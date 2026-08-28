'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, ChefHat, Utensils, ArrowRight, X } from 'lucide-react';
import { OrderType, Language, CurrencyCode, ExchangeRates } from '@/types';
import { formatFCFA, formatConvertedPrice, playOrderSound } from '@/lib/utils';
import { getUIText } from '@/lib/translation-engine';

interface OrderSuccessTrackerProps {
  order: OrderType | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderMore: () => void;
  lang?: Language;
  currency?: CurrencyCode;
  exchangeRates?: ExchangeRates;
}

export const OrderSuccessTracker: React.FC<OrderSuccessTrackerProps> = ({
  order,
  isOpen,
  onClose,
  onOrderMore,
  lang = 'FR',
  currency = 'FCFA',
  exchangeRates,
}) => {
  useEffect(() => {
    if (isOpen) {
      playOrderSound();
      try {
        confetti({
          particleCount: 70,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#059669', '#ea580c', '#f59e0b', '#2563eb'],
        });
      } catch (err) {
        // Non-blocking
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const t = getUIText(lang);
  const formattedTable = order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-lg mb-3 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t.orderSuccessTitle}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
            {t.orderSuccessSubtitle}
          </p>

          <div className="mt-3 inline-flex items-center gap-2 bg-black/20 px-3.5 py-1.5 rounded-full text-xs font-bold border border-white/20">
            <span>📍 {t.table} N° {formattedTable}</span>
            <span>•</span>
            <span>N° {order.id.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Live Preparation Timeline */}
          <div className="bg-orange-50/80 border border-orange-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {t.orderStep1Title}
                </p>
                <p className="text-[11px] text-slate-500">
                  {t.orderStep1Desc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs animate-pulse">
                <ChefHat className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">
                  {t.orderStep2Title}
                </p>
                <p className="text-[11px] text-amber-700">
                  {t.orderStep2Desc}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                <Utensils className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600">
                  {t.orderStep3Title} {formattedTable}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t.orderStep3Desc}
                </p>
              </div>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t.orderSummary} ({order.items.length})
            </h4>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 divide-y divide-slate-100 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-700">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-slate-900 truncate max-w-[180px]">
                      {item.name || item.menuItem?.name || 'Plat commandé'}
                    </span>
                  </div>
                  <span className="font-bold text-slate-700">
                    {formatFCFA(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="pt-2 flex justify-between items-center font-black text-sm text-slate-900">
                <span>{t.totalToPay}</span>
                <div className="text-right">
                  <span className="text-emerald-700 block">{formatFCFA(order.total)}</span>
                  {formatConvertedPrice(order.total, currency, lang, exchangeRates) && (
                    <span className="text-[11px] font-black text-slate-500 block">
                      ({formatConvertedPrice(order.total, currency, lang, exchangeRates)})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
          <button
            type="button"
            onClick={onOrderMore}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm py-3.5 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{t.orderMore}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-xs font-semibold text-slate-600 hover:text-slate-900 py-2 transition-colors"
          >
            {t.closeWindow}
          </button>
        </div>
      </div>
    </div>
  );
};
