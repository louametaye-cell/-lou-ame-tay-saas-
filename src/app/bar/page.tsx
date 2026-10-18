'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import KitchenKDSView from '@/components/kitchen/KitchenKDSView';
import { ScreenShield } from '@/components/security/ScreenShield';

function BarPageContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams?.get('restaurantId') || undefined;

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = "Poste Bar & Boissons — Lou Ame Tay?";
    }
  }, []);

  return (
    <ScreenShield userRole="KITCHEN_STAFF">
      <KitchenKDSView initialRestaurantId={restaurantId} />
    </ScreenShield>
  );
}

export default function BarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-400 gap-3">
        <div className="w-10 h-10 border-3 border-blue-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest font-black">Chargement de l'Écran Bar...</span>
      </div>
    }>
      <BarPageContent />
    </Suspense>
  );
}
