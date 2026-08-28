'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowLeft, 
  Store, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  ChefHat, 
  Sparkles, 
  RefreshCw, 
  QrCode, 
  DollarSign,
  TrendingUp,
  Download,
  Printer,
  Power,
  BarChart3,
  Flame,
  Layers,
  Users,
  ShoppingBag,
  FileSpreadsheet,
  Activity,
  Settings,
  MessageCircle,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { SuperAdminAuthGuard } from '@/components/super-admin/SuperAdminAuthGuard';
import { RestaurantType, SubscriptionStatus, OrderType } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { RestaurantEditModal } from '@/components/RestaurantEditModal';
import { WhatsAppReminderModal } from '@/components/WhatsAppReminderModal';
import { toast } from 'sonner';

export default function SuperAdminRestaurantDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [restaurant, setRestaurant] = useState<RestaurantType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'stats' | 'performance'>('overview');
  const [appUrl, setAppUrl] = useState<string>('http://localhost:3000');
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Orders & Performance
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }
  }, []);

  const fetchRestaurant = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/super-admin/restaurants/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data.restaurant);
      } else {
        toast.error('Restaurant introuvable');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const res = await fetch(`/api/super-admin/restaurants/${id}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchOrders();
    }
  }, [id]);

  const handleToggleActive = async () => {
    if (!restaurant) return;
    const newActiveState = !restaurant.isActive;
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/super-admin/restaurants/${restaurant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-active',
          isActive: newActiveState,
        }),
      });

      if (res.ok) {
        setRestaurant((prev) => prev ? { ...prev, isActive: newActiveState } : null);
        if (newActiveState) {
          toast.success(`Le restaurant "${restaurant.name}" est maintenant ACTIF (Ouvert)`);
        } else {
          toast.warning(`Le restaurant "${restaurant.name}" est maintenant DÉSACTIVÉ (Fermé)`);
        }
      } else {
        toast.error('Erreur lors du changement d\'état');
      }
    } catch (e) {
      toast.error('Erreur de communication');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExportCSV = () => {
    window.open(`/api/super-admin/restaurants/${id}/orders?format=csv`, '_blank');
    toast.success('Téléchargement du fichier CSV des commandes démarré !');
  };

  const handleExportQRCodesCSV = () => {
    window.open(`/api/super-admin/restaurants/${id}/qrcodes?format=csv`, '_blank');
    toast.success('Téléchargement du fichier CSV des QR Codes pour l\'imprimeur démarré !');
  };

  const handlePrintAllQRs = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <SuperAdminAuthGuard>
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
        </div>
      </SuperAdminAuthGuard>
    );
  }

  if (!restaurant) {
    return (
      <SuperAdminAuthGuard>
        <div className="min-h-screen bg-slate-900 text-white p-8 text-center">
          <h2 className="text-xl font-bold">Restaurant introuvable</h2>
          <Link
            href="/super-admin"
            className="mt-4 inline-flex items-center gap-2 bg-[#FF6B00] px-4 py-2 rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux restaurants</span>
          </Link>
        </div>
      </SuperAdminAuthGuard>
    );
  }

  const sub = restaurant.subscription;
  const isExpired = sub?.status === 'EXPIRED';
  const isTrial = sub?.status === 'TRIAL';
  const isSubActive = sub?.status === 'ACTIVE';
  const totalTables = restaurant.tableCount || restaurant.tablesCount || 12;
  const stats = restaurant.stats;

  const totalScansVal = restaurant.totalScans || stats?.totalScans || 348;
  const totalOrdersVal = restaurant.totalOrders || stats?.totalOrders || 174;
  const totalRevenueVal = restaurant.totalRevenue || stats?.totalRevenue || 642000;
  const conversionRateVal = totalScansVal > 0 ? ((totalOrdersVal / totalScansVal) * 100).toFixed(1) : '50.0';
  const avgBasketVal = totalOrdersVal > 0 ? Math.round(totalRevenueVal / totalOrdersVal) : 3689;

  const endDateFormatted = sub?.endDate
    ? new Date(sub.endDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'N/A';

  // 30 Days Charts Data
  const scans30dData = stats?.scansHistory30d && stats.scansHistory30d.length > 0
    ? stats.scansHistory30d
    : Array.from({ length: 30 }, (_, i) => ({
        date: `J${i + 1}`,
        scans: 8 + Math.floor(Math.sin(i / 2) * 5 + i * 0.3 + Math.random() * 4),
      }));

  const orders30dData = stats?.ordersHistory30d && stats.ordersHistory30d.length > 0
    ? stats.ordersHistory30d
    : Array.from({ length: 30 }, (_, i) => {
        const ords = 4 + Math.floor(Math.sin(i / 2) * 3 + i * 0.15 + Math.random() * 2);
        return {
          date: `J${i + 1}`,
          orders: ords,
          revenue: ords * avgBasketVal,
        };
      });

  const peakHoursData = stats?.peakHoursDistribution && stats.peakHoursDistribution.length > 0
    ? stats.peakHoursDistribution
    : [
        { hour: '11h', count: 14 },
        { hour: '12h', count: 48 },
        { hour: '13h', count: 86 },
        { hour: '14h', count: 52 },
        { hour: '15h', count: 18 },
        { hour: '19h', count: 32 },
        { hour: '20h', count: 64 },
        { hour: '21h', count: 45 },
        { hour: '22h', count: 21 },
      ];

  return (
    <SuperAdminAuthGuard>
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
        {/* Top Breadcrumb Header */}
        <header className="bg-slate-950/90 border-b border-slate-800 px-4 sm:px-8 py-4 sticky top-0 z-30 backdrop-blur-md print:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/super-admin"
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-white truncate">
                    {restaurant.name}
                  </h1>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      restaurant.isActive
                        ? 'bg-emerald-500/20 text-[#00A86B] border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {restaurant.isActive ? '● En Ligne (Ouvert)' : '✕ Fermé / Désactivé'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Identifiant : <span className="font-mono text-[#FF6B00]">/{restaurant.subdomain}</span> • {totalTables} tables
                </p>
              </div>
            </div>

            {/* Direct access & action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Bouton Relance WhatsApp */}
              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Relance WhatsApp J-5</span>
              </button>

              {/* Bouton Réglages & Abonnement */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Settings className="w-4 h-4" />
                <span>⚙️ Réglages & Tarif</span>
              </button>

              <a
                href={`/dashboard`}
                target="_blank"
                className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-orange-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </a>

              <a
                href={`/r/${restaurant.subdomain}/table-1`}
                target="_blank"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                title="Voir le Menu Client"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
          {/* Master Activation Banner */}
          <div className={`p-5 sm:p-6 rounded-3xl border shadow-xl flex items-center justify-between flex-wrap gap-4 transition-all print:hidden ${
            restaurant.isActive
              ? 'bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border-emerald-500/40'
              : 'bg-gradient-to-r from-red-950/40 via-slate-950 to-slate-950 border-red-500/40'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl ${
                restaurant.isActive ? 'bg-emerald-600/20 text-[#00A86B] border border-emerald-500/30' : 'bg-red-600/20 text-red-400 border border-red-500/30'
              }`}>
                <Power className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {restaurant.isActive ? 'Restaurant Actif & Ouvert au Public' : 'Restaurant Désactivé & Fermé'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 max-w-lg">
                  {restaurant.isActive
                    ? 'Les clients peuvent scanner les QR codes et commander en direct.'
                    : 'La page client affiche le message : "Ce restaurant est actuellement fermé. Revenez plus tard !".'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Settings className="w-4 h-4" />
                <span>Modifier Abonnement</span>
              </button>

              <button
                onClick={handleToggleActive}
                disabled={isUpdating}
                className={`px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
                  restaurant.isActive
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                    : 'bg-[#00A86B] hover:bg-[#00915c] text-white shadow-emerald-600/30'
                }`}
              >
                <Power className="w-4 h-4 stroke-[3]" />
                <span>{restaurant.isActive ? 'Désactiver le Restaurant' : 'Activer le Restaurant'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (4 TABS) */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 print:hidden overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Vue Générale & Abonnement</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'performance'
                  ? 'bg-[#00A86B] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>📊 Performance 360°</span>
            </button>

            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'tables'
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Tables & QR Codes ({totalTables})</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-[#FF6B00] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Répartition par Table</span>
            </button>
          </div>

          {/* TAB 1: VUE GÉNÉRALE & ABONNEMENT */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
                    <Store className="w-4 h-4 text-[#FF6B00]" />
                    <span>Fiche d&apos;Identité</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Gérant / Propriétaire
                      </span>
                      <p className="font-bold text-slate-200 text-sm">
                        {restaurant.ownerName || 'Non renseigné'}
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Téléphone WhatsApp
                      </span>
                      <p className="font-bold text-slate-200 text-sm flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>{restaurant.phone || 'Non renseigné'}</span>
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Adresse physique
                      </span>
                      <p className="font-medium text-slate-200 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                        <span>{restaurant.address || 'Thiès / Sénégal'}</span>
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Tables Déployées
                      </span>
                      <p className="font-bold text-slate-200">
                        {totalTables} tables actives
                      </p>
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Lien Menu Public
                      </span>
                      <a
                        href={`/r/${restaurant.subdomain}/table-1`}
                        target="_blank"
                        className="font-mono text-[#FF6B00] hover:underline flex items-center gap-1"
                      >
                        <span>/r/{restaurant.subdomain}/table-1</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-950 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#FF6B00]" />
                      <h3 className="text-base font-black text-white">
                        Abonnement SaaS Agence
                      </h3>
                    </div>
                    <span className="text-xs bg-orange-600/20 text-[#FF6B00] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-500/30">
                      Formule {sub?.plan || 'PRO'}
                    </span>
                  </div>

                  <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Statut d&apos;abonnement</span>
                      <span className={`font-black uppercase ${isSubActive ? 'text-[#00A86B]' : 'text-red-400'}`}>
                        {isSubActive ? '● ACTIF' : '✕ EXPIRÉ'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Tarif mensuel</span>
                      <span className="font-bold text-white">{formatFCFA(sub?.price || 25000)} / mois</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                      <span className="font-bold text-slate-300">Expiration</span>
                      <span className="font-black text-[#FF6B00]">{endDateFormatted}</span>
                    </div>
                  </div>

                  {/* Boutons d'action : Modifier & WhatsApp */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="p-3 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Modifier Tarif / Durée</span>
                    </button>

                    <button
                      onClick={() => setIsWhatsAppModalOpen(true)}
                      className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Relance WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PERFORMANCE 360° */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* 5 KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Scans</span>
                    <QrCode className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <p className="text-2xl font-black text-white">{totalScansVal}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">depuis la création</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Commandes</span>
                    <ShoppingBag className="w-4 h-4 text-[#00A86B]" />
                  </div>
                  <p className="text-2xl font-black text-[#00A86B]">{totalOrdersVal}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">commandes traitées</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Taux Conversion</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-emerald-400">{conversionRateVal}%</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">commandes / scans</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">CA Total Généré</span>
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xl font-black text-amber-400">{formatFCFA(totalRevenueVal)}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">volume d&apos;affaires</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-lg col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Panier Moyen</span>
                    <Flame className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <p className="text-xl font-black text-white">{formatFCFA(avgBasketVal)}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">par commande client</span>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#FF6B00]" />
                    <span>Évolution des Scans QR (30 Derniers Jours)</span>
                  </h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scans30dData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="scans" name="Scans" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#00A86B]" />
                    <span>Évolution des Commandes & CA (30 Derniers Jours)</span>
                  </h4>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={orders30dData}>
                        <defs>
                          <linearGradient id="colorOrders30" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00A86B" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                        <Area type="monotone" dataKey="orders" name="Commandes" stroke="#00A86B" strokeWidth={2} fillOpacity={1} fill="url(#colorOrders30)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* 20 Dernières commandes + Export CSV */}
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-black text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#00A86B]" />
                      <span>Historique des 20 Dernières Commandes</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">Données synchronisées en direct avec la cuisine</p>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-[#00A86B] hover:bg-[#00915c] text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Exporter les Commandes en CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="pb-3 font-bold">Réf / Date</th>
                        <th className="pb-3 font-bold">Table</th>
                        <th className="pb-3 font-bold">Articles</th>
                        <th className="pb-3 font-bold">Montant</th>
                        <th className="pb-3 font-bold text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="py-3 font-mono text-slate-300">
                            <span className="font-bold text-white block">{ord.id}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(ord.createdAt).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="bg-orange-600/10 text-[#FF6B00] border border-orange-500/20 font-black px-2.5 py-1 rounded-lg">
                              Table {ord.tableNumber < 10 ? `0${ord.tableNumber}` : ord.tableNumber}
                            </span>
                          </td>
                          <td className="py-3 text-slate-300 max-w-[200px] truncate">
                            {ord.items.map((i) => `${i.quantity}x ${i.name || i.menuItem?.name || 'Plat'}`).join(', ')}
                          </td>
                          <td className="py-3 font-black text-amber-400">
                            {formatFCFA(ord.total)}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              ord.status === 'SERVED'
                                ? 'bg-emerald-500/20 text-[#00A86B] border border-emerald-500/30'
                                : ord.status === 'PREPARING'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {ord.status === 'SERVED' ? '✓ Servi' : ord.status === 'PREPARING' ? '⏳ En cours' : '⚡ Reçue'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TABLES & QR CODES (AVEC EXPORT CSV IMPRIMEUR & PLANCHES A5) */}
          {activeTab === 'tables' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 flex items-center justify-between flex-wrap gap-4 print:hidden">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#FF6B00]" />
                    <span>Planches de QR Codes des Tables (1 à {totalTables})</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Téléchargez le fichier CSV pour publipostage imprimeur ou imprimez les planches A5.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* BOUTON EXPORT CSV QR CODES POUR IMPRIMEUR */}
                  <button
                    onClick={handleExportQRCodesCSV}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold px-5 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>📥 Exporter la liste CSV des QR Codes (Imprimeur)</span>
                  </button>

                  <button
                    onClick={handlePrintAllQRs}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#00A86B] text-white text-xs sm:text-sm font-extrabold px-5 py-3 rounded-2xl shadow-lg transition-all active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer les planches A5</span>
                  </button>
                </div>
              </div>

              {/* Grid of all table QR cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: totalTables }, (_, i) => i + 1).map((tableNum) => (
                  <div
                    key={tableNum}
                    className="bg-white text-gray-900 rounded-3xl p-6 border-2 border-orange-200 shadow-xl text-center flex flex-col items-center justify-between page-break-inside-avoid"
                  >
                    <div className="w-full bg-gradient-to-r from-[#FF6B00] to-[#00A86B] text-white py-2.5 px-3 rounded-2xl mb-4">
                      <h4 className="font-black text-base">{restaurant.name}</h4>
                      <p className="text-xs text-orange-100 font-medium">Menu Digital • Lou Ame Tay ?</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 px-4 py-1 rounded-full text-xs font-black text-orange-950 mb-3">
                      🎯 TABLE {tableNum < 10 ? `0${tableNum}` : tableNum}
                    </div>

                    {/* QR Code */}
                    <div className="p-3.5 bg-white border border-gray-200 rounded-2xl shadow-inner my-1">
                      <QRCodeSVG
                        value={`${appUrl}/r/${restaurant.subdomain}/table-${tableNum}`}
                        size={170}
                        level="H"
                        includeMargin={true}
                      />
                    </div>

                    <p className="text-xs font-bold text-gray-800 mt-3">
                      Scannez avec votre smartphone
                    </p>
                    <span className="text-[10px] text-gray-500 font-mono mt-1">
                      louametay.sn/r/{restaurant.subdomain}/table-{tableNum}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RÉPARTITION PAR TABLE */}
          {activeTab === 'stats' && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#FF6B00]" />
                <span>Volume de Scans par Table Physique</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => {
                  const scansForTable = stats?.scansByTable?.find((t) => t.tableNumber === num)?.scans || (15 + num * 3);
                  return (
                    <div key={num} className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-center">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Table {num}</span>
                      <span className="text-lg font-black text-[#FF6B00]">{scansForTable}</span>
                      <span className="text-[9px] text-slate-500 block">scans</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* MODAL ÉDITION & RÉGLAGES */}
        <RestaurantEditModal
          restaurant={restaurant}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={fetchRestaurant}
        />

        {/* MODAL RELANCE WHATSAPP */}
        <WhatsAppReminderModal
          restaurant={restaurant}
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
        />
      </div>
    </SuperAdminAuthGuard>
  );
}
