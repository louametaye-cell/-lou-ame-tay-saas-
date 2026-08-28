'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Layers, 
  UtensilsCrossed, 
  Check, 
  Clock 
} from 'lucide-react';
import { CategoryType, MenuItemType } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

export interface ComboDealType {
  id: string;
  name: string;
  description: string;
  fixedPrice: number;
  starterCategory?: string;
  mainCategory?: string;
  drinkCategory?: string;
  period: 'LUNCH' | 'DINNER' | 'ALL_DAY';
  isActive: boolean;
}

interface ComboBuilderProps {
  categories: CategoryType[];
  initialCombos?: ComboDealType[];
}

export const ComboBuilder: React.FC<ComboBuilderProps> = ({
  categories,
  initialCombos = [
    {
      id: 'combo_teranga_midi',
      name: 'Formule Midi Téranga (Entrée + Plat + Boisson)',
      description: 'Portion Pastels + Thiéboudienne ou Yassa au choix + Jus de Bissap frais',
      fixedPrice: 4500,
      period: 'LUNCH',
      isActive: true,
    },
    {
      id: 'combo_grillade_soir',
      name: 'Menu Soirée Dibi & Grillades',
      description: 'Dibi Agneau braisé + Frites maison + Boisson gazeuse ou Jus naturel',
      fixedPrice: 6500,
      period: 'DINNER',
      isActive: true,
    },
  ],
}) => {
  const [combos, setCombos] = useState<ComboDealType[]>(initialCombos);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fixedPrice, setFixedPrice] = useState('4500');
  const [period, setPeriod] = useState<'LUNCH' | 'DINNER' | 'ALL_DAY'>('LUNCH');

  const handleCreateCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Veuillez renseigner le nom de la formule.');
      return;
    }

    const newCombo: ComboDealType = {
      id: `combo_${Date.now()}`,
      name,
      description,
      fixedPrice: parseFloat(fixedPrice) || 4500,
      period,
      isActive: true,
    };

    setCombos([newCombo, ...combos]);
    setName('');
    setDescription('');
    setFixedPrice('4500');
    setIsCreating(false);
    toast.success(`🍱 Formule « ${newCombo.name} » créée avec succès !`);
  };

  const handleToggleActive = (id: string) => {
    setCombos(
      combos.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    toast.info('Statut de la formule mis à jour');
  };

  const handleDelete = (id: string) => {
    setCombos(combos.filter((c) => c.id !== id));
    toast.warning('Formule supprimée');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-900 border border-slate-800 p-5 rounded-3xl">
        <div className="space-y-0.5">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Moteur de Formules & Menus Midi / Soir</span>
          </h3>
          <p className="text-xs text-slate-400">
            Créez des offres combinées tout-en-un (Entrée + Plat + Boisson) pour augmenter le ticket moyen.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="min-h-[44px] px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Nouvelle Formule</span>
        </button>
      </div>

      {/* Creation Modal / Inline Drawer */}
      {isCreating && (
        <form
          onSubmit={handleCreateCombo}
          className="bg-slate-900 border-2 border-orange-500/80 p-6 rounded-3xl space-y-4 shadow-xl animate-in zoom-in-95"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black text-white">
              Créer une nouvelle Formule Combinée
            </h4>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Annuler
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Nom de la formule *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Formule Midi Téranga Express"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                Tarif Forfaitaire (FCFA) *
              </label>
              <input
                type="number"
                value={fixedPrice}
                onChange={(e) => setFixedPrice(e.target.value)}
                placeholder="4500"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              Description & Inclusions
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: 1 Entrée au choix (Pastels) + 1 Plat du Jour + 1 Jus local frais (Bissap ou Bouye)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">
              Créneau horaire d'affichage automatique
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'LUNCH', label: '☀️ Midi (12h - 16h)' },
                { id: 'DINNER', label: '🌙 Soir (18h - 00h)' },
                { id: 'ALL_DAY', label: '🍽️ Toute la journée' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    period === p.id
                      ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                      : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md"
            >
              Enregistrer la Formule
            </button>
          </div>
        </form>
      )}

      {/* Existing Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {combos.map((combo) => (
          <div
            key={combo.id}
            className={`p-5 rounded-3xl border-2 transition-all space-y-3 flex flex-col justify-between ${
              combo.isActive
                ? 'bg-slate-900 border-amber-500/50 shadow-md shadow-amber-500/5'
                : 'bg-slate-950/60 border-slate-800 opacity-60'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍱</span>
                  <h4 className="text-sm font-black text-white">{combo.name}</h4>
                </div>
                <span className="text-xs font-black text-amber-400 font-mono bg-amber-950/80 px-2.5 py-1 rounded-xl border border-amber-800/80 shrink-0">
                  {formatFCFA(combo.fixedPrice)}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {combo.description}
              </p>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span>
                    {combo.period === 'LUNCH'
                      ? 'Midi (12h-16h)'
                      : combo.period === 'DINNER'
                      ? 'Soir (18h-00h)'
                      : 'Toute la journée'}
                  </span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    combo.isActive
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {combo.isActive ? 'Active' : 'Désactivée'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleActive(combo.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  combo.isActive
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {combo.isActive ? 'Désactiver' : 'Activer'}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(combo.id)}
                className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-950/40 transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};