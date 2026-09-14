'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  ArrowLeft,
  Store,
  ShieldAlert
} from 'lucide-react';
import { 
  FeatureKey, 
  hasAccessToFeature, 
  getFeaturePaywallInfo, 
  buildUpgradeWhatsAppUrl,
  PLANS_REGISTRY
} from '@/lib/plan-permissions';

interface LockedFeatureGuardProps {
  featureKey: FeatureKey;
  children: React.ReactNode;
}

export const LockedFeatureGuard: React.FC<LockedFeatureGuardProps> = ({
  featureKey,
  children,
}) => {
  const [currentPlanSlug, setCurrentPlanSlug] = useState<string>('tambali');
  const [restaurantName, setRestaurantName] = useState<string>('Mon Restaurant');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('current_restaurant_id') || '';
      const storedName = localStorage.getItem('current_restaurant_name') || 'Mon Restaurant';
      setRestaurantName(storedName);

      if (storedId) {
        fetch(`/api/tenant/branding?restaurantId=${encodeURIComponent(storedId)}`)
          .then((r) => r.json())
          .then((data) => {
            const slug = data.plan?.slug?.toLowerCase() || (data.isTambali ? 'tambali' : 'tambali');
            setCurrentPlanSlug(slug);
            if (data.businessName || data.name) {
              setRestaurantName(data.businessName || data.name);
            }
          })
          .catch(() => {})
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  const isUnlocked = hasAccessToFeature(currentPlanSlug, featureKey);

  // 1. Si la fonctionnalité est débloquée, afficher la page normale
  if (isUnlocked) {
    return <>{children}</>;
  }

  // 2. Si la fonctionnalité est verrouillée, afficher l'écran de conversion valorisant
  const paywall = getFeaturePaywallInfo(featureKey);
  const targetPlan = PLANS_REGISTRY[paywall.requiredPlan];
  const whatsappUrl = buildUpgradeWhatsAppUrl(
    restaurantName,
    currentPlanSlug,
    paywall.requiredPlan,
    paywall.name
  );

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 text-center relative overflow-hidden">
        
        {/* Halo décoratif subtil */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-amber-100 rounded-full blur-2xl opacity-60 pointer-events-none" />

        {/* Cadenas Valorisé */}
        <div className="w-18 h-18 rounded-3xl bg-amber-500/15 text-amber-600 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-9 h-9 stroke-[2.2]" />
        </div>

        {/* Badge & Titre */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Formule {paywall.requiredPlanName} requise</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {paywall.name}
          </h1>
        </div>

        {/* Encadré Bénéfice Concret */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left">
          <p className="text-sm font-bold text-amber-950 leading-relaxed text-center sm:text-left">
            💡 {paywall.benefit}
          </p>
        </div>

        {/* Liste des déblocages concrets */}
        <div className="text-left space-y-3 pt-2">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Inclus dès la formule {paywall.requiredPlanName} :
          </h3>
          <div className="space-y-2.5">
            {paywall.concreteUnlocks.map((unlock, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span>{unlock}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tarif & Sans Engagement */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs text-slate-500 font-bold block">Tarif formule {paywall.requiredPlanName}</span>
            <span className="text-xs text-emerald-600 font-bold">Sans engagement • Activation immédiate</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-2xl font-black text-slate-900">
              {targetPlan.priceMonthly.toLocaleString('fr-FR')}
            </span>
            <span className="text-xs font-black text-slate-500 ml-1">FCFA / mois</span>
          </div>
        </div>

        {/* Actions directes */}
        <div className="space-y-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Mettre à niveau mon restaurant sur WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retourner au tableau de bord</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
