'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Coins 
} from 'lucide-react';
import { CartItem, Language, CurrencyCode, ExchangeRates } from '@/types';
import { PaymentMethod, useCartStore } from '@/store/useCartStore';
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
  const [cashNote, setCashNote] = useState('Montant exact');
  const t = getUIText(lang);
  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  if (!isOpen) return null;

  const totalPrice = items.reduce((sum, item) => {
    const extrasSum = (item.options?.extras || []).reduce((es, e) => es + e.price, 0);
    return sum + (item.menuItem.price + extrasSum) * item.quantity;
  }, 0);

  const convertedTotal =
    currency !== 'FCFA' && exchangeRates
      ? formatConvertedPrice(totalPrice, currency, exchangeRates)
      : null;

  const handleSelectCashPreset = (preset: string) => {
    setCashNote(preset);
    if (preset !== 'Montant exact') {
      onCustomerNoteChange(
        customerNote ? `${customerNote} (Appoint : ${preset})` : `Appoint : ${preset}`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl max-h-[92vh] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-500 to-amber-600 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-2xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>{lang === 'WO' ? 'Sa Panie' : t.yourOrder}</span>
                <span className="text-xs bg-white text-orange-600 px-2 py-0.5 rounded-lg font-black font-mono">
                  Table {formattedTable}
                </span>
              </h2>
              <p className="text-xs text-orange-100">
                {items.length} {items.length > 1 ? t.articles : t.article}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] bg-white/20 hover:bg-white/30 text-white rounded-2xl flex items-center justify-center transition-all"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-4xl">🛒</div>
              <p className="text-base font-bold text-slate-800">{t.emptyCartTitle}</p>
              <p className="text-xs text-slate-500">{t.emptyCartSubtitle}</p>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                {items.map((item) => {
                  const extrasPrice = (item.options?.extras || []).reduce(
                    (sum, e) => sum + e.price,
                    0
                  );
                  const itemUnitPrice = item.menuItem.price + extrasPrice;
                  const itemTotalPrice = itemUnitPrice * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <h4 className="font-black text-sm text-slate-900 leading-snug truncate">
                              {item.menuItem.name}
                            </h4>
                            <span className="text-xs font-black text-slate-900 shrink-0 font-mono">
                              {formatFCFA(itemTotalPrice)}
                            </span>
                          </div>

                          {/* Options badges */}
                          {item.options && (
                            <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
                              {item.options.side && (
                                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                                  🍛 {item.options.side}
                                </span>
                              )}
                              {item.options.spiceLevel && (
                                <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md">
                                  🌶️ {item.options.spiceLevel}
                                </span>
                              )}
                              {item.options.extras?.map((ex) => (
                                <span
                                  key={ex.id}
                                  className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-md"
                                >
                                  +{ex.name}
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
                        <div className="flex items-center bg-white rounded-2xl p-1 gap-1 shrink-0 border border-slate-200 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="min-h-[38px] min-w-[38px] bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center font-bold text-lg active:scale-95 transition-transform hover:bg-rose-50 hover:text-rose-600"
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
                            className="min-h-[38px] min-w-[38px] bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-lg active:scale-95 transition-transform hover:bg-emerald-700"
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
              <div className="pt-2 border-t border-slate-200 space-y-2.5">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                  {lang === 'WO' ? 'Moyen de paiement :' : 'Moyen de paiement sur place :'}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('WAVE')}
                    className={`min-h-[50px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${
                      paymentMethod === 'WAVE'
                        ? 'border-blue-500 bg-blue-50 text-blue-950 font-black shadow-xs ring-2 ring-blue-400/40'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">🔵</span>
                    <span className="text-[11px] font-extrabold text-[#1DA1F2]">Wave</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('ORANGE_MONEY')}
                    className={`min-h-[50px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${
                      paymentMethod === 'ORANGE_MONEY'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-black shadow-xs ring-2 ring-orange-400/40'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">🟠</span>
                    <span className="text-[11px] font-extrabold text-[#FF6B00]">OM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('CASH_TPE')}
                    className={`min-h-[50px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${
                      paymentMethod === 'CASH_TPE'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-black shadow-xs ring-2 ring-emerald-400/40'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-[11px] font-extrabold text-emerald-900">Espèces</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPaymentMethodChange('CARD')}
                    className={`min-h-[50px] p-2 rounded-2xl border-2 flex flex-col items-center justify-center gap-0.5 transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-black shadow-xs ring-2 ring-purple-400/40'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-purple-600" />
                    <span className="text-[11px] font-extrabold text-purple-900">Carte</span>
                  </button>
                </div>

                {/* Cash Appoint Suggestions */}
                {paymentMethod === 'CASH_TPE' && (
                  <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 space-y-2 animate-in fade-in">
                    <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{lang === 'WO' ? 'Am nga moné ?' : 'Prévoir la monnaie sur place :'}</span>
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                      {['Montant exact', 'Billet 5 000 F', 'Billet 10 000 F', 'Billet 20 000 F'].map(
                        (preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleSelectCashPreset(preset)}
                            className={`p-2 rounded-xl font-bold transition-all border text-[11px] ${
                              cashNote === preset
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100/50'
                            }`}
                          >
                            {preset}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Wave Info Banner */}
                {paymentMethod === 'WAVE' && (
                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 text-xs text-blue-900 space-y-1">
                    <span className="font-bold block">🔵 Paiement Wave instantané</span>
                    <p className="text-[11px] text-blue-800">
                      Vous pourrez scanner le QR Code du serveur ou ouvrir directement l'application Wave à l'étape suivante.
                    </p>
                  </div>
                )}
              </div>

              {/* Customer Name & Kitchen Instructions */}
              <div className="pt-2 border-t border-slate-200 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 block">
                    {lang === 'WO' ? 'Sa Tur (Bëgg-bëgg) :' : 'Votre Prénom (Optionnel) :'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => onCustomerNameChange(e.target.value)}
                    placeholder="Ex: Moussa, Fatou, Ibrahima..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 outline-none shadow-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 block">
                    {t.kitchenNoteLabel}
                  </label>
                  <textarea
                    rows={2}
                    value={customerNote}
                    onChange={(e) => onCustomerNoteChange(e.target.value)}
                    placeholder={t.kitchenNotePlaceholder}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-orange-500 rounded-2xl p-3 text-xs sm:text-sm text-slate-900 outline-none shadow-xs resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with Total and CTA Button */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500 block uppercase font-bold">
                  {t.totalToPay}
                </span>
                {convertedTotal && (
                  <span className="text-xs font-bold text-emerald-700 block">
                    {convertedTotal}
                  </span>
                )}
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                {formatFCFA(totalPrice)}
              </span>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onSubmitOrder}
              className="w-full min-h-[52px] bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-95 active:scale-[0.99] disabled:bg-slate-300 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmission...' : `🚀 Commander pour Table ${formattedTable}`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};