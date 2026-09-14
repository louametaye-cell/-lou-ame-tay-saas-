'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import CashierPOS from '@/components/cashier/CashierPOS';

export default function TenantCashierRoute() {
  const params = useParams();
  const subdomain = (params?.subdomain as string) || undefined;

  return <CashierPOS initialRestaurantId={subdomain} />;
}
