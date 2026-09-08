import React from 'react';
import { SuperAdminAuthGuard } from '@/components/super-admin/SuperAdminAuthGuard';

export const metadata = {
  title: 'Super Admin | Lou Ame Tay ? - MDA Arts Work',
  description: 'Portail de pilotage centralisé, abonnements et monitoring multi-restaurants.',
};

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminAuthGuard>{children}</SuperAdminAuthGuard>;
}
