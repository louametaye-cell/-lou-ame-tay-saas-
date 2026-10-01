import React from 'react';
import type { Metadata } from 'next';
import { DashboardBackground } from '@/components/DashboardBackground';

export const metadata: Metadata = {
  title: 'Tableau de Bord — Espace Gérant Lou Ame Tay?',
  description: 'Tableau de bord de gestion pour restaurateurs Lou Ame Tay ?',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Background Soft Overlay & Pattern */}
      <DashboardBackground />
      
      {/* Main Content */}
      <div className="relative z-0">
        {children}
      </div>
    </div>
  );
}
