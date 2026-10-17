'use client';

import React, { useState } from 'react';
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
  onSubmit: (paymentMethod: string, customerName: string, isPaidLater: boolean, tableNumber: number, employeeName?: string) => Promise<void>;
  isSubmitting: boolean;
}

export function CashierCart({ items, onUpdateQuantity, onClear, onSubmit, isSubmitting }: CashierCartProps) {
  const [customerName, setCustomerName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'WAVE' | 'ORANGE_MONEY' | 'STAFF_MEAL'>('CASH');
  const [orderMode, setOrderMode] = useState<'COMPTOIR' | 'TABLE'>('COMPTOIR');
  const [tableNumber, setTableNumber] = useState<string>('');

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const handleSubmit = async () => {
    if (items.length === 0) return;
    
    // Validation stricte repas personnel
    if (paymentMethod === 'STAFF_MEAL' && !employeeName.trim()) {
      toast.error('Veuillez saisir le nom de l\'employé pour valider le bon de repas personnel (NP).');
      return;
    }

    const isPaidLater = orderMode === 'TABLE' && paymentMethod !== 'STAFF_MEAL';
    const finalTable = isPaidLater ? (parseInt(tableNumber) || 0) : 0;
    const finalName = paymentMethod === 'STAFF_MEAL'
      ? `Employé : ${employeeName.trim()}`
      : customerName || (isPaidLater ? `Table ${finalTable}` : 'Client Comptoir');

    await onSubmit(paymentMethod, finalName, isPaidLater, finalTable, employeeName.trim() || undefined);
    setCustomerName('');
    setEmployeeName('');
    setTableNumber('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* En-tête */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <h2 className="font-black text-lg">Ticket Comptoir</h2>
        {items.length > 0 && (
          <button 
            onClick={onClear} 
            className="min-h-[48px] px-3 text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors touch-manipulation cursor-pointer"
          >
            <Trash2 className="w-4 h-4" /> Vider
          </button>
        )}
      </div>

      {/* Nom du client ou Table */}
      <div className="p-3 border-b border-slate-100 shrink-0 space-y-2">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
          <button 
            onClick={() => setOrderMode('COMPTOIR')}
            className={`flex-1 min-h-[48px] text-xs font-bold py-2 rounded-xl touch-manipulation cursor-pointer transition-all ${orderMode === 'COMPTOIR' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-500'}`}
          >
            COMPTOIR
          </button>
          <button 
            onClick={() => setOrderMode('TABLE')}
            className={`flex-1 min-h-[48px] text-xs font-bold py-2 rounded-xl touch-manipulation cursor-pointer transition-all ${orderMode === 'TABLE' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-500'}`}
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
              className="w-24 min-h-[48px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-400 font-bold"
            />
          )}
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={paymentMethod === 'STAFF_MEAL' ? "Nom de l'employé (Obligatoire)" : "Nom du client (facultatif)"}
              value={paymentMethod === 'STAFF_MEAL' ? employeeName : customerName}
              onChange={(e) => {
                if (paymentMethod === 'STAFF_MEAL') setEmployeeName(e.target.value);
                else setCustomerName(e.target.value);
              }}
              className="w-full min-h-[48px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-400 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
            <p className="text-sm font-medium">Panier vide</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-2xl gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate">{item.name}</p>
                <p className="text-xs text-slate-500 font-medium font-mono">{formatFCFA(item.price)}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-xl border border-slate-200">
                <button 
                  onClick={() => onUpdateQuantity(item.menuItemId, -1)} 
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 active:scale-90 text-slate-700 touch-manipulation cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-black text-sm w-6 text-center">{item.quantity}</span>
                <button 
                  onClick={() => onUpdateQuantity(item.menuItemId, 1)} 
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 active:scale-90 text-slate-700 touch-manipulation cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total et Encaissement */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-3">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total</span>
          <span className="text-2xl font-black font-mono text-slate-900">{formatFCFA(total)}</span>
        </div>

        {orderMode === 'COMPTOIR' || paymentMethod === 'STAFF_MEAL' ? (
          <>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setPaymentMethod('CASH')}
                className={`min-h-[48px] py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all touch-manipulation cursor-pointer ${
                  paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs font-black' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Espèces</span>
              </button>
              <button
                onClick={() => setPaymentMethod('WAVE')}
                className={`min-h-[48px] py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all touch-manipulation cursor-pointer ${
                  paymentMethod === 'WAVE' ? 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-xs font-black' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Wave</span>
              </button>
              <button
                onClick={() => setPaymentMethod('ORANGE_MONEY')}
                className={`min-h-[48px] py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all touch-manipulation cursor-pointer ${
                  paymentMethod === 'ORANGE_MONEY' ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs font-black' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">OM</span>
              </button>
              <button
                onClick={() => setPaymentMethod('STAFF_MEAL')}
                className={`min-h-[48px] py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all touch-manipulation cursor-pointer ${
                  paymentMethod === 'STAFF_MEAL' ? 'border-purple-600 bg-purple-50 text-purple-950 shadow-xs font-black ring-2 ring-purple-300' : 'border-slate-200 bg-white text-slate-600 hover:border-purple-200'
                }`}
                title="Repas du personnel (bon NP déduit sur salaire)"
              >
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-[10px] uppercase font-bold">Repas NP</span>
              </button>
            </div>

            {paymentMethod === 'STAFF_MEAL' && (
              <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <span>👤</span>
                  <span>Bon Repas Personnel (NP)</span>
                </span>
                <p className="text-[11px] text-purple-700">
                  Déduit sur salaire à la fin du mois. Ce montant ne sera pas imputé à la caisse du jour.
                </p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || items.length === 0}
              className={`w-full min-h-[52px] py-3.5 text-white rounded-2xl font-black text-base sm:text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation cursor-pointer disabled:opacity-50 ${
                paymentMethod === 'STAFF_MEAL' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isSubmitting ? (
                <span className="animate-pulse">Enregistrement...</span>
              ) : (
                <>
                  <Check className="w-6 h-6 stroke-[3]" />
                  <span>{paymentMethod === 'STAFF_MEAL' ? 'VALIDER LE BON NP' : 'ENCAISSER & IMPRIMER'}</span>
                </>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="w-full min-h-[52px] py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl font-black text-base sm:text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation cursor-pointer"
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
