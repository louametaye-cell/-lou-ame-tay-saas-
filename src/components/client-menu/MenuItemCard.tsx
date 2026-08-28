'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, Clock, Star, Sparkles, AlertCircle } from 'lucide-react';
import { MenuItemType, ALLERGEN_ICONS, Language } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { getUIText, translateAllergenLabel } from '@/lib/translation-engine';

interface MenuItemCardProps {
  item: MenuItemType;
  quantity: number;
  onQuickAdd: (item: MenuItemType) => void;
  onQuickRemove: (itemId: string) => void;
  onClickDetails: (item: MenuItemType) => void;
  lang?: Language;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantity,
  onQuickAdd,
  onQuickRemove,
  onClickDetails,
  lang = 'FR',
}) => {
  const t = getUIText(lang);
  const isOutOfStock = item.isAvailable === false;
  const isSpecial = item.isSpecialOfTheDay || item.isSpecial;
  const wolofTitle = item.nameWolof || item.wolofName;
  const prepTime = item.preparationTime || 10;
  const rating = item.rating || 4.8;

  // Max 2 allergen badges for clean mobile card
  const allergenBadges = (item.allergens || [])
    .slice(0, 2)
    .map((all) => {
      const match = ALLERGEN_ICONS[all] || { icon: '⚠️', label: all };
      const translatedLabel = translateAllergenLabel(match.label, lang);
      return { label: translatedLabel, icon: match.icon };
    });

  return (
    <article
      className={`bg-white rounded-3xl overflow-hidden border border-orange-100/90 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group relative ${
        isOutOfStock ? 'opacity-60 grayscale-[35%]' : ''
      } ${isSpecial ? 'ring-2 ring-amber-400/60 shadow-amber-500/5' : ''}`}
    >
      {/* 1. Image 4:3 Ratio with Badges */}
      <div
        onClick={() => !isOutOfStock && onClickDetails(item)}
        className="relative w-full aspect-[4/3] cursor-pointer overflow-hidden bg-amber-50"
      >
        <Image
          src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={Boolean(isSpecial)}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          {isSpecial ? (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.specialOfTheDay}</span>
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1.5 ml-auto">
            <div className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>⏱ {prepTime} {t.prepTime}</span>
            </div>

            <div className="bg-black/60 backdrop-blur-xs text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center z-10 p-4">
            <span className="bg-rose-600 text-white font-black text-xs sm:text-sm uppercase tracking-wider px-4 py-2 rounded-2xl shadow-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{t.outOfStock}</span>
            </span>
          </div>
        )}
      </div>

      {/* 2. Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#FFFDFB]">
        <div
          onClick={() => !isOutOfStock && onClickDetails(item)}
          className="cursor-pointer space-y-1"
        >
          {wolofTitle && (
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block">
              {wolofTitle}
            </span>
          )}
          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-orange-600 transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-normal">
            {item.description}
          </p>
        </div>

        {/* 3. Tags & Allergens */}
        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
          {item.spiceLevel && item.spiceLevel > 0 ? (
            <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
              <span>🌶️</span>
              <span>{item.spiceLevel === 1 ? 'Léger' : item.spiceLevel === 2 ? 'Épicé' : 'Très pimenté'}</span>
            </span>
          ) : null}

          {allergenBadges.map((all, idx) => (
            <span
              key={idx}
              className="bg-amber-50 border border-amber-200 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-lg flex items-center gap-1"
            >
              <span>{all.icon}</span>
              <span>{all.label}</span>
            </span>
          ))}
        </div>

        {/* 4. Bottom Row: Price & 44px Touch Action Button */}
        <div className="pt-3 border-t border-orange-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold block">{t.price}</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight block">
              {formatFCFA(item.price)}
            </span>
          </div>

          <div>
            {quantity > 0 ? (
              <div className="flex items-center bg-emerald-50 border-2 border-emerald-600/30 rounded-2xl p-0.5 gap-1.5 shadow-xs">
                <button
                  type="button"
                  onClick={() => onQuickRemove(item.id)}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-white text-slate-800 flex items-center justify-center font-bold text-lg active:scale-95 transition-transform shadow-xs hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Diminuer"
                >
                  <Minus className="w-4 h-4 stroke-[3]" />
                </button>

                <span className="font-black text-sm text-emerald-800 px-1 min-w-[20px] text-center">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => onQuickAdd(item)}
                  disabled={isOutOfStock}
                  className="min-h-[40px] min-w-[40px] rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg active:scale-95 transition-transform shadow-xs hover:bg-emerald-700"
                  aria-label="Augmenter"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onQuickAdd(item)}
                disabled={isOutOfStock}
                className="min-h-[44px] px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-sm shadow-emerald-600/20"
                aria-label={`Ajouter ${item.name} au panier`}
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t.add}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
