'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  CreditCard, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UtensilsCrossed, 
  Store, 
  UserCheck, 
  TrendingUp, 
  ShoppingBag,
  FileSpreadsheet,
  RefreshCw,
  X
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { OrderType } from '@/types';
import { OrderDetailModal } from '@/components/cashier/OrderDetailModal';
import { toast } from 'sonner';

type DatePreset = 'TODAY' | 'YESTERDAY' | 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'THIS_MONTH' | 'CUSTOM';

export default function DashboardOrdersArchivePage() {
  const [restaurantName, setRestaurantName] = useState<string>('Mon Restaurant');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filtres temporels
  const [datePreset, setDatePreset] = useState<DatePreset>('LAST_7_DAYS');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Filtres métier
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination & Données
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [stats, setStats] = useState({
    totalOrdersCount: 0,
    paidOrdersCount: 0,
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(25);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modale de détail
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  // Calcul effectif des dates de début et fin selon le preset
  const effectiveDates = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    switch (datePreset) {
      case 'TODAY':
        return { start: todayStr, end: todayStr };
      case 'YESTERDAY': {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().split('T')[0];
        return { start: yStr, end: yStr };
      }
      case 'LAST_7_DAYS': {
        const d7 = new Date();
        d7.setDate(d7.getDate() - 7);
        return { start: d7.toISOString().split('T')[0], end: todayStr };
      }
      case 'LAST_30_DAYS': {
        const d30 = new Date();
        d30.setDate(d30.getDate() - 30);
        return { start: d30.toISOString().split('T')[0], end: todayStr };
      }
      case 'THIS_MONTH': {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: firstDay.toISOString().split('T')[0], end: todayStr };
      }
      case 'CUSTOM':
      default:
        return { start: customStartDate, end: customEndDate };
    }
  }, [datePreset, customStartDate, customEndDate]);

  // Chargement des commandes d'archive
  const fetchOrdersArchive = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') || '' : '';
      const params = new URLSearchParams({
        restaurantId: storedId,
        startDate: effectiveDates.start,
        endDate: effectiveDates.end,
        status: statusFilter,
        paymentMethod: paymentMethodFilter,
        page: String(page),
        limit: String(limit)
      });

      const res = await fetch(`/api/dashboard/orders?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrders(data.orders || []);
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
        if (data.restaurant?.businessName) {
          setRestaurantName(data.restaurant.businessName);
        }
      } else {
        toast.error(data.error || 'Erreur lors du chargement des archives');
      }
    } catch (err) {
      toast.error('Erreur de communication avec le serveur');
    } finally {
      setIsLoading(false);
    }
  }, [effectiveDates, statusFilter, paymentMethodFilter, page, limit]);

  useEffect(() => {
    fetchOrdersArchive();
  }, [fetchOrdersArchive]);

  // Filtrage local instantané par recherche textuelle
  const displayedOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();

    return orders.filter((o) => {
      const idStr = (o.id || '').toLowerCase();
      const customer = (o.customerName || '').toLowerCase();
      const employee = (o.employeeName || '').toLowerCase();
      const table = String(o.tableNumber || '');
      const location = (o.locationDetail || '').toLowerCase();
      const items = (o.items || []).map((i) => (i.name || i.menuItem?.name || '').toLowerCase()).join(' ');

      return (
        idStr.includes(q) ||
        customer.includes(q) ||
        employee.includes(q) ||
        table.includes(q) ||
        location.includes(q) ||
        items.includes(q)
      );
    });
  }, [orders, searchQuery]);

  // Exportation en CSV certifié avec encodage UTF-8 et BOM Excel
  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.warning('Aucune commande à exporter pour la période sélectionnée.');
      return;
    }

    try {
      const headers = [
        'ID Commande',
        'Date',
        'Heure',
        'Table / Espace',
        'Type',
        'Client / Employé',
        'Articles',
        'Total (FCFA)',
        'Statut Commande',
        'Statut Paiement',
        'Moyen de Paiement',
        'Réf Transaction'
      ];

      const rows = orders.map((o) => {
        const orderDate = o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '';
        const orderTime = o.createdAt ? new Date(o.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
        const tableLabel = o.locationDetail || (o.tableNumber ? `Table ${o.tableNumber}` : 'Comptoir');
        const itemsStr = (o.items || []).map((i) => `${i.quantity}x ${i.name || i.menuItem?.name || 'Article'}`).join(' | ');
        const total = (o as any).totalAmount ?? o.total ?? 0;

        return [
          `#CMD-${o.id.slice(-5).toUpperCase()}`,
          orderDate,
          orderTime,
          `"${tableLabel.replace(/"/g, '""')}"`,
          o.orderType || 'TABLE',
          `"${(o.employeeName || o.customerName || '').replace(/"/g, '""')}"`,
          `"${itemsStr.replace(/"/g, '""')}"`,
          total,
          o.status,
          o.paymentStatus,
          o.paymentMethod || 'CASH',
          o.transactionRef || ''
        ];
      });

      // Construction du CSV avec BOM UTF-8 (\uFEFF) pour compatibilité Excel Sénégal
      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `commandes_${restaurantName.replace(/\s+/g, '_')}_${effectiveDates.start}_au_${effectiveDates.end}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Export CSV réussi (${orders.length} commandes exportées) !`);
    } catch (e) {
      console.error('Erreur export CSV:', e);
      toast.error('Erreur lors de la génération du fichier CSV.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* 1. TOP HEADER : TITRE & BOUTONS D'ACTION */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all"
            title="Retour au Tableau de Bord"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-slate-900 text-amber-400 rounded-xl">
                <Receipt className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Historique des Commandes & Archives
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {restaurantName} • Données consolidées et archivage froid pour la comptabilité
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchOrdersArchive}
            disabled={isLoading}
            className="px-4 py-2.5 min-h-[44px] bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            title="Actualiser les données"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            title="Exporter les commandes de la période au format CSV"
          >
            <Download className="w-4 h-4" />
            <span>Exporter en CSV</span>
          </button>
        </div>
      </div>

      {/* 2. BARRE DES FILTRES DE DATES & PÉRIODES */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        
        {/* Ligne 1 : Presets de dates */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'TODAY', label: "Aujourd'hui" },
              { id: 'YESTERDAY', label: 'Hier' },
              { id: 'LAST_7_DAYS', label: '7 derniers jours' },
              { id: 'LAST_30_DAYS', label: '30 derniers jours' },
              { id: 'THIS_MONTH', label: 'Ce mois-ci' },
              { id: 'CUSTOM', label: 'Personnalisé' },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setDatePreset(preset.id as DatePreset);
                  setPage(1);
                }}
                className={`px-3.5 py-2 min-h-[40px] rounded-2xl text-xs font-bold transition-all border ${
                  datePreset === preset.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-black'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Du {new Date(effectiveDates.start).toLocaleDateString('fr-FR')} au {new Date(effectiveDates.end).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>

        {/* Ligne 2 : Date Picker Personnalisé (si CUSTOM sélectionné) */}
        {datePreset === 'CUSTOM' && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Du :</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">Au :</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setPage(1);
                }}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-bold text-slate-800"
              />
            </div>
          </div>
        )}

        {/* Ligne 3 : Filtres combinés (Statut, Paiement, Recherche) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          
          {/* Recherche */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par N°, table, client, plat..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-slate-400 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtre Statut */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl px-3 py-2.5 shadow-2xs cursor-pointer focus:outline-hidden focus:border-slate-400"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PAID">✅ Encaissées (Payées)</option>
              <option value="UNPAID">⚠️ En attente de paiement</option>
              <option value="STAFF_NP">👤 Repas Employés (NP)</option>
              <option value="CANCELLED">🔴 Annulées</option>
            </select>
          </div>

          {/* Filtre Moyen de Paiement */}
          <div>
            <select
              value={paymentMethodFilter}
              onChange={(e) => {
                setPaymentMethodFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl px-3 py-2.5 shadow-2xs cursor-pointer focus:outline-hidden focus:border-slate-400"
            >
              <option value="ALL">Tous les paiements</option>
              <option value="CASH">💵 Espèces (Cash)</option>
              <option value="WAVE">🌊 Wave</option>
              <option value="ORANGE_MONEY">🍊 Orange Money</option>
              <option value="CARD">💳 Carte Bancaire / TPE</option>
              <option value="STAFF_MEAL">👤 Repas Personnel</option>
            </select>
          </div>

        </div>

      </div>

      {/* 3. CARTES KPIS STATISTIQUES CONSOLIDÉES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* CA Encaissé */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Recettes Encaissées</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-xl sm:text-2xl text-slate-900">
            {formatFCFA(stats.totalRevenue)}
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {stats.paidOrdersCount} commandes payées
          </p>
        </div>

        {/* Volume de commandes */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Commandes Totales</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-xl sm:text-2xl text-slate-900">
            {stats.totalOrdersCount}
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Sur la période sélectionnée
          </p>
        </div>

        {/* Panier Moyen */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Panier Moyen</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-xl sm:text-2xl text-slate-900">
            {formatFCFA(stats.averageOrderValue)}
          </div>
          <p className="text-[11px] text-amber-800 font-semibold mt-1">
            Par client encaissé
          </p>
        </div>

        {/* Taux de Conversion */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Taux d'Encaissement</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-mono font-black text-xl sm:text-2xl text-slate-900">
            {stats.totalOrdersCount > 0 ? Math.round((stats.paidOrdersCount / stats.totalOrdersCount) * 100) : 0}%
          </div>
          <p className="text-[11px] text-indigo-700 font-semibold mt-1">
            {stats.paidOrdersCount} sur {stats.totalOrdersCount} commandes
          </p>
        </div>

      </div>

      {/* 4. TABLEAU DE DONNÉES D'ARCHIVES */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden space-y-4">
        {/* Vue Mobile : Cartes Déclutterisées (md:hidden) */}
        <div className="block md:hidden space-y-3 p-4">
          {displayedOrders.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <div className="font-bold text-slate-700">Aucune commande archivée</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Modifiez les filtres de date pour afficher des données.
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const total = (order as any).totalAmount ?? order.total ?? 0;
              const isPaid = order.paymentStatus === 'PAID';
              const isStaff = order.paymentMethod === 'STAFF_MEAL' || order.paymentStatus === 'STAFF_NP';
              const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '';
              const timeStr = order.createdAt ? new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
              const tableLabel = order.locationDetail || (order.tableNumber ? `Table ${order.tableNumber}` : 'Comptoir');
              const itemsList = (order.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ');

              return (
                <div
                  key={order.id}
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsDetailOpen(true);
                  }}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5 active:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        #CMD-{order.id.slice(-5).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">{dateStr} {timeStr}</span>
                    </div>

                    <div>
                      {isStaff ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-purple-100 text-purple-900">
                          Repas NP
                        </span>
                      ) : isPaid ? (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-100 text-emerald-900">
                          Payé ({order.paymentMethod || 'Cash'})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-100 text-amber-900">
                          Impayé
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                      {tableLabel}
                    </span>
                    {(order.employeeName || order.customerName) && (
                      <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                        {order.employeeName || order.customerName}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 font-medium line-clamp-2">
                    {itemsList || 'Aucun article'}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="font-mono font-black text-base text-slate-950">
                      {formatFCFA(total)}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                        setIsDetailOpen(true);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      <span>Détails</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vue Desktop : Tableau Complet (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4 w-28">Date & Heure</th>
                <th className="py-3.5 px-4 w-32">N° Commande</th>
                <th className="py-3.5 px-4 w-40">Emplacement</th>
                <th className="py-3.5 px-4 min-w-[220px]">Articles Consommés</th>
                <th className="py-3.5 px-4 w-36 text-right">Total Net</th>
                <th className="py-3.5 px-4 w-36 text-center">Paiement</th>
                <th className="py-3.5 px-4 w-28 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="font-bold text-slate-700">Aucune commande archivée</div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Modifiez les filtres temporels ou de statut pour afficher des données.
                    </p>
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => {
                  const total = (order as any).totalAmount ?? order.total ?? 0;
                  const isPaid = order.paymentStatus === 'PAID';
                  const isStaff = order.paymentMethod === 'STAFF_MEAL' || order.paymentStatus === 'STAFF_NP';

                  const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) : '';
                  const timeStr = order.createdAt ? new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
                  const tableLabel = order.locationDetail || (order.tableNumber ? `Table ${order.tableNumber}` : 'Comptoir');

                  const itemsList = (order.items || []).map((i) => `${i.quantity}x ${i.name}`).join(', ');

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailOpen(true);
                      }}
                    >
                      {/* Date & Heure */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 whitespace-nowrap">
                        <div>{dateStr}</div>
                        <div className="text-[10px] text-slate-400">{timeStr}</div>
                      </td>

                      {/* N° Commande */}
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-1 rounded-md text-[11px] border border-slate-200">
                          #CMD-{order.id.slice(-5).toUpperCase()}
                        </span>
                      </td>

                      {/* Emplacement */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        <div className="truncate">{tableLabel}</div>
                        {(order.employeeName || order.customerName) && (
                          <div className="text-[10px] text-slate-500 font-normal truncate">
                            {order.employeeName || order.customerName}
                          </div>
                        )}
                      </td>

                      {/* Articles */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-xs truncate font-medium text-slate-800" title={itemsList}>
                          {itemsList || 'Aucun article'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {order.items?.length || 0} article(s)
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-black text-slate-950 text-sm whitespace-nowrap">
                        {formatFCFA(total)}
                      </td>

                      {/* Statut Paiement */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isStaff ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-900">
                            Repas NP
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-900">
                            Payé ({order.paymentMethod || 'Cash'})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900">
                            Impayé
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td 
                        className="py-3.5 px-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-all ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Voir</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
          <div>
            Affichage page <strong className="text-slate-900">{page}</strong> sur{' '}
            <strong className="text-slate-900">{totalPages}</strong> ({stats.totalOrdersCount} commandes totales)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-700 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold px-2">{page} / {totalPages}</span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 text-slate-700 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* MODALE DE DÉTAIL COMMANDE */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedOrder(null);
        }}
      />

    </div>
  );
}
