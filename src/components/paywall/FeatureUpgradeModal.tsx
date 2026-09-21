'use client';

import React from 'react';
import { 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  X, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  FeatureKey, 
  getFeaturePaywallInfo, 
  buildUpgradeWhatsAppUrl,
  PLANS_REGISTRY
} from '@/lib/plan-permissions';

interface FeatureUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureKey: FeatureKey;
  currentPlanSlug?: string | null;
  restaurantName?: string;
}

export const FeatureUpgradeModal: React.FC<FeatureUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureKey,
  currentPlanSlug = 'tambali',
  restaurantName = 'Mon Restaurant',
}) => {
  if (!isOpen) return null;

  const paywall = getFeaturePaywallInfo(featureKey);
  const targetPlan = PLANS_REGISTRY[paywall.requiredPlan];
  const whatsappUrl = buildUpgradeWhatsAppUrl(
    restaurantName,
    currentPlanSlug,
    paywall.requiredPlan,
    paywall.name
  );

  const handleUpgradeClick = () => {
    // 1. Enregistrement télémétrique optionnel de l'intérêt d'upgrade
    try {
      fetch('/api/dashboard/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'UPGRADE_REQUEST',
          featureKey,
          targetPlan: paywall.requiredPlan,
          restaurantName
        })
      }).catch(() => {});
    } catch {}

    // 2. Ouverture directe de la conversation WhatsApp pré-remplie
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900 relative space-y-6">
        
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête avec Cadenas & Badge Formule */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Lock className="w-7 h-7 stroke-[2.2]" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              <ShieldCheck className="w-3 h-3 text-amber-600" />
              <span>Disponible avec la formule {paywall.requiredPlanName}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {paywall.name}
            </h3>
          </div>
        </div>

        {/* Bénéfice Concret Promis */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80">
          <p className="text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed">
            💡 {paywall.benefit}
          </p>
        </div>

        {/* Ce que la mise à niveau débloque concrètement */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Inclus dans la formule {paywall.requiredPlanName} :
          </h4>
          <div className="space-y-2.5">
            {paywall.concreteUnlocks.map((unlock, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>{unlock}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tarif & Offre */}
        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold block">Tarif de la formule {paywall.requiredPlanName}</span>
            <span className="text-xs text-emerald-600 font-semibold">Sans engagement • Activation immédiate</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-black text-slate-900">
              {targetPlan.priceMonthly.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-black text-slate-500 ml-1">FCFA / mois</span>
          </div>
        </div>

        {/* Boutons d'Action Directs */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleUpgradeClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Mettre à niveau via WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-800 font-bold text-center transition-colors"
          >
            Continuer sur mon abonnement actuel
          </button>
        </div>

      </div>
    </div>
  );
};
