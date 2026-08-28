'use client';

import React from 'react';
import { Receipt, Clock, Sparkles, ChevronUp } from 'lucide-react';
import { OrderType } from '@/types';
import { formatFCFA } from '@/lib/utils';

interface ActiveOrderFloatingPillProps {
  orders: OrderType[];
  tableNumber: number;
  onOpenTracker: () => void;
}

export const ActiveOrderFloatingPill: React.FC<ActiveOrderFloatingPillProps> = ({
  orders,
  tableNumber,
  onOpenTracker,
}) => {
  if (!orders || orders.length === 0) return null;

  const totalAccumulated = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalItemsCount = orders.reduce((sum, o) => sum + (o.items?.length || 0), 0);
  const latestOrder = orders[orders.length - 1];

  // Estimated prep time
  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  return (
    <aside
      role="region"
      aria-label="Suivi de commande en direct"
      className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300"
    >
      <button
        type="button"
        onClick={onOpenTracker}
        aria-label={`Ouvrir le ticket numérique de la Table ${formattedTable}. Total : ${formatFCFA(totalAccumulated)}`}
        className="w-full bg-slate-950/95 hover:bg-slate-900 text-white rounded-2xl p-3 shadow-2xl border border-amber-400/40 backdrop-blur-md flex items-center justify-between gap-3 transition-all hover:scale-[1.02] active:scale-95 group text-left"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 rounded-xl shadow-xs shrink-0 animate-pulse">
            <Receipt className="w-4 h-4" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider">
                Table {formattedTable}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>En Cuisine</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium truncate">
              {totalItemsCount} article{totalItemsCount > 1 ? 's' : ''} • Solde : <strong className="text-white font-mono">{formatFCFA(totalAccumulated)}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shrink-0">
          <span>Voir Ticket</span>
          <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </button>
    </aside>
  );
};