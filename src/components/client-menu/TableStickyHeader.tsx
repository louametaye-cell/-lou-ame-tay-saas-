'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Search, Bell, X, Receipt, Droplets, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '@/types';
import { getUIText } from '@/lib/translation-engine';
import { toast } from 'sonner';

interface TableStickyHeaderProps {
  restaurantName: string;
  logoUrl?: string | null;
  tableNumber: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  lang?: Language;
}

export const TableStickyHeader: React.FC<TableStickyHeaderProps> = ({
  restaurantName,
  logoUrl,
  tableNumber,
  searchQuery,
  onSearchChange,
  lang = 'FR',
}) => {
  const t = getUIText(lang);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [calledReason, setCalledReason] = useState<string | null>(null);

  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  const handleCall = (reason: string) => {
    setCalledReason(reason);
    toast.success(`${t.table} ${formattedTable} - ${reason} !`, {
      description: 'Un serveur arrive à votre table.',
    });

    setTimeout(() => {
      setCalledReason(null);
      setIsModalOpen(false);
    }, 1600);
  };

  const reasons = [
    { label: t.callReasonBill, icon: Receipt, color: 'bg-amber-500' },
    { label: t.callReasonWater, icon: Droplets, color: 'bg-blue-500' },
    { label: t.callReasonHelp, icon: HelpCircle, color: 'bg-emerald-600' },
    { label: t.callReasonOther, icon: Bell, color: 'bg-purple-600' },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FFF8F0]/95 backdrop-blur-md border-b border-orange-200/80 shadow-xs transition-all">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 space-y-3">
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
                  {t.scanChooseOrder}
                </p>
              </div>
            </div>

            {/* Right Action: Table Badge & Waiter Bell Button */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-emerald-600 text-white text-xs sm:text-sm font-black px-3.5 py-2 rounded-2xl shadow-sm flex items-center gap-1.5">
                <span>📍 {t.table}</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-white font-mono">
                  {formattedTable}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="min-h-[44px] min-w-[44px] bg-white hover:bg-orange-50 text-orange-600 border-2 border-orange-200 rounded-2xl transition-all shadow-xs active:scale-95 flex items-center justify-center"
                title={t.callWaiter}
                aria-label={t.callWaiter}
              >
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
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

      {/* Call Waiter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 relative animate-in slide-in-from-bottom duration-300 shadow-2xl border-t-4 border-emerald-600">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-transform"
              aria-label={t.closeWindow}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg sm:text-xl text-slate-950">
                  {t.callWaiterTitle}
                </h3>
                <p className="text-sm font-extrabold text-emerald-700">
                  📍 {t.table} N° {formattedTable}
                </p>
              </div>
            </div>

            {calledReason ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
                <h4 className="text-base font-black text-slate-900">
                  {t.callWaiterSent}
                </h4>
                <p className="text-xs text-slate-600">
                  {t.callWaiterSubtitle}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {reasons.map((r, idx) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleCall(r.label)}
                      className="w-full min-h-[50px] p-3.5 bg-slate-50 hover:bg-emerald-50 border-2 border-slate-200 hover:border-emerald-600 rounded-2xl text-left flex items-center gap-3.5 active:scale-[0.98] transition-all shadow-xs group"
                    >
                      <div className={`p-2.5 rounded-xl text-white ${r.color} shadow-xs`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-800 flex-1">
                        {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
