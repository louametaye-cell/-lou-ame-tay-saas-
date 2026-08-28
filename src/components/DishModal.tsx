'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Clock, Star, Plus, Minus, Sparkles, MessageSquare } from 'lucide-react';
import { MenuItemType, ALLERGEN_ICONS } from '@/types';
import { formatFCFA } from '@/lib/utils';

interface DishModalProps {
  item: MenuItemType | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: MenuItemType, notes?: string, quantity?: number) => void;
}

export const DishModal: React.FC<DishModalProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  if (!isOpen || !item) return null;

  const handleAdd = () => {
    onAddToCart(item, notes.trim() ? notes.trim() : undefined, quantity);
    setQuantity(1);
    setNotes('');
    onClose();
  };

  const wolofTitle = item.nameWolof || item.wolofName;
  const prepTime = item.preparationTime || 10;
  const rating = item.rating || 4.8;
  const isSpecial = item.isSpecialOfTheDay || item.isSpecial;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFDFB] rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border-t-4 border-green-600 relative animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col justify-between">
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 min-h-[48px] min-w-[48px] rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          {/* Header Image */}
          <div className="relative w-full h-64 sm:h-72 bg-amber-50">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-amber-50">
                🍲
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
              {isSpecial && (
                <span className="bg-[#FF6B00] text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span>🌟 Lou Ame Tay</span>
                </span>
              )}

              <div className="ml-auto flex items-center gap-2">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>⏱ {prepTime} min</span>
                </span>
                <span className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{rating.toFixed(1)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Details (Typography >= 16px) */}
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              {wolofTitle && (
                <span className="text-sm font-black text-green-600 uppercase tracking-wider block">
                  {wolofTitle}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-black text-gray-950">
                {item.name}
              </h2>
              <span className="text-2xl font-black text-gray-950 block mt-1">
                {formatFCFA(item.price)}
              </span>
            </div>

            <p className="text-base text-gray-700 leading-relaxed">
              {item.description}
            </p>

            {/* Allergens with Icons */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80">
                <span className="text-xs font-black text-amber-950 uppercase tracking-wider block mb-2">
                  Allergènes présents :
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {item.allergens.map((all, idx) => {
                    const match = ALLERGEN_ICONS[all] || { icon: '⚠️', label: all };
                    return (
                      <span
                        key={idx}
                        className="bg-white border border-amber-300 text-sm px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 text-gray-800 shadow-sm"
                      >
                        <span className="text-base">{match.icon}</span>
                        <span>{match.label}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Special Instructions (Input 16px) */}
            <div className="space-y-1.5 pt-2">
              <label className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-green-600" />
                <span>Instructions particulières pour la cuisine :</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Sans oignons, bien pimenté, sauce à part..."
                rows={2}
                className="w-full bg-white border border-orange-200 focus:border-green-600 rounded-2xl p-3.5 text-base text-gray-900 outline-none resize-none shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Controls with 48px Stepper & 56px Button */}
        <div className="p-4 bg-white border-t border-orange-100 flex items-center justify-between gap-3">
          {/* Stepper with 48px buttons */}
          <div className="flex items-center bg-gray-100 rounded-2xl p-1 border border-gray-200 gap-1">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="min-h-[48px] min-w-[48px] bg-white text-gray-800 rounded-xl flex items-center justify-center font-bold text-xl active:scale-95 transition-transform shadow-sm"
            >
              <Minus className="w-5 h-5 stroke-[3]" />
            </button>
            <span className="font-black text-lg text-gray-900 px-3">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="min-h-[48px] min-w-[48px] bg-white text-gray-800 rounded-xl flex items-center justify-center font-bold text-xl active:scale-95 transition-transform shadow-sm"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Big Add Button (56px) */}
          <button
            onClick={handleAdd}
            className="flex-1 min-h-[56px] px-5 bg-green-600 hover:bg-green-700 text-white font-black text-base rounded-2xl shadow-lg shadow-green-600/25 active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <span>Ajouter • {formatFCFA(item.price * quantity)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
