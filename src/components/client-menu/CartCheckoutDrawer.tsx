'use client';

import React from 'react';
import { X, Plus, Minus, Trash2, Send, ShoppingBag, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { CartItem, Language, CurrencyCode, ExchangeRates } from '@/types';
import { PaymentMethod } from '@/store/useCartStore';
import { formatFCFA, formatConvertedPrice } from '@/lib/utils';
import { getUIText } from '@/lib/translation-engine';

interface CartCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  tableNumber: number;
  customerNote: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  onCustomerNoteChange: (note: string) => void;
  onCustomerNameChange: (name: string) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onAddItem: (item: CartItem['menuItem']) => void;
  onRemoveItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onClearCart: () => void;
  onSubmitOrder: () => void;
  isSubmitting?: boolean;
  lang?: Language;
  currency?: CurrencyCode;
  exchangeRates?: ExchangeRates;
}

export const CartCheckoutDrawer: React.FC<CartCheckoutDrawerProps> = ({
  isOpen,
  onClose,
  items,
  tableNumber,
  customerNote,
  customerName,
  paymentMethod,
  onCustomerNoteChange,
  onCustomerNameChange,
  onPaymentMethodChange,
  onAddItem,
  onRemoveItem,
  onDeleteItem,
  onClearCart,
  onSubmitOrder,
  isSubmitting = false,
  lang = 'FR',
  currency = 'FCFA',
  exchangeRates,
}) => {
  if (!isOpen) return null;

  const t = getUIText(lang);
  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  const totalPrice = items.reduce((sum, item) => {
    const extrasSum = (item.options?.extras || []).reduce((es, e) => es + e.price, 0);
    return sum + (item.menuItem.price + extrasSum) * item.quantity;
  }, 0);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const convertedTotalPrice = formatConvertedPrice(totalPrice, currency, lang, exchangeRates);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] max-h-[94vh] flex flex-col justify-between shadow-2xl border-t-4 border-emerald-600 animate-in slide-in-from-bottom duration-300">
        {/* Pull Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                {t.yourOrder}
              </h2>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-700">
                📍 {t.table} N° {formattedTable} • {totalCount} {totalCount > 1 ? t.articles : t.article}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center active:scale-95 transition-transform"
            aria-label={t.closeWindow}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List & Customization Details */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <span className="text-5xl block">🛒</span>
              <p className="text-base font-bold text-slate-800">
                {t.emptyCartTitle}
              </p>
              <p className="text-xs text-slate-500">
                {t.emptyCartSubtitle}
              </p>
            </div>
          ) : (
            <>
              {/* List of Ordered Dishes */}
              <div className="space-y-3">
                {items.map((item) => {
                  const extrasSum = (item.options?.extras || []).reduce((es, e) => es + e.price, 0);
                  const itemUnitPrice = item.menuItem.price + extrasSum;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#FFFDFB] p-3.5 rounded-2xl border border-orange-100 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-black text-slate-950 truncate">
                            {item.menuItem.name}
                          </h4>
                          <span className="text-xs font-black text-emerald-700 block mt-0.5">
                            {formatFCFA(itemUnitPrice * item.quantity)}
                          </span>

                          {/* Selected Options Badges */}
                          {(item.options?.side || item.options?.spiceLevel || (item.options?.extras && item.options.extras.length > 0)) && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {item.options.side && (
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  🍚 {item.options.side}
                                </span>
                              )}
                              {item.options.spiceLevel && (
                                <span className="bg-orange-50 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  🌶️ {item.options.spiceLevel}
                                </span>
                              )}
                              {(item.options.extras || []).map((ext, eIdx) => (
                                <span key={eIdx} className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  + {ext.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.customNotes && (
                            <p className="text-[11px] text-slate-500 italic mt-1 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200/60">
                              « {item.customNotes} »
                            </p>
                          )}
                        </div>

                        {/* Quantity Stepper (min 44px) */}
                        <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="min-h-[40px] min-w-[40px] bg-white text-slate-800 rounded-xl flex items-center justify-center font-bold text-lg active:scale-95 transition-transform shadow-2xs hover:bg-rose-50 hover:text-rose-600"
                            aria-label="Diminuer"
                          >
                            <Minus className="w-4 h-4 stroke-[3]" />
                          </button>

                          <span className="font-black text-sm text-slate-900 px-1.5 min-w-[20px] text-center">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => onAddItem(item.menuItem)}
                            className="min-h-[40px] min-w-[40px] bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg active:scale-95 transition-transform shadow-2xs hover:bg-emerald-700"
                            aria-label="Ajouter"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  Mode de règlement souhaité :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('CASH_TPE')}
                    className={`min-h-[48px] p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'CASH_TPE'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px] leading-tight font-bold">Espèces / TPE</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('WAVE')}
                    className={`min-h-[48px] p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'WAVE'
                        ? 'border-blue-500 bg-blue-50 text-blue-950 font-black shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">🔵</span>
                    <span className="text-[11px] leading-tight font-bold text-[#1DA1F2]">Wave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('ORANGE_MONEY')}
                    className={`min-h-[48px] p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                      paymentMethod === 'ORANGE_MONEY'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-black shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">🟠</span>
                    <span className="text-[11px] leading-tight font-bold text-[#FF6B00]">OM</span>
                  </button>
                </div>
              </div>

              {/* Optional Customer Name */}
              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <label className="text-xs font-black text-slate-900 block">
                  Votre Prénom (Optionnel) :
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => onCustomerNameChange(e.target.value)}
                  placeholder="Ex: Moussa, Fatou, Jean..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-2xl p-3 text-sm text-slate-900 outline-none shadow-xs"
                />
              </div>

              {/* Kitchen Global Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-900 block">
                  {t.kitchenNoteLabel}
                </label>
                <input
                  type="text"
                  value={customerNote}
                  onChange={(e) => onCustomerNoteChange(e.target.value)}
                  placeholder={t.kitchenNotePlaceholder}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-2xl p-3 text-sm text-slate-900 outline-none shadow-xs"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer with BIG GREEN BUTTON (56px) */}
        {items.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-sm font-bold text-slate-600">{t.totalToPay}</span>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-950 tracking-tight block">
                  {formatFCFA(totalPrice)}
                </span>
                {convertedTotalPrice && (
                  <span className="text-xs font-black text-emerald-700 block">
                    {convertedTotalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* The Big 56px Green Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onSubmitOrder}
              className="w-full min-h-[56px] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-base font-black rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Send className="w-5 h-5 stroke-[2.5]" />
              <span>
                {isSubmitting
                  ? 'Transmission en cours...'
                  : `🚀 Envoyer en cuisine (Table ${formattedTable})`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
