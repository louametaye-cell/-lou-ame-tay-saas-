'use client';

import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Receipt, 
  Droplets, 
  Flame, 
  Utensils, 
  CheckCircle2, 
  Banknote, 
  Smartphone 
} from 'lucide-react';
import { Language } from '@/types';
import { getUIText } from '@/lib/translation-engine';
import { toast } from 'sonner';

interface ServiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  lang?: Language;
}

export const ServiceCallModal: React.FC<ServiceCallModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  lang = 'FR',
}) => {
  const t = getUIText(lang);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [paymentOption, setPaymentOption] = useState<'CASH' | 'WAVE' | 'OM'>('WAVE');
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  const reasons = [
    {
      id: 'water',
      label: lang === 'WO' ? 'Ndox mu sedd / Gelas' : 'Glaçons / Eau fraîche',
      icon: '🧊',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    {
      id: 'spice',
      label: lang === 'WO' ? 'Kaani bu bari (Kaani)' : 'Piment supplémentaire / Kaani',
      icon: '🌶️',
      color: 'bg-rose-50 border-rose-200 text-rose-900',
    },
    {
      id: 'bread',
      label: lang === 'WO' ? 'Mburu mu tàng' : 'Pain supplémentaire',
      icon: '🥖',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    {
      id: 'cutlery',
      label: lang === 'WO' ? 'Kuuwer / Sarjet' : 'Couverts / Serviettes',
      icon: '🍽️',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    },
    {
      id: 'bill',
      label: lang === 'WO' ? 'Fay lii (Facture bi)' : 'Demander l\'addition (Note)',
      icon: '🧾',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
    },
  ];

  const handleSendCall = async (reasonText: string) => {
    setSelectedReason(reasonText);
    setIsSent(true);

    const fullMessage =
      selectedReason === 'bill' || reasonText.includes('addition') || reasonText.includes('Facture')
        ? `${reasonText} (${paymentOption === 'WAVE' ? 'Paiement Wave 🔵' : paymentOption === 'OM' ? 'Orange Money 🟠' : 'Espèces 💵'})`
        : reasonText;

    toast.success(`🛎️ Table ${formattedTable} : ${fullMessage}`, {
      description: 'Demande transmise au serveur. Il arrive à votre table.',
      duration: 4000,
    });

    setTimeout(() => {
      setIsSent(false);
      setSelectedReason(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-orange-100 space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orange-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-orange-500/10 text-orange-600 rounded-2xl">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {lang === 'WO' ? 'Wo Serveer bi' : 'Appeler le Serveur'}
              </h3>
              <p className="text-xs text-orange-600 font-bold">
                📍 Table N° {formattedTable}
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

        {/* Motifs Grid */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-slate-600">
            {lang === 'WO'
              ? 'Tànnal lila soxla :'
              : 'De quoi avez-vous besoin à votre table ?'}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {reasons.map((r) => {
              const isSelected = selectedReason === r.id;
              return (
                <div key={r.id} className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (r.id === 'bill') {
                        setSelectedReason('bill');
                      } else {
                        handleSendCall(r.label);
                      }
                    }}
                    className={`w-full min-h-[48px] p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-left active:scale-[0.99] ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-400/40'
                        : `${r.color} hover:shadow-xs`
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.icon}</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {r.label}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                    )}
                  </button>

                  {/* Sub-options if Bill is requested */}
                  {r.id === 'bill' && selectedReason === 'bill' && (
                    <div className="bg-purple-50/80 p-3 rounded-2xl border border-purple-200 space-y-2.5 animate-in slide-in-from-top-2">
                      <span className="text-[11px] font-bold text-purple-950 block">
                        {lang === 'WO'
                          ? 'Naka ngay faye ?'
                          : 'Mode de règlement souhaité :'}
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPaymentOption('WAVE')}
                          className={`p-2 rounded-xl text-xs font-black transition-all border ${
                            paymentOption === 'WAVE'
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-white text-slate-700 border-purple-200'
                          }`}
                        >
                          🔵 Wave
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentOption('OM')}
                          className={`p-2 rounded-xl text-xs font-black transition-all border ${
                            paymentOption === 'OM'
                              ? 'bg-orange-500 text-white border-orange-600 shadow-xs'
                              : 'bg-white text-slate-700 border-purple-200'
                          }`}
                        >
                          🟠 OM
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentOption('CASH')}
                          className={`p-2 rounded-xl text-xs font-black transition-all border ${
                            paymentOption === 'CASH'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-700 border-purple-200'
                          }`}
                        >
                          💵 Espèces
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSendCall(r.label)}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95"
                      >
                        {lang === 'WO'
                          ? 'Yónnee laajal facture bi 🧾'
                          : 'Demander l\'addition maintenant 🧾'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-slate-500 text-center">
          {lang === 'WO'
            ? 'Serveer bi dafay yëg sa woote léegi.'
            : 'Votre demande s\'affiche instantanément sur la tablette du serveur.'}
        </p>
      </div>
    </div>
  );
};