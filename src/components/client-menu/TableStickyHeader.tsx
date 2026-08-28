'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Bell, X, Receipt, Droplets, HelpCircle, CheckCircle2, Globe } from 'lucide-react';
import { Language } from '@/types';
import { getUIText } from '@/lib/translation-engine';
import { ServiceCallModal } from './ServiceCallModal';

interface TableStickyHeaderProps {
  restaurantName: string;
  logoUrl?: string | null;
  tableNumber: number;
  isExpress?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'ES', label: 'Español', flag: '🇪🇸' },
  { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'WO', label: 'Wolof', flag: '🇸🇳' },
];

export const TableStickyHeader: React.FC<TableStickyHeaderProps> = ({
  restaurantName,
  logoUrl,
  tableNumber,
  isExpress = false,
  searchQuery,
  onSearchChange,
  lang = 'FR',
  onLanguageChange,
}) => {
  const t = getUIText(lang);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FFF8F0]/95 backdrop-blur-md border-b border-orange-200/80 shadow-xs transition-all">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-3.5 space-y-2.5">
          {/* Top Brand & Actions Bar */}
          <div className="flex items-center justify-between gap-3">
            {/* Restaurant Brand & Avatar */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-sm border-2 border-[#FF6B00]/30 bg-white shrink-0">
                <Image
                  src={logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'}
                  alt={restaurantName}
                  fill
                  className="object-cover"
                  sizes="56px"
                  priority
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate flex items-center gap-1.5">
                  <span>👋 {restaurantName}</span>
                </h1>
                <p className="text-xs text-orange-600 font-bold tracking-wide truncate">
                  {isExpress
                    ? '⚡ Service Express au Comptoir & Bar'
                    : lang === 'WO'
                    ? 'Skaneel, tànnal, komandeel léegi.'
                    : t.scanChooseOrder}
                </p>
              </div>
            </div>

            {/* Right Action: Table / Express Badge & Waiter Bell Button */}
            <div className="flex items-center gap-2 shrink-0">
              {isExpress ? (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-black px-3.5 py-2 rounded-2xl shadow-sm flex items-center gap-1.5 animate-pulse">
                  <span>⚡ Comptoir / Bar</span>
                </div>
              ) : (
                <div className="bg-emerald-600 text-white text-xs sm:text-sm font-black px-3.5 py-2 rounded-2xl shadow-sm flex items-center gap-1.5">
                  <span>📍 {t.table}</span>
                  <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-white font-mono">
                    {formattedTable}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsServiceModalOpen(true)}
                className="min-h-[44px] min-w-[44px] bg-white hover:bg-orange-50 text-orange-600 border-2 border-orange-200 rounded-2xl transition-all shadow-xs active:scale-95 flex items-center justify-center relative"
                title={lang === 'WO' ? 'Wo serveer bi' : t.callWaiter}
                aria-label={lang === 'WO' ? 'Wo serveer bi' : t.callWaiter}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full" />
              </button>
            </div>
          </div>

          {/* Interactive Multi-Language Flags Switcher Bar */}
          {onLanguageChange && (
            <div className="flex items-center justify-between gap-1.5 bg-white/90 p-1 rounded-2xl border border-orange-200/90 shadow-2xs overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 shrink-0 px-1.5 text-xs text-slate-500 font-bold hidden sm:flex">
                <Globe className="w-3.5 h-3.5 text-orange-600" />
                <span>Langue :</span>
              </div>
              <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-start">
                {LANGUAGES.map((l) => {
                  const isSelected = lang === l.code;
                  return (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => onLanguageChange(l.code)}
                      className={`min-h-[36px] flex-1 sm:flex-initial px-2.5 sm:px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 shadow-sm border border-amber-600 font-black'
                          : 'text-slate-600 hover:text-slate-950 hover:bg-orange-50/70 border border-transparent'
                      }`}
                    >
                      <span className="text-sm leading-none">{l.flag}</span>
                      <span className="text-[11px] uppercase tracking-wide">{l.code}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={lang === 'WO' ? 'Seet lëkk, ceebe, mbaxal mba naan...' : t.searchPlaceholder}
              className="w-full bg-white border border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                aria-label="Effacer la recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Service Call Modal */}
      <ServiceCallModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        tableNumber={tableNumber}
        lang={lang}
      />
    </>
  );
};