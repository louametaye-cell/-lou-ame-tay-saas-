'use client';

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Copy, 
  Check, 
  X, 
  ExternalLink, 
  QrCode, 
  Share2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface ExpressPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  tenantName: string;
  currentPlanId?: string;
}

export function ExpressPaymentModal({
  isOpen,
  onClose,
  tenantId,
  tenantName,
  currentPlanId = 'plan_pro',
}: ExpressPaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState(currentPlanId);
  const [months, setMonths] = useState(1);
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchLinks() {
      try {
        setLoading(true);
        const res = await fetch('/api/payments/generate-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            planId: selectedPlan,
            periodMonths: months,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setLinks(data.links);
        }
      } catch (e) {
        toast.error('Erreur de chargement des liens');
      } finally {
        setLoading(false);
      }
    }

    fetchLinks();
  }, [isOpen, tenantId, selectedPlan, months]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, isMsg = false) => {
    navigator.clipboard.writeText(text);
    if (isMsg) {
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
      toast.success('Message WhatsApp copié avec succès !');
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success('Lien direct de paiement copié !');
    }
  };

  const shareWhatsApp = () => {
    if (!links) return;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(links.whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-900 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lien Direct Wave & Orange Money</h3>
            <p className="text-xs text-slate-500">Deep Linking mobile & partage WhatsApp</p>
          </div>
        </div>

        {/* Plan & Duration Selector */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Pack SaaS :</label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full bg-slate-800 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="plan_starter">Starter (15 000 FCFA)</option>
              <option value="plan_pro">Pro (25 000 FCFA)</option>
              <option value="plan_enterprise">Premium VIP (45 000 FCFA)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Durée :</label>
            <select
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value={1}>1 Mois</option>
              <option value={3}>3 Mois (Trimestriel)</option>
              <option value={6}>6 Mois (-5% remise)</option>
              <option value={12}>12 Mois (-15% remise)</option>
            </select>
          </div>
        </div>

        {/* Amount Box */}
        <div className="bg-slate-800/80 border border-slate-200 rounded-2xl p-4 text-center mb-5">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total à payer :</span>
          <div className="text-2xl font-black text-orange-400">
            {links?.amount ? links.amount.toLocaleString('fr-FR') : '...'} FCFA
          </div>
          <span className="text-[11px] text-slate-500">{tenantName}</span>
        </div>

        {/* Direct Action Buttons */}
        <div className="space-y-3 mb-5">
          {/* Wave Deep Link */}
          <a
            href={links?.waveDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-2xl transition shadow-lg shadow-sky-500/20"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🌊</span>
              <span>Ouvrir l'application Wave (Mobile)</span>
            </div>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Orange Money */}
          <a
            href={links?.orangeMoneyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full p-3.5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-bold rounded-2xl transition shadow-lg shadow-orange-500/20"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🍊</span>
              <span>Payer avec Orange Money</span>
            </div>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Share & Copy Section */}
        <div className="bg-slate-800/50 border border-slate-200/60 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-slate-700">Partager le lien au gérant :</p>
          
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(links?.publicPaymentUrl)}
              className="flex-1 py-2 px-3 bg-slate-700 hover:bg-slate-650 text-slate-800 hover:text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copié !' : 'Copier le lien'}
            </button>

            <button
              onClick={shareWhatsApp}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-4 h-4" />
              Envoyer par WhatsApp
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Validation automatique en direct via Webhook</span>
        </div>
      </div>
    </div>
  );
}
