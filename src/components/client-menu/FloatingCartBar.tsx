'use client';

import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { Language } from '@/types';
import { getUIText } from '@/lib/translation-engine';

interface FloatingCartBarProps {
  totalCount: number;
  totalPrice: number;
  tableNumber: number;
  onOpenCart: () => void;
  lang?: Language;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  totalCount,
  totalPrice,
  onOpenCart,
  lang = 'FR',
}) => {
  if (totalCount === 0) return null;

  const t = getUIText(lang);

  return (
    <aside
      aria-label="Panier flottant"
      className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t-2 border-emerald-600 shadow-2xl z-40 animate-in slide-in-from-bottom duration-300"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Count & Amount Summary */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-xs font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
              {totalCount}
            </span>
          </div>

          <div className="min-w-0">
            <span className="text-xs text-slate-500 font-bold block truncate">
              {totalCount} {totalCount > 1 ? t.articles : t.article}
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight block">
              {formatFCFA(totalPrice)}
            </span>
          </div>
        </div>

        {/* Primary CTA Button (52px) */}
        <button
          type="button"
          onClick={onOpenCart}
          className="min-h-[52px] px-5 sm:px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <span>{t.viewCart}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
