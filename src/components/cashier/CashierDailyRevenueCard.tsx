'use client';

import React, { useMemo } from 'react';
import { OrderType } from '@/types';
import { EyeOff, Eye, Lock } from 'lucide-react';
import { isWithinBlindClosingWindow, BlindClosingConfig } from '@/lib/cashier-blind-closing';

interface CashierDailyRevenueCardProps {
  orders: OrderType[];
  className?: string;
  userRole?: 'ADMIN' | 'CASHIER';
  closingConfig?: BlindClosingConfig;
  currentSession?: any;
}

/**
 * Carte Unique et Épurée du Chiffre d'Affaires du Jour (Poste Caisse Focus)
 * - Calcule en temps réel la somme des commandes PAID du jour (createdAt >= startOfToday)
 * - Exclut rigoureusement les commandes CANCELLED et les repas personnels STAFF_MEAL / STAFF_NP
 * - Sécurité Financière : Masquage automatique "Clôture à l'aveugle" pour le profil CASHIER dans les 2h30 précédant la fermeture.
 * - Le Gérant (ADMIN) conserve la visibilité permanente en temps réel.
 */
export const CashierDailyRevenueCard: React.FC<CashierDailyRevenueCardProps> = ({
  orders,
  className = '',
  userRole = 'CASHIER',
  closingConfig,
  currentSession,
}) => {
  // Calcul dynamique et réactif du Chiffre d'Affaires réel du jour
  const breakdown = useMemo(() => {
    let startOfToday: number;
    try {
      const now = new Date();
      const dakarDateStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Africa/Dakar',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(now);
      startOfToday = new Date(`${dakarDateStr}T00:00:00.000Z`).getTime();
    } catch {
      const now = new Date();
      startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    }

    let cashTotal = 0;
    let mobileMoneyTotal = 0;
    let cardTotal = 0;

    // Filtrage strict : payé aujourd'hui, non annulé, et non repas personnel
    orders.forEach((o) => {
      // 1. Exclusion stricte des commandes annulées
      if (o.status === 'CANCELLED') return;

      // 2. Vérification statut paiement PAID
      const isPaid = o.paymentStatus === 'PAID' || o.paymentStatus === 'PAID_IN_FULL' || o.paymentStatus === 'SUCCESS';
      if (!isPaid) return;

      // 3. Exclusion des bons repas personnel (NP)
      const isStaffMeal = o.paymentMethod === 'STAFF_MEAL' || o.paymentStatus === 'STAFF_NP' || (o as any).employeeName;
      if (isStaffMeal) return;

      // 4. Vérification de la date de la journée
      const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      if (orderTime < startOfToday) return;

      const amount = Number((o as any).totalAmount ?? o.total ?? 0);
      if (isNaN(amount) || amount <= 0) return;

      // 5. Ventilation par mode de règlement
      const method = (o.paymentMethod || 'CASH').toUpperCase();

      if (method === 'CASH') {
        cashTotal += amount;
      } else if (
        method === 'WAVE' ||
        method === 'ORANGE_MONEY' ||
        method === 'FREE_MONEY' ||
        method === 'YAS_MONEY' ||
        method === 'MOBILE_MONEY'
      ) {
        mobileMoneyTotal += amount;
      } else if (
        method === 'CARD' ||
        method === 'CASH_TPE' ||
        method === 'TPE' ||
        method === 'CREDIT_CARD'
      ) {
        cardTotal += amount;
      } else {
        cashTotal += amount;
      }
    });

    const totalRevenue = cashTotal + mobileMoneyTotal + cardTotal;

    return {
      totalRevenue,
      cashTotal,
      mobileMoneyTotal,
      cardTotal,
    };
  }, [orders]);

  // Évaluation de la règle de clôture à l'aveugle
  const isBlindActive = useMemo(() => {
    // Règle 1 : L'administrateur (Gérant) voit TOUJOURS le CA en temps réel
    if (userRole === 'ADMIN') return false;

    // Règle 2 : Option désactivée par le gérant
    if (closingConfig?.autoHideEnabled === false) return false;

    // Règle 3 : Si la session est déjà clôturée ou inexistante, aucun masquage requis
    if (currentSession?.status === 'CLOSED') return false;

    // Règle 4 : Vérification de la fenêtre temporelle
    const closingTime = closingConfig?.closingTime || '23:30';
    const delayMinutes = closingConfig?.blindClosingDelayMinutes ?? 150;

    return isWithinBlindClosingWindow(new Date(), closingTime, delayMinutes, true);
  }, [userRole, closingConfig, currentSession]);

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* 1. Titre et Indicateur de Sécurité */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Chiffre d&apos;Affaires du Jour
          </h2>
          {isBlindActive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-md text-[11px] font-bold">
              <EyeOff className="w-3 h-3 text-amber-700" />
              <span>Clôture à l&apos;aveugle</span>
            </span>
          ) : userRole === 'ADMIN' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-md text-[11px] font-bold">
              <Eye className="w-3 h-3 text-emerald-600" />
              <span>Vue Gérant</span>
            </span>
          ) : null}
        </div>
        <span className="text-xs font-medium text-slate-400">
          Encaissé Réel
        </span>
      </div>

      {/* 2. Total Principal XXL (Masqué ou en Clair) */}
      <div className="flex items-baseline gap-2">
        {isBlindActive ? (
          <>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-slate-400 tracking-widest select-none">
              ••••••
            </span>
            <span className="text-base sm:text-lg font-semibold font-mono text-slate-400">
              FCFA
            </span>
          </>
        ) : (
          <>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
              {breakdown.totalRevenue.toLocaleString('fr-FR')}
            </span>
            <span className="text-base sm:text-lg font-semibold font-mono text-slate-500">
              FCFA
            </span>
          </>
        )}
      </div>

      {/* 3. Séparateur discret */}
      <div className="border-t border-slate-100" />

      {/* 4. Ventilation par mode de règlement */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        {/* Espèces */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-500">Espèces :</span>
          <span className={`font-mono font-bold ${isBlindActive ? 'text-slate-400' : 'text-slate-900'}`}>
            {isBlindActive ? '••• FCFA' : `${breakdown.cashTotal.toLocaleString('fr-FR')} FCFA`}
          </span>
        </div>

        <span className="text-slate-200 hidden sm:inline">•</span>

        {/* Mobile Money */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
          <span className="text-slate-500">Mobile Money (Wave/OM) :</span>
          <span className={`font-mono font-bold ${isBlindActive ? 'text-slate-400' : 'text-slate-900'}`}>
            {isBlindActive ? '••• FCFA' : `${breakdown.mobileMoneyTotal.toLocaleString('fr-FR')} FCFA`}
          </span>
        </div>

        <span className="text-slate-200 hidden sm:inline">•</span>

        {/* TPE / Carte */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
          <span className="text-slate-500">TPE Carte :</span>
          <span className={`font-mono font-bold ${isBlindActive ? 'text-slate-400' : 'text-slate-900'}`}>
            {isBlindActive ? '••• FCFA' : `${breakdown.cardTotal.toLocaleString('fr-FR')} FCFA`}
          </span>
        </div>
      </div>

      {/* 5. Bandeau informatif si masquage actif */}
      {isBlindActive && (
        <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <Lock className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>Sécurité Comptable :</strong> Le montant total est masqué avant la fermeture pour garantir la clôture à l&apos;aveugle. Il sera révélé après validation de la clôture Z.
          </span>
        </div>
      )}
    </div>
  );
};
