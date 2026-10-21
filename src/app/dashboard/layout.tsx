import React from 'react';
import type { Metadata } from 'next';
import { DashboardBackground } from '@/components/DashboardBackground';
import { BottomNavMobile } from '@/components/dashboard/BottomNavMobile';
import { AissatouChat } from '@/components/ai/AissatouChat';

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
      
      {/* Main Content avec padding-bottom pour libérer l'espace sous la BottomNavMobile */}
      <div className="relative z-0 pb-20 md:pb-0">
        {children}
      </div>

      {/* Barre de navigation mobile App-like */}
      <BottomNavMobile />

      {/* Assistante IA Aissatou Copilote Gérant */}
      <AissatouChat variant="gerant" />
    </div>
  );
}
