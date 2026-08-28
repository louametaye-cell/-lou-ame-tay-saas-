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
    <header className="sticky top-0 z-30 bg-slate-950 text-white border-b-2 border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
        {/* Top Row: Brand, Clock, Navigation Links & Audio Controls */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Brand & Navigation Return */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="min-h-[44px] min-w-[44px] bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 rounded-2xl flex items-center justify-center transition-all border border-slate-700"
              title="Retour au Dashboard"
              aria-label="Retour au Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  <span>Écran Cuisine (KDS)</span>
                  <span className="text-xs text-orange-400 font-bold bg-orange-950/80 px-2 py-0.5 rounded-lg border border-orange-800/80 hidden sm:inline">
                    {restaurantName}
                  </span>
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="font-mono text-[11px]">
                      {isConnected ? 'Realtime Connecté' : 'Mode Synchro (3s)'}
                    </span>
                  </div>
                  <span>•</span>
                  <span className="font-mono text-emerald-400 font-bold">{timeStr}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Shortcuts */}
          <div className="hidden md:flex items-center gap-2 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            <Link
              href="/dashboard/menu"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-orange-400" />
              <span>Gestion Menu</span>
            </Link>
            <Link
              href="/dashboard/stats"
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Statistiques</span>
            </Link>
          </div>

          {/* Right: Audio Toggle & Refresh Button */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Audio Toggle Button (Essential for Browser Autoplay policy) */}
            <button
              type="button"
              onClick={handleAudioButtonClick}
              className={`min-h-[44px] px-3.5 py-2 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 border ${
                isAudioEnabled
                  ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800/80 hover:bg-rose-900/60 animate-pulse'
              }`}
            >
              {isAudioEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Son Actif</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>Activer Son 🔊</span>
                </>
              )}
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              className="min-h-[44px] min-w-[44px] bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 rounded-2xl flex items-center justify-center transition-all border border-slate-700"
              title="Rafraîchir les commandes"
              aria-label="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Status Counter Badges & Filter Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap pt-1 border-t border-slate-800/80">
          {/* Counters Pill Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onFilterChange('PENDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                activeFilter === 'PENDING'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>En attente :</span>
              <span className="font-mono text-sm">{counts.pending}</span>
            </button>

            <button
              type="button"
              onClick={() => onFilterChange('PREPARING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                activeFilter === 'PREPARING'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 scale-105'
                  : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>En préparation :</span>
              <span className="font-mono text-sm">{counts.preparing}</span>
            </button>

            {counts.urgent > 0 && (
              <button
                type="button"
                onClick={() => onFilterChange('URGENT')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all animate-pulse ${
                  activeFilter === 'URGENT'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-105'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Urgentes (&gt;15m) :</span>
                <span className="font-mono text-sm">{counts.urgent}</span>
              </button>
            )}

            <div className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:flex items-center gap-1.5">
              <span>Servies ajd :</span>
              <span className="font-mono text-sm font-black">{counts.served}</span>
            </div>
          </div>

          {/* Quick Filter Selection */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs ml-auto">
            <button
              type="button"
              onClick={() => onFilterChange('ALL')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeFilter === 'ALL'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
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
                  : 'text-slate-400 hover:text-white'
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
