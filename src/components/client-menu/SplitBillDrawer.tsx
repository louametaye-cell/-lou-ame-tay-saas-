'use client';

import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Plus, 
  Minus, 
  Share2, 
  Calculator, 
  Check, 
  Sparkles 
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { Language } from '@/types';
import { toast } from 'sonner';

interface SplitBillDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  tableNumber: number;
  restaurantName?: string;
  lang?: Language;
}

export const SplitBillDrawer: React.FC<SplitBillDrawerProps> = ({
  isOpen,
  onClose,
  totalAmount,
  tableNumber,
  restaurantName = 'Chez Fatou & Frères',
  lang = 'FR',
}) => {
  const [splitCount, setSplitCount] = useState(2);
  const [tipAmount, setTipAmount] = useState(0);

  if (!isOpen) return null;

  const grandTotal = totalAmount + tipAmount;
  const perPersonAmount = Math.ceil(grandTotal / splitCount);
  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  // Generate WhatsApp Share Message
  const handleShareWhatsApp = () => {
    const message = `🍽️ *Addition Table ${formattedTable} - ${restaurantName}*\n\n` +
      `💰 *Total Commande :* ${formatFCFA(totalAmount)}\n` +
      (tipAmount > 0 ? `🎁 *Pourboire service :* ${formatFCFA(tipAmount)}\n` : '') +
      `👥 *Nombre de convives :* ${splitCount} personnes\n\n` +
      `👉 *Montant par personne :* *${formatFCFA(perPersonAmount)}*\n\n` +
      `_Envoyé via Lou Ame Tay ? Menu Digital_`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.success('📱 Récapitulatif partagé sur WhatsApp !');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-orange-100 space-y-5 animate-in slide-in-from-bottom-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orange-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {lang === 'WO' ? 'Séddale Facture bi' : 'Partager l\'Addition'}
              </h3>
              <p className="text-xs text-emerald-700 font-bold">
                📍 Table N° {formattedTable} • Total : {formatFCFA(totalAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Guest Count Stepper */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-orange-500" />
              <span>{lang === 'WO' ? 'Ñata nit ngeen ?' : 'Nombre de convives à table :'}</span>
            </span>
            <span className="text-lg font-black text-slate-900 font-mono">
              {splitCount} pers.
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setSplitCount((prev) => Math.max(1, prev - 1))}
              className="flex-1 min-h-[44px] bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-black text-slate-700 flex items-center justify-center active:scale-95 transition-all shadow-2xs"
            >
              <Minus className="w-4 h-4" />
            </button>

            {/* Quick Presets */}
            {[2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSplitCount(num)}
                className={`min-h-[44px] px-3.5 rounded-xl text-xs font-black transition-all ${
                  splitCount === num
                    ? 'bg-orange-500 text-white shadow-xs scale-105'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-orange-50'
                }`}
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setSplitCount((prev) => Math.min(20, prev + 1))}
              className="flex-1 min-h-[44px] bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-black text-slate-700 flex items-center justify-center active:scale-95 transition-all shadow-2xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Optional Service Tip */}
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-slate-600 block">
            {lang === 'WO' ? 'Pourboire ngir serveer bi :' : 'Pourboire pour le serveur (Optionnel) :'}
          </span>
          <div className="grid grid-cols-4 gap-2">
            {[0, 500, 1000, 2000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setTipAmount(amount)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  tipAmount === amount
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                }`}
              >
                {amount === 0 ? '0 F' : `+${amount} F`}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Result Box */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-5 rounded-3xl text-white shadow-lg space-y-1 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-100">
            {lang === 'WO' ? 'Lii la nit ku nekk di fay :' : 'Montant par personne :'}
          </span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono">
            {formatFCFA(perPersonAmount)}
          </div>
          <span className="text-[11px] text-orange-100">
            (Total {formatFCFA(grandTotal)} divisé par {splitCount})
          </span>
        </div>

        {/* 4. WhatsApp Share Action */}
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
        >
          <Share2 className="w-4 h-4" />
          <span>Partager sur WhatsApp 💬</span>
        </button>
      </div>
    </div>
  );
};