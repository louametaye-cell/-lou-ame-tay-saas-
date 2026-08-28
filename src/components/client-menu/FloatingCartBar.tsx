'use client';

import React from 'react';
import { ShoppingBag, ArrowRight, Users } from 'lucide-react';
import { Language, CurrencyCode, ExchangeRates } from '@/types';
import { formatFCFA, formatConvertedPrice } from '@/lib/utils';
import { getUIText } from '@/lib/translation-engine';

interface FloatingCartBarProps {
  totalCount: number;
  totalPrice: number;
  tableNumber: number;
  onOpenCart: () => void;
  onOpenSplitBill?: () => void;
  lang?: Language;
  currency?: CurrencyCode;
  exchangeRates?: ExchangeRates;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({
  totalCount,
  totalPrice,
  onOpenCart,
  onOpenSplitBill,
  lang = 'FR',
  currency = 'FCFA',
  exchangeRates,
}) => {
  if (totalCount === 0) return null;

  const t = getUIText(lang);
  const convertedTotal =
    currency !== 'FCFA' && exchangeRates
      ? formatConvertedPrice(totalPrice, currency, exchangeRates)
      : null;

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
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight block font-mono">
                {formatFCFA(totalPrice)}
              </span>
              {convertedTotal && (
                <span className="text-xs font-black text-emerald-700">
                  ({convertedTotal})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Actions: Split Bill Button + View Cart Button */}
        <div className="flex items-center gap-2">
          {onOpenSplitBill && (
            <button
              type="button"
              onClick={onOpenSplitBill}
              className="min-h-[46px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs active:scale-95"
              title="Partager l'addition"
            >
              <Users className="w-4 h-4 text-emerald-700" />
              <span className="hidden sm:inline">Partager</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCart}
            className="min-h-[46px] px-4 sm:px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
            aria-label="Voir mon panier"
          >
            <span>{lang === 'WO' ? 'Xool sa panie' : t.viewCart}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </aside>
  );
};