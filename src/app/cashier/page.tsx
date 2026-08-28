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

  // Fetch current live orders
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/orders');
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
    return () => clearInterval(interval);
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
    EscPosPrinterService.printViaWindowFallback(order, 'Chez Fatou & Frères (Comptoir)');
    toast.success(`🖨️ Ticket de caisse imprimé !`);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 space-y-6">
      {/* 1. TOP HEADER & CASHIER BAR */}
      <header className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all"
            title="Retour au Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 rounded-xl font-black shadow-xs">
                <Receipt className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Écran Caisse &amp; Comptoir Express
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Chez Fatou &amp; Frères • Encaissement instantané &amp; Commandes à emporter
            </p>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-800/80 border border-slate-700/80 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Caisse du Jour</span>
              <span className="text-sm font-black text-white font-mono">{formatFCFA(totalRevenue)}</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-purple-500/30 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
            <span className="text-base">⚡</span>
            <div>
              <span className="text-[10px] text-purple-300 font-bold block uppercase">Ventes Express</span>
              <span className="text-sm font-black text-purple-300 font-mono">{formatFCFA(expressRevenue)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-all border border-slate-700"
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
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all ${
            activeFilter === 'ALL'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          Toutes les Commandes ({orders.filter((o) => o.status !== 'SERVED').length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('EXPRESS')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeFilter === 'EXPRESS'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>⚡ Comptoir / Express</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
            {orders.filter((o) => (o.orderType === 'EXPRESS' || o.tableNumber === 0) && o.status !== 'SERVED').length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('TABLE')}
          className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 ${
            activeFilter === 'TABLE'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          <span>🍽️ Tables (Salle)</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
            {orders.filter((o) => o.orderType !== 'EXPRESS' && o.tableNumber > 0 && o.status !== 'SERVED').length}
          </span>
        </button>
      </div>

      {/* 3. READY TO PICKUP BANNER */}
      {readyOrders.length > 0 && (
        <section className="bg-gradient-to-r from-emerald-950 to-teal-950 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-sm sm:text-base font-black text-emerald-300">
                📦 Commandes Prêtes à Retirer ({readyOrders.length})
              </h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold">À remettre aux clients</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {readyOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-slate-900 border border-emerald-500/40 p-3 rounded-2xl flex items-center justify-between gap-2"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-emerald-400 text-xs">
                      #{ord.id.slice(-5).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {ord.orderType === 'EXPRESS' || ord.tableNumber === 0 ? '⚡ Express' : `Table ${ord.tableNumber}`}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white block truncate">
                    {ord.customerName || `${ord.items.length} articles`} • {formatFCFA(ord.total)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCallCustomer(ord)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl"
                    title="Appeler le client"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(ord.id, 'SERVED')}
                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs"
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
          <div className="col-span-full py-16 text-center text-slate-500 space-y-2 bg-slate-900/50 rounded-3xl border border-slate-800">
            <span className="text-4xl block">✨</span>
            <h3 className="text-base font-bold text-slate-300">Aucune commande en attente</h3>
            <p className="text-xs text-slate-500">Toutes les commandes sont préparées ou encaissées !</p>
          </div>
        ) : (
          activeOrders.map((order) => {
            const isExpress = order.orderType === 'EXPRESS' || order.tableNumber === 0;

            return (
              <div
                key={order.id}
                className={`bg-slate-900 rounded-3xl border-2 overflow-hidden shadow-xl flex flex-col justify-between transition-all ${
                  isExpress
                    ? 'border-purple-500/60 bg-gradient-to-b from-purple-950/20 to-slate-900'
                    : 'border-slate-800'
                }`}
              >
                {/* Card Header */}
                <div
                  className={`p-4 flex items-center justify-between text-white ${
                    isExpress
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                      : order.status === 'PENDING'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-tight">
                      {isExpress ? '⚡ COMPTOIR' : `TABLE ${order.tableNumber}`}
                    </span>
                    <span className="text-xs font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md">
                      #{order.id.slice(-5).toUpperCase()}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold opacity-90">
                    {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'En direct'}
                  </span>
                </div>

                {/* Customer line & payment badge */}
                <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    {order.customerName ? (
                      <span className="text-amber-300 font-bold flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-orange-400" />
                        <span>{order.customerName}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Client Express</span>
                    )}
                  </div>

                  <span className="font-bold text-slate-300">
                    {order.paymentMethod === 'WAVE' ? '🔵 Wave' : order.paymentMethod === 'ORANGE_MONEY' ? '🟠 OM' : '💵 Espèces'}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-56 text-xs text-slate-200">
                  {order.items.map((item, idx) => (
                    <div key={item.id || idx} className="flex justify-between items-start border-b border-slate-800/80 pb-1.5 last:border-0">
                      <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-amber-400">{item.quantity}x</span>
                          <span className="font-bold text-white truncate">{item.name || item.menuItem?.name || 'Plat'}</span>
                        </div>
                        {item.notes && (
                          <span className="block text-[10px] text-amber-300/80 italic pl-4">
                            Note : {item.notes}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-300 shrink-0">
                        {formatFCFA(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}

                  {order.customerNote && (
                    <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-200">
                      <strong>Remarque :</strong> « {order.customerNote} »
                    </div>
                  )}
                </div>

                {/* Total & Action Buttons */}
                <div className="p-4 bg-slate-950/80 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase">Total à Encaisser :</span>
                    <span className="text-base font-black text-amber-400 font-mono">{formatFCFA(order.total)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Action 1: Préparer */}
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className={`py-2 px-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
                        order.status === 'PREPARING'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Préparer</span>
                    </button>

                    {/* Action 2: Prête */}
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                      className={`py-2 px-1.5 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 transition-all ${
                        order.status === 'READY'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-emerald-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Prête</span>
                    </button>

                    {/* Action 3: Imprimer Ticket */}
                    <button
                      type="button"
                      onClick={() => handlePrintReceipt(order)}
                      className="py-2 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1"
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
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
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