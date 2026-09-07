'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Banknote, 
  Smartphone, 
  User, 
  Sparkles, 
  ChefHat, 
  Package, 
  RefreshCw, 
  ArrowLeft, 
  Volume2,
  DollarSign,
  ShoppingBag,
  Store,
  Check
} from 'lucide-react';
import { OrderType, OrderStatus } from '@/types';
import { formatFCFA, playOrderSound } from '@/lib/utils';
import { EscPosPrinterService } from '@/services/EscPosPrinterService';
import { toast } from 'sonner';

export default function CashierCounterPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPRESS' | 'TABLE'>('ALL');
  const [restaurantName, setRestaurantName] = useState<string>('Caisse Restaurant');
  const [restaurantId, setRestaurantId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('current_restaurant_name');
      const storedId = localStorage.getItem('current_restaurant_id');
      if (storedName) setRestaurantName(storedName);
      if (storedId) setRestaurantId(storedId);
    }
  }, []);

  // Fetch current live orders for active restaurant
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : null;
      const url = storedId ? `/api/orders?restaurantId=${encodeURIComponent(storedId)}` : '/api/orders';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setLastRefreshed(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);

    // Keyboard shortcuts listener for cashier POS
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        fetchOrders();
        toast.info('🔄 Liste des commandes actualisée (Touche R)');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setActiveFilter((prev) => (prev === 'ALL' ? 'EXPRESS' : prev === 'EXPRESS' ? 'TABLE' : 'ALL'));
        toast.info('🔍 Filtre modifié (Touche F)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Update order status
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        toast.success(`Commande mise à jour : ${status}`);
      } else {
        // Fallback local update
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (e) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  };

  const handlePrintReceipt = (order: OrderType) => {
    const currentName = restaurantName || 'Caisse Restaurant';
    EscPosPrinterService.printViaWindowFallback(order, currentName);
    toast.success(`🖨️ Ticket de caisse imprimé (${currentName}) !`);
  };

  const handleCallCustomer = (order: OrderType) => {
    playOrderSound();
    toast.info(`📢 Appel Client : Commande #${order.id.slice(-5).toUpperCase()} prête au comptoir !`);
  };

  // Filtered orders
  const activeOrders = useMemo(() => {
    return orders.filter((o) => {
      if (o.status === 'SERVED' || o.status === 'CANCELLED') return false;
      const isExpress = o.orderType === 'EXPRESS' || o.tableNumber === 0;
      if (activeFilter === 'EXPRESS') return isExpress;
      if (activeFilter === 'TABLE') return !isExpress;
      return true;
    });
  }, [orders, activeFilter]);

  const readyOrders = useMemo(() => {
    return orders.filter((o) => o.status === 'READY');
  }, [orders]);

  // Daily statistics
  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [orders]);

  const expressRevenue = useMemo(() => {
    return orders
      .filter((o) => o.orderType === 'EXPRESS' || o.tableNumber === 0)
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [orders]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-6 space-y-6">
      {/* 1. TOP HEADER & CASHIER BAR (LIGHT MODE PREMIUM) */}
      <header className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all active:scale-[0.97]"
            title="Retour au Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black shadow-xs">
                <Receipt className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Écran Caisse &amp; Comptoir Express
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {restaurantName} • Encaissement instantané &amp; Commandes à emporter
            </p>
          </div>
        </div>

        {/* Quick KPI stats & Keyboard shortcuts badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="hidden lg:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-2xl text-[11px] font-mono text-slate-600">
            <span className="bg-white text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded font-black shadow-2xs">[R]</span> Actualiser
            <span className="bg-white text-slate-900 border border-slate-200 px-1.5 py-0.5 rounded font-black ml-1 shadow-2xs">[F]</span> Filtrer
          </div>

          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shadow-2xs">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] text-emerald-700 font-bold block uppercase">Caisse du Jour</span>
              <span className="text-sm font-black text-emerald-950 font-mono">{formatFCFA(totalRevenue)}</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 shadow-2xs">
            <span className="text-base">⚡</span>
            <div>
              <span className="text-[10px] text-amber-700 font-bold block uppercase">Ventes Express</span>
              <span className="text-sm font-black text-amber-950 font-mono">{formatFCFA(expressRevenue)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all border border-slate-200 active:scale-[0.97]"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* 2. FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 min-h-[44px] rounded-2xl text-xs font-black transition-all active:scale-[0.97] border ${
            activeFilter === 'ALL'
              ? 'bg-amber-400 text-slate-950 border-amber-500/40 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
        >
          Toutes les Commandes ({orders.filter((o) => o.status !== 'SERVED').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('EXPRESS')}
          className={`px-4 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-[0.97] border ${
            activeFilter === 'EXPRESS'
              ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <span>⚡ Comptoir / Express</span>
          <span className="bg-amber-400/20 text-amber-600 border border-amber-300/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
            {orders.filter((o) => (o.orderType === 'EXPRESS' || o.tableNumber === 0) && o.status !== 'SERVED').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('TABLE')}
          className={`px-4 min-h-[44px] rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-[0.97] border ${
            activeFilter === 'TABLE'
              ? 'bg-amber-400 text-slate-950 border-amber-500/40 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
        >
          <span>🍽️ Tables (Salle)</span>
          <span className="bg-slate-900/10 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-mono">
            {orders.filter((o) => o.orderType !== 'EXPRESS' && o.tableNumber > 0 && o.status !== 'SERVED').length}
          </span>
        </button>
      </div>

      {/* 3. READY TO PICKUP BANNER */}
      {readyOrders.length > 0 && (
        <section className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-amber-950">
                📦 Commandes Prêtes à Retirer ({readyOrders.length})
              </h3>
            </div>
            <span className="text-xs text-amber-900 font-bold">À remettre aux clients</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {readyOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-amber-700 text-xs">
                      #{ord.id.slice(-5).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {ord.orderType === 'EXPRESS' || ord.tableNumber === 0 ? '⚡ Express' : `Table ${ord.tableNumber}`}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 block truncate">
                    {ord.customerName || `${ord.items.length} articles`} • {formatFCFA(ord.total)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCallCustomer(ord)}
                    className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl transition-all active:scale-[0.97]"
                    title="Appeler le client"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(ord.id, 'SERVED')}
                    className="px-3 py-2 min-h-[40px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-[0.97]"
                    title="Marquer comme retirée"
                  >
                    Retiré ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. ORDERS GRID */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {activeOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 space-y-2 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-4xl block">✨</span>
            <h3 className="text-base font-bold text-slate-800">Aucune commande en attente</h3>
            <p className="text-xs text-slate-500">Toutes les commandes sont préparées ou encaissées !</p>
          </div>
        ) : (
          activeOrders.map((order) => {
            const isExpress = order.orderType === 'EXPRESS' || order.tableNumber === 0;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border-2 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between transition-all ${
                  isExpress ? 'border-amber-300' : 'border-slate-200'
                }`}
              >
                {/* Card Header */}
                <div
                  className={`p-4 flex items-center justify-between ${
                    isExpress
                      ? 'bg-slate-900 text-amber-400'
                      : order.status === 'PENDING'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base sm:text-lg font-black tracking-tight">
                      {isExpress ? '⚡ COMPTOIR' : `TABLE ${order.tableNumber}`}
                    </span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      order.status === 'PENDING' && !isExpress ? 'bg-black/10 text-slate-950' : 'bg-white/15 text-white'
                    }`}>
                      #{order.id.slice(-5).toUpperCase()}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold opacity-90">
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'En direct'}
                  </span>
                </div>

                {/* Customer line & payment badge */}
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    {order.customerName ? (
                      <span className="text-slate-900 font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-amber-600" />
                        <span>{order.customerName}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Client Express</span>
                    )}
                  </div>

                  <span className="font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-2xs">
                    {order.paymentMethod === 'WAVE' ? '🔵 Wave' : order.paymentMethod === 'ORANGE_MONEY' ? '🟠 OM' : '💵 Espèces'}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-56 text-xs text-slate-800 bg-white">
                  {order.items.map((item, idx) => (
                    <div key={item.id || idx} className="flex justify-between items-start border-b border-slate-100 pb-1.5 last:border-0">
                      <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-amber-600">{item.quantity}x</span>
                          <span className="font-bold text-slate-900 truncate">{item.name || item.menuItem?.name || 'Plat'}</span>
                        </div>
                        {item.notes && (
                          <span className="block text-[10px] text-amber-700 italic pl-4">
                            Note : {item.notes}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-700 shrink-0">
                        {formatFCFA(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}

                  {order.customerNote && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                      <strong>Remarque :</strong> « {order.customerNote} »
                    </div>
                  )}
                </div>

                {/* Total & Action Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-bold uppercase">Total à Encaisser :</span>
                    <span className="text-base font-black text-slate-950 font-mono">{formatFCFA(order.total)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Action 1: Préparer */}
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className={`py-2 px-1.5 min-h-[40px] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-[0.97] border ${
                        order.status === 'PREPARING'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Préparer</span>
                    </button>

                    {/* Action 2: Prête */}
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className={`py-2 px-1.5 min-h-[40px] rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all active:scale-[0.97] border ${
                        order.status === 'READY'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Prête</span>
                    </button>

                    {/* Action 3: Imprimer Ticket */}
                    <button
                      type="button"
                      onClick={() => handlePrintReceipt(order)}
                      className="py-2 px-1.5 min-h-[40px] bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 active:scale-[0.97] transition-all"
                      title="Imprimer ticket de caisse"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ticket</span>
                    </button>
                  </div>

                  {/* Bouton Final Encaisser & Clôturer */}
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                    className="w-full min-h-[48px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Encaisser &amp; Clôturer</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}