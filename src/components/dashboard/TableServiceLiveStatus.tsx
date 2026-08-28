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
  DollarSign,
  Edit2,
  Phone,
  User,
  ArrowRightLeft
} from 'lucide-react';
import { OrderType, OrderItemType } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { isDrinkOrBarItem, isKitchenDish } from '@/lib/order-routing';
import { 
  ServerShiftMember, 
  getServerShiftMembers, 
  saveServerShiftMembers, 
  getTableServerMap,
  assignTableToServer 
} from '@/lib/server-shift';
import { EditWaiterModal } from './EditWaiterModal';
import { toast } from 'sonner';

interface TableServiceLiveStatusProps {
  orders: OrderType[];
  tableCount?: number;
  onRefreshOrders?: () => void;
}

export const TableServiceLiveStatus: React.FC<TableServiceLiveStatusProps> = ({
  orders,
  tableCount = 12,
  onRefreshOrders,
}) => {
  // Liste des membres du shift
  const [shiftMembers, setShiftMembers] = useState<ServerShiftMember[]>(() => {
    return getServerShiftMembers();
  });

  // Table -> Assigned Server map: { 1: "Modou Faye", 2: "Modou Faye", ... }
  const [tableServerMap, setTableServerMap] = useState<Record<number, string>>(() => {
    return getTableServerMap();
  });

  // Modale d'édition d'un serveur
  const [editingMember, setEditingMember] = useState<ServerShiftMember | null>(null);

  // Formulaire d'ajout rapide
  const [isAddWaiterOpen, setIsAddWaiterOpen] = useState(false);
  const [newWaiterName, setNewWaiterName] = useState('');
  const [newWaiterPhone, setNewWaiterPhone] = useState('');
  const [newWaiterHours, setNewWaiterHours] = useState('11h00 - 23h30 (Journée Complète)');

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
    assignTableToServer(tableNum, serverName);
    toast.success(`👤 Table ${tableNum} assignée à ${serverName}`);
  };

  // Add a new server to the shift
  const handleAddWaiter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWaiterName.trim()) return;

    const newMember: ServerShiftMember = {
      id: `srv_${Date.now()}`,
      name: newWaiterName.trim(),
      phone: newWaiterPhone.trim() || undefined,
      shiftHours: newWaiterHours,
      periodType: 'FULL_DAY',
      status: 'ACTIVE',
      assignedTables: [],
    };

    const updated = [...shiftMembers, newMember];
    setShiftMembers(updated);
    saveServerShiftMembers(updated);

    setNewWaiterName('');
    setNewWaiterPhone('');
    setIsAddWaiterOpen(false);
    toast.success(`✨ Serveur « ${newMember.name} » ajouté au shift`);
  };

  // Save member edits
  const handleSaveMember = (updated: ServerShiftMember) => {
    const nextList = shiftMembers.map((m) => (m.id === updated.id ? updated : m));
    setShiftMembers(nextList);
    saveServerShiftMembers(nextList);

    // Update table names if name changed
    const oldName = shiftMembers.find((m) => m.id === updated.id)?.name;
    if (oldName && oldName !== updated.name) {
      const newMap = { ...tableServerMap };
      Object.keys(newMap).forEach((k) => {
        const num = Number(k);
        if (newMap[num] === oldName) {
          newMap[num] = updated.name;
        }
      });
      setTableServerMap(newMap);
    }
  };

  // Delete a server member
  const handleDeleteMember = (memberId: string) => {
    const target = shiftMembers.find((m) => m.id === memberId);
    const nextList = shiftMembers.filter((m) => m.id !== memberId);
    setShiftMembers(nextList);
    saveServerShiftMembers(nextList);

    // Unassign tables
    if (target) {
      const newMap = { ...tableServerMap };
      Object.keys(newMap).forEach((k) => {
        const num = Number(k);
        if (newMap[num] === target.name) {
          delete newMap[num];
        }
      });
      setTableServerMap(newMap);
    }
  };

  // Transfer all tables from one member to another
  const handleTransferTables = (fromMemberId: string, toMemberId: string) => {
    const fromMember = shiftMembers.find((m) => m.id === fromMemberId);
    const toMember = shiftMembers.find((m) => m.id === toMemberId);
    if (!fromMember || !toMember) return;

    const newMap = { ...tableServerMap };
    Object.keys(newMap).forEach((k) => {
      const num = Number(k);
      if (newMap[num] === fromMember.name) {
        newMap[num] = toMember.name;
      }
    });

    setTableServerMap(newMap);
    if (typeof window !== 'undefined') {
      localStorage.setItem('louametay_table_server_shift', JSON.stringify(newMap));
    }
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
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Shift en Cours &amp; Attribution des Serveurs
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Gérez les horaires, les pauses et les attributions de tables de chaque serveur en temps réel
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddWaiterOpen(!isAddWaiterOpen)}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Ajouter Serveur au Shift</span>
          </button>
        </div>

        {/* Server Cards with Shifts & Edit Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
          {shiftMembers.map((member) => {
            const tableCountAssigned = Object.values(tableServerMap).filter((v) => v === member.name).length;

            return (
              <div
                key={member.id}
                className="bg-slate-50 hover:bg-white border border-slate-200 hover:border-amber-400 p-3.5 rounded-2xl transition-all shadow-2xs flex flex-col justify-between gap-2.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-slate-900 text-xs truncate">
                        {member.name}
                      </span>
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
                          member.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : member.status === 'BREAK'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {member.status === 'ACTIVE' ? '🟢 En Service' : member.status === 'BREAK' ? '⏸️ En Pause' : '🔴 Terminé'}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 truncate">
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{member.shiftHours}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingMember(member)}
                    className="p-1.5 bg-white group-hover:bg-amber-100 text-slate-400 group-hover:text-amber-900 rounded-lg border border-slate-200 group-hover:border-amber-300 transition-all shadow-2xs"
                    title="Modifier horaires / shift"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">Tables assignées</span>
                  <span className="font-mono font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {tableCountAssigned} table{tableCountAssigned > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Waiter Inline Drawer */}
        {isAddWaiterOpen && (
          <form
            onSubmit={handleAddWaiter}
            className="p-4 bg-amber-50/70 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-end gap-3 animate-in fade-in"
          >
            <div className="w-full sm:flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-800">Nom &amp; Prénom</label>
              <input
                type="text"
                required
                placeholder="Ex: Modou Faye"
                value={newWaiterName}
                onChange={(e) => setNewWaiterName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
              />
            </div>

            <div className="w-full sm:flex-1 space-y-1">
              <label className="text-xs font-bold text-slate-800">Créneau de Travail</label>
              <select
                value={newWaiterHours}
                onChange={(e) => setNewWaiterHours(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
              >
                <option value="11h00 - 16h30 (Service Midi)">☀️ Midi (11h00 - 16h30)</option>
                <option value="17h00 - 00h30 (Service Soirée)">🌙 Soirée (17h00 - 00h30)</option>
                <option value="11h00 - 23h30 (Journée Complète)">⚡ Journée Complète (11h00 - 23h30)</option>
                <option value="12h00 - 20h00 (Renfort)">✨ Renfort (12h00 - 20h00)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAddWaiterOpen(false)}
                className="px-3 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-xs"
              >
                Ajouter
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Tables Grid with Waiter Assignment & Live Service Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {activeTablesList.map((t) => {
          const hasOrder = Boolean(t.activeOrder);

          return (
            <div
              key={t.tableNum}
              className={`bg-white rounded-3xl border-2 p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between gap-3 relative ${
                t.isAllServed
                  ? 'border-emerald-400 bg-emerald-50/10'
                  : hasOrder
                  ? 'border-amber-400 bg-amber-50/10 ring-1 ring-amber-400/50'
                  : 'border-slate-200'
              }`}
            >
              {/* Header: Table Number + Assigned Server Dropdown */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black text-slate-950 font-mono">
                      TABLE {t.tableNum < 10 ? `0${t.tableNum}` : t.tableNum}
                    </span>
                    {hasOrder && (
                      <span className="text-[11px] font-bold text-slate-400 font-mono">
                        #{t.activeOrder!.id.slice(-5).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Customer Name if provided */}
                  {hasOrder && t.activeOrder?.customerName && (
                    <span className="text-[11px] font-black text-slate-700 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-orange-600" />
                      <span>{t.activeOrder.customerName}</span>
                    </span>
                  )}
                </div>

                {/* Server assignment dropdown */}
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Serveur dédié
                  </span>
                  <select
                    value={t.assignedServer}
                    onChange={(e) => handleAssignServer(t.tableNum, e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-amber-500 cursor-pointer shadow-2xs"
                  >
                    {shiftMembers.map((m) => (
                      <option key={m.id} value={m.name}>
                        👤 {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Body: Items Status (Cuisine vs Bar) */}
              {hasOrder ? (
                <div className="space-y-3 flex-1">
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600">
                        {t.servedItemsCount} / {t.totalItemsCount} servis
                      </span>
                      <span
                        className={`font-mono font-black ${
                          t.isAllServed ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {t.progressPercent}%
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
                        <span>Cuisine (Plats chauds &amp; grillades)</span>
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

      {/* Edit Waiter Modal */}
      <EditWaiterModal
        member={editingMember}
        allMembers={shiftMembers}
        isOpen={Boolean(editingMember)}
        onClose={() => setEditingMember(null)}
        onSaveMember={handleSaveMember}
        onDeleteMember={handleDeleteMember}
        onTransferTables={handleTransferTables}
      />
    </div>
  );
};