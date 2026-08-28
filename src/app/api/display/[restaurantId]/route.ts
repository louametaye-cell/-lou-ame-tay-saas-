import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SAMPLE_RESTAURANTS, SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { orderStorage } from '@/lib/order-storage';
import { RestaurantType } from '@/types';
import { redis } from '@/lib/redis';
import { checkRateLimit } from '@/lib/rate-limit';
import { startTimer, logPerformance } from '@/lib/logger';

export async function GET(
  req: Request,
  { params }: { params: { restaurantId: string } }
) {
  const timer = startTimer();
  try {
    // 1. Rate Limiting Check (200 req/min for TV displays)
    const rate = await checkRateLimit(req, 'display');
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes TV.' },
        { status: 429, headers: { 'Retry-After': String(rate.reset) } }
      );
    }

    const searchId = params.restaurantId.toLowerCase();
    const cacheKey = `display:${searchId}`;

    // 2. Check Redis Cache
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logPerformance(`GET /api/display/${searchId}`, timer.elapsedMs(), 'CACHE_HIT');
        return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT' } });
      }
    } catch {}

    // 1. Try finding in Prisma DB first if available
    let dbRestaurant: any = null;
    try {
      dbRestaurant = await (prisma as any).restaurant?.findFirst({
        where: {
          OR: [
            { id: searchId },
            { subdomain: searchId },
          ],
        },
        include: {
          categories: {
            orderBy: { displayOrder: 'asc' },
            include: {
              items: true,
            },
          },
        },
      });
    } catch (e) {}

    let restaurant: RestaurantType = SAMPLE_RESTAURANTS.find(
      (r) => r.id.toLowerCase() === searchId || r.subdomain.toLowerCase() === searchId
    ) || SAMPLE_RESTAURANT;

    if (dbRestaurant) {
      restaurant = {
        id: dbRestaurant.id,
        name: dbRestaurant.name,
        tagline: 'Gastronomie sénégalaise authentique & Grillades',
        subdomain: dbRestaurant.subdomain,
        phone: dbRestaurant.phone,
        address: dbRestaurant.address,
        logoUrl: dbRestaurant.logoUrl,
        bannerUrl: dbRestaurant.bannerUrl,
        currency: dbRestaurant.currency || 'FCFA',
        isActive: dbRestaurant.isActive ?? true,
        tableCount: dbRestaurant.tableCount ?? 12,
        categories: (dbRestaurant.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          displayOrder: c.displayOrder,
          items: (c.items || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            description: i.description || '',
            price: Number(i.price) || 0,
            imageUrl: i.imageUrl || '',
            isAvailable: i.isAvailable,
            isSpecialOfTheDay: i.isSpecialOfTheDay,
            preparationTime: i.preparationTime || 10,
            allergens: i.allergens || [],
            categoryId: i.categoryId,
          })),
        })),
      };
    }

    // Update with real-time stock availability from orderStorage
    const formattedCategories = restaurant.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || '🍽️',
      items: (cat.items || []).map((item) => {
        const liveAvailable = orderStorage.getItemAvailability(item.id, item.isAvailable);
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          imageUrl: item.imageUrl,
          isAvailable: liveAvailable,
          isSpecialOfTheDay: item.isSpecialOfTheDay,
        };
      }),
    }));

    const responsePayload = {
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      subdomain: restaurant.subdomain,
      restaurantAddress: restaurant.address || 'Thiès / Dakar, Sénégal',
      restaurantPhone: restaurant.phone || '+221 77 654 32 10',
      logoUrl: restaurant.logoUrl,
      bannerUrl: restaurant.bannerUrl,
      currency: restaurant.currency || 'FCFA',
      categories: formattedCategories,
      updatedAt: new Date().toISOString(),
    };

    // Save into Redis (TTL 300s)
    try {
      await redis.set(cacheKey, responsePayload, { ex: 300 });
    } catch {}

    logPerformance(`GET /api/display/${searchId}`, timer.elapsedMs(), 'CACHE_MISS');

    return NextResponse.json(responsePayload, {
      headers: {
        'X-Cache': 'MISS',
        'X-RateLimit-Remaining': String(rate.remaining),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération menu display' }, { status: 500 });
  }
}