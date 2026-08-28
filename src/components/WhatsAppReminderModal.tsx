'use client';

import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Send, Check, Copy, AlertCircle, Phone, DollarSign } from 'lucide-react';
import { RestaurantType } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface WhatsAppReminderModalProps {
  restaurant: RestaurantType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppReminderModal: React.FC<WhatsAppReminderModalProps> = ({
  restaurant,
  isOpen,
  onClose,
}) => {
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState('');
  const [daysOffset, setDaysOffset] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (restaurant && isOpen) {
      setPhone(restaurant.phone || '+221 77 654 32 10');
      fetchReminderText(5);
    }
  }, [restaurant, isOpen]);

  const fetchReminderText = async (offset: number) => {
    if (!restaurant) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/super-admin/whatsapp/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: restaurant.id,
          daysOffset: offset,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reminder) {
          setMessage(data.reminder.message);
          setDaysOffset(offset);
        }
      }
    } catch (e) {
      console.error('Erreur relance WhatsApp:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !restaurant) return null;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Message copié dans le presse-papier !');
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success('WhatsApp ouvert avec le message pré-rempli !');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border-2 border-emerald-500/40 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-5 bg-[#14261d] border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/30">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Relance Paiement WhatsApp (J-5 Automatisé)</span>
              </h2>
              <p className="text-xs text-emerald-300">
                Destinataire : <span className="font-bold">{restaurant.ownerName || 'Gérant'}</span> ({restaurant.name})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200 text-sm">
          {/* Quick Timing Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Type de Relance & Échéance :
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => fetchReminderText(5)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                  daysOffset === 5
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                J-5 (5 jours)
              </button>
              <button
                type="button"
                onClick={() => fetchReminderText(2)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                  daysOffset === 2
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                J-2 (Urgent)
              </button>
              <button
                type="button"
                onClick={() => fetchReminderText(0)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                  daysOffset === 0
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                Jour J (Aujourd&apos;hui)
              </button>
              <button
                type="button"
                onClick={() => fetchReminderText(-3)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all ${
                  daysOffset === -3
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-300 border border-slate-800'
                }`}
              >
                Expiré (Relance)
              </button>
            </div>
          </div>

          {/* Numéro de Téléphone WhatsApp */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">
              Numéro de Téléphone WhatsApp :
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 pl-10 text-white focus:border-emerald-400 outline-none text-sm font-mono font-bold"
              />
            </div>
          </div>

          {/* Aperçu du Message Pré-Rempli */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-400">
                Message Généré & Prêt à Envoyer :
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copier le texte</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl p-4 text-sm text-slate-100 font-sans leading-relaxed outline-none resize-none shadow-inner"
            />
          </div>

          {/* Note Info Wave/Orange Money */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300">
            <DollarSign className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Le message intègre automatiquement les coordonnées Wave et Orange Money de votre agence pour un paiement instantané sans friction.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs"
          >
            Fermer
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="min-h-[48px] px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all ml-auto"
          >
            <Send className="w-4 h-4 stroke-[2.5]" />
            <span>Ouvrir WhatsApp & Envoyer 🚀</span>
          </button>
        </div>
      </div>
    </div>
  );
};
