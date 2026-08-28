'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, Utensils, Sparkles, ChefHat, BellRing, ArrowRight } from 'lucide-react';
import { OrderType, Language } from '@/types';
import { formatFCFA, playOrderSound } from '@/lib/utils';
import { getUIText } from '@/lib/translation-engine';

interface OrderSuccessModalProps {
  order: OrderType | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderMore: () => void;
  lang?: Language;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderMore,
  lang = 'FR',
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger pleasant chime and celebratory confetti
      playOrderSound();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ea580c', '#16a34a', '#f59e0b', '#dc2626'],
        });
      } catch (err) {
        console.log('Confetti effect unavailable:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const t = getUIText(lang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -left-6 -top-6 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-lg mb-3 animate-bounce-subtle">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {t.orderSuccessTitle}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-1">
            {t.orderSuccessSubtitle}
          </p>

          <div className="mt-3 inline-flex items-center gap-2 bg-black/20 px-3.5 py-1.5 rounded-full text-xs font-bold backdrop-blur-xs border border-white/20">
            <span>🎯 {t.table} {order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}</span>
            <span>•</span>
            <span>N° {order.id.slice(-6).toUpperCase()}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Real-time Order Status Timeline */}
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4">
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {t.orderStep1Title}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {t.orderStep1Desc}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
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

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                  <Utensils className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-600">
                    {t.orderStep3Title} {order.tableNumber}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    {t.orderStep3Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {t.orderSummary} ({order.items.length})
            </h4>

            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 divide-y divide-gray-100 text-xs">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-orange-600">
                      {item.quantity}x
                    </span>
                    <span className="font-medium text-gray-900 truncate max-w-[180px]">
                      {item.menuItem.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-700">
                    {formatFCFA(item.price * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="pt-2 flex justify-between items-center font-black text-sm text-gray-900">
                <span>{t.totalToPay}</span>
                <span className="text-orange-600">{formatFCFA(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-2">
          <button
            onClick={onOrderMore}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm py-3 px-4 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{t.orderMore}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full text-xs font-semibold text-gray-600 hover:text-gray-900 py-2 transition-colors"
          >
            {t.closeWindow}
          </button>
        </div>
      </div>
    </div>
  );
};
