'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  CreditCard, 
  Clock, 
  Phone, 
  Lock, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { SubscriptionStatus } from '@/types';

interface SubscriptionGuardProps {
  status: SubscriptionStatus;
  trialEndsAt?: string;
  subscriptionExpiresAt?: string;
  subdomain?: string;
  isClientView?: boolean;
  children: React.ReactNode;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  status,
  trialEndsAt,
  subscriptionExpiresAt,
  subdomain,
  isClientView = false,
  children,
}) => {
  const isSuspended = status === 'SUSPENDED';
  const isPastDue = status === 'EXPIRED' || (status as any) === 'PAST_DUE';

  // 1. Client View Suspended Screen
  if (isClientView && isSuspended) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center p-4 text-slate-900 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border-2 border-orange-200 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-slate-950">
            Menu en cours d'actualisation 🍽️
          </h2>

          <p className="text-xs text-slate-600 leading-relaxed">
            Ce restaurant met actuellement à jour ses cartes et suggestions du jour. Veuillez vous adresser directement à votre serveur.
          </p>

          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-orange-600">
              Lou Ame Tay ? • Menu Digital &amp; Commande
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Dashboard View with Warning Banner
  return (
    <>
      {isPastDue && !isSuspended && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-3 shadow-md flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-200 shrink-0" />
            <span className="text-xs font-black">
              ⚠️ Période de grâce active : Votre abonnement mensuel (15.000 FCFA) est arrivé à échéance. Veuillez régulariser pour éviter la suspension du menu client.
            </span>
          </div>

          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 bg-white text-orange-700 hover:bg-orange-50 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 shrink-0"
          >
            <span>Régulariser par Wave / OM</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {isSuspended && !isClientView && (
        <div className="bg-rose-950 text-white border-b-2 border-rose-500 px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <h4 className="text-sm font-black">
                Compte Suspendu pour défaut de paiement
              </h4>
              <p className="text-xs text-rose-200">
                Votre menu client est actuellement masqué. Débloquez instantanément votre compte.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/221774587474?text=Bonjour,%20je%20souhaite%20r%C3%A9activer%20mon%20abonnement%20Lou%20Ame%20Tay"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Phone className="w-4 h-4" />
            <span>Support MDA (+221 77 458 74 74)</span>
          </a>
        </div>
      )}

      {children}
    </>
  );
};