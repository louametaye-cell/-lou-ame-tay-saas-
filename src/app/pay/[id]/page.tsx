'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  ArrowRight,
  ExternalLink,
  PhoneCall,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function PublicPaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantId = (params?.id as string) || 'resto_thies_01';
  const planId = searchParams?.get('plan') || 'plan_pro';
  const months = parseInt(searchParams?.get('months') || '1', 10);

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<'WAVE' | 'ORANGE_MONEY'>('WAVE');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadPaymentDetails() {
      try {
        setLoading(true);
        const res = await fetch('/api/payments/generate-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            planId,
            periodMonths: months,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setPaymentData(data.links);
        } else {
          toast.error(data.error || 'Impossible de charger le lien');
        }
      } catch (err) {
        toast.error('Erreur de connexion');
      } finally {
        setLoading(false);
      }
    }

    loadPaymentDetails();
  }, [tenantId, planId, months]);

  const handleSimulatePayment = async () => {
    try {
      setProcessing(true);
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          planId,
          provider: selectedProvider,
          periodMonths: months,
          phone: '+221774587474',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPaymentSuccess(true);
        toast.success(data.message || 'Paiement validé avec succès !');
      } else {
        toast.error(data.error || 'Échec du paiement');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-medium">Chargement du lien de paiement sécurisé...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Paiement Validé avec Succès !</h1>
          <p className="text-slate-300 text-sm mb-6">
            Votre abonnement <strong className="text-orange-400 font-semibold">{paymentData?.planName}</strong> est immédiatement activé pour <strong className="text-white">{months} mois</strong>. Votre menu digital reste 100% accessible.
          </p>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-left text-xs text-slate-300 space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-slate-400">Restaurant :</span>
              <span className="font-semibold text-white">{paymentData?.tenantName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Montant réglé :</span>
              <span className="font-bold text-emerald-400">{paymentData?.amount?.toLocaleString('fr-FR')} FCFA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Moyen :</span>
              <span className="font-semibold text-white">{selectedProvider === 'WAVE' ? 'Wave Sénégal' : 'Orange Money'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Statut :</span>
              <span className="text-emerald-400 font-bold">COMPLÉTÉ (Facture PDF disponible)</span>
            </div>
          </div>

          <a
            href={`/r/${tenantId}/table-1`}
            className="inline-flex items-center justify-center w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 font-bold rounded-2xl shadow-lg transition-all"
          >
            Accéder à mon Menu Digital
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Paiement Sécurisé Mobile Money UEMOA
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Lou Ame Tay <span className="text-orange-500">?</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">Plateforme Officielle MDA Arts Work Sénégal</p>
      </div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Recipient & Amount Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-850 border border-slate-700/80 rounded-2xl p-5 mb-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none"></div>
          <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Règlement d'abonnement</p>
          <h2 className="text-xl font-bold text-white mb-2">{paymentData?.tenantName}</h2>
          <div className="text-3xl font-extrabold text-orange-400 tracking-tight">
            {paymentData?.amount?.toLocaleString('fr-FR')} <span className="text-lg font-bold text-slate-300">FCFA</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pack {paymentData?.planName} • Durée : {months} mois
          </p>
        </div>

        {/* Payment Methods Selection */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Choisissez votre moyen de paiement :
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* WAVE */}
          <button
            type="button"
            onClick={() => setSelectedProvider('WAVE')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
              selectedProvider === 'WAVE'
                ? 'bg-sky-500/15 border-sky-400 text-sky-300 shadow-lg shadow-sky-500/10'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-slate-950 font-black text-lg mb-2 shadow">
              🌊
            </div>
            <span className="font-bold text-sm text-white">Wave</span>
            <span className="text-[10px] text-sky-400 font-medium mt-0.5">App Directe (0% frais)</span>
          </button>

          {/* ORANGE MONEY */}
          <button
            type="button"
            onClick={() => setSelectedProvider('ORANGE_MONEY')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
              selectedProvider === 'ORANGE_MONEY'
                ? 'bg-orange-500/15 border-orange-400 text-orange-300 shadow-lg shadow-orange-500/10'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-slate-950 font-black text-lg mb-2 shadow">
              🍊
            </div>
            <span className="font-bold text-sm text-white">Orange Money</span>
            <span className="text-[10px] text-orange-400 font-medium mt-0.5">Sonatel / Max it</span>
          </button>
        </div>

        {/* Action Button : Direct Open App */}
        {selectedProvider === 'WAVE' ? (
          <div className="space-y-3">
            <a
              href={paymentData?.waveDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-sky-500/20 text-base transition-transform active:scale-98 gap-2"
            >
              <Smartphone className="w-5 h-5" />
              Ouvrir l'application Wave et Payer
            </a>
            
            <p className="text-[11px] text-center text-slate-400">
              💡 Le montant de <strong className="text-sky-300">{paymentData?.amount?.toLocaleString('fr-FR')} FCFA</strong> sera déjà pré-rempli dans votre Wave.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <a
              href={paymentData?.orangeMoneyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full py-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-orange-500/20 text-base transition-transform active:scale-98 gap-2"
            >
              <Smartphone className="w-5 h-5" />
              Payer via Orange Money
            </a>

            <p className="text-[11px] text-center text-slate-400">
              💡 Code marchand direct Sonatel : <strong className="text-orange-300">#144#391*789456123*...#</strong>
            </p>
          </div>
        )}

        {/* Instant Simulation / Test button */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {processing ? 'Validation en cours...' : 'Tester la confirmation immédiate (Simulation directe)'}
          </button>
        </div>

        {/* Security Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Paiement crypté SSL 256 bits • Reçu fiscal conforme</span>
        </div>
      </div>

      {/* Support Line */}
      <div className="mt-6 text-center text-xs text-slate-500">
        Besoin d'assistance ? Contactez le support MDA Arts Work au{' '}
        <a href="tel:+221774587474" className="text-orange-400 font-semibold hover:underline">
          +221 77 458 74 74
        </a>
      </div>
    </div>
  );
}
