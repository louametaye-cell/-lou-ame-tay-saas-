import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SAMPLE_RESTAURANTS, SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { orderStorage } from '@/lib/order-storage';
import { RestaurantType } from '@/types';

export async function GET(
  req: Request,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const searchId = params.restaurantId.toLowerCase();

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

    return NextResponse.json({
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
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération menu display' }, { status: 500 });
  }
}