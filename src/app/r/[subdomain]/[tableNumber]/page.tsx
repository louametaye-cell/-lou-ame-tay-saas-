import React from 'react';
import { notFound, permanentRedirect } from 'next/navigation';
import { ClientMenuView } from '@/components/ClientMenuView';
import { prisma } from '@/lib/prisma';
import { RestaurantType } from '@/types';

// Correspondances d'anciens sous-domaines pour garantir zéro rupture sur les anciens QR codes / favoris
const LEGACY_SUBDOMAINS: Record<string, string> = {
  'chez-colle': 'sams-prestige',
  'mg-cafe-resto': 'madiba-restaurant',
  'hotel-cayor': 'hotel-lat-dior',
};

interface PageProps {
  params: Promise<{
    subdomain: string;
    tableNumber: string;
  }> | {
    subdomain: string;
    tableNumber: string;
  };
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function FriendlyTableMenuPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = searchParams ? await Promise.resolve(searchParams) : {};

  // Redirection automatique permanente pour les anciens sous-domaines historiques
  const rawSubdomain = (resolvedParams.subdomain || '').toLowerCase().trim();
  if (LEGACY_SUBDOMAINS[rawSubdomain]) {
    const targetSubdomain = LEGACY_SUBDOMAINS[rawSubdomain];
    const targetTable = resolvedParams.tableNumber || '1';
    permanentRedirect(`/r/${targetSubdomain}/${targetTable}`);
  }

  // 1. Nettoyage du numéro de table (supporte "1", "01", "table-1", "table-04", etc.)
  const rawTableStr = (
    resolvedParams.tableNumber ||
    (resolvedSearchParams.table as string) ||
    (resolvedSearchParams.tableNumber as string) ||
    '1'
  );
  const cleanDigits = rawTableStr.replace(/[^0-9]/g, '');
  const tableNum = parseInt(cleanDigits, 10) || 1;

  let restaurant: any = null;

  try {
    // 2. Recherche directe dans la table Prisma `tenant`
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
