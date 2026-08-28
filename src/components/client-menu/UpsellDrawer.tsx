'use client';

import React from 'react';
import { Sparkles, Plus, ArrowRight, X, HeartHandshake } from 'lucide-react';
import { MenuItemType, Language } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface UpsellSuggestion {
  id: string;
  name: string;
  category: string;
  price: number;
  promoPrice?: number;
  imageUrl: string;
  tagline: string;
}

interface UpsellDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueToCheckout: () => void;
  onAddUpsellItem: (item: MenuItemType) => void;
  lang?: Language;
}

const DEFAULT_UPSELL_ITEMS: UpsellSuggestion[] = [
  {
    id: 'upsell_bissap',
    name: 'Bissap Maison Glacé',
    category: 'Boissons',
    price: 1000,
    promoPrice: 500,
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80',
    tagline: 'Infusion fraîche de fleurs d\'hibiscus & menthe',
  },
  {
    id: 'upsell_bouye',
    name: 'Jus de Bouye Frais',
    category: 'Boissons',
    price: 1200,
    promoPrice: 500,
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80',
    tagline: 'Nectar onctueux de pulpe de baobab sauvage',
  },
  {
    id: 'upsell_pastels',
    name: 'Portion Pastels Poisson (4 pcs)',
    category: 'Entrées',
    price: 1500,
    promoPrice: 1000,
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=400&q=80',
    tagline: 'Beignets dorés farcis au poisson & sauce kaani',
  },
];

export const UpsellDrawer: React.FC<UpsellDrawerProps> = ({
  isOpen,
  onClose,
  onContinueToCheckout,
  onAddUpsellItem,
  lang = 'FR',
}) => {
  if (!isOpen) return null;

  const handleAdd = (item: UpsellSuggestion) => {
    const menuItem: MenuItemType = {
      id: item.id,
      name: item.name,
      description: item.tagline,
      price: item.promoPrice || item.price,
      imageUrl: item.imageUrl,
      isAvailable: true,
      allergens: [],
      categoryId: 'boissons',
    };
    onAddUpsellItem(menuItem);
    toast.success(`✨ « ${item.name} » ajouté en offre spéciale !`);
    onContinueToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-orange-100 space-y-4 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orange-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                {lang === 'WO' ? 'Ndax da ngay naan lii ?' : 'Pour accompagner votre repas ?'}
              </h3>
              <p className="text-xs text-amber-700 font-bold">
                {lang === 'WO' ? 'Ofer spésiyal ci sa komand !' : 'Offre spéciale sur les boissons & douceurs'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onContinueToCheckout}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Suggestion Cards */}
        <div className="space-y-2.5">
          {DEFAULT_UPSELL_ITEMS.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-gradient-to-r from-amber-50/70 to-orange-50/40 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 hover:shadow-xs transition-all"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-amber-200">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  {item.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {item.tagline}
                </p>
                <div className="flex items-baseline gap-1.5 pt-0.5">
                  <span className="text-xs font-black text-orange-600 font-mono">
                    +{formatFCFA(item.promoPrice || item.price)}
                  </span>
                  <span className="text-[10px] text-slate-400 line-through font-mono">
                    {formatFCFA(item.price)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAdd(item)}
                className="min-h-[38px] px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 shadow-2xs transition-all shrink-0"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Ajouter</span>
              </button>
            </div>
          ))}
        </div>

        {/* Skip / Continue Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={onContinueToCheckout}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5"
          >
            <span>{lang === 'WO' ? 'Déedéet, jàllal léegi' : 'Non merci, continuer vers le paiement'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};