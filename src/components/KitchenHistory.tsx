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
    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>📜 HISTORIQUE - COMMANDES SERVIES (AJOURD'HUI)</span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {historyOrders.length}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Journal des plats envoyés en salle aujourd'hui
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 shadow-2xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exporter CSV</span>
          </button>
        </div>
      </div>

      {/* Total Revenue Banner */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-900">Total Encaissé Aujourd'hui :</span>
        </div>
        <span className="text-base font-black text-emerald-800 font-mono">
          {formatFCFA(totalRevenue)}
        </span>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Chargement de l'historique...
        </div>
      ) : historyOrders.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Aucune commande servie pour l'instant aujourd'hui.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
          {historyOrders.map((order) => {
            const servedTimeFormatted = order.servedAt
              ? new Date(order.servedAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Servi';

            const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="p-3.5 bg-slate-50 border border-slate-200 hover:bg-slate-100/70 rounded-2xl flex items-center justify-between gap-3 flex-wrap transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center font-black text-sm shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-900">
                      Table {order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">
                      ⏱ {servedTimeFormatted} • {itemCount} item{itemCount > 1 ? 's' : ''} ({order.items.map((i) => `${i.quantity}x ${i.name || i.menuItem?.name || 'Plat'}`).join(', ')})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <span className="text-sm font-black text-amber-700 font-mono">
                    {formatFCFA(order.total)}
                  </span>

                  {onRestoreOrder && (
                    <button
                      type="button"
                      onClick={() => onRestoreOrder(order.id)}
                      className="p-1.5 bg-white hover:bg-slate-200 text-slate-500 hover:text-orange-600 border border-slate-200 rounded-lg text-xs flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                      title="Rétablir en cuisine"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};