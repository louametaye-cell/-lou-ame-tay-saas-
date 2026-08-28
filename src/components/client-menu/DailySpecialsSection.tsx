'use client';

import React from 'react';
import { Sparkles, Clock, Star, Plus, Flame } from 'lucide-react';
import { MenuItemType, Language, CurrencyCode, ExchangeRates } from '@/types';
import { formatFCFA, formatConvertedPrice } from '@/lib/utils';
import { getUIText } from '@/lib/translation-engine';

interface DailySpecialsSectionProps {
  items: MenuItemType[];
  onQuickAdd: (item: MenuItemType) => void;
  onOpenDetails: (item: MenuItemType) => void;
  lang?: Language;
  currency?: CurrencyCode;
  exchangeRates?: ExchangeRates;
}

export const DailySpecialsSection: React.FC<DailySpecialsSectionProps> = ({
  items,
  onQuickAdd,
  onOpenDetails,
  lang = 'FR',
  currency = 'FCFA',
  exchangeRates,
}) => {
  const t = getUIText(lang);

  const specials = items.filter(
    (item) => item.isDailySpecial || item.isSpecialOfTheDay || item.isSpecial
  );

  if (specials.length === 0) return null;

  return (
    <section className="space-y-3">
      {/* Header Title */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌟</span>
          <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
            {lang === 'WO' ? 'Lou am tay ? (Plats du Jour)' : 'Lou Ame Tay ? — Plats du Jour'}
          </h2>
        </div>
        <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
          Cuisiné Frais ⏱️
        </span>
      </div>

      {/* Horizontal Carousel */}
      <div className="flex items-stretch gap-3.5 overflow-x-auto no-scrollbar py-1 scroll-smooth">
        {specials.map((dish) => {
          const formattedPrice = formatFCFA(dish.price);
          const convertedBadge =
            currency !== 'FCFA' && exchangeRates
              ? formatConvertedPrice(dish.price, currency, exchangeRates)
              : null;

          return (
            <div
              key={dish.id}
              onClick={() => dish.isAvailable && onOpenDetails(dish)}
              className={`min-w-[280px] max-w-[300px] bg-white rounded-3xl overflow-hidden border-2 border-amber-400 shadow-md hover:shadow-lg transition-all flex flex-col justify-between shrink-0 group relative cursor-pointer ${
                !dish.isAvailable ? 'opacity-60 grayscale-[40%]' : ''
              }`}
            >
              {/* Photo & Badges */}
              <div className="relative w-full h-36 bg-amber-50 overflow-hidden">
                <img
                  src={dish.imageUrl || '/placeholder-food.jpg'}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Top Badge */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider animate-pulse">
                    <Sparkles className="w-3 h-3" />
                    <span>Lou Ame Tay</span>
                  </span>

                  <div className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>{dish.preparationTime || 12} min</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 bg-[#FFFDFB]">
                <div>
                  <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mt-0.5">
                    {dish.description}
                  </p>
                </div>

                {/* Price & Add Button */}
                <div className="pt-2 border-t border-orange-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-black text-slate-900 block font-mono">
                      {formattedPrice}
                    </span>
                    {convertedBadge && (
                      <span className="text-[10px] font-bold text-emerald-700 block">
                        {convertedBadge}
                      </span>
                    )}
                  </div>

                  {dish.isAvailable ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAdd(dish);
                      }}
                      className="min-h-[40px] px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm transition-all"
                      aria-label={`Ajouter ${dish.name}`}
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span>{t.add}</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">
                      Épuisé
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};