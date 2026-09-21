'use client';

import React, { useState } from 'react';
import { Users, User, Check, X, ArrowRight, Sparkles } from 'lucide-react';

interface SeparateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  currentGuestName?: string;
  isCurrentlySeparate?: boolean;
  onSelectCommonBill: () => void;
  onSelectSeparateBill: (guestName: string) => void;
}

export const SeparateBillModal: React.FC<SeparateBillModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  currentGuestName = '',
  isCurrentlySeparate = false,
  onSelectCommonBill,
  onSelectSeparateBill,
}) => {
  const [name, setName] = useState(currentGuestName);
  const [selectedMode, setSelectedMode] = useState<'COMMON' | 'SEPARATE'>(
    isCurrentlySeparate ? 'SEPARATE' : 'SEPARATE'
  );

  if (!isOpen) return null;

  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  const handleConfirm = () => {
    if (selectedMode === 'COMMON') {
      onSelectCommonBill();
    } else {
      const cleanName = name.trim() || `Place ${Math.floor(Math.random() * 8) + 1}`;
      onSelectSeparateBill(cleanName);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 flex flex-col">
        
        {/* Header avec dégradé soigné */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="inline-flex p-3 rounded-2xl bg-teal-500 text-slate-950 mb-2.5 shadow-md">
            <Users className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            Table {formattedTable} — Mode d'Addition
          </h2>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Comment souhaitez-vous commander et régler votre repas ?
          </p>
        </div>

        {/* Corps de sélection visuelle */}
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Option 1 : Note Commune */}
          <button
            type="button"
            onClick={() => setSelectedMode('COMMON')}
            className={`w-full min-h-[58px] p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
              selectedMode === 'COMMON'
                ? 'border-emerald-500 bg-emerald-50/80 shadow-md ring-2 ring-emerald-400/30'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${selectedMode === 'COMMON' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">
                  👥 Note Commune (Même Table)
                </div>
                <div className="text-xs text-slate-500">
                  Tous les plats sont regroupés sur l'addition de la table.
                </div>
              </div>
            </div>
            {selectedMode === 'COMMON' && (
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>

          {/* Option 2 : Addition Séparée */}
          <button
            type="button"
            onClick={() => setSelectedMode('SEPARATE')}
            className={`w-full min-h-[58px] p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
              selectedMode === 'SEPARATE'
                ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-400/30'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${selectedMode === 'SEPARATE' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">
                  👤 Mon Addition Séparée (Individuelle)
                </div>
                <div className="text-xs text-slate-500">
                  Je paie uniquement mes plats avec mon propre Wave, OM ou espèces.
                </div>
              </div>
            </div>
            {selectedMode === 'SEPARATE' && (
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            )}
          </button>

          {/* Saisie du prénom en mode séparé */}
          {selectedMode === 'SEPARATE' && (
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2 animate-in fade-in">
              <label className="text-xs font-black uppercase tracking-wider text-blue-950 block">
                Votre Prénom ou N° de Place :
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Moussa, Fatou, Place 2..."
                className="w-full bg-white border border-blue-300 focus:border-blue-600 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none shadow-xs"
                autoFocus
              />
              <p className="text-[11px] text-blue-800 leading-snug">
                Ce nom apparaîtra sur votre ticket personnel et permettra au serveur de vous apporter directement vos plats.
              </p>
            </div>
          )}

          {/* Bouton de confirmation principal (VERT géant) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full min-h-[54px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer border border-emerald-500"
            >
              <span>Valider mon choix</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
