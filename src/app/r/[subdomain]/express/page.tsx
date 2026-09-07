import React from 'react';
import { notFound } from 'next/navigation';
import { ClientMenuView } from '@/components/ClientMenuView';
import { prisma } from '@/lib/prisma';
import { RestaurantType } from '@/types';

interface PageProps {
  params: Promise<{
    subdomain: string;
  }> | {
    subdomain: string;
  };
}

export default async function ExpressCounterMenuPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  let restaurant: any = null;

  try {
    const dbTenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
          { subdomain: resolvedParams.subdomain },
          { id: resolvedParams.subdomain }
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

    if (!dbTenant) {
      notFound();
    }

    const brandingObj = typeof dbTenant.branding === 'object' && dbTenant.branding !== null ? dbTenant.branding : {};

      restaurant = {
        id: dbTenant.id,
        name: dbTenant.businessName,
        tagline: brandingObj.tagline || 'Service Express au Comptoir & Bar',
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
            preparationTime: 10,
            allergens: [],
            categoryId: c.id,
          })),
        })),
      };
  } catch (error) {
    console.error('Erreur chargement menu express :', error);
  }

  return (
    <ClientMenuView
      initialRestaurant={restaurant}
      tableNumber={0}
      isExpress={true}
    />
  );
}
