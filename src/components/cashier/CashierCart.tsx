'use client';

import React, { useState } from 'react';
import { Minus, Plus, Trash2, Banknote, Smartphone, Check, User, Phone, AlertTriangle, Receipt, X } from 'lucide-react';
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
  onSubmit: (
    paymentMethod: string, 
    customerName: string, 
    isPaidLater: boolean, 
    tableNumber: number, 
    employeeName?: string,
    cashDetails?: { amountReceived: number; changeGiven: number }
  ) => Promise<void>;
  isSubmitting: boolean;
}

export function CashierCart({ items, onUpdateQuantity, onClear, onSubmit, isSubmitting }: CashierCartProps) {
  const [customerName, setCustomerName] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'WAVE' | 'ORANGE_MONEY' | 'STAFF_MEAL'>('CASH');
  const [orderMode, setOrderMode] = useState<'COMPTOIR' | 'TABLE'>('COMPTOIR');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const receivedNum = Number(cashReceived) || 0;
  const changeGiven = receivedNum >= total ? receivedNum - total : 0;
  const isCashInsufficient = paymentMethod === 'CASH' && orderMode === 'COMPTOIR' && total > 0 && receivedNum < total;

  // Étape 1 : Validation des données et ouverture de la modale de confirmation
  const handlePreSubmit = () => {
    if (items.length === 0) return;
    
    // Validation stricte repas personnel
    if (paymentMethod === 'STAFF_MEAL' && !employeeName.trim()) {
      toast.error('Veuillez saisir le nom de l\'employé pour valider le bon de repas personnel (NP).');
      return;
    }

    // Validation stricte montant reçu en espèces
    if (paymentMethod === 'CASH' && orderMode === 'COMPTOIR') {
      if (receivedNum < total) {
        toast.error(`Montant reçu insuffisant (${formatFCFA(receivedNum)} pour un total de ${formatFCFA(total)}).`);
        return;
      }
    }

    setIsConfirmModalOpen(true);
  };

  // Étape 2 : Confirmation finale et soumission
  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);

    const isPaidLater = orderMode === 'TABLE' && paymentMethod !== 'STAFF_MEAL';
    const finalTable = isPaidLater ? (parseInt(tableNumber) || 0) : 0;
    const finalName = paymentMethod === 'STAFF_MEAL'
      ? `Employé : ${employeeName.trim()}`
      : customerName.trim() || (isPaidLater ? `Table ${finalTable}` : 'Client anonyme');

    const cashDetails = paymentMethod === 'CASH' && orderMode === 'COMPTOIR'
      ? { amountReceived: receivedNum, changeGiven }
      : undefined;

    await onSubmit(paymentMethod, finalName, isPaidLater, finalTable, employeeName.trim() || undefined, cashDetails);
    setCustomerName('');
    setEmployeeName('');
    setTableNumber('');
    setCashReceived('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
      {/* En-tête */}
      <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <h2 className="font-black text-lg">Ticket Comptoir</h2>
        {items.length > 0 && (
          <button 
            onClick={onClear} 
            className="min-h-[44px] px-3 text-rose-400 hover:text-rose-300 text-xs font-bold flex items-center gap-1 transition-colors touch-manipulation cursor-pointer"
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
            className={`flex-1 min-h-[44px] text-xs font-bold py-2 rounded-xl touch-manipulation cursor-pointer transition-all ${orderMode === 'COMPTOIR' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-500'}`}
          >
            COMPTOIR
          </button>
          <button 
            onClick={() => setOrderMode('TABLE')}
            className={`flex-1 min-h-[44px] text-xs font-bold py-2 rounded-xl touch-manipulation cursor-pointer transition-all ${orderMode === 'TABLE' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-500'}`}
          >
            SUR PLACE
          </button>
        </div>
        
        <div className="flex flex-col w-full gap-2">
          {orderMode === 'TABLE' && (
            <input
              type="number"
              placeholder="N° Table"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-amber-400 font-bold"
            />
          )}
          <div className="relative w-full">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                paymentMethod === 'STAFF_MEAL' 
                  ? "Nom de l'employé (Obligatoire)" 
                  : "Nom ou Téléphone du client (facultatif)"
              }
              value={paymentMethod === 'STAFF_MEAL' ? employeeName : customerName}
              onChange={(e) => {
                if (paymentMethod === 'STAFF_MEAL') setEmployeeName(e.target.value);
                else setCustomerName(e.target.value);
              }}
              className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Liste des articles */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
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
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 shrink-0 space-y-2.5">
        <div className="flex justify-between items-baseline">
          <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total</span>
          <span className="text-2xl font-black font-mono text-slate-900">{formatFCFA(total)}</span>
        </div>

        {orderMode === 'COMPTOIR' || paymentMethod === 'STAFF_MEAL' ? (
          <>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`min-h-[44px] py-2 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all touch-manipulation cursor-pointer ${
                  paymentMethod === 'CASH' ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs font-black' : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-200'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Espèces</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('WAVE')}
                className={`min-h-[44px] py-2 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all touch-manipulation cursor-pointer ${
                  paymentMethod === 'WAVE' ? 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-xs font-black' : 'border-slate-200 bg-white text-slate-600 hover:border-cyan-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">Wave</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('ORANGE_MONEY')}
                className={`min-h-[44px] py-2 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all touch-manipulation cursor-pointer ${
                  paymentMethod === 'ORANGE_MONEY' ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs font-black' : 'border-slate-200 bg-white text-slate-600 hover:border-orange-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold">OM</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('STAFF_MEAL')}
                className={`min-h-[44px] py-2 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all touch-manipulation cursor-pointer ${
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

            {/* Point 4 : Calcul automatique du rendu de monnaie en espèces */}
            {paymentMethod === 'CASH' && items.length > 0 && (
              <div className="space-y-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Montant reçu du client (FCFA) :
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    placeholder={`Ex: ${total}`}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full text-lg font-mono font-black p-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  />
                </div>

                {/* Raccourcis billets courants */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setCashReceived(String(total))}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-200 transition-colors"
                  >
                    Exact ({formatFCFA(total)})
                  </button>
                  {[1000, 2000, 5000, 10000].map((bill) => (
                    <button
                      key={bill}
                      type="button"
                      onClick={() => setCashReceived(String(bill))}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-800 hover:text-emerald-900 rounded-lg text-xs font-mono font-bold border border-slate-200 transition-colors"
                    >
                      {formatFCFA(bill)}
                    </button>
                  ))}
                </div>

                {/* Résultat rendu ou manque */}
                {receivedNum > 0 && (
                  receivedNum >= total ? (
                    <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex items-center justify-between text-emerald-950">
                      <span className="text-xs font-black uppercase tracking-wide">Monnaie à rendre :</span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800">
                        {formatFCFA(changeGiven)}
                      </span>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between text-rose-950">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>Montant insuffisant (Manque) :</span>
                      </div>
                      <span className="text-base font-black font-mono text-rose-700">
                        {formatFCFA(total - receivedNum)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handlePreSubmit}
              disabled={isSubmitting || items.length === 0 || isCashInsufficient}
              className={`w-full min-h-[52px] py-3.5 text-white rounded-2xl font-black text-base sm:text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] touch-manipulation cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                paymentMethod === 'STAFF_MEAL' ? 'bg-purple-700 hover:bg-purple-800' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isSubmitting ? (
                <span className="animate-pulse">Enregistrement...</span>
              ) : isCashInsufficient ? (
                <span className="text-xs sm:text-sm font-bold">Saisir le montant reçu ({formatFCFA(total)})</span>
              ) : (
                <>
                  <Check className="w-6 h-6 stroke-[3]" />
                  <span>{paymentMethod === 'STAFF_MEAL' ? 'VALIDER LE BON NP' : `ENCAISSER (${formatFCFA(total)})`}</span>
                </>
              )}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handlePreSubmit}
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

      {/* 🛡️ MODALE DE CONFIRMATION AVANT ENCAISSEMENT (Mission 1) */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
              <Receipt className="w-7 h-7 text-emerald-700" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {orderMode === 'TABLE' ? 'Confirmer l\'envoi en cuisine ?' : 'Confirmer la vente ?'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Veuillez vérifier les informations avant validation.
              </p>
            </div>

            {/* Récapitulatif épuré */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center text-sm font-black text-slate-900">
                <span className="text-slate-500 font-bold uppercase tracking-wide text-xs">Total :</span>
                <span className="font-mono text-base text-emerald-950">{formatFCFA(total)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span className="text-slate-500 font-medium">Mode de règlement :</span>
                <span className="font-bold">
                  {paymentMethod === 'CASH'
                    ? 'Espèces'
                    : paymentMethod === 'WAVE'
                    ? 'Wave'
                    : paymentMethod === 'ORANGE_MONEY'
                    ? 'Orange Money'
                    : 'Repas Personnel (NP)'}
                </span>
              </div>

              {paymentMethod === 'CASH' && orderMode === 'COMPTOIR' && (
                <>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-medium">Montant reçu :</span>
                    <span className="font-mono font-bold">{formatFCFA(receivedNum)}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-100/80 border border-emerald-300 rounded-xl flex justify-between items-center text-emerald-950 font-bold">
                    <span>Monnaie à rendre :</span>
                    <span className="font-mono font-black text-base text-emerald-900">{formatFCFA(changeGiven)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-center text-slate-700 pt-1.5 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Destination :</span>
                <span className="font-bold">
                  {orderMode === 'TABLE' ? `Sur place (Table ${tableNumber || '?'})` : 'Comptoir'}
                </span>
              </div>

              {(customerName.trim() || employeeName.trim()) && (
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500 font-medium">{paymentMethod === 'STAFF_MEAL' ? 'Employé :' : 'Client :'}</span>
                  <span className="font-bold truncate max-w-[160px]">
                    {paymentMethod === 'STAFF_MEAL' ? employeeName : customerName}
                  </span>
                </div>
              )}
            </div>

            {/* Boutons d'action : Primaire vert & Secondaire gris */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={isSubmitting}
                className="w-full min-h-[48px] py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation disabled:opacity-50"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>
                  {orderMode === 'TABLE'
                    ? 'Oui, Envoyer en Cuisine'
                    : paymentMethod === 'STAFF_MEAL'
                    ? 'Oui, Valider le Bon NP'
                    : 'Oui, Encaisser et Imprimer'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmitting}
                className="w-full min-h-[44px] py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer touch-manipulation"
              >
                Non, Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const ShoppingBag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
