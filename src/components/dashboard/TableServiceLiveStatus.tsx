'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Utensils, 
  Wine, 
  CheckCircle2, 
  Clock, 
  UserCheck, 
  Plus, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { OrderType, OrderItemType } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { isDrinkOrBarItem, isKitchenDish } from '@/lib/order-routing';
import { toast } from 'sonner';

interface TableServiceLiveStatusProps {
  orders: OrderType[];
  tableCount?: number;
  onRefreshOrders?: () => void;
}

// Serveurs par défaut pour le shift
const DEFAULT_WAITERS = [
  'Modou Faye',
  'Fatou Diop',
  'Moussa Sall',
  'Awa Ndiaye',
  'Ibrahima Fall',
];

export const TableServiceLiveStatus: React.FC<TableServiceLiveStatusProps> = ({
  orders,
  tableCount = 12,
  onRefreshOrders,
}) => {
  // Liste des serveurs du shift
  const [waiters, setWaiters] = useState<string[]>(DEFAULT_WAITERS);
  const [newWaiterName, setNewWaiterName] = useState('');
  const [isAddWaiterOpen, setIsAddWaiterOpen] = useState(false);

  // Table -> Assigned Server map: { 1: "Modou Faye", 2: "Modou Faye", ... }
  const [tableServerMap, setTableServerMap] = useState<Record<number, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('louametay_table_server_shift');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    // Distribution par défaut (rangées de tables)
    const initial: Record<number, string> = {};
    for (let i = 1; i <= tableCount; i++) {
      if (i <= 4) initial[i] = 'Modou Faye';
      else if (i <= 8) initial[i] = 'Fatou Diop';
      else initial[i] = 'Moussa Sall';
    }
    return initial;
  });

  // Track served individual item keys: Set of "orderId_itemId"
  const [servedItemsMap, setServedItemsMap] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('louametay_served_items_shift');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {};
  });

  // Save server map to local storage
  const handleAssignServer = (tableNum: number, serverName: string) => {
    const updated = { ...tableServerMap, [tableNum]: serverName };
    setTableServerMap(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('louametay_table_server_shift', JSON.stringify(updated));
    }
    toast.success(`👤 Table ${tableNum} assignée à ${serverName}`);
  };

  // Add a new server to the shift
  const handleAddWaiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaiterName.trim()) return;
    if (waiters.includes(newWaiterName.trim())) {
      toast.error('Ce serveur est déjà dans la liste');
      return;
    }
    const updated = [...waiters, newWaiterName.trim()];
    setWaiters(updated);
    setNewWaiterName('');
    setIsAddWaiterOpen(false);
    toast.success(`✨ Serveur « ${newWaiterName.trim()} » ajouté au shift`);
  };

  // Toggle single item served status
  const handleToggleItemServed = (orderId: string, itemKey: string, itemName: string, tableNumber: number) => {
    const key = `${orderId}_${itemKey}`;
    const newStatus = !servedItemsMap[key];
    const updated = { ...servedItemsMap, [key]: newStatus };
    setServedItemsMap(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('louametay_served_items_shift', JSON.stringify(updated));
    }

    if (newStatus) {
      toast.success(`✅ « ${itemName} » marqué comme SERVI (Table ${tableNumber})`);
    } else {
      toast.info(`⏳ « ${itemName} » remis en attente`);
    }
  };

  // Build tables view with active orders
  const activeTablesList = useMemo(() => {
    return Array.from({ length: tableCount }, (_, i) => {
      const tableNum = i + 1;
      const activeOrder = orders.find(
        (o) => o.tableNumber === tableNum && o.status !== 'CANCELLED'
      );
      const assignedServer = tableServerMap[tableNum] || 'Non assigné';

      let kitchenItems: any[] = [];
      let barItems: any[] = [];
      let totalItemsCount = 0;
      let servedItemsCount = 0;

      if (activeOrder && activeOrder.items) {
        activeOrder.items.forEach((it, idx) => {
          const itemKey = `${activeOrder.id}_${it.id || idx}`;
          const isServed = Boolean(servedItemsMap[itemKey] || activeOrder.status === 'SERVED');
          const isBar = isDrinkOrBarItem(it);

          const decoratedItem = {
            ...it,
            key: it.id || String(idx),
            isServed,
            isBar,
          };

          totalItemsCount += it.quantity;
          if (isServed) {
            servedItemsCount += it.quantity;
          }

          if (isBar) {
            barItems.push(decoratedItem);
          } else {
            kitchenItems.push(decoratedItem);
          }
        });
      }

      const progressPercent =
        totalItemsCount > 0 ? Math.round((servedItemsCount / totalItemsCount) * 100) : 0;
      const isAllServed = totalItemsCount > 0 && servedItemsCount === totalItemsCount;

      return {
        tableNum,
        activeOrder,
        assignedServer,
        kitchenItems,
        barItems,
        totalItemsCount,
        servedItemsCount,
        progressPercent,
        isAllServed,
      };
    });
  }, [orders, tableCount, tableServerMap, servedItemsMap]);

  return (
    <div className="space-y-6">
      {/* 1. Header: Shift & Waiters Summary */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Shift en Cours & Attribution des Serveurs
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Chaque table est assignée à un serveur dédié pour sécuriser l'encaissement et le service
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {waiters.map((w) => (
            <span
              key={w}
              className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{w}</span>
            </span>
          ))}

          <button
            type="button"
            onClick={() => setIsAddWaiterOpen(!isAddWaiterOpen)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1 shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter Serveur</span>
          </button>
        </div>
      </div>

      {/* Add Waiter Form */}
      {isAddWaiterOpen && (
        <form
          onSubmit={handleAddWaiter}
          className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center gap-3 flex-wrap animate-in fade-in"
        >
          <span className="text-xs font-bold text-amber-900">Nouveau serveur en service :</span>
          <input
            type="text"
            required
            placeholder="Ex: Babacar Seck"
            value={newWaiterName}
            onChange={(e) => setNewWaiterName(e.target.value)}
            className="bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-amber-500 min-w-[200px]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-black text-xs shadow-2xs transition-all"
          >
            Enregistrer pour le shift
          </button>
          <button
            type="button"
            onClick={() => setIsAddWaiterOpen(false)}
            className="px-3 py-2 text-slate-600 text-xs font-bold hover:text-slate-900"
          >
            Annuler
          </button>
        </form>
      )}

      {/* 2. Grid of Tables Live Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {activeTablesList.map((t) => {
          const hasOrder = Boolean(t.activeOrder);

          return (
            <div
              key={t.tableNum}
              className={`rounded-3xl border-2 p-5 flex flex-col justify-between space-y-4 transition-all shadow-xs ${
                !hasOrder
                  ? 'bg-white border-slate-200/80 opacity-80'
                  : t.isAllServed
                  ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200'
                  : 'bg-white border-amber-400 shadow-sm'
              }`}
            >
              {/* Header Box: Table #, Server Dropdown & Total */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-900 font-black text-sm px-3 py-1 rounded-xl border border-amber-200">
                      Table {t.tableNum}
                    </span>
                    {hasOrder && (
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        #{t.activeOrder?.id.slice(-5).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Server selector */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] text-slate-400 font-bold">👤 Serveur :</span>
                    <select
                      value={t.assignedServer}
                      onChange={(e) => handleAssignServer(t.tableNum, e.target.value)}
                      className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {waiters.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {hasOrder && (
                  <div className="text-right">
                    <span className="text-xs text-slate-500 font-medium block">Total</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      {formatFCFA(t.activeOrder?.total || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Body: Live Service Breakdown */}
              {hasOrder ? (
                <div className="space-y-3.5 flex-1">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-600">
                        Avancement du service :
                      </span>
                      <span className={t.isAllServed ? 'text-emerald-700 font-black' : 'text-amber-700'}>
                        {t.servedItemsCount} / {t.totalItemsCount} articles ({t.progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          t.isAllServed ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${t.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* 1. Plats de Cuisine */}
                  {t.kitchenItems.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-orange-600" />
                        <span>Cuisine (Plats chauds & grillades)</span>
                      </span>

                      <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 text-xs">
                        {t.kitchenItems.map((it) => (
                          <div
                            key={it.key}
                            onClick={() =>
                              handleToggleItemServed(
                                t.activeOrder!.id,
                                it.key,
                                it.name || it.menuItem?.name || 'Plat',
                                t.tableNum
                              )
                            }
                            className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all border ${
                              it.isServed
                                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                                : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="font-mono font-black text-amber-700 shrink-0">
                                {it.quantity}x
                              </span>
                              <span className={`truncate font-bold ${it.isServed ? 'line-through text-slate-500' : ''}`}>
                                {it.name || it.menuItem?.name || 'Plat'}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                                it.isServed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {it.isServed ? '✅ Servi' : '⏳ En Cuisine'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. Boissons du Bar */}
                  {t.barItems.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Wine className="w-3.5 h-3.5 text-blue-600" />
                        <span>Comptoir Bar (Boissons fraîches)</span>
                      </span>

                      <div className="space-y-1 bg-blue-50/50 p-2.5 rounded-2xl border border-blue-200 text-xs">
                        {t.barItems.map((it) => (
                          <div
                            key={it.key}
                            onClick={() =>
                              handleToggleItemServed(
                                t.activeOrder!.id,
                                it.key,
                                it.name || it.menuItem?.name || 'Boisson',
                                t.tableNum
                              )
                            }
                            className={`p-2 rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all border ${
                              it.isServed
                                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                                : 'bg-white text-slate-800 border-blue-200 hover:border-blue-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="font-mono font-black text-blue-700 shrink-0">
                                {it.quantity}x
                              </span>
                              <span className={`truncate font-bold ${it.isServed ? 'line-through text-slate-500' : ''}`}>
                                {it.name || it.menuItem?.name || 'Boisson'}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md shrink-0 ${
                                it.isServed
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              {it.isServed ? '✅ Servie' : '🥤 À Servir'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                  <span>Table libre</span>
                  <span className="block text-[11px] text-slate-500 font-medium">
                    Assignée à {t.assignedServer}
                  </span>
                </div>
              )}

              {/* Footer Indicator */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Statut Table</span>
                {hasOrder ? (
                  <span
                    className={`font-black px-2.5 py-0.5 rounded-lg ${
                      t.isAllServed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {t.isAllServed ? '🟢 Tout Servi' : '🟡 Service en cours'}
                  </span>
                ) : (
                  <span className="font-bold text-slate-500">⚪ Libre</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};