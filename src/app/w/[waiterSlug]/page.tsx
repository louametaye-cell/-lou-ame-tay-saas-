import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { WaiterScanClient } from './WaiterScanClient';

interface PageProps {
  params: {
    waiterSlug: string;
  };
}

export default async function WaiterScanPage({ params }: PageProps) {
  // 1. Récupérer le serveur
  const waiter = await prisma.waiter.findUnique({
    where: { qrCodeSlug: params.waiterSlug },
    include: {
      tenant: {
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
          zones: true,
        },
      },
    },
  });

  if (!waiter || !waiter.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Serveur introuvable</h1>
          <p className="text-slate-600">
            Ce QR Code n'est plus valide. Veuillez scanner le QR code de votre table ou faire appel à un autre serveur.
          </p>
        </div>
      </div>
    );
  }

  const dbTenant = waiter.tenant;
  // @ts-ignore
  const brandingObj: any = typeof dbTenant.branding === 'object' && dbTenant.branding !== null ? dbTenant.branding : {};

  // Formater le restaurant pour le composant ClientMenuView
  const restaurant = {
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
    tableCount: dbTenant.tables?.length || 0,
    tablesCount: dbTenant.tables?.length || 0,
    branding: brandingObj as any,
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

  return (
    <WaiterScanClient 
      waiter={{
        id: waiter.id,
        name: waiter.name,
      }}
      restaurant={restaurant}
      zones={dbTenant.zones || []}
      tables={dbTenant.tables || []}
    />
  );
}
