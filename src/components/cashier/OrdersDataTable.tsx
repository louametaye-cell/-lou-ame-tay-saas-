'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  CreditCard, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UtensilsCrossed, 
  Store, 
  UserCheck, 
  ArrowUpDown,
  RefreshCw,
  X
} from 'lucide-react';
import { OrderType } from '@/types';
import { formatFCFA } from '@/lib/utils';

interface OrdersDataTableProps {
  orders: OrderType[];
  onViewOrder: (order: OrderType) => void;
  onPayOrder: (order: OrderType) => void;
  onPrintReceipt: (order: OrderType) => void;
  isLoading?: boolean;
}

export const OrdersDataTable: React.FC<OrdersDataTableProps> = ({
  orders,
  onViewOrder,
  onPayOrder,
  onPrintReceipt,
  isLoading = false
}) => {
  // Filtres et Recherche
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [spaceFilter, setSpaceFilter] = useState<string>('ALL'); // ALL, TABLE, TAKEAWAY

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Tri (par date par défaut desc)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtrage combiné instantané côté client
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Filtre par recherche textuelle (N° commande, table, client, employé, article)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const orderId = (order.id || '').toLowerCase();
        const shortId = orderId.slice(-5);
        const tableNum = String(order.tableNumber || '');
        const location = (order.locationDetail || '').toLowerCase();
        const customer = (order.customerName || '').toLowerCase();
        const employee = (order.employeeName || '').toLowerCase();
        const itemsNames = (order.items || []).map((i) => (i.name || '').toLowerCase()).join(' ');

        const matchesQuery = 
          orderId.includes(query) ||
          shortId.includes(query) ||
          tableNum.includes(query) ||
          location.includes(query) ||
          customer.includes(query) ||
          employee.includes(query) ||
          itemsNames.includes(query);

        if (!matchesQuery) return false;
      }

      // 2. Filtre par statut (Toutes, En attente, Prêtes, Payées, Annulées)
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'PAID') {
          if (order.paymentStatus !== 'PAID') return false;
        } else if (statusFilter === 'UNPAID') {
          if (order.paymentStatus === 'PAID' || order.status === 'CANCELLED') return false;
        } else if (statusFilter === 'PENDING') {
          if (order.status !== 'PENDING') return false;
        } else if (statusFilter === 'READY') {
          if (order.status !== 'READY') return false;
        } else if (statusFilter === 'SERVED') {
          if (order.status !== 'SERVED') return false;
        } else if (statusFilter === 'CANCELLED') {
          if (order.status !== 'CANCELLED') return false;
        } else if (statusFilter === 'STAFF_NP') {
          if (order.paymentMethod !== 'STAFF_MEAL' && order.paymentStatus !== 'STAFF_NP') return false;
        }
      }

      // 3. Filtre par espace (Table vs Comptoir)
      if (spaceFilter !== 'ALL') {
        const isTakeaway = order.orderType === 'TAKEAWAY' || order.orderType === 'EXPRESS' || (!order.tableNumber || order.tableNumber === 0);
        if (spaceFilter === 'TABLE' && isTakeaway) return false;
        if (spaceFilter === 'TAKEAWAY' && !isTakeaway) return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, spaceFilter]);

  // Tri
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [filteredOrders, sortOrder]);

  // Pagination calculée
  const totalPages = Math.ceil(sortedOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  // Réinitialiser la page à 1 si la recherche ou les filtres changent
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleSpaceFilterChange = (val: string) => {
    setSpaceFilter(val);
    setCurrentPage(1);
  };

  // Helper pour afficher le badge de statut
  const renderStatusBadge = (order: OrderType) => {
    if (order.status === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-200">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          Annulée
        </span>
      );
    }

    if (order.paymentMethod === 'STAFF_MEAL' || order.paymentStatus === 'STAFF_NP') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-900 border border-purple-200">
          <UserCheck className="w-3.5 h-3.5 text-purple-600" />
          Repas NP
        </span>
      );
    }

    if (order.paymentStatus === 'PAID') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Payée
        </span>
      );
    }

    if (order.status === 'READY') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-800 border border-blue-200 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Prête
        </span>
      );
    }

    if (order.status === 'PREPARING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200">
          <UtensilsCrossed className="w-3.5 h-3.5 text-indigo-600" />
          En cuisine
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-900 border border-amber-300">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        En attente
      </span>
    );
  };

  // Helper pour afficher le résumé des consommations (ex: 2x Salade, 1x Jus)
  const renderItemsSummary = (order: OrderType) => {
    if (!order.items || order.items.length === 0) {
      return <span className="text-slate-400 italic">Aucun article</span>;
    }

    const itemsSummary = order.items
      .map((i) => `${i.quantity}x ${i.name}`)
      .join(', ');

    return (
      <div className="max-w-xs truncate" title={itemsSummary}>
        <span className="font-semibold text-slate-800">{itemsSummary}</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden space-y-4">
      
      {/* 1. BARRE DE COMMANDE SUPÉRIEURE : RECHERCHE INSTANTANÉE & FILTRES */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50/50">
        
        {/* Titre & Compteur */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-amber-400 rounded-2xl shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Commandes de la Journée</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                {filteredOrders.length} {filteredOrders.length > 1 ? 'commandes' : 'commande'}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Liste détaillée des encaissements et services de table
            </p>
          </div>
        </div>

        {/* Contrôles de Recherche & Filtres */}
        <div className="flex items-center gap-2.5 flex-wrap lg:flex-nowrap">
          
          {/* Barre de Recherche instantanée */}
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Rechercher N°, Table, Client..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-hidden focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtre par Statut (Dropdown) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl px-3 py-2.5 shadow-2xs cursor-pointer focus:outline-hidden focus:border-slate-400"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="UNPAID">⚠️ À Encaisser</option>
              <option value="PAID">✅ Payées</option>
              <option value="PENDING">🟡 En attente</option>
              <option value="READY">🔵 Prêtes</option>
              <option value="SERVED">🟢 Servies</option>
              <option value="STAFF_NP">👤 Repas Personnel (NP)</option>
              <option value="CANCELLED">🔴 Annulées</option>
            </select>
          </div>

          {/* Filtre par Espace (Table vs Comptoir) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={spaceFilter}
              onChange={(e) => handleSpaceFilterChange(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl px-3 py-2.5 shadow-2xs cursor-pointer focus:outline-hidden focus:border-slate-400"
            >
              <option value="ALL">Tous les espaces</option>
              <option value="TABLE">🪑 Ventes sur Table</option>
              <option value="TAKEAWAY">🧾 Ventes Comptoir</option>
            </select>
          </div>

        </div>

      </div>

      {/* 2. TABLEAU DE DONNÉES (DATA TABLE RESPONSIVE SHADCN STYLE) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-black uppercase text-slate-500 tracking-wider">
              <th className="py-3.5 px-4 w-24">
                <button
                  type="button"
                  onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  className="flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Inverser le tri"
                >
                  <span>Heure</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </button>
              </th>
              <th className="py-3.5 px-4 w-32">N° Commande</th>
              <th className="py-3.5 px-4 w-44">Table / Espace</th>
              <th className="py-3.5 px-4 min-w-[200px]">Résumé des Consommations</th>
              <th className="py-3.5 px-4 w-36 text-right">Total Net</th>
              <th className="py-3.5 px-4 w-36 text-center">Statut</th>
              <th className="py-3.5 px-4 w-44 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
                    🔍
                  </div>
                  <div className="font-bold text-slate-700">Aucune commande trouvée</div>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    {searchQuery || statusFilter !== 'ALL' || spaceFilter !== 'ALL'
                      ? 'Aucun résultat ne correspond à vos filtres actuels. Réinitialisez la recherche.'
                      : 'Aucune commande enregistrée pour cette journée.'}
                  </p>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => {
                const total = (order as any).totalAmount ?? order.total ?? 0;
                const isPaid = order.paymentStatus === 'PAID';
                const isStaffMeal = order.paymentMethod === 'STAFF_MEAL' || order.paymentStatus === 'STAFF_NP';
                const isExpress = order.orderType === 'EXPRESS' || order.tableNumber === 0;

                const timeStr = order.createdAt 
                  ? new Date(order.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                  : '--:--';

                const tableLabel = order.locationDetail
                  ? order.locationDetail
                  : isExpress
                  ? 'Comptoir'
                  : `Table ${order.tableNumber}`;

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onViewOrder(order)}
                  >
                    {/* Colonne 1 : Heure */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{timeStr}</span>
                      </div>
                    </td>

                    {/* Colonne 2 : N° Commande */}
                    <td className="py-3.5 px-4 font-mono font-black text-slate-900 whitespace-nowrap">
                      <span className="bg-slate-100 group-hover:bg-slate-200 px-2 py-1 rounded-md text-[11px] border border-slate-200 transition-colors">
                        #CMD-{order.id.slice(-5).toUpperCase()}
                      </span>
                    </td>

                    {/* Colonne 3 : Table / Espace */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${isExpress ? 'bg-amber-500' : 'bg-indigo-500'}`} />
                        <span className="truncate">{tableLabel}</span>
                      </div>
                      {order.customerName && (
                        <div className="text-[11px] font-normal text-slate-500 truncate mt-0.5">
                          {order.customerName}
                        </div>
                      )}
                    </td>

                    {/* Colonne 4 : Résumé des articles */}
                    <td className="py-3.5 px-4">
                      {renderItemsSummary(order)}
                      <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {order.items?.length || 0} article(s)
                      </div>
                    </td>

                    {/* Colonne 5 : Total Net */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-slate-950 text-sm whitespace-nowrap">
                      {formatFCFA(total)}
                    </td>

                    {/* Colonne 6 : Statut */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {renderStatusBadge(order)}
                    </td>

                    {/* Colonne 7 : Actions */}
                    <td 
                      className="py-3.5 px-4 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()} // Évite d'ouvrir la modale au clic sur un bouton d'action
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Bouton Voir */}
                        <button
                          type="button"
                          onClick={() => onViewOrder(order)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-all"
                          title="Voir le détail de la commande"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Voir</span>
                        </button>

                        {/* Bouton Encaisser (si non réglée) */}
                        {!isPaid && !isStaffMeal && order.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            onClick={() => onPayOrder(order)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-2xs transition-all active:scale-95"
                            title="Procéder à l'encaissement"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Encaisser</span>
                          </button>
                        )}

                        {/* Bouton Ticket */}
                        <button
                          type="button"
                          onClick={() => onPrintReceipt(order)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                          title="Imprimer le ticket 80mm"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 3. PAGINATION & STATISTIQUES INFÉRIEURES */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        
        {/* Compteur de lignes */}
        <div>
          Affichage de <strong className="text-slate-900">{filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> à{' '}
          <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredOrders.length)}</strong> sur{' '}
          <strong className="text-slate-900">{filteredOrders.length}</strong> commandes du jour
        </div>

        {/* Contrôles de page */}
        <div className="flex items-center gap-3">
          
          {/* Sélecteur de taille de page */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Lignes :</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg text-xs px-2 py-1 font-bold text-slate-700"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* Boutons Précédent / Suivant */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition-all"
              title="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono font-bold text-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-white text-slate-700 transition-all"
              title="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
