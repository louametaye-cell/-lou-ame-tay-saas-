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
  Plus,
  Wine
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
import { isDrinkOrBarItem } from '@/lib/order-routing';
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
    { id: '1', itemName: 'Bissap Maison 50cl', stock: 0, unit: 'bouteilles', isOutOfStock: true, category: 'Boissons' },
    { id: '2', itemName: 'Pastels Poisson (Portion 6)', stock: 2, unit: 'portions', isOutOfStock: false, category: 'Entrées' },
  ]);

  // Notifications toggle
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Track served drinks at bar locally
  const [servedDrinkKeys, setServedDrinkKeys] = useState<string[]>([]);

  // Pending Bar Drinks extracted from live orders for bartenders/servers
  const pendingBarDrinks = useMemo(() => {
    const drinksList: {
      key: string;
      orderId: string;
      tableNumber: number;
      time: string;
      item: any;
    }[] = [];

    orders.forEach((o) => {
      if (o.status !== 'SERVED') {
        const raw = o.rawItems || [];
        raw.forEach((it: any, itIdx: number) => {
          if (isDrinkOrBarItem(it)) {
            const key = `${o.id}_${it.id || itIdx}_${it.name}`;
            if (!servedDrinkKeys.includes(key)) {
              drinksList.push({
                key,
                orderId: o.id,
                tableNumber: o.tableNumber,
                time: o.time || 'En cours',
                item: it,
              });
            }
          }
        });
      }
    });

    return drinksList;
  }, [orders, servedDrinkKeys]);

  const handleMarkDrinkServed = (key: string, drinkName: string, tableNumber: number) => {
    setServedDrinkKeys((prev) => [...prev, key]);
    toast.success(`🥤 « ${drinkName} » marqué comme SERVI à la Table ${tableNumber} !`);
  };

  // Initialize restaurant name & date
  useEffect(() => {
    const storedName = localStorage.getItem('current_restaurant_name');
    const storedSub = localStorage.getItem('current_restaurant_subdomain');
    if (storedName) setRestaurantName(storedName);
    if (storedSub) setRestaurantSubdomain(storedSub);

    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    setCurrentDateString(now.toLocaleDateString('fr-FR', options));
  }, []);

  // Fetch Dashboard Live Data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // 1. Stats
      const resStats = await fetch('/api/dashboard/stats');
      if (resStats.ok) {
        const dataStats = await resStats.json();
        setKpis((prev) => ({
          ...prev,
          todayRevenue: dataStats.todayRevenue ?? prev.todayRevenue,
          todayOrders: dataStats.todayOrders ?? prev.todayOrders,
          todayCovers: dataStats.todayCovers ?? prev.todayCovers,
          outOfStock: dataStats.outOfStock ?? prev.outOfStock,
        }));
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
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 10 seconds
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
        toast.success(`"${alertItem.itemName}" a été remis en stock !`);
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-500 selection:text-white pb-20">
      {/* 1. EN-TÊTE OPÉRATIONNEL */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          {/* Logo + Nom du Restaurant */}
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0 group">
              <img 
                src="/logo.png" 
                alt="Lou Ame Tay ?" 
                className="w-11 h-11 rounded-2xl object-cover border border-amber-300 shadow-xs group-hover:scale-105 transition-transform" 
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {restaurantName}
                </h1>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Caisse Ouverte
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>📅 {currentDateString}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-400">
                  Actualisé à {lastRefreshed.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchDashboardData}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-slate-700 transition-all active:scale-95 shadow-2xs"
              title="Rafraîchir les données"
            >
              <RefreshCw className={`w-4 h-4 text-orange-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-slate-700 transition-all relative shadow-2xs"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-xs">
                    {alerts.length}
                  </span>
                )}
              </button>

              {/* Notifications Popover */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-3xl p-4 shadow-xl z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">Notifications Caisse</span>
                    <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {alerts.length} alertes
                    </span>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {alerts.map((a) => (
                      <div key={a.id} className="p-2.5 bg-rose-50 rounded-xl border border-rose-200 text-xs">
                        <span className="font-bold text-rose-800 block">⚠️ Rupture de stock</span>
                        <span className="text-slate-700">{a.itemName} ({a.unit})</span>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-2">Aucune alerte pour le moment</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Kitchen KDS Quick View */}
            <Link
              href="/dashboard/kitchen"
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3.5 py-2.5 rounded-2xl transition-all shadow-xs"
            >
              <span>👨‍🍳 Écran Cuisine KDS</span>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-2.5 rounded-2xl transition-all"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. CORPS PRINCIPAL DU DASHBOARD */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        {/* KPIS */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 : CA du Jour */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">CA du Jour</span>
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                {formatFCFA(kpis.todayRevenue)}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700">
                <span>↗ +{kpis.revenueChange}%</span>
                <span className="text-slate-400 font-normal">vs hier</span>
              </div>
            </div>

            {/* KPI 2 : Commandes */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Commandes</span>
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                {kpis.todayOrders}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700">
                <span>↗ +{kpis.ordersChange}%</span>
                <span className="text-slate-400 font-normal">vs hier</span>
              </div>
            </div>

            {/* KPI 3 : Couverts Servis */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-blue-400 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Couverts (Estimés)</span>
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
                {kpis.todayCovers}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700">
                <span>↗ +{kpis.coversChange}%</span>
                <span className="text-slate-400 font-normal">vs hier</span>
              </div>
            </div>

            {/* KPI 4 : Plats en Rupture */}
            <div className={`border rounded-3xl p-5 shadow-xs relative overflow-hidden transition-colors ${
              kpis.outOfStock > 0 
                ? 'bg-rose-50/70 border-rose-300' 
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">Plats en Rupture</span>
                <div className={`p-2 rounded-xl ${kpis.outOfStock > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${kpis.outOfStock > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                {kpis.outOfStock}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-bold">
                {kpis.outOfStock > 0 ? (
                  <span className="text-rose-700 animate-pulse">⚠️ Réapprovisionnement requis</span>
                ) : (
                  <span className="text-emerald-700">✅ Tous les plats en stock</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2.5 : COMPTOIR BAR & BOISSONS EN ATTENTE (AIGUILLAGE SERVEURS) */}
        {pendingBarDrinks.length > 0 && (
          <section className="bg-blue-50/70 border-2 border-blue-300 rounded-3xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <Wine className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-blue-950 flex items-center gap-2">
                    <span>Comptoir Bar & Boissons Fraîches en Attente</span>
                    <span className="bg-blue-600 text-white text-[11px] px-2 py-0.5 rounded-full font-bold">
                      {pendingBarDrinks.length} à servir
                    </span>
                  </h3>
                  <p className="text-xs text-blue-800">
                    Ces boissons ne passent pas par la cuisine : préparez-les au bar et attribuez-les aux serveurs
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pendingBarDrinks.map((b) => (
                <div
                  key={b.key}
                  className="p-3 bg-white border border-blue-200 rounded-2xl flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-black text-xs border border-amber-200">
                        Table {b.tableNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{b.time}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {b.item.quantity}x {b.item.name || b.item.menuItem?.name || 'Boisson'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleMarkDrinkServed(
                        b.key,
                        b.item.name || b.item.menuItem?.name || 'Boisson',
                        b.tableNumber
                      )
                    }
                    className="min-h-[36px] px-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-2xs shrink-0 transition-all"
                    title="Marquer comme servie"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Servie</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 3 : DERNIÈRES COMMANDES */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Commandes en Cours (Temps Réel)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Rafraîchissement auto (10s)
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Table</th>
                    <th className="py-3.5 px-4">Heure</th>
                    <th className="py-3.5 px-4">Plats Commandés</th>
                    <th className="py-3.5 px-4">Total (FCFA)</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4 text-right">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {orders.map((o) => {
                    const isLate = o.status === 'LATE';
                    const isReady = o.status === 'READY' || o.status === 'SERVED';

                    return (
                      <tr 
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        {/* Table */}
                        <td className="py-3.5 px-4 sm:px-6 font-black text-slate-900">
                          <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-xl font-bold border border-amber-200">
                            Table {o.tableNumber}
                          </span>
                        </td>

                        {/* Heure */}
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {o.time}
                        </td>

                        {/* Plats Commandés */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                          {o.items.join(', ')}
                          {o.customerNote && (
                            <span className="block text-[11px] text-amber-700 font-normal italic truncate">
                              « {o.customerNote} »
                            </span>
                          )}
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                          {formatFCFA(o.total)}
                        </td>

                        {/* Statut */}
                        <td className="py-3.5 px-4">
                          {isLate && (
                            <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-300 px-2.5 py-1 rounded-xl text-xs font-black animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                              🔴 En retard
                            </span>
                          )}
                          {!isLate && isReady && (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-xl text-xs font-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              🟢 Prêt / Servi
                            </span>
                          )}
                          {!isLate && !isReady && (
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-black">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
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
                            className="text-xs text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1"
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
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Aucune commande en attente pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 4 : MODULES OPÉRATIONNELS & GRAPHIQUES */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graphique d'Affluence (2 colonnes) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Affluence Hebdomadaire (Scans QR vs Commandes)
                </h3>
                <p className="text-xs text-slate-500">
                  Taux de conversion moyen : 45% sur 7 jours
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Temps Réel
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="scansLightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#0F172A' }}
                  />
                  <Area type="monotone" dataKey="scans" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#scansLightGrad)" name="Scans QR" />
                  <Line type="monotone" dataKey="orders" stroke="#059669" strokeWidth={2} name="Commandes" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alertes de Stock (1 colonne) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Alertes de Stock</span>
                </h3>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {alerts.length} alerte(s)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Plats et boissons bientôt épuisés ou en rupture
              </p>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-56 pr-1">
              {alerts.map((al) => (
                <div key={al.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">{al.itemName}</span>
                    <span className="text-[11px] text-rose-600 font-semibold block">
                      {al.stock === 0 ? '❌ Épuisé' : `⚠️ Reste ${al.stock} ${al.unit}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRestock(al)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-2xs shrink-0 transition-all"
                  >
                    + Stock
                  </button>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  Tous vos stocks sont au vert !
                </div>
              )}
            </div>

            <Link
              href="/dashboard/menu"
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Gérer les stocks du menu</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* SECTION 5 : RACCOURCIS MODULES */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/dashboard/menu"
            className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-amber-400 hover:shadow-sm transition-all group"
          >
            <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <Utensils className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">Gestion du Menu</h4>
            <p className="text-xs text-slate-500 mt-1">Plats, prix et formules combinées</p>
          </Link>

          <Link
            href="/dashboard/tables"
            className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all group"
          >
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <QrCode className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">Plan de Salle</h4>
            <p className="text-xs text-slate-500 mt-1">Tables et QR codes HD prêts à imprimer</p>
          </Link>

          <Link
            href="/dashboard/kitchen"
            className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-orange-400 hover:shadow-sm transition-all group"
          >
            <div className="p-3 bg-orange-100 text-orange-800 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <Store className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">Écran Cuisine KDS</h4>
            <p className="text-xs text-slate-500 mt-1">Tickets en direct et impression 80mm</p>
          </Link>

          <Link
            href="/dashboard/stats"
            className="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-blue-400 hover:shadow-sm transition-all group"
          >
            <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">Statistiques & Vues</h4>
            <p className="text-xs text-slate-500 mt-1">Diagnostic vues vs commandes</p>
          </Link>
        </section>
      </main>

      {/* Modal Détails Commande */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-800 rounded-xl font-black text-sm">
                  Table {selectedOrder.tableNumber}
                </span>
                <span className="text-xs text-slate-500 font-mono">#{selectedOrder.id.slice(-5).toUpperCase()}</span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Articles commandés :</h4>
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2.5 text-xs">
                {selectedOrder.rawItems && selectedOrder.rawItems.length > 0 ? (
                  selectedOrder.rawItems.map((it, idx) => {
                    const dishName = it.name || it.menuItem?.name || 'Plat traditionnel';
                    const dishPrice = Number(it.price || it.menuItem?.price || 0);
                    const dishQty = Number(it.quantity) || 1;
                    const lineTotal = dishPrice * dishQty;

                    return (
                      <div key={it.id || idx} className="flex justify-between items-start font-bold text-slate-900 border-b border-slate-200/60 last:border-0 pb-2 last:pb-0">
                        <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-700 font-black font-mono shrink-0">{dishQty}x</span>
                            <span className="truncate">{dishName}</span>
                          </div>
                          {it.notes && (
                            <span className="block text-[11px] text-slate-500 italic font-normal pl-4">
                              Note : {it.notes}
                            </span>
                          )}
                          {it.options && (
                            <div className="flex flex-wrap gap-1 pl-4 pt-0.5">
                              {it.options.side && (
                                <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                                  🍛 {it.options.side}
                                </span>
                              )}
                              {it.options.spiceLevel && (
                                <span className="text-[10px] bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-rose-700">
                                  🌶️ {it.options.spiceLevel}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-slate-900 font-bold shrink-0">
                          {formatFCFA(lineTotal)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between font-bold text-slate-900">
                      <span>{it}</span>
                    </div>
                  ))
                )}
              </div>
              {selectedOrder.customerNote && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold block">Remarque client :</span>
                  <span>« {selectedOrder.customerNote} »</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold">Total :</span>
              <span className="text-base font-black text-slate-900 font-mono">{formatFCFA(selectedOrder.total)}</span>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}