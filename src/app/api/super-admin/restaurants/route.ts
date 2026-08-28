import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';
import { SubscriptionPlan } from '@/types';

export async function GET() {
  try {
    // Attempt to query database if accessible
    const dbRestaurants = await (prisma as any).restaurant?.findMany({
      include: {
        subscription: true,
        tables: true,
        categories: {
          include: {
            items: true,
          },
        },
        orders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbRestaurants && dbRestaurants.length > 0) {
      const formatted = dbRestaurants.map((r: any) => ({
        id: r.id,
        name: r.name,
        subdomain: r.subdomain,
        ownerName: r.ownerName,
        phone: r.phone,
        address: r.address,
        logoUrl: r.logoUrl,
        bannerUrl: r.bannerUrl,
        currency: r.currency,
        isActive: r.isActive,
        tablesCount: r.tables?.length || 0,
        ordersCount: r.orders?.length || 0,
        createdAt: r.createdAt.toISOString(),
        subscription: r.subscription
          ? {
              id: r.subscription.id,
              plan: r.subscription.plan as SubscriptionPlan,
              status: r.subscription.status,
              price: r.subscription.price,
              startDate: r.subscription.startDate.toISOString(),
              endDate: r.subscription.endDate.toISOString(),
            }
          : null,
        categories: (r.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          displayOrder: c.displayOrder,
          items: (c.items || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            description: i.description || '',
            price: i.price,
            imageUrl: i.imageUrl || '',
            isAvailable: i.isAvailable,
            allergens: i.allergens || [],
            categoryId: i.categoryId,
          })),
        })),
      }));

      return NextResponse.json({ restaurants: formatted, source: 'database' });
    }
  } catch (error) {
    // Fallback to in-memory store
  }

  const memoryRestaurants = orderStorage.getRestaurants();
  return NextResponse.json({ restaurants: memoryRestaurants, source: 'memory' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, subdomain, ownerName, phone, address, plan, months, tablesCount } = body;

    if (!name || !subdomain) {
      return NextResponse.json(
        { error: 'Nom et sous-domaine obligatoires' },
        { status: 400 }
      );
    }

    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

    // Add to in-memory store
    const newRestaurant = orderStorage.createRestaurant({
      name,
      subdomain: cleanSubdomain,
      ownerName,
      phone,
      address,
      plan: plan || 'PRO',
      months: Number(months) || 1,
      tablesCount: Number(tablesCount) || 10,
    });

    // Try saving in Prisma DB
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (Number(months) || 1));

      const price = plan === 'STARTER' ? 15000 : plan === 'ENTERPRISE' ? 50000 : 25000;

      const sub = await (prisma as any).subscription?.create({
        data: {
          plan: (plan as SubscriptionPlan) || 'PRO',
          status: 'ACTIVE',
          price,
          startDate,
          endDate,
        },
      });

      const dbResto = await (prisma as any).restaurant?.create({
        data: {
          id: newRestaurant.id,
          name,
          subdomain: cleanSubdomain,
          ownerName,
          phone,
          address,
          subscriptionId: sub?.id,
          isActive: true,
        },
      });

      // Create default tables
      const numTables = Number(tablesCount) || 10;
      for (let i = 1; i <= numTables; i++) {
        await (prisma as any).table?.create({
          data: {
            number: i,
            restaurantId: dbResto?.id || newRestaurant.id,
            qrCodeUrl: `https://louametay.sn/r/${cleanSubdomain}/table-${i}`,
          },
        });
      }
    } catch (dbErr) {
      console.warn('Prisma creation bypassed:', dbErr);
    }

    return NextResponse.json({ success: true, restaurant: newRestaurant }, { status: 201 });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création du restaurant' },
      { status: 500 }
    );
  }
}
