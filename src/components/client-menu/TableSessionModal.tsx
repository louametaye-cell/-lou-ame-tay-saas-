'use client';

import React from 'react';
import { Users, User, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Language } from '@/types';

interface TableSessionModalProps {
  isOpen: boolean;
  tableNumber: number;
  restaurantName: string;
  onSelectShared: () => void;
  onSelectIndividual: () => void;
  lang?: Language;
}

export const TableSessionModal: React.FC<TableSessionModalProps> = ({
  isOpen,
  tableNumber,
  restaurantName,
  onSelectShared,
  onSelectIndividual,
  lang = 'FR',
}) => {
  if (!isOpen) return null;

  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-orange-200 text-slate-900 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            📍 Table N° {formattedTable}
          </span>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
            Bienvenue chez {restaurantName}
          </h2>
          <p className="text-xs text-slate-600">
            {lang === 'WO'
              ? 'Tànnal naka ngay komandé ak sa xarit yi :'
              : 'Comment souhaitez-vous passer votre commande ?'}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* Option A: Shared Table Cart */}
          <button
            type="button"
            onClick={onSelectShared}
            className="p-4 rounded-2xl border-2 border-orange-500 bg-gradient-to-br from-orange-50/90 to-amber-50/60 hover:from-orange-100/90 hover:to-amber-100/70 text-left transition-all active:scale-[0.98] shadow-xs group"
          >
            <div className="flex items-start gap-3">
              <div className="p-3 bg-orange-500 text-white rounded-2xl shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-950">
                    {lang === 'WO' ? '👥 Panie bu ñu bokk' : '👥 Panier Partagé de la Table'}
                  </span>
                  <span className="text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-md uppercase">
                    Populaire
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'WO'
                    ? 'Bokkal sa komand ak nit ñi toog ci taabal bi ci temps réel.'
                    : 'Commandez ensemble ! Tous les convives de la table voient et ajoutent leurs plats au même panier.'}
                </p>
              </div>
            </div>
          </button>

          {/* Option B: Individual Cart */}
          <button
            type="button"
            onClick={onSelectIndividual}
            className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-left transition-all active:scale-[0.98] shadow-xs group"
          >
            <div className="flex items-start gap-3">
              <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <span className="text-sm font-black text-slate-950 block">
                  {lang === 'WO' ? '👤 Sa komand yow rekk' : '👤 Ma Commande Individuelle'}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'WO'
                    ? 'Komandeel sa bopp rekk ci taabal bi.'
                    : 'Gérez votre panier personnel indépendant rattaché à votre numéro de table.'}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-slate-500 text-center">
          ✨ Synchronisation en direct sans application ni création de compte.
        </p>
      </div>
    </div>
  );
};