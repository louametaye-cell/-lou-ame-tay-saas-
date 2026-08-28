'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ChefHat, 
  Clock, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Flame,
  ArrowLeft,
  Check,
  Play,
  XCircle,
  RotateCcw,
  MessageSquare
} from 'lucide-react';
import { OrderType, OrderStatus } from '@/types';
import { formatFCFA, playOrderBipSound } from '@/lib/utils';
import { KitchenHistory } from '@/components/KitchenHistory';
import { toast } from 'sonner';

export default function KitchenPage() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const restaurantId = 'resto_thies_01';

  const previousPendingIds = useRef<Set<string>>(new Set());

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const incomingOrders: OrderType[] = data.orders || [];

        // Detect new PENDING orders to trigger audio BIP
        const currentPending = incomingOrders.filter((o) => o.status === 'PENDING');
        const hasNewOrder = currentPending.some((o) => !previousPendingIds.current.has(o.id));

        if (hasNewOrder && isAudioEnabled && previousPendingIds.current.size > 0) {
          playOrderBipSound();
          toast.success('🔔 NOUVELLE COMMANDE REÇUE EN CUISINE !', {
            duration: 4000,
          });
        }

        previousPendingIds.current = new Set(currentPending.map((o) => o.id));
        setOrders(incomingOrders);
      }
    } catch (error) {
      console.error('Erreur de chargement des commandes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [isAudioEnabled]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, servedAt: newStatus === 'SERVED' ? new Date().toISOString() : null } : o))
    );

    try {
      const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setRefreshTrigger((prev) => prev + 1);
        if (newStatus === 'SERVED') {
          toast.success('Commande marquée comme Servie ✅');
        } else if (newStatus === 'PREPARING') {
          toast.info('Commande passée en préparation 🔄');
        } else if (newStatus === 'CANCELLED') {
          toast.error('Commande annulée ❌');
        } else if (newStatus === 'PENDING') {
          toast.warning('Commande rétablie en cuisine ↺');
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Erreur lors de la mise à jour du statut');
      fetchOrders();
    }
  };

  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 font-sans pb-20">
      {/* Top Bar Header */}
      <header className="bg-[#0f1422] border-b border-slate-800 px-4 sm:px-6 py-4 sticky top-0 z-30 shadow-xl backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-all"
              title="Retour accueil"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="p-3 bg-[#FF6B00] text-white rounded-2xl shadow-lg shadow-orange-500/20">
              <ChefHat className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Vue Comptoir & Cuisine</span>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Gestion des commandes en direct & historique du service
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                const next = !isAudioEnabled;
                setIsAudioEnabled(next);
                if (next) playOrderBipSound();
                toast(next ? '🔊 Alertes sonores activées' : '🔇 Mode silencieux');
              }}
              className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition-all ${
                isAudioEnabled
                  ? 'bg-emerald-600/20 text-[#00A86B] border-emerald-500/40 shadow-md'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAudioEnabled ? 'BIP Sonore ON' : 'Silencieux'}</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchOrders}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all"
              title="Actualiser"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {/* SECTION 1: 🔴 NOUVELLES COMMANDES (PENDING) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-red-500 text-xl">🔴</span>
              <span>NOUVELLES COMMANDES ({pendingOrders.length})</span>
            </h2>
            {pendingOrders.length > 0 && (
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                Action requise
              </span>
            )}
          </div>

          {pendingOrders.length === 0 ? (
            <div className="bg-[#0f1422]/60 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
              Aucune nouvelle commande en attente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingOrders.map((order) => {
                const timeStr = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const note = order.customerNote || order.note;

                return (
                  <div
                    key={order.id}
                    className="bg-[#18120a] border-2 border-amber-500 rounded-3xl p-5 shadow-2xl space-y-4 relative overflow-hidden"
                  >
                    {/* Header: 🟡 NOUVELLE COMMANDE - TABLE X ⏱ HH:MM */}
                    <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 text-lg">🟡</span>
                        <h3 className="font-black text-base sm:text-lg text-white">
                          NOUVELLE COMMANDE - TABLE {order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-black/40 px-3 py-1 rounded-full border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        <span>⏱ {timeStr}</span>
                      </div>
                    </div>

                    {/* Plats commandés */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm bg-black/30 p-2.5 rounded-xl border border-white/5"
                        >
                          <span className="font-extrabold text-white">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span className="font-mono font-bold text-amber-300 text-xs">
                            {formatFCFA(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Remarque client 📝 */}
                    {note && (
                      <div className="bg-amber-500/15 border border-amber-500/40 p-3 rounded-2xl text-xs flex items-start gap-2 text-amber-200">
                        <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-300 block">📝 Remarque :</span>
                          <p className="font-medium text-white">{note}</p>
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">TOTAL</span>
                      <span className="text-lg font-black text-white">{formatFCFA(order.total)}</span>
                    </div>

                    {/* Action Buttons: [✅ Servie]  [🔄 En préparation]  [❌ Annuler] */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                        className="flex-1 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>✅ Servie</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="flex-1 min-h-[44px] bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all shadow-md"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>🔄 En préparation</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                        className="px-3 min-h-[44px] bg-red-950/60 hover:bg-red-900/80 text-red-400 border border-red-500/30 font-bold text-xs rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all"
                        title="Annuler la commande"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>❌ Annuler</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: 🟢 EN PRÉPARATION (PREPARING) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span className="text-emerald-400 text-xl">🟢</span>
              <span>EN PRÉPARATION ({preparingOrders.length})</span>
            </h2>
          </div>

          {preparingOrders.length === 0 ? (
            <div className="bg-[#0f1422]/60 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs">
              Aucune commande actuellement sur le feu.
            </div>
          ) : (
            <div className="bg-[#0f1422] border-2 border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
              {preparingOrders.map((order) => {
                const timeStr = new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

                return (
                  <div
                    key={order.id}
                    className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-mono font-black text-sm">
                        {order.tableNumber < 10 ? `0${order.tableNumber}` : order.tableNumber}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-sm text-white">
                          Table {order.tableNumber} - {itemCount} item{itemCount > 1 ? 's' : ''}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          ⏱ {timeStr} • {order.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-sm font-black text-amber-400">
                        {formatFCFA(order.total)}
                      </span>

                      <button
                        onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                        className="min-h-[40px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 active:scale-95 transition-all shadow-md"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>✅ Servie</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 3: 📜 HISTORIQUE - COMMANDES SERVIES (AJOURD'HUI) */}
        <section className="mt-8">
          <KitchenHistory
            restaurantId={restaurantId}
            onRestoreOrder={(orderId) => handleUpdateStatus(orderId, 'PENDING')}
            refreshTrigger={refreshTrigger}
          />
        </section>
      </main>
    </div>
  );
}
