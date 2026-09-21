'use client';

import React from 'react';
import { Users, Sparkles, Clock, HelpCircle, ArrowRight, Utensils } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';

interface TableWelcomeModalProps {
  isOpen: boolean;
  tableNumber: number;
  restaurantName?: string;
  elapsedMinutes?: number;
  lastOrderTotal?: number;
  onJoinMeal: () => void;
  onStartNewMeal: () => void;
}

export const TableWelcomeModal: React.FC<TableWelcomeModalProps> = ({
  isOpen,
  tableNumber,
  restaurantName = 'Notre Restaurant',
  elapsedMinutes = 20,
  lastOrderTotal,
  onJoinMeal,
  onStartNewMeal,
}) => {
  if (!isOpen) return null;

  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col">
        
        {/* En-tête accueillant avec dégradé ambre/ardoise */}
        <div className="p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white text-center relative overflow-hidden">
          <div className="inline-flex p-3 rounded-2xl bg-amber-500 text-slate-950 mb-3 shadow-md">
            <Utensils className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>👋</span>
            <span>Vous êtes à la Table {formattedTable}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
            {restaurantName}
          </p>
        </div>

        {/* Corps d'explication simple et visuel */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-950">
                Un repas vient de se terminer ici
              </h3>
              <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
                Une addition a été réglée il y a environ <strong className="font-black">{elapsedMinutes} min</strong>
                {lastOrderTotal && lastOrderTotal > 0 ? (
                  <> ({formatFCFA(lastOrderTotal)})</>
                ) : null}.
                <br />
                Que souhaitez-vous faire ?
              </p>
            </div>
          </div>

          {/* Boutons d'action géants (Accessibilité Universelle) */}
          <div className="space-y-3 pt-1">
            {/* Bouton 1 : Rejoindre (VERT) */}
            <button
              type="button"
              onClick={onJoinMeal}
              className="w-full min-h-[56px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-between shadow-lg shadow-emerald-600/25 transition-all cursor-pointer border border-emerald-500"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Users className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-black leading-tight">👥 Je rejoins le repas en cours</div>
                  <div className="text-[11px] font-normal text-emerald-100">
                    Ajouter mes plats sur la note de la table
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 shrink-0" />
            </button>

            {/* Bouton 2 : Nouveau repas (BLEU) */}
            <button
              type="button"
              onClick={onStartNewMeal}
              className="w-full min-h-[56px] py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm sm:text-base flex items-center justify-between shadow-lg shadow-blue-600/25 transition-all cursor-pointer border border-blue-500"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Sparkles className="w-5 h-5 text-white stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-black leading-tight">🆕 Je commence un nouveau repas</div>
                  <div className="text-[11px] font-normal text-blue-100">
                    Démarrer une table neuve et vierge
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 shrink-0" />
            </button>
          </div>

          {/* Note discrète */}
          <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>En cas de doute, demandez à votre serveur.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
