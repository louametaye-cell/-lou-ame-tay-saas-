'use client';

import React, { useState } from 'react';
import { Sparkles, Plus, Check, Utensils, ArrowRight } from 'lucide-react';
import { MenuItemType, Language } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { getUIText } from '@/lib/translation-engine';
import { toast } from 'sonner';

interface ComboSectionProps {
  onAddComboToCart: (comboItem: MenuItemType) => void;
  lang?: Language;
}

export const ComboSection: React.FC<ComboSectionProps> = ({
  onAddComboToCart,
  lang = 'FR',
}) => {
  const t = getUIText(lang);
  const [selectedStarter, setSelectedStarter] = useState('Pastels Poisson (4 pcs)');
  const [selectedMain, setSelectedMain] = useState('Thiéboudienne Rouge Traditionnelle');
  const [selectedDrink, setSelectedDrink] = useState('Jus de Bissap Maison');
  const [isOpenBuilder, setIsOpenBuilder] = useState(false);

  const starters = ['Pastels Poisson (4 pcs)', 'Fataya Viande Hachée', 'Salade Fraîcheur'];
  const mains = ['Thiéboudienne Rouge Traditionnelle', 'Yassa Ginaar Braisé', 'Mafé Yàpp Bœuf'];
  const drinks = ['Jus de Bissap Maison', 'Jus de Bouye Frais', 'Eau Minérale Kirène'];

  const handleAddFormula = () => {
    const comboDish: MenuItemType = {
      id: `combo_midi_${Date.now()}`,
      name: '🍱 Formule Midi Téranga Express',
      description: `Inclus : 1x ${selectedStarter} + 1x ${selectedMain} + 1x ${selectedDrink}`,
      price: 4500,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
      isAvailable: true,
      allergens: [],
      categoryId: 'combos',
    };

    onAddComboToCart(comboDish);
    setIsOpenBuilder(false);
    toast.success('🍱 Formule Midi Téranga ajoutée à votre commande !');
  };

  return (
    <section className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-500/5 border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 space-y-4 shadow-sm">
      {/* Banner */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full inline-block">
            Menu Tout-en-Un ☀️
          </span>
          <h3 className="text-base font-black text-slate-950">
            {t.comboFormulaTitle || '🍱 Formule Midi Téranga (Entrée + Plat + Boisson)'}
          </h3>
          <p className="text-xs text-slate-600">
            {t.comboFormulaSubtitle || 'Composez votre déjeuner complet à tarif préférentiel.'}
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-base font-black text-orange-600 font-mono block">
            4 500 FCFA
          </span>
          <span className="text-[10px] text-slate-400 line-through font-mono">
            6 000 FCFA
          </span>
        </div>
      </div>

      {!isOpenBuilder ? (
        <button
          type="button"
          onClick={() => setIsOpenBuilder(true)}
          className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Composer ma Formule (3 étapes)</span>
        </button>
      ) : (
        <div className="space-y-4 pt-2 border-t border-amber-200 animate-in slide-in-from-top-2">
          {/* Step 1: Starter */}
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px]">1</span>
              <span>Choisissez votre Entrée :</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {starters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStarter(s)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                    selectedStarter === s
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs font-black'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Main Dish */}
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px]">2</span>
              <span>Choisissez votre Plat Principal :</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {mains.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMain(m)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                    selectedMain === m
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs font-black'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Drink */}
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px]">3</span>
              <span>Choisissez votre Boisson fraîche :</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
              {drinks.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDrink(d)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                    selectedDrink === d
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs font-black'
                      : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Validate Button */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsOpenBuilder(false)}
              className="py-2.5 px-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={handleAddFormula}
              className="flex-1 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Ajouter la Formule (4 500 FCFA)</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};