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
  dbTables?: any[];
  onRefreshTables?: () => void;
  onRefreshOrders?: () => void;
  restaurantId?: string;
}

export const TableServiceLiveStatus: React.FC<TableServiceLiveStatusProps> = ({
  orders,
  tableCount = 12,
  dbTables,
  onRefreshTables,
  onRefreshOrders,
  restaurantId,
}) => {
  const effectiveTenantId = restaurantId || (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') || '' : '');

  // Confirmation inline de libération de table
  const [confirmingReleaseTable, setConfirmingReleaseTable] = useState<number | null>(null);
  const [isReleasingTable, setIsReleasingTable] = useState<boolean>(false);

  // Filtre par état de cycle de vie (3 états : FREE, OCCUPIED, TO_CLEAN)
  const [lifeCycleFilter, setLifeCycleFilter] = useState<'ALL' | 'FREE' | 'OCCUPIED' | 'TO_CLEAN'>('ALL');

  // Liste des membres du shift
  const [shiftMembers, setShiftMembers] = useState<ServerShiftMember[]>(() => {
    return getServerShiftMembers();
  });

  // Dynamic zones from DB
  const [zones, setZones] = useState<any[]>([]);

  // Table -> Assigned Server map: { 1: "Modou Faye", 2: "Modou Faye", ... }
  const [tableServerMap, setTableServerMap] = useState<Record<number, string>>(() => {
    return getTableServerMap();
  });

  // Modale d'édition d'un serveur
  const [editingMember, setEditingMember] = useState<ServerShiftMember | null>(null);

  // Filtre par Zone / Salle
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!effectiveTenantId) return;

    // Fetch tenant zones
    fetch(`/api/tenant/zones?tenantId=${encodeURIComponent(effectiveTenantId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.zones && Array.isArray(data.zones)) {
          setZones(data.zones);
        }
      })
      .catch(() => {});

    // Fetch tenant waiters from DB
    fetch(`/api/tenant/waiters?tenantId=${encodeURIComponent(effectiveTenantId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.waiters && Array.isArray(data.waiters)) {
          const dbWaiters = data.waiters;
          const current = getServerShiftMembers();
          if (current.length === 0 && dbWaiters.length > 0) {
            const mapped: ServerShiftMember[] = dbWaiters.map((w: any) => ({
              id: w.id,
              name: w.name,
              phone: w.phone || undefined,
              shiftHours: '11h00 - 23h30 (Journée Complète)',
              periodType: 'FULL_DAY',
              status: 'ACTIVE',
              assignedTables: [],
            }));
            setShiftMembers(mapped);
            saveServerShiftMembers(mapped);
          }
        }
      })
      .catch(() => {});
  }, [effectiveTenantId]);

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

  // Remise en service manuelle d'une table (Nettoyée & Libre)
  const handleReleaseTable = async (tableNum: number) => {
    try {
      setIsReleasingTable(true);
      const res = await fetch('/api/tenant/tables/release', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: effectiveTenantId,
          tableNumber: tableNum,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`✨ Table ${tableNum < 10 ? '0' + tableNum : tableNum} remise en service !`, {
          description: 'La table est prête et propre pour accueillir les prochains clients.',
        });
        setConfirmingReleaseTable(null);
        if (onRefreshTables) onRefreshTables();
        if (onRefreshOrders) onRefreshOrders();
      } else {
        toast.error(data.error || 'Erreur lors de la remise en service de la table');
      }
    } catch (e) {
      toast.error('Erreur réseau lors de la remise en service');
    } finally {
      setIsReleasingTable(false);
    }
  };

  // Build tables view with active orders and lifecycle statuses
  const activeTablesList = useMemo(() => {
    return Array.from({ length: tableCount }, (_, i) => {
      const tableNum = i + 1;
      const dbTable = dbTables?.find((d: any) => d.tableNumber === tableNum);
      const clearedAtTime = dbTable?.clearedAt ? new Date(dbTable.clearedAt).getTime() : null;

      // 1. Filtrer les commandes pour cette table (non annulées)
      const tableOrders = orders.filter((o) => {
        if (o.tableNumber !== tableNum || o.status === 'CANCELLED') return false;
        if (!clearedAtTime) return true;
        return new Date(o.createdAt).getTime() > clearedAtTime;
      });

      // 2. Vérifier s'il y a des commandes non soldées
      const unpaidOrders = tableOrders.filter((o) => o.paymentStatus !== 'PAID');
      const latestUnpaidOrder = unpaidOrders.length > 0 ? unpaidOrders[unpaidOrders.length - 1] : undefined;

      // 3. Vérifier les commandes payées
      const paidOrders = tableOrders.filter((o) => o.paymentStatus === 'PAID');
      const latestPaidOrder = paidOrders.length > 0 ? paidOrders[paidOrders.length - 1] : undefined;

      // 🎯 DÉTERMINATION DES 3 ÉTATS DU CYCLE DE VIE MÉTIER :
      // - FREE : aucune commande active après clearedAt -> Carte verte, sans nom de client
      // - OCCUPIED : commande(s) active(s) non payée(s) -> Carte rouge/orange, nom et #cmd
      // - TO_CLEAN : addition payée, client parti, table à nettoyer -> Carte jaune, badge "À remettre en service"
      let lifeCycleStatus: 'FREE' | 'OCCUPIED' | 'TO_CLEAN' = 'FREE';
      let activeOrder: OrderType | undefined = undefined;

      if (latestUnpaidOrder) {
        lifeCycleStatus = 'OCCUPIED';
        activeOrder = latestUnpaidOrder;
      } else if (tableOrders.length > 0 && paidOrders.length === tableOrders.length) {
        lifeCycleStatus = 'TO_CLEAN';
        activeOrder = latestPaidOrder;
      }

      const assignedServer = tableServerMap[tableNum] || 'Non assigné';

      let kitchenItems: any[] = [];
      let barItems: any[] = [];
      let totalItemsCount = 0;
      let servedItemsCount = 0;

      if (activeOrder && activeOrder.items) {
        activeOrder.items.forEach((it, idx) => {
          const itemKey = `${activeOrder!.id}_${it.id || idx}`;
          const isServed = Boolean(servedItemsMap[itemKey] || activeOrder!.status === 'SERVED');
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
        dbTable,
        lifeCycleStatus,
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
  }, [orders, tableCount, tableServerMap, servedItemsMap, dbTables]);

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
        {shiftMembers.length === 0 ? (
          <div className="text-center py-6 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-1.5">
            <Users className="w-7 h-7 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">Aucun serveur dans le shift en cours</p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Cliquez sur « Ajouter Serveur au Shift » ci-dessus pour intégrer des serveurs et leur attribuer des tables en temps réel.
            </p>
          </div>
        ) : (
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
        )}

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

      {/* 2. Cycle de Vie des Tables & Filtres de Salle */}
      <div className="space-y-3 bg-white p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-2xs">
        {/* Ligne 1 : Compteurs et Filtres des 3 États Métier */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setLifeCycleFilter('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                lifeCycleFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>🍽️ Toutes les Tables</span>
              <span className="bg-slate-700/30 text-xs px-1.5 py-0.2 rounded-md font-mono">
                {tableCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLifeCycleFilter('FREE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                lifeCycleFilter === 'FREE'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <span>🟢 Libres</span>
              <span className="bg-emerald-700/30 text-xs px-1.5 py-0.2 rounded-md font-mono">
                {activeTablesList.filter((t) => t.lifeCycleStatus === 'FREE').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLifeCycleFilter('OCCUPIED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                lifeCycleFilter === 'OCCUPIED'
                  ? 'bg-amber-500 text-slate-950 shadow-2xs'
                  : 'text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <span>🟡 Occupées</span>
              <span className="bg-amber-600/30 text-xs px-1.5 py-0.2 rounded-md font-mono">
                {activeTablesList.filter((t) => t.lifeCycleStatus === 'OCCUPIED').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setLifeCycleFilter('TO_CLEAN')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                lifeCycleFilter === 'TO_CLEAN'
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'text-orange-950 bg-orange-50 hover:bg-orange-100 border border-orange-200'
              }`}
            >
              <span>🧹 À Libérer (À nettoyer)</span>
              <span className="bg-orange-700/30 text-xs px-1.5 py-0.2 rounded-md font-mono">
                {activeTablesList.filter((t) => t.lifeCycleStatus === 'TO_CLEAN').length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synchronisation live</span>
          </div>
        </div>

        {/* Ligne 2 : Filtres de Zones / Salles */}
        {zones.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-1">
              Salles / Zones :
            </span>
            <button
              type="button"
              onClick={() => setActiveZoneFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeZoneFilter === 'ALL'
                  ? 'bg-slate-200 text-slate-900 font-black'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Toutes les zones
            </button>
            {zones.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => setActiveZoneFilter(zone.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeZoneFilter === zone.id
                    ? 'bg-amber-100 text-amber-900 font-black border border-amber-300'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                📍 {zone.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Grille des Tables avec Cycle de Vie (3 États Clairs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {activeTablesList
          .filter((t) => {
            // Filtre par Zone
            if (activeZoneFilter !== 'ALL') {
              const targetZone = zones.find((z) => z.id === activeZoneFilter);
              if (targetZone && targetZone.tables && targetZone.tables.length > 0) {
                const inZone = targetZone.tables.some((zt: any) => zt.tableNumber === t.tableNum);
                if (!inZone) return false;
              }
            }
            // Filtre par Statut de Cycle de Vie
            if (lifeCycleFilter !== 'ALL') {
              return t.lifeCycleStatus === lifeCycleFilter;
            }
            return true;
          })
          .map((t) => {
            const hasOrder = Boolean(t.activeOrder);

            // =================================================================
            // ÉTAT 1 : LIBRE (Verte, sans nom de client, prête à accueillir)
            // =================================================================
            if (t.lifeCycleStatus === 'FREE') {
              return (
                <div
                  key={t.tableNum}
                  data-table-number={t.tableNum}
                  data-table-lifecycle="FREE"
                  className="bg-white rounded-3xl border-2 border-emerald-400 hover:border-emerald-500 p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between gap-4 relative group hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-emerald-100 pb-3">
                    <div>
                      <span className="text-base sm:text-lg font-black text-emerald-950 font-mono">
                        TABLE {t.tableNum < 10 ? `0${t.tableNum}` : t.tableNum}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider block mt-0.5">
                        {t.dbTable?.zone?.name || 'Salle Principale'}
                      </span>
                    </div>

                    {/* Server assignment dropdown */}
                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        Serveur dédié
                      </span>
                      <select
                        value={t.assignedServer}
                        onChange={(e) => handleAssignServer(t.tableNum, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                      >
                        <option value="Non assigné">Non assigné</option>
                        {shiftMembers.map((m) => (
                          <option key={m.id} value={m.name}>
                            👤 {m.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Body : Table Libre et prête */}
                  <div className="py-6 text-center space-y-2.5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs transition-transform group-hover:scale-105">
                      <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-950">Table Libre &amp; Dressée</h4>
                      <p className="text-xs text-emerald-700 font-medium">Prête à accueillir de nouveaux clients</p>
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold block pt-1">
                      Serveur : {t.assignedServer}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Statut Table</span>
                    <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-black px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>Libre</span>
                    </span>
                  </div>
                </div>
              );
            }

            // =================================================================
            // ÉTAT 3 : À LIBÉRER (Addition payée, client parti, table à nettoyer)
            // =================================================================
            if (t.lifeCycleStatus === 'TO_CLEAN') {
              return (
                <div
                  key={t.tableNum}
                  data-table-number={t.tableNum}
                  data-table-lifecycle="TO_CLEAN"
                  className="bg-gradient-to-b from-amber-50 via-white to-amber-50/60 rounded-3xl border-2 border-amber-500 shadow-md ring-2 ring-amber-300/60 p-4 sm:p-5 transition-all flex flex-col justify-between gap-3 relative"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-amber-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-slate-950 font-mono">
                          TABLE {t.tableNum < 10 ? `0${t.tableNum}` : t.tableNum}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md border border-amber-500 shadow-2xs">
                          À LIBÉRER
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                        {t.dbTable?.zone?.name || 'Salle Principale'}
                      </span>
                    </div>

                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">
                        Serveur dédié
                      </span>
                      <span className="text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded-xl border border-slate-200 inline-block">
                        👤 {t.assignedServer}
                      </span>
                    </div>
                  </div>

                  {/* Body : Encart d'invitation au nettoyage et remise en service */}
                  <div className="space-y-3 py-1">
                    <div className="p-3 bg-amber-100/90 border border-amber-300 rounded-2xl space-y-1.5 text-left">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-800 shrink-0" />
                        <span className="text-xs font-black text-amber-950 uppercase tracking-wide">
                          Addition Réglée en Caisse ✓
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 font-medium leading-relaxed">
                        Le repas précédent est soldé. Nettoyez et dressez la table, puis confirmez qu&apos;elle est prête pour le prochain client.
                      </p>
                      {t.activeOrder?.customerName && (
                        <p className="text-[11px] text-slate-500 font-bold border-t border-amber-200/80 pt-1">
                          Dernier client : {t.activeOrder.customerName} (#{t.activeOrder.id.slice(-5).toUpperCase()})
                        </p>
                      )}
                    </div>

                    {/* Action Manuelle avec Confirmation (Bouton VERT >= 48px) */}
                    {confirmingReleaseTable === t.tableNum ? (
                      <div className="p-3 bg-white border-2 border-emerald-500 rounded-2xl space-y-2 shadow-md animate-in fade-in">
                        <p className="text-xs font-black text-slate-900 text-center">
                          Confirmer la remise en service de la Table {t.tableNum} ?
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={isReleasingTable}
                            onClick={() => handleReleaseTable(t.tableNum)}
                            className="min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                            <span>✓ Prête</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingReleaseTable(null)}
                            className="min-h-[46px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                          >
                            <span>✕ Annuler</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingReleaseTable(t.tableNum)}
                        className="w-full min-h-[48px] py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 stroke-[2.5]" />
                        <span>Table Prête (Remettre en service)</span>
                      </button>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Statut Table</span>
                    <span className="bg-amber-200 text-amber-950 font-black border border-amber-300 px-2.5 py-0.5 rounded-lg text-xs flex items-center gap-1">
                      <span>🧹 À Nettoyer</span>
                    </span>
                  </div>
                </div>
              );
            }

            // =================================================================
            // ÉTAT 2 : OCCUPÉE (Client en cours, commande(s) active(s))
            // =================================================================
            return (
              <div
                key={t.tableNum}
                data-table-number={t.tableNum}
                data-table-lifecycle="OCCUPIED"
                className={`bg-white rounded-3xl border-2 p-4 sm:p-5 transition-all shadow-xs flex flex-col justify-between gap-3 relative ${
                  t.isAllServed
                    ? 'border-emerald-400 bg-emerald-50/10'
                    : 'border-amber-400 bg-amber-50/10 ring-1 ring-amber-400/50'
                }`}
              >
                {/* Header: Table Number + Order # + Customer Name */}
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
                      <span className="text-[11px] font-black text-slate-800 flex items-center gap-1 mt-0.5">
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
                      <option value="Non assigné">Non assigné</option>
                      {shiftMembers.map((m) => (
                        <option key={m.id} value={m.name}>
                          👤 {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Body: Items Status (Cuisine vs Bar) */}
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
                        <span>Cuisine (Plats chauds)</span>
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
                        <span>Bar (Boissons fraîches)</span>
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

                {/* Footer Indicator */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Statut Table</span>
                  <span
                    className={`font-black px-2.5 py-0.5 rounded-lg ${
                      t.isAllServed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {t.isAllServed ? '🟢 Tout Servi' : '🟡 Repas en cours'}
                  </span>
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