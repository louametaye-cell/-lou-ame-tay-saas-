'use client';

import React, { useMemo } from 'react';
import { OrderType } from '@/types';

interface CashierDailyRevenueCardProps {
  orders: OrderType[];
  className?: string;
}

/**
 * Carte Unique et Épurée du Chiffre d'Affaires du Jour (Poste Caisse Focus)
 * - Calcule en temps réel la somme des commandes PAID du jour (createdAt >= startOfToday)
 * - Exclut rigoureusement les commandes CANCELLED et les repas personnels STAFF_MEAL / STAFF_NP
 * - Palette neutre : Total en grand (text-4xl text-slate-900 font-mono font-bold)
 * - Répartition sobre et discrète (Espèces / Mobile Money / TPE) sans fonds colorés agressifs
 */
export const CashierDailyRevenueCard: React.FC<CashierDailyRevenueCardProps> = ({
  orders,
  className = '',
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

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 ${className}`}
    >
      {/* 1. Titre et Indicateur de Période sobre */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Chiffre d&apos;Affaires du Jour
        </h2>
        <span className="text-xs font-medium text-slate-400">
          Encaissé Réel
        </span>
      </div>

      {/* 2. Total Principal XXL en noir pur font-mono font-bold */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-bold font-mono text-slate-900 tracking-tight">
          {breakdown.totalRevenue.toLocaleString('fr-FR')}
        </span>
        <span className="text-base sm:text-lg font-semibold font-mono text-slate-500">
          FCFA
        </span>
      </div>

      {/* 3. Séparateur discret */}
      <div className="border-t border-slate-100" />

      {/* 4. Ventilation en puces discrètes et texte gris aligné */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
        {/* Espèces */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-slate-500">Espèces :</span>
          <span className="font-mono font-bold text-slate-900">
            {breakdown.cashTotal.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        <span className="text-slate-200 hidden sm:inline">•</span>

        {/* Mobile Money */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
          <span className="text-slate-500">Mobile Money (Wave/OM) :</span>
          <span className="font-mono font-bold text-slate-900">
            {breakdown.mobileMoneyTotal.toLocaleString('fr-FR')} FCFA
          </span>
        </div>

        <span className="text-slate-200 hidden sm:inline">•</span>

        {/* TPE / Carte */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
          <span className="text-slate-500">TPE Carte :</span>
          <span className="font-mono font-bold text-slate-900">
            {breakdown.cardTotal.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      </div>
    </div>
  );
};
