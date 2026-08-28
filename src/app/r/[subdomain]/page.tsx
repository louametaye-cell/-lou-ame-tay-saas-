import React from 'react';
import { ClientMenuView } from '@/components/ClientMenuView';
import { SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { orderStorage } from '@/lib/order-storage';
import { prisma } from '@/lib/prisma';
import { RestaurantType } from '@/types';

interface PageProps {
  params: {
    subdomain: string;
    tableNumber: string;
  };
}

export default async function FriendlyTableMenuPage({ params }: PageProps) {
  const tableNum = parseInt(params.tableNumber, 10) || 1;
  let restaurant: RestaurantType = orderStorage.getRestaurantById(params.subdomain) || SAMPLE_RESTAURANT;

  try {
    const dbRestaurant = await (prisma as any).restaurant?.findUnique({
      where: { subdomain: params.subdomain },
      include: {
        categories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            items: true,
          },
        },
      },
    });

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
        currency: dbRestaurant.currency,
        isActive: dbRestaurant.isActive ?? true,
        tableCount: dbRestaurant.tableCount ?? 12,
        tablesCount: dbRestaurant.tableCount ?? 12,
        categories: (dbRestaurant.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          displayOrder: c.displayOrder,
          items: (c.items || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            wolofName: undefined,
            description: i.description || '',
            price: i.price,
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
  } catch (error) {
    // Fallback to orderStorage lookup
  }

  return (
    <ClientMenuView
      initialRestaurant={restaurant}
      tableNumber={tableNum}
    />
  );
}
