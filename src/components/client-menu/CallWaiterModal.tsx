'use client';

import React, { useState } from 'react';
import { Bell, X, Check, Droplets, Receipt, Utensils, HelpCircle, Sparkles } from 'lucide-react';
import { getAssignedServerForTable } from '@/lib/server-shift';
import { toast } from 'sonner';

interface CallWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
  restaurantId?: string;
  customerName?: string;
  isExpress?: boolean;
}

const QUICK_REASONS = [
  { id: 'water', label: "Demander de l'eau ou glaçons", icon: Droplets, emoji: '💧' },
  { id: 'bill', label: "Demander l'addition / la note", icon: Receipt, emoji: '🧾' },
  { id: 'cutlery', label: 'Couverts, serviettes ou sauce', icon: Utensils, emoji: '🍽️' },
  { id: 'question', label: 'Question sur la commande', icon: HelpCircle, emoji: '❓' },
];

export const CallWaiterModal: React.FC<CallWaiterModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
  restaurantId = 'resto_thies_01',
  customerName,
  isExpress = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("Demande d'assistance en salle");
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  if (!isOpen) return null;

  const serverName = isExpress ? 'Guichet Caisse' : getAssignedServerForTable(tableNumber);
  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const finalReason = customNote.trim() ? `${selectedReason} : ${customNote.trim()}` : selectedReason;

    try {
      const res = await fetch('/api/table/call-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          restaurantId,
          customerName,
          reason: finalReason,
        }),
      });

      if (res.ok) {
        setIsSent(true);
        toast.success(
          isExpress 
            ? '🔔 Appel caisse envoyé ! Le caissier a été notifié.'
            : `🔔 ${serverName} a été notifié(e) pour la Table ${formattedTable} !`
        );
        setTimeout(() => {
          setIsSent(false);
          onClose();
        }, 1800);
      } else {
        toast.error("Impossible d'envoyer l'appel.");
      }
    } catch (err) {
      toast.error('Erreur de connexion.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 text-slate-900">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 mx-auto mb-3 bg-white text-orange-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
            <Bell className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-black">
            {isExpress ? '🔔 Appeler le Guichet Caisse' : `🔔 Appeler le Serveur`}
          </h3>
          <p className="text-xs text-amber-100 font-bold mt-1">
            {isExpress ? 'Comptoir Express' : `Table ${formattedTable} • Serveur dédié : ${serverName}`}
          </p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isSent ? (
            <div className="py-8 text-center space-y-2 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">Appel transmis !</h4>
              <p className="text-xs text-slate-600 font-medium max-w-xs mx-auto">
                {serverName} arrive immédiatement à votre table. Merci pour votre patience.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-xs font-black uppercase text-slate-500 block mb-2">
                  Que désirez-vous ?
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {QUICK_REASONS.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedReason(r.label)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                        selectedReason === r.label
                          ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{r.emoji}</span>
                      <span className="flex-1">{r.label}</span>
                      {selectedReason === r.label && (
                        <Check className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-500 block mb-1.5">
                  Précision ou note (optionnel)
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ex: 2 verres d'eau supplémentaires, piment..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <Bell className="w-4 h-4" />
                  <span>{isSending ? 'Envoi en cours...' : 'Envoyer l\'appel immédiatement'}</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};