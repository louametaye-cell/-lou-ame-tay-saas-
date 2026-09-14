'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import KitchenKDSView from '@/components/kitchen/KitchenKDSView';

function KitchenPageContent() {
  const searchParams = useSearchParams();
  const restaurantId = searchParams?.get('restaurantId') || undefined;

  return <KitchenKDSView initialRestaurantId={restaurantId} />;
}

export default function KitchenPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-amber-400 gap-3">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs uppercase tracking-widest font-black">Chargement de l'Écran Cuisine...</span>
      </div>
    }>
      <KitchenPageContent />
    </Suspense>
  );
}