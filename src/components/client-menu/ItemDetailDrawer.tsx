'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Clock, Star, Plus, Minus, Sparkles, Check, MessageSquare } from 'lucide-react';
import { MenuItemType, CartItemOption, CartItemExtra, ALLERGEN_ICONS, Language } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { getUIText, translateAllergenLabel } from '@/lib/translation-engine';

interface ItemDetailDrawerProps {
  item: MenuItemType | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    item: MenuItemType,
    options: CartItemOption,
    notes: string,
    quantity: number
  ) => void;
  lang?: Language;
}

const AVAILABLE_SIDES = [
  { id: 'side_riz_blanc', label: 'Riz blanc parfumé', icon: '🍚' },
  { id: 'side_riz_rouge', label: 'Riz rouge au bouillon (Ceeb)', icon: '🔴' },
  { id: 'side_alloco', label: 'Alloco (Plantains frits)', icon: '🍌' },
  { id: 'side_frites', label: 'Frites dorées', icon: '🍟' },
];

const SPICE_LEVELS = [
  { id: 'spice_doux', label: 'Doux (Sans piment)', icon: '🟢' },
  { id: 'spice_moyen', label: 'Pimenté', icon: '🌶️' },
  { id: 'spice_apart', label: 'Piment servi à part', icon: '🥣' },
];

const AVAILABLE_EXTRAS: CartItemExtra[] = [
  { id: 'extra_bissap', name: 'Bissap / Bouye frais maison', price: 500 },
  { id: 'extra_sauce_yassa', name: 'Sauce oignons caramélisés yassa', price: 300 },
  { id: 'extra_oeuf', name: 'Œuf dur fermier', price: 300 },
];

export const ItemDetailDrawer: React.FC<ItemDetailDrawerProps> = ({
  item,
  isOpen,
  onClose,
  onAddToCart,
  lang = 'FR',
}) => {
  const t = getUIText(lang);

  const [quantity, setQuantity] = useState(1);
  const [selectedSide, setSelectedSide] = useState<string>('Riz blanc parfumé');
  const [selectedSpice, setSelectedSpice] = useState<string>('Doux (Sans piment)');
  const [selectedExtras, setSelectedExtras] = useState<CartItemExtra[]>([]);
  const [customerNotes, setCustomerNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedSide('Riz blanc parfumé');
      setSelectedSpice('Doux (Sans piment)');
      setSelectedExtras([]);
      setCustomerNotes('');
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const toggleExtra = (extra: CartItemExtra) => {
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const extrasTotalPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0);
  const singleItemPrice = item.price + extrasTotalPrice;
  const grandTotal = singleItemPrice * quantity;

  const handleConfirmAdd = () => {
    const options: CartItemOption = {
      side: selectedSide,
      spiceLevel: selectedSpice,
      extras: selectedExtras,
    };
    onAddToCart(item, options, customerNotes.trim(), quantity);
    onClose();
  };

  const wolofTitle = item.nameWolof || item.wolofName;
  const prepTime = item.preparationTime || 10;
  const rating = item.rating || 4.8;
  const isSpecial = item.isSpecialOfTheDay || item.isSpecial;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFDFB] rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border-t-4 border-emerald-600 relative animate-in slide-in-from-bottom duration-300 max-h-[92vh] flex flex-col justify-between">
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 min-h-[44px] min-w-[44px] rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-all active:scale-95 flex items-center justify-center"
          aria-label={t.closeWindow}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 space-y-6">
          {/* Hero Image */}
          <div className="relative w-full aspect-[16/9] bg-amber-50">
            <Image
              src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
              alt={item.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 500px"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
              {isSpecial && (
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.specialOfTheDay}</span>
                </span>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-amber-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>⏱ {prepTime} {t.prepTime}</span>
                </span>
                <span className="bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-amber-300">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{rating.toFixed(1)}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Dish Information */}
          <div className="px-5 space-y-4">
            <div>
              {wolofTitle && (
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block">
                  {wolofTitle}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-black text-slate-950">
                {item.name}
              </h2>
              <span className="text-2xl font-black text-orange-600 block mt-1">
                {formatFCFA(item.price)}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {item.description}
            </p>

            {/* Allergens Info */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="bg-amber-50/90 p-3 rounded-2xl border border-amber-200">
                <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider block mb-1.5">
                  {t.allergensPresent}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.allergens.map((all, idx) => {
                    const match = ALLERGEN_ICONS[all] || { icon: '⚠️', label: all };
                    const translatedLabel = translateAllergenLabel(match.label, lang);
                    return (
                      <span
                        key={idx}
                        className="bg-white border border-amber-300 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 text-slate-800 shadow-2xs"
                      >
                        <span>{match.icon}</span>
                        <span>{translatedLabel}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 1. Choice of Side */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Accompagnement au choix :</span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Inclus</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_SIDES.map((side) => {
                  const isSelected = selectedSide === side.label;
                  return (
                    <button
                      key={side.id}
                      type="button"
                      onClick={() => setSelectedSide(side.label)}
                      className={`min-h-[44px] p-3 rounded-2xl border-2 text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{side.icon}</span>
                        <span className="text-xs sm:text-sm font-semibold">{side.label}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Choice of Spice Level */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
                <span>Niveau de piment :</span>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Inclus</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SPICE_LEVELS.map((sp) => {
                  const isSelected = selectedSpice === sp.label;
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setSelectedSpice(sp.label)}
                      className={`min-h-[44px] p-2.5 rounded-2xl border-2 text-center flex flex-col items-center justify-center transition-all active:scale-[0.98] ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/80 text-orange-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-base">{sp.icon}</span>
                      <span className="text-[11px] font-bold mt-0.5">{sp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Extra Add-ons (Checkboxes) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-200">
              <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                Suppléments & Boissons fraîches :
              </label>
              <div className="space-y-2">
                {AVAILABLE_EXTRAS.map((extra) => {
                  const isChecked = selectedExtras.some((e) => e.id === extra.id);
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={`w-full min-h-[44px] p-3 rounded-2xl border-2 text-left flex items-center justify-between transition-all active:scale-[0.98] ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold">{extra.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-orange-600">+{formatFCFA(extra.price)}</span>
                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${isChecked ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Special Kitchen Notes */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 pb-2">
              <label className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{t.specialInstructions}</span>
              </label>
              <input
                type="text"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder={t.specialInstructionsPlaceholder}
                className="w-full bg-white border border-slate-200 focus:border-emerald-600 rounded-2xl p-3 text-sm text-slate-900 outline-none shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Bottom CTA Controls */}
        <div className="p-4 bg-white border-t border-orange-100 flex items-center justify-between gap-3 shadow-lg">
          {/* Quantity Stepper (min 44px) */}
          <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="min-h-[44px] min-w-[44px] bg-white text-slate-800 rounded-xl flex items-center justify-center font-bold text-lg active:scale-95 transition-transform shadow-2xs hover:bg-rose-50 hover:text-rose-600"
              aria-label="Diminuer la quantité"
            >
              <Minus className="w-4 h-4 stroke-[3]" />
            </button>
            <span className="font-black text-base text-slate-900 px-2 min-w-[24px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="min-h-[44px] min-w-[44px] bg-white text-slate-800 rounded-xl flex items-center justify-center font-bold text-lg active:scale-95 transition-transform shadow-2xs hover:bg-emerald-50 hover:text-emerald-700"
              aria-label="Augmenter la quantité"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* Primary CTA (56px) */}
          <button
            type="button"
            onClick={handleConfirmAdd}
            className="flex-1 min-h-[56px] px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{t.add} • {formatFCFA(grandTotal)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
