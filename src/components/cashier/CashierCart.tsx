'use client';

import React, { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, Banknote, Smartphone, Check, User } from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

export type CashierCartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

interface CashierCartProps {
  items: CashierCartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onClear: () => void;
  onSubmit: (paymentMethod: string, customerName: string, isPaidLater: boolean, tableNumber: number) => Promise<void>;
  isSubmitting: boolean;
}

export function CashierCart({ items, onUpdateQuantity, onClear, onSubmit, isSubmitting }: CashierCartProps) {

  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'WAVE' | 'ORANGE_MONEY'>('CASH');
  const [orderMode, setOrderMode] = useState<'COMPTOIR' | 'TABLE'>('COMPTOIR');
  const [tableNumber, setTableNumber] = useState<string>('');


  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);


  const handleSubmit = async () => {
    if (items.length === 0) return;
    const isPaidLater = orderMode === 'TABLE';
    const finalTable = isPaidLater ? (parseInt(tableNumber) || 0) : 0;
    const finalName = customerName || (isPaidLater ? `Table ${finalTable}` : 'Client Comptoir');
    await onSubmit(paymentMethod, finalName, isPaidLater, finalTable);
    setCustomerName('');
    setTableNumber('');
  };


  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* En-tête */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <h2 className="font-black text-lg">Ticket Comptoir</h2>
        {items.length > 0 && (
          <button onClick={onClear} className="text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors">
            <Trash2 className="w-4 h-4" /> Vider
          </button>
        )}
      </div>

      {/* Nom du client ou Table */}
      <div className="p-3 border-b border-slate-100 shrink-0 space-y-2">
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button 
            onClick={() => setOrderMode('COMPTOIR')}
            className={`flex-1 text-xs font-bold py-1.5 rounded-md ${orderMode === 'COMPTOIR' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            COMPTOIR
          </button>
          <button 
            onClick={() => setOrderMode('TABLE')}
            className={`flex-1 text-xs font-bold py-1.5 rounded-md ${orderMode === 'TABLE' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            SUR PLACE
          </button>
        </div>
        
        <div className="flex gap-2">
          {orderMode === 'TABLE' && (
            <input
              type="number"
              placeholder="N° Table"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-400 font-bold"
            />
          )}
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Nom du client (facultatif)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[300px]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
            <ShoppingBag className="w-12 h-12" />
            <p className="text-sm font-bold">Le ticket est vide</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.menuItemId} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 animate-in slide-in-from-right-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                <p className="text-xs font-black text-amber-600 font-mono">{formatFCFA(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shrink-0 shadow-xs">
                <button onClick={() => onUpdateQuantity(item.menuItemId, -1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center font-bold text-slate-900 text-sm">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.menuItemId, 1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

            {/* Zone d'Encaissement */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total</span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-slate-900">{formatFCFA(total)}</span>
        </div>

        {orderMode === 'COMPTOIR' ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase">Espèces</span>
              </button>
              <button
                onClick={() => setPaymentMethod('WAVE')}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  paymentMethod === 'WAVE' ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase">Wave</span>
              </button>
              <button
                onClick={() => setPaymentMethod('ORANGE_MONEY')}
                className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                  paymentMethod === 'ORANGE_MONEY' ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase">Orange M.</span>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Encaissement...</span>
              ) : (
                <>
                  <Check className="w-6 h-6" /> ENCAISSER
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl font-black text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Envoi Cuisine...</span>
            ) : (
              <>
                ENVOYER CUISINE (À PAYER)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

const ShoppingBag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
