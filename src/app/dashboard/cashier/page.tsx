'use client';

import React from 'react';
import CashierPOS from '@/components/cashier/CashierPOS';
import { ScreenShield } from '@/components/security/ScreenShield';

export default function DashboardCashierPage() {
  return (
    <ScreenShield userRole="CASHIER">
      <CashierPOS />
    </ScreenShield>
  );
}