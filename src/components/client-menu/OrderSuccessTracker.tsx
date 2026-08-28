'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ChefHat, 
  Utensils, 
  ArrowRight, 
  X, 
  Receipt, 
  Clock, 
  Bell, 
  CreditCard, 
  Plus, 
  Sparkles,
  Banknote,
  Smartphone
} from 'lucide-react';
import { OrderType, Language, CurrencyCode, ExchangeRates } from '@/types';
import { formatFCFA, formatConvertedPrice, playOrderSound } from '@/lib/utils';
import { getUIText } from '@/lib/translation-engine';
import { toast } from 'sonner';

interface OrderSuccessTrackerProps {
  order: OrderType | null;
  sessionOrders?: OrderType[];
  isOpen: boolean;
  onClose: () => void;
  onOrderMore: () => void;
  onPayOnline?: (totalAmount: number) => void;
  lang?: Language;
  currency?: CurrencyCode;
  exchangeRates?: ExchangeRates;
  restaurantName?: string;
}

export const OrderSuccessTracker: React.FC<OrderSuccessTrackerProps> = ({
  order,
  sessionOrders = [],
  isOpen,
  onClose,
  onOrderMore,
  onPayOnline,
  lang = 'FR',
  currency = 'FCFA',
  exchangeRates,
  restaurantName = 'Chez Fatou & Frères',
}) => {
  // Accumulated orders for this table session
  const allOrders = sessionOrders.length > 0 ? sessionOrders : order ? [order] : [];
  const totalBalance = allOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  // Live Countdown state (12 min = 720 sec)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(720);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(2); // 1: Reçue, 2: Cuisson, 3: Attribuée/Prête, 4: Servie
  const [billRequested, setBillRequested] = useState(false);

  useEffect(() => {
    if (isOpen) {
      playOrderSound();
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#059669', '#ea580c', '#f59e0b', '#2563eb'],
        });
      } catch (err) {}
    }
  }, [isOpen]);

  // Countdown timer effect
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setCurrentStep(3); // Marked as ready & assigned
          return 0;
        }
        if (prev <= 180 && currentStep === 2) {
          setCurrentStep(3);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, currentStep]);

  if (!isOpen || !order) return null;

  const t = getUIText(lang);
  const formattedTable = order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTimeRemaining = `${minutes} min ${seconds < 10 ? '0' + seconds : seconds} s`;

  const handleRequestBill = () => {
    setBillRequested(true);
    toast.success(`🧾 Addition de la Table ${formattedTable} demandée ! Un serveur arrive avec votre note.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[94vh] border border-slate-200">
        
        {/* TOP RECEIPT HEADER */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 p-5 text-white relative overflow-hidden shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            title="Fermer le ticket"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl shadow-md shrink-0">
              <Receipt className="w-6 h-6" />
            </div>

            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                Ticket Numérique Officiel
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white truncate">
                {restaurantName}
              </h2>
              <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-300">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md font-bold">
                  📍 Table {formattedTable}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-300 font-bold">
                  #{order.id.slice(-6).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* PROGRESS COUNTDOWN BAR */}
          <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  Temps d'attente estimé
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-300 font-mono">
                  {secondsRemaining > 0 ? `⏳ ~ ${formattedTimeRemaining}` : '✅ Commande Prête !'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-300 uppercase block">Statut Live</span>
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{currentStep === 2 ? 'En Cuisson' : currentStep === 3 ? 'Prête & Attribuée' : 'Validée'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* 1. NOTIFICATION BANNER : ATTRIBUÉE AU SERVEUR */}
          {currentStep >= 3 && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl flex items-start gap-3 shadow-xs animate-in slide-in-from-top-2">
              <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-xs shrink-0 animate-bounce">
                <Bell className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-black text-emerald-950">
                  🔔 Commande Prête &amp; Attribuée pour être servie !
                </h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  Votre serveur apporte vos plats et boissons à votre table. Merci pour votre patience et bon appétit ! 😋
                </p>
              </div>
            </div>
          )}

          {/* 2. LIVE STEPS TIMELINE */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-[11px]">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block leading-tight">1. Transmise en Cuisine &amp; Bar</span>
                <span className="text-[10px] text-slate-500">Commande réceptionnée et confirmée</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                currentStep >= 2 ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-200 text-slate-500'
              }`}>
                <ChefHat className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block leading-tight">2. En Préparation &amp; Cuisson</span>
                <span className="text-[10px] text-slate-500">Les chefs préparent vos plats à la minute</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                currentStep >= 3 ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
              }`}>
                <Utensils className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block leading-tight">3. Service à Table ({formattedTable})</span>
                <span className="text-[10px] text-slate-500">Attribuée à votre serveur dédié</span>
              </div>
            </div>
          </div>

          {/* 3. ORDERED ITEMS ACCUMULATED RECEIPT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>📋 Détail de l'Addition</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  {allOrders.length} tour{allOrders.length > 1 ? 's' : ''}
                </span>
              </h4>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
              {allOrders.map((ord, ordIdx) => (
                <div key={ord.id} className="p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border-b border-slate-100 pb-1">
                    <span>Tour N°{ordIdx + 1} ({ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'En cours'})</span>
                    <span className="font-mono text-slate-700">{formatFCFA(ord.total)}</span>
                  </div>

                  <div className="space-y-1.5">
                    {ord.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex justify-between items-start text-xs">
                        <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-800 font-black font-mono">{item.quantity}x</span>
                            <span className="font-bold text-slate-900 truncate">
                              {item.name || item.menuItem?.name || 'Plat traditionnel'}
                            </span>
                          </div>
                          {item.notes && (
                            <span className="block text-[10px] text-slate-500 italic pl-4">
                              Note : {item.notes}
                            </span>
                          )}
                        </div>
                        <span className="font-mono font-bold text-slate-800 shrink-0">
                          {formatFCFA(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* TOTAL BALANCE BLOCK */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 flex items-center justify-between text-slate-950 font-black border-t-2 border-amber-300">
                <div>
                  <span className="text-xs uppercase tracking-wider block text-slate-700">
                    Solde Total Cumulé (Table {formattedTable})
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Toutes consommations de la session incluses
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base sm:text-lg font-mono text-amber-950 font-black block">
                    {formatFCFA(totalBalance)}
                  </span>
                  {currency !== 'FCFA' && exchangeRates && (
                    <span className="text-[11px] font-bold text-slate-600 block font-mono">
                      ≈ {formatConvertedPrice(totalBalance, currency, exchangeRates)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 4. PAYMENT & BILL OPTIONS */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Règlement &amp; Addition :
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleRequestBill}
                disabled={billRequested}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  billRequested
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-2xs'
                }`}
              >
                <Receipt className="w-4 h-4 text-orange-600" />
                <span>{billRequested ? '✅ Addition Demandée' : '🧾 Demander l\'Addition'}</span>
              </button>

              <button
                type="button"
                onClick={() => onPayOnline?.(totalBalance)}
                className="py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                <Smartphone className="w-4 h-4" />
                <span>Payer par Wave / Orange Money</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-500 italic pt-1">
              Vous pouvez également régler en espèces directement à table auprès de votre serveur après votre repas.
            </p>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 py-2 px-3 transition-colors"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={onOrderMore}
            className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-2xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Ajouter d'autres Plats (Boissons/Desserts)</span>
          </button>
        </div>
      </div>
    </div>
  );
};