'use client';

import React from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Sparkles, Clock, QrCode, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';

interface ClassicDisplayProps {
  data: {
    restaurantId: string;
    restaurantName: string;
    subdomain: string;
    restaurantAddress?: string;
    restaurantPhone?: string;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    categories: Array<{
      id: string;
      name: string;
      icon?: string;
      items: Array<{
        id: string;
        name: string;
        description?: string;
        price: number;
        imageUrl?: string;
        isAvailable: boolean;
        isSpecialOfTheDay?: boolean;
      }>;
    }>;
  };
  currentTime: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  orderMenuUrl: string;
}

export const ClassicDisplay: React.FC<ClassicDisplayProps> = ({
  data,
  currentTime,
  isFullscreen,
  onToggleFullscreen,
  orderMenuUrl,
}) => {
  return (
    <div className="min-h-screen bg-[#1A1A1A] text-slate-100 p-4 sm:p-8 flex flex-col justify-between select-none">
      
      {/* 1. TOP HEADER BRAND & CLOCK */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-4 text-center md:text-left">
          {data.logoUrl ? (
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black shrink-0 shadow-lg">
              <Image src={data.logoUrl} alt={data.restaurantName} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-3xl shadow-lg shrink-0">
              🍽️
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                Menu du Jour en Direct
              </span>
              <span className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>TV Display 4K</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
              {data.restaurantName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {data.restaurantAddress || 'Thiès / Dakar, Sénégal'} • {data.restaurantPhone}
            </p>
          </div>
        </div>

        {/* Live Clock & Fullscreen Button */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-md">
            <Clock className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Heure Sénégal (GMT)
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-white">
                {currentTime}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl border border-slate-700 transition-all shadow-md active:scale-95"
            title={isFullscreen ? 'Quitter le Plein Écran (Échap)' : 'Plein Écran (Touche F)'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 2. MENU GRID (3 COLUMNS) */}
      <main className="my-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {data.categories.map((category) => (
          <div
            key={category.id}
            className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 flex flex-col shadow-xl backdrop-blur-xs hover:border-slate-700 transition-all"
          >
            {/* Category Header */}
            <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 border-b border-slate-800">
              <span className="text-2xl">{category.icon || '🥘'}</span>
              <h2 className="text-lg sm:text-xl font-black text-amber-400 tracking-tight">
                {category.name}
              </h2>
              <span className="ml-auto text-xs font-bold text-slate-500 font-mono">
                ({category.items.length})
              </span>
            </div>

            {/* Dishes in this Category */}
            <div className="space-y-3.5 flex-1">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3.5 p-2.5 rounded-2xl transition-all border ${
                    !item.isAvailable
                      ? 'opacity-40 bg-slate-950/40 border-dashed border-slate-800'
                      : item.isSpecialOfTheDay
                      ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30'
                      : 'bg-slate-950/40 hover:bg-slate-800/60 border-slate-800/50'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700/50">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl bg-slate-800 text-slate-500">
                        🍲
                      </div>
                    )}

                    {item.isSpecialOfTheDay && item.isAvailable && (
                      <div className="absolute top-1 left-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>DU JOUR</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight truncate">
                        {item.name}
                      </h3>
                    </div>

                    {item.description && (
                      <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-1 mt-0.5 font-medium">
                        {item.description}
                      </p>
                    )}

                    {/* Price & Stock Badge */}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm sm:text-base font-black font-mono text-emerald-400">
                        {formatFCFA(item.price)}
                      </span>

                      {!item.isAvailable && (
                        <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Rupture</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* 3. FOOTER CALL-TO-ACTION & GIANT QR CODE */}
      <footer className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-3 bg-white text-slate-950 rounded-2xl shrink-0 shadow-md">
            <QrCode className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-white">
              📱 Scannez pour commander depuis votre table
            </h4>
            <p className="text-xs text-slate-400">
              Ouvrez l'appareil photo de votre smartphone ou utilisez Wave / Orange Money
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-2xl shadow-lg border-2 border-emerald-500">
            <QRCodeSVG value={orderMenuUrl} size={64} level="M" />
          </div>
          <div className="hidden lg:block text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Accès Direct</span>
            <span className="text-xs font-mono font-bold text-amber-400">{orderMenuUrl}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};