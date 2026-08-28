'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  QrCode, 
  ChefHat, 
  UtensilsCrossed 
} from 'lucide-react';
import { TableManager } from '@/components/dashboard/TableManager';

export default function DashboardTablesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Brand & Return */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="min-h-[44px] min-w-[44px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl flex items-center justify-center transition-all border border-slate-700 active:scale-95"
              title="Retour au Dashboard"
              aria-label="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <span>Plan de Salle &amp; QR Codes</span>
                  <span className="text-xs text-orange-400 font-bold bg-orange-950/80 px-2 py-0.5 rounded-lg border border-orange-800/80 hidden sm:inline">
                    Chez Fatou &amp; Frères
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  État des tables en temps réel &amp; export des QR codes HD
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/kitchen"
              className="px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <ChefHat className="w-4 h-4 text-orange-400" />
              <span>Cuisine (KDS)</span>
            </Link>
            <Link
              href="/dashboard/menu"
              className="px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
              <span>Menu &amp; Stock</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Table Manager */}
      <main className="max-w-7xl mx-auto px-4 pt-6">
        <TableManager
          subdomain="chezfatou"
          restaurantName="Chez Fatou & Frères"
          initialTableCount={12}
        />
      </main>
    </div>
  );
}