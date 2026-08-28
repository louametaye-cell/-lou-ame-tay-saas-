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
  // 1. Nettoyage du numéro de table (supporte "1", "01", "table-1", "table-04")
  const rawTableStr = (params.tableNumber || '1').replace(/[^0-9]/g, '');
  const tableNum = parseInt(rawTableStr, 10) || 1;

  let restaurant: RestaurantType = orderStorage.getRestaurantById(params.subdomain) || SAMPLE_RESTAURANT;

  try {
    // 2. Recherche directe dans la table Prisma `tenant`
    const dbTenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
          { subdomain: params.subdomain },
          { id: params.subdomain }
        ]
      },
      include: {
        categories: {
          orderBy: { displayOrder: 'asc' },
          include: {
            items: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
        tables: true,
      },
    });

    if (dbTenant) {
      const brandingObj = typeof dbTenant.branding === 'object' && dbTenant.branding !== null ? dbTenant.branding : {};

      restaurant = {
        id: dbTenant.id,
        name: dbTenant.businessName,
        tagline: brandingObj.tagline || 'Scannez • Commandez • Savourez !',
        subdomain: dbTenant.subdomain,
        phone: dbTenant.phone,
        address: dbTenant.address,
        logoUrl: dbTenant.logoUrl,
        bannerUrl: dbTenant.bannerUrl,
        currency: dbTenant.currency || 'FCFA',
        isActive: dbTenant.subscriptionStatus === 'ACTIVE' || dbTenant.subscriptionStatus === 'TRIAL',
        tableCount: dbTenant.tables?.length || 12,
        tablesCount: dbTenant.tables?.length || 12,
        branding: brandingObj,
        categories: (dbTenant.categories || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          displayOrder: c.displayOrder,
          items: (c.items || []).map((i: any) => ({
            id: i.id,
            name: i.name,
            wolofName: undefined,
            description: i.description || '',
            price: Number(i.price),
            imageUrl: i.imageUrl || '',
            isAvailable: i.isAvailable ?? true,
            isSpecialOfTheDay: i.isDailySpecial ?? false,
            preparationTime: 15,
            allergens: [],
            categoryId: c.id,
          })),
        })),
      };
    }
  } catch (error) {
    console.error('Erreur chargement menu restaurant :', error);
  }

  return (
    <ClientMenuView
      initialRestaurant={restaurant}
      tableNumber={tableNum}
    />
  );
}
