'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Store, 
  Utensils, 
  QrCode, 
  BarChart3, 
  Bell, 
  LogOut, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  X, 
  ExternalLink,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Headphones,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface CurrentOrder {
  id: string;
  tableNumber: number;
  time: string;
  items: string[];
  rawItems?: any[];
  total: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'LATE';
  customerNote?: string;
  createdAt?: string;
}

interface StockAlert {
  id: string;
  itemName: string;
  stock: number;
  unit: string;
  isOutOfStock: boolean;
  category?: string;
}

export default function OperationalDashboardPage() {
  const router = useRouter();

  // State
  const [restaurantName, setRestaurantName] = useState('Chez Fatou & Frères');
  const [restaurantSubdomain, setRestaurantSubdomain] = useState('chezfatou');
  const [currentDateString, setCurrentDateString] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // KPIs
  const [kpis, setKpis] = useState({
    todayRevenue: 125000,
    todayOrders: 18,
    todayCovers: 42,
    outOfStock: 2,
    revenueChange: 12.5,
    ordersChange: 5.2,
    coversChange: 8.0,
  });

  // Current Live Orders
  const [orders, setOrders] = useState<CurrentOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CurrentOrder | null>(null);

  // Weekly Trends Chart Data
  const [trends, setTrends] = useState<any[]>([
    { day: 'Lun', scans: 45, orders: 12 },
    { day: 'Mar', scans: 52, orders: 15 },
    { day: 'Mer', scans: 48, orders: 13 },
    { day: 'Jeu', scans: 61, orders: 18 },
    { day: 'Ven', scans: 75, orders: 24 },
    { day: 'Sam', scans: 88, orders: 32 },
    { day: 'Dim', scans: 68, orders: 22 },
  ]);

  // Stock Alerts
  const [alerts, setAlerts] = useState<StockAlert[]>([
    { id: 'dish_thiof_braise', itemName: 'Thiof Braisé Royal', stock: 2, unit: 'portions', isOutOfStock: false, category: 'Poissons' },
    { id: 'dish_dibi_agneau', itemName: "Dibi d'Agneau façon Thiès", stock: 0, unit: 'Épuisé', isOutOfStock: true, category: 'Grillades' },
  ]);

  // Notifications modal / drawer
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Format today date in French
  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    setCurrentDateString(formatted.charAt(0).toUpperCase() + formatted.slice(1));

    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('current_restaurant_name');
      const savedSub = localStorage.getItem('current_restaurant_subdomain');
      if (savedName) setRestaurantName(savedName);
      if (savedSub) setRestaurantSubdomain(savedSub);
    }
  }, []);

  // Fetch all operational data
  const fetchDashboardData = async () => {
    try {
      // 1. KPIs
      const resStats = await fetch('/api/dashboard/stats');
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setKpis(dataStats);
      }

      // 2. Current Orders
      const resOrders = await fetch('/api/dashboard/orders/current');
      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        if (dataOrders.orders) {
          setOrders(dataOrders.orders);
        }
      }

      // 3. Weekly Trends
      const resTrends = await fetch('/api/dashboard/weekly-trends');
      if (resTrends.ok) {
        const dataTrends = await resTrends.json();
        if (dataTrends.trends) {
          setTrends(dataTrends.trends);
        }
      }

      // 4. Stock Alerts
      const resAlerts = await fetch('/api/dashboard/alerts');
      if (resAlerts.ok) {
        const dataAlerts = await resAlerts.json();
        if (dataAlerts.alerts) {
          setAlerts(dataAlerts.alerts);
        }
      }

      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Erreur actualisation dashboard', e);
    }
  };

  // Auto-refresh every 10 seconds (Temps réel opérationnel)
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Restock item action
  const handleRestock = async (alertItem: StockAlert) => {
    try {
      const res = await fetch('/api/dashboard/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: alertItem.id, isAvailable: true }),
      });

      if (res.ok) {
        toast.success(`"${alertItem.itemName}" a été réapprovisionné et remis en stock !`);
        setAlerts((prev) => prev.filter((a) => a.id !== alertItem.id));
        setKpis((prev) => ({ ...prev, outOfStock: Math.max(0, prev.outOfStock - 1) }));
      }
    } catch (err) {
      toast.error('Erreur lors du réapprovisionnement');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_restaurant_id');
    localStorage.removeItem('current_restaurant_name');
    localStorage.removeItem('current_restaurant_subdomain');
    toast.info('Session déconnectée');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-orange-500 selection:text-white pb-20">
      {/* ========================================================================= */}
      {/* 1. EN-TÊTE OPÉRATIONNEL (Logo, Restaurant, Date, Cloche, Déconnexion)     */}
      {/* ========================================================================= */}
      <header className="bg-slate-900/90 border-b border-slate-800/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Logo + Nom du Restaurant */}
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0 group">
              <img 
                src="/logo.png" 
                alt="Lou Ame Tay ?" 
                className="w-11 h-11 rounded-2xl object-cover border border-orange-500/40 shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform" 
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
                  {restaurantName}
                </h1>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Caisse Ouverte
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span>📅 {currentDateString}</span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-500">
                  Actualisé à {lastRefreshed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </p>
            </div>
          </div>

          {/* Right Header Actions : Kitchen link, Notifications, Profile, Logout */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-300 transition-all active:scale-95"
              title="Rafraîchir les données"
            >
              <RefreshCw className="w-4 h-4 text-orange-400" />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-300 transition-all relative"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-white">Notifications Caisse</span>
                    <span className="text-[10px] text-orange-400 font-bold">{alerts.length} alertes</span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {alerts.map((a) => (
                      <div key={a.id} className="p-2.5 bg-slate-950 rounded-xl border border-red-900/30 text-xs">
                        <span className="font-bold text-red-400 block">⚠️ Rupture de stock</span>
                        <span className="text-slate-300">{a.itemName} ({a.unit})</span>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-2">Aucune alerte pour le moment</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Kitchen KDS Quick View */}
            <Link
              href="/dashboard/kitchen"
              className="flex items-center gap-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all shadow-xs"
            >
              <span>👨‍🍳 Écran Cuisine KDS</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-2.5 rounded-2xl transition-all"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CORPS PRINCIPAL DU DASHBOARD CAISSE                                    */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        {/* ===================================================================== */}
        {/* SECTION 2 : LES 4 KPIS EN HAUT (Calculés en direct)                   */}
        {/* ===================================================================== */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 : CA du Jour */}
            <div className="bg-slate-900/85 border border-slate-800/90 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-orange-500/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">CA du Jour</span>
                <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {formatFCFA(kpis.todayRevenue)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
                <span>↗ +{kpis.revenueChange}%</span>
                <span className="text-slate-500 font-normal">vs hier</span>
              </div>
            </div>

            {/* KPI 2 : Commandes */}
            <div className="bg-slate-900/85 border border-slate-800/90 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Commandes</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {kpis.todayOrders}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
                <span>↗ +{kpis.ordersChange}%</span>
                <span className="text-slate-500 font-normal">vs hier</span>
              </div>
            </div>

            {/* KPI 3 : Couverts Servis */}
            <div className="bg-slate-900/85 border border-slate-800/90 rounded-3xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Couverts (Estimés)</span>
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {kpis.todayCovers}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-400">
                <span>↗ +{kpis.coversChange}%</span>
                <span className="text-slate-500 font-normal">vs hier</span>
              </div>
            </div>

            {/* KPI 4 : Plats en Rupture */}
            <div className={`border rounded-3xl p-5 shadow-lg relative overflow-hidden transition-colors ${
              kpis.outOfStock > 0 
                ? 'bg-red-950/20 border-red-800/50' 
                : 'bg-slate-900/85 border-slate-800/90'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">Plats en Rupture</span>
                <div className={`p-2 rounded-xl ${kpis.outOfStock > 0 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-black tracking-tight ${kpis.outOfStock > 0 ? 'text-red-400' : 'text-white'}`}>
                {kpis.outOfStock}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold">
                {kpis.outOfStock > 0 ? (
                  <span className="text-red-400 animate-pulse">⚠️ Réapprovisionnement requis</span>
                ) : (
                  <span className="text-emerald-400">✅ Tous les plats en stock</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 3 : DERNIÈRES COMMANDES EN COURS (Tableau Temps Réel 10s)     */}
        {/* ===================================================================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg font-black text-white tracking-tight">
                Commandes en Cours (Temps Réel)
              </h2>
            </div>
            <span className="text-xs text-slate-400">
              Rafraîchissement auto (10s)
            </span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Table</th>
                    <th className="py-3.5 px-4">Heure</th>
                    <th className="py-3.5 px-4">Plats Commandés</th>
                    <th className="py-3.5 px-4">Total (FCFA)</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {orders.map((o) => {
                    const isLate = o.status === 'LATE';
                    const isReady = o.status === 'READY' || o.status === 'SERVED';

                    return (
                      <tr 
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        {/* Table */}
                        <td className="py-3.5 px-4 sm:px-6 font-black text-white">
                          <span className="bg-slate-800 text-orange-400 px-2.5 py-1 rounded-xl font-bold">
                            Table {o.tableNumber}
                          </span>
                        </td>

                        {/* Heure */}
                        <td className="py-3.5 px-4 text-slate-400 font-medium">
                          {o.time}
                        </td>

                        {/* Plats Commandés */}
                        <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                          {o.items.join(', ')}
                          {o.customerNote && (
                            <span className="block text-[11px] text-amber-400/90 font-normal italic truncate">
                              « {o.customerNote} »
                            </span>
                          )}
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4 font-black text-white">
                          {formatFCFA(o.total)}
                        </td>

                        {/* Statut */}
                        <td className="py-3.5 px-4">
                          {isLate && (
                            <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-xl text-xs font-black animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                              🔴 En retard
                            </span>
                          )}
                          {!isLate && isReady && (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-xl text-xs font-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              🟢 Prêt / Servi
                            </span>
                          )}
                          {!isLate && !isReady && (
                            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs font-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              🟡 En cours
                            </span>
                          )}
                        </td>

                        {/* Action Details */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(o);
                            }}
                            className="text-xs text-orange-400 hover:text-orange-300 font-bold inline-flex items-center gap-1"
                          >
                            <span>Voir</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        Aucune commande en attente pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 4 : ACTIONS RAPIDES (3 Boutons Principaux)                    */}
        {/* ===================================================================== */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Actions Rapides Caisse
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Gérer le Menu */}
            <Link
              href="/dashboard/menu"
              className="bg-gradient-to-tr from-slate-900 to-slate-800 hover:from-slate-850 hover:to-slate-750 border border-slate-700/80 rounded-3xl p-5 shadow-lg flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <Utensils className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">📝 Gérer le Menu</h3>
                  <p className="text-xs text-slate-400">Modifier les plats, prix & ruptures</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors" />
            </Link>

            {/* 2. QR Codes */}
            <Link
              href="/dashboard/qrcodes"
              className="bg-gradient-to-tr from-slate-900 to-slate-800 hover:from-slate-850 hover:to-slate-750 border border-slate-700/80 rounded-3xl p-5 shadow-lg flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">🖨️ QR Codes Tables</h3>
                  <p className="text-xs text-slate-400">Commander chevalets A5 / PVC</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            {/* 3. Statistiques */}
            <Link
              href="/dashboard/stats"
              className="bg-gradient-to-tr from-slate-900 to-slate-800 hover:from-slate-850 hover:to-slate-750 border border-slate-700/80 rounded-3xl p-5 shadow-lg flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">📊 Statistiques</h3>
                  <p className="text-xs text-slate-400">Analyse du CA et des scans</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </Link>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SECTION 5 & 6 : GRAPHIQUE DES TENDANCES (Recharts) & ALERTES RUPTURES */}
        {/* ===================================================================== */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 5. Graphique des Tendances Hebdo (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white">Tendances de la Semaine (7 Jours)</h3>
                <p className="text-xs text-slate-400">Comparatif des scans QR et des commandes réelles</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-[#3b82f6] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> Scans
                </span>
                <span className="flex items-center gap-1 text-[#10b981] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Commandes
                </span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Line type="monotone" dataKey="scans" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} name="Scans" />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="Commandes" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 6. Alertes Ruptures de Stock (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <span>Alertes de Stock</span>
              </h3>
              <span className="text-xs text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-full">
                {alerts.length} à surveiller
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((a) => (
                <div 
                  key={a.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                    a.isOutOfStock 
                      ? 'bg-red-950/20 border-red-900/40' 
                      : 'bg-amber-950/20 border-amber-900/40'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{a.itemName}</h4>
                    <p className="text-[11px] text-slate-400">
                      {a.isOutOfStock ? (
                        <span className="text-red-400 font-bold">🔴 Épuisé (En rupture)</span>
                      ) : (
                        <span className="text-amber-400 font-bold">⚠️ Plus que {a.stock} {a.unit}</span>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRestock(a)}
                    className="shrink-0 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-black px-2.5 py-1.5 rounded-xl transition-all shadow-md"
                  >
                    + En stock
                  </button>
                </div>
              ))}

              {alerts.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs">
                  ✅ Aucun plat en rupture. Tous les ingrédients sont disponibles.
                </div>
              )}
            </div>

            <Link
              href="/dashboard/menu"
              className="w-full block text-center bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold py-2.5 rounded-2xl border border-slate-800 transition-colors"
            >
              Accéder à la gestion du menu complet ➔
            </Link>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* MODALE DÉTAIL COMMANDE INTERACTIVE                                        */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-orange-400">Détail Commande</span>
                <h3 className="text-lg font-black text-white">Table {selectedOrder.tableNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Heure de commande :</span>
                <span className="font-bold text-white">{selectedOrder.time}</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 block mb-1">Articles commandés :</span>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="text-xs font-semibold text-white flex items-center justify-between">
                    <span>{it}</span>
                  </div>
                ))}
              </div>

              {selectedOrder.customerNote && (
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300">
                  <span className="font-bold block">Remarque client :</span>
                  « {selectedOrder.customerNote} »
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-black">
                <span>Total à encaisser :</span>
                <span className="text-orange-400 text-base">{formatFCFA(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl text-xs transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
