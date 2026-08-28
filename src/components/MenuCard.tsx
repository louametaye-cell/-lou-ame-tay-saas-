'use client';

import React from 'react';
import Image from 'next/image';
import { Plus, Minus, Clock, Star, Sparkles } from 'lucide-react';
import { MenuItemType, ALLERGEN_ICONS } from '@/types';
import { formatFCFA } from '@/lib/utils';

interface MenuCardProps {
  item: MenuItemType;
  quantity: number;
  onAdd: (item: MenuItemType) => void;
  onRemove: (itemId: string) => void;
  onClickDetails?: (item: MenuItemType) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  quantity,
  onAdd,
  onRemove,
  onClickDetails,
}) => {
  const isOutOfStock = !item.isAvailable;
  const isSpecial = item.isSpecialOfTheDay || item.isSpecial;
  const wolofTitle = item.nameWolof || item.wolofName;
  const prepTime = item.preparationTime || 10;
  const rating = item.rating || 4.5;

  // Max 3 allergen badges
  const allergenBadges = (item.allergens || [])
    .slice(0, 3)
    .map((all) => {
      const match = ALLERGEN_ICONS[all] || { icon: '⚠️', label: all };
      return { label: match.label, icon: match.icon };
    });

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden border border-amber-100/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative ${
        isOutOfStock ? 'opacity-60 grayscale-[40%]' : ''
      } ${isSpecial ? 'ring-2 ring-[#FF6B00]/40' : ''}`}
    >
      {/* 1. Large full-width optimized mobile image */}
      <div
        onClick={() => !isOutOfStock && onClickDetails?.(item)}
        className="relative w-full cursor-pointer overflow-hidden bg-amber-50"
      >
        <Image
          src={item.imageUrl || '/images/placeholder.jpg'}
          alt={item.name}
          width={400}
          height={300}
          className="w-full h-[200px] object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-500"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 pointer-events-none">
          {isSpecial && (
            <span className="bg-[#FF6B00] text-white text-xs font-black px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>🌟 Lou Ame Tay</span>
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            <div className="bg-black/60 backdrop-blur-md text-white text-xs font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>⏱ {prepTime} min</span>
            </div>

            <div className="bg-black/60 backdrop-blur-md text-amber-300 text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
            <span className="bg-red-600 text-white font-black text-sm uppercase tracking-widest px-5 py-2.5 rounded-full shadow-xl">
              ⚠️ Momentanément Épuisé
            </span>
          </div>
        )}
      </div>

      {/* 2. Card Body with 16px Padding & Typography >= 16px */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4 bg-[#FFFDFB]">
        <div>
          <div className="space-y-1">
            {wolofTitle && (
              <span className="text-sm font-black text-green-600 uppercase tracking-wider block">
                {wolofTitle}
              </span>
            )}
            <h3
              onClick={() => !isOutOfStock && onClickDetails?.(item)}
              className="text-lg sm:text-xl font-black text-gray-950 leading-snug cursor-pointer group-hover:text-[#FF6B00] transition-colors"
            >
              {item.name}
            </h3>
          </div>

          <p className="text-base text-gray-700 line-clamp-2 mt-2 leading-relaxed font-normal">
            {item.description}
          </p>
        </div>

        {/* 3. Allergen Badges */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {allergenBadges.length > 0 ? (
            allergenBadges.map((all, idx) => (
              <span
                key={idx}
                className="bg-amber-50 border border-amber-200 text-sm px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-gray-800 shadow-sm"
              >
                <span className="text-base">{all.icon}</span>
                <span className="text-xs font-bold">{all.label}</span>
              </span>
            ))
          ) : (
            <span className="text-sm text-green-600 font-bold flex items-center gap-1">
              🌿 Fait maison avec passion
            </span>
          )}
        </div>

        {/* 4. Bottom Controls: Big Price + 48px Touch Buttons */}
        <div className="pt-3 border-t border-amber-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-gray-500 uppercase font-bold block">Prix</span>
            <span className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight block">
              {formatFCFA(item.price)}
            </span>
          </div>

          <div>
            {quantity > 0 ? (
              <div className="flex items-center bg-green-50 border-2 border-green-600/30 rounded-2xl p-1 shadow-sm gap-2">
                <button
                  onClick={() => onRemove(item.id)}
                  className="min-h-[48px] min-w-[48px] rounded-xl bg-white text-gray-800 flex items-center justify-center font-bold text-xl active:scale-95 transition-transform shadow-sm hover:bg-red-50 hover:text-red-600"
                  aria-label="Diminuer la quantité"
                >
                  <Minus className="w-5 h-5 stroke-[3]" />
                </button>

                <span className="font-black text-lg text-green-700 px-2 min-w-[24px] text-center">
                  {quantity}
                </span>

                <button
                  onClick={() => onAdd(item)}
                  disabled={isOutOfStock}
                  className="min-h-[48px] min-w-[48px] rounded-xl bg-green-600 text-white flex items-center justify-center font-bold text-xl active:scale-95 transition-transform shadow-md hover:bg-green-700"
                  aria-label="Augmenter la quantité"
                >
                  <Plus className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onAdd(item)}
                disabled={isOutOfStock}
                className="min-h-[48px] min-w-[48px] px-5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-md"
                aria-label={`Ajouter ${item.name} au panier`}
              >
                <Plus className="w-5 h-5 stroke-[3]" />
                <span className="font-extrabold">Ajouter</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
