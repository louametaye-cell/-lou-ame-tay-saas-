import React from 'react';
import { prisma } from '@/lib/prisma';
import KitchenKDSView from '@/components/kitchen/KitchenKDSView';

interface TenantKitchenRouteProps {
  params: {
    subdomain: string;
  };
}

export default async function TenantKitchenRoute({ params }: TenantKitchenRouteProps) {
  const subdomain = params?.subdomain;

  let initialPlanSlug = 'baobab';
  let initialRestaurantName = 'Écran Cuisine (KDS)';

  try {
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ subdomain }, { id: subdomain }],
      },
      include: {
        plan: {
          select: { slug: true, name: true }
        }
      }
    });

    if (tenant) {
      initialPlanSlug = tenant.plan?.slug?.toLowerCase() || 'tambali';
      initialRestaurantName = tenant.businessName;
    }
  } catch (err) {
    console.warn('[TenantKitchenRoute] DB fetch error:', err);
  }

  return (
    <KitchenKDSView
      initialRestaurantId={subdomain}
      initialPlanSlug={initialPlanSlug}
      initialRestaurantName={initialRestaurantName}
    />
  );
}
