'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Banknote, Smartphone, CreditCard } from 'lucide-react';
import { OrderType } from '@/types';

interface CashierDailyRevenueCardProps {
  orders: OrderType[];
  className?: string;
}

/**
 * Carte Unique de Chiffre d'Affaires du Jour pour le Poste Caisse
 * - Calcule en temps réel la somme des commandes PAID du jour (createdAt >= startOfToday)
 * - Exclut rigoureusement les commandes CANCELLED et les repas personnels STAFF_MEAL / STAFF_NP
 * - Ventile par Espèces (Cash), Mobile Money (Wave, Orange Money, Free) et TPE (Carte)
 */
export const CashierDailyRevenueCard: React.FC<CashierDailyRevenueCardProps> = ({
  orders,
  className = '',
}) => {
  // Calcul dynamique et réactif du Chiffre d'Affaires réel du jour
  const breakdown = useMemo(() => {
    // Calcul du début de journée dans le fuseau horaire sénégalais (Africa/Dakar - UTC+0)
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

      // 4. Vérification de la date de la journée (données chaudes)
      const orderTime = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      if (orderTime < startOfToday) return;

      // Montant de la commande
      const amount = Number((o as any).totalAmount ?? o.total ?? 0);
      if (isNaN(amount) || amount <= 0) return;

      // 5. Ventilation précise par mode de règlement
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
        // Fallback en espèces si moyen non spécifié
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
      className={`bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-shadow p-5 sm:p-6 ${className}`}
    >
      {/* 1. En-tête discret */}
      <div className="flex items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-2xs">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
            Chiffre d'Affaires du Jour
          </span>
        </div>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-lg">
          Encaissé Réel
        </span>
      </div>

      {/* 2. Chiffre Principal XXL */}
      <div className="my-2 flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
          {breakdown.totalRevenue.toLocaleString('fr-FR')}
        </span>
        <span className="text-base sm:text-lg font-bold text-slate-500">FCFA</span>
      </div>

      {/* 3. Séparateur fin */}
      <div className="border-t border-slate-100 my-4" />

      {/* 4. Ventilation en 3 colonnes : Espèces, Mobile Money, TPE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 🟢 Espèces */}
        <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-emerald-800 block uppercase tracking-wider">
                Espèces
              </span>
              <span className="text-sm sm:text-base font-black text-emerald-950 font-mono truncate block">
                {breakdown.cashTotal.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* 🔵 Mobile Money (Wave, OM, Free) */}
        <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-blue-800 block uppercase tracking-wider">
                Mobile Money
              </span>
              <span className="text-sm sm:text-base font-black text-blue-950 font-mono truncate block">
                {breakdown.mobileMoneyTotal.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>

        {/* 🟣 Terminal TPE (Carte Bancaire) */}
        <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-purple-600 text-white rounded-lg shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-purple-800 block uppercase tracking-wider">
                Terminal TPE
              </span>
              <span className="text-sm sm:text-base font-black text-purple-950 font-mono truncate block">
                {breakdown.cardTotal.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
