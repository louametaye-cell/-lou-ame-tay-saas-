'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import KitchenKDSView from '@/components/kitchen/KitchenKDSView';

export default function TenantKitchenRoute() {
  const params = useParams();
  const subdomain = (params?.subdomain as string) || undefined;

  return <KitchenKDSView initialRestaurantId={subdomain} />;
}
