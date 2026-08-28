'use client';

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, RefreshCw, Clock, DollarSign, RotateCcw } from 'lucide-react';
import { OrderType } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface KitchenHistoryProps {
  restaurantId?: string;
  onRestoreOrder?: (orderId: string) => void;
  refreshTrigger?: number;
}

export const KitchenHistory: React.FC<KitchenHistoryProps> = ({
  restaurantId = 'resto_thies_01',
  onRestoreOrder,
  refreshTrigger = 0,
}) => {
  const [historyOrders, setHistoryOrders] = useState<OrderType[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const url = `/api/kitchen/history?restaurantId=${encodeURIComponent(restaurantId)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistoryOrders(data.orders || []);
        setTotalRevenue(data.total || 0);
      }
    } catch (e) {
      console.error('Erreur chargement historique cuisine:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [restaurantId, refreshTrigger]);

  const handleExportCSV = () => {
    const url = `/api/kitchen/history?restaurantId=${encodeURIComponent(restaurantId)}&format=csv`;
    window.open(url, '_blank');
    toast.success('Fichier CSV de l\'historique généré !');
  };

  return (
    <div className="bg-[#0f1422] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-2xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>📜 HISTORIQUE - COMMANDES SERVIES (AJOURD&apos;HUI)</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {historyOrders.length}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Journal des plats envoyés en salle aujourd&apos;hui
            </p>
          </div>
        </div>

        <button
          onClick={fetchHistory}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Orders List */}
      {historyOrders.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs bg-slate-950/50 rounded-2xl border border-slate-800/80">
          Aucune commande servie pour le moment aujourd&apos;hui.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {historyOrders.map((order) => {
            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
            const servedTimeFormatted = order.servedAt
              ? new Date(order.servedAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

            return (
              <div
                key={order.id}
                className="bg-slate-950/90 border border-slate-800/90 hover:border-slate-700 p-3.5 rounded-2xl flex items-center justify-between flex-wrap gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-sm shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="text-sm font-black text-white">
                      Table {order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ⏱ {servedTimeFormatted} • {itemCount} item{itemCount > 1 ? 's' : ''} ({order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-sm font-black text-amber-400">
                    {formatFCFA(order.total)}
                  </span>

                  {onRestoreOrder && (
                    <button
                      onClick={() => onRestoreOrder(order.id)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-orange-400 border border-slate-800 rounded-lg text-xs flex items-center gap-1 active:scale-95 transition-all"
                      title="Rétablir en cuisine"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Rétablir</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: Summary & Export CSV Button */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black text-white">
            📊 TOTAL AUJOURD&apos;HUI : {historyOrders.length} commande{historyOrders.length > 1 ? 's' : ''} - {formatFCFA(totalRevenue)}
          </span>
        </div>

        <button
          onClick={handleExportCSV}
          className="min-h-[44px] px-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 active:scale-95 transition-all shadow-md ml-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>📥 Exporter en CSV</span>
        </button>
      </div>
    </div>
  );
};
