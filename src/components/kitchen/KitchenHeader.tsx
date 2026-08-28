'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChefHat, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  Flame, 
  ArrowLeft, 
  LayoutDashboard, 
  UtensilsCrossed, 
  BarChart3, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import { unlockAudioContext } from './KitchenSoundAlert';

export type KitchenFilter = 'ALL' | 'PENDING' | 'PREPARING' | 'URGENT' | 'DRINKS';

interface KitchenHeaderProps {
  restaurantName?: string;
  isConnected: boolean;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  counts: {
    pending: number;
    preparing: number;
    served: number;
    urgent: number;
  };
  activeFilter: KitchenFilter;
  onFilterChange: (filter: KitchenFilter) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const KitchenHeader: React.FC<KitchenHeaderProps> = ({
  restaurantName = 'Chez Fatou & Frères',
  isConnected,
  isAudioEnabled,
  onToggleAudio,
  counts,
  activeFilter,
  onFilterChange,
  onRefresh,
  isLoading,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAudioButtonClick = () => {
    unlockAudioContext();
    onToggleAudio();
  };

  return (
    <header className="sticky top-0 z-30 bg-white text-slate-900 border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
        {/* Top Row: Brand, Clock, Navigation Links & Audio Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Brand & Navigation Return */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-2xl flex items-center justify-center transition-all border border-slate-200 shadow-xs"
              title="Retour au Dashboard"
              aria-label="Retour au Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/15 text-amber-700 rounded-2xl border border-amber-500/30">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                  <span>Écran Cuisine (KDS)</span>
                  <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 hidden sm:inline">
                    {restaurantName}
                  </span>
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {isConnected ? 'Realtime Connecté' : 'Mode Synchro (3s)'}
                    </span>
                  </div>
                  <span>•</span>
                  <span className="font-mono text-emerald-700 font-black">{timeStr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Shortcuts */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <Link
              href="/dashboard/menu"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
              <span>Gestion Menu</span>
            </Link>
            <Link
              href="/dashboard/stats"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Statistiques</span>
            </Link>
          </div>

          {/* Right: Audio Toggle & Refresh Button */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Audio Toggle Button */}
            <button
              type="button"
              onClick={handleAudioButtonClick}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 border ${
                isAudioEnabled
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-xs'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 animate-pulse'
              }`}
            >
              {isAudioEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Son Actif</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-600" />
                  <span>Activer Son 🔊</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              className="min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 rounded-2xl flex items-center justify-center transition-all border border-slate-200 shadow-xs"
              title="Rafraîchir les commandes"
              aria-label="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Status Counter Badges & Filter Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-slate-100">
          {/* Counters Pill Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onFilterChange('PENDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                activeFilter === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>En attente :</span>
              <span className="font-mono text-sm font-black">{counts.pending}</span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('PREPARING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                activeFilter === 'PREPARING'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>En préparation :</span>
              <span className="font-mono text-sm font-black">{counts.preparing}</span>
            </button>

            {counts.urgent > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange('URGENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all animate-pulse ${
                  activeFilter === 'URGENT'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Urgentes (&gt;15m) :</span>
                <span className="font-mono text-sm font-black">{counts.urgent}</span>
              </button>
            )}

            <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:flex items-center gap-1.5">
              <span>Servies ajd :</span>
              <span className="font-mono text-sm font-black">{counts.served}</span>
            </div>
          </div>

          {/* Quick Filter Selection */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs ml-auto">
            <button
              type="button"
              onClick={() => onFilterChange('ALL')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tout
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('DRINKS')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeFilter === 'DRINKS'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🥤 Boissons
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};