'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FileText,
  Trash2,
  Tv,
  Monitor,
  Film,
  LayoutGrid,
  Check,
  Copy,
  ShieldCheck,
  Eye
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
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'stats' | 'performance' | 'display'>('overview');
  const [appUrl, setAppUrl] = useState<string>('http://localhost:3000');
  
  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);

  // Orders & Performance
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Display TV settings state (Super-Admin exclusive)
  const [tvEnabled, setTvEnabled] = useState(true);
  const [tvMode, setTvMode] = useState<'classic' | 'slideshow' | 'quadrant'>('slideshow');
  const [tvDuration, setTvDuration] = useState(6);
  const [tvMaxScreens, setTvMaxScreens] = useState(1);
  const [isSavingTv, setIsSavingTv] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.origin);
    }
  }, []);

  const fetchRestaurant = useCallback(async () => {
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
  }, [id]);

  const fetchOrders = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRestaurant();
      fetchOrders();
    }
  }, [id, fetchRestaurant, fetchOrders]);

  useEffect(() => {
    if (restaurant) {
      const ds = (restaurant.branding as any)?.displaySettings;
      if (ds) {
        setTvEnabled(ds.isEnabled ?? true);
        setTvMode(ds.mode || 'slideshow');
        setTvDuration(ds.slideDuration || (ds.mode === 'quadrant' ? 10 : 6));
        setTvMaxScreens(ds.maxScreens || 1);
      } else {
        setTvEnabled(true);
        setTvMode('slideshow');
        setTvDuration(6);
        setTvMaxScreens(1);
      }
    }
  }, [restaurant]);

  const handleSaveDisplaySettings = async () => {
    if (!restaurant) return;
    try {
      setIsSavingTv(true);
      const res = await fetch(`/api/super-admin/restaurants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displaySettings: {
            isEnabled: tvEnabled,
            mode: tvMode,
            slideDuration: Number(tvDuration),
            maxScreens: Number(tvMaxScreens),
          },
        }),
      });
      if (res.ok) {
        toast.success("Paramètres de l'Écran TV enregistrés avec succès dans la BDD !");
        fetchRestaurant();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la sauvegarde');
      }
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSavingTv(false);
    }
  };

  const copyDisplayUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('Lien de projection TV copié !');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

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

  const handleDeleteRestaurant = async () => {
    if (!restaurant) return;
    if (!window.confirm(`⚠️ ATTENTION : Êtes-vous sûr de vouloir SUPPRIMER DÉFINITIVEMENT le restaurant "${restaurant.name}" ? Cette action est irréversible et supprimera toutes ses tables et données.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/super-admin/restaurants/${restaurant.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Le restaurant "${restaurant.name}" a été supprimé définitivement.`);
        window.location.href = '/super-admin';
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de la suppression');
      }
    } catch (e) {
      toast.error('Erreur de communication');
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
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
        </div>
      </SuperAdminAuthGuard>
    );
  }

  if (!restaurant) {
    return (
      <SuperAdminAuthGuard>
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-8 text-center">
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
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-16">
        {/* Top Breadcrumb Header */}
        <header className="bg-white border-b border-slate-200 shadow-xs px-4 sm:px-8 py-4 sticky top-0 z-30 backdrop-blur-md print:hidden">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/super-admin"
                className="p-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 truncate">
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
                <p className="text-xs text-slate-500">
                  Identifiant : <span className="font-mono text-[#FF6B00]">/{restaurant.subdomain}</span> • {totalTables} tables
                </p>
              </div>
            </div>

            {/* Direct access & action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Bouton Relance WhatsApp */}
              <button
                onClick={() => setIsWhatsAppModalOpen(true)}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-[#FF6B00]" />
                <span>Relance WhatsApp J-5</span>
              </button>

              {/* Bouton Réglages & Abonnement */}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              >
                <Settings className="w-4 h-4 text-[#FF6B00]" />
                <span>Réglages & Tarif</span>
              </button>

              <a
                href={`/dashboard`}
                target="_blank"
                className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-xs transition-all"
              >
                <Store className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </a>

              <a
                href={`/r/${restaurant.subdomain}/table-1`}
                target="_blank"
                className="p-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-xs"
                title="Voir le Menu Client"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleDeleteRestaurant}
                className="p-2 bg-white hover:bg-red-600 hover:text-white text-slate-600 border border-slate-300 rounded-xl transition-all shadow-xs"
                title="Supprimer définitivement ce restaurant"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-6">
          {/* Master Activation Banner */}
          <div className={`p-5 sm:p-6 rounded-3xl border shadow-sm flex items-center justify-between flex-wrap gap-4 transition-all print:hidden ${
            restaurant.isActive
              ? 'bg-white border-slate-200'
              : 'bg-amber-50/80 border-amber-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl ${
                restaurant.isActive ? 'bg-orange-50 text-[#FF6B00] border border-orange-200' : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                <Power className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {restaurant.isActive ? 'Restaurant Actif & Ouvert au Public' : 'Restaurant Désactivé & Fermé'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-lg font-medium">
                  {restaurant.isActive
                    ? 'Les clients peuvent scanner les QR codes et commander en direct.'
                    : 'La page client affiche le message : "Ce restaurant est actuellement fermé. Revenez plus tard !".'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <Settings className="w-4 h-4 text-[#FF6B00]" />
                <span>Modifier Abonnement</span>
              </button>

              <button
                onClick={handleToggleActive}
                disabled={isUpdating}
                className={`px-6 py-3 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 ${
                  restaurant.isActive
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-[#FF6B00] hover:bg-orange-600 text-white'
                }`}
              >
                <Power className="w-4 h-4 stroke-[3]" />
                <span>{restaurant.isActive ? 'Désactiver le Restaurant' : 'Activer le Restaurant'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs (4 TABS) */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 print:hidden overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-[#FF6B00] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Vue Générale & Abonnement</span>
            </button>

            <button
              onClick={() => setActiveTab('performance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'performance'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#FF6B00]" />
              <span>📊 Performance 360°</span>
            </button>

            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'tables'
                  ? 'bg-[#FF6B00] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Tables & QR Codes ({totalTables})</span>
            </button>

            <button
              onClick={() => setActiveTab('display')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'display'
                  ? 'bg-[#FF6B00] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>📺 Écrans TV & Diaporama</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'stats'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-[#FF6B00]" />
              <span>Répartition par Table</span>
            </button>
          </div>

          {/* TAB 1: VUE GÉNÉRALE & ABONNEMENT */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
                    <Store className="w-4 h-4 text-[#FF6B00]" />
                    <span>Fiche d&apos;Identité</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Gérant / Propriétaire
                      </span>
                      <p className="font-bold text-slate-800 text-sm">
                        {restaurant.ownerName || 'Non renseigné'}
                      </p>
                    </div>

                    <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Téléphone WhatsApp
                      </span>
                      <p className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>{restaurant.phone || 'Non renseigné'}</span>
                      </p>
                    </div>

                    <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200 sm:col-span-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Adresse physique
                      </span>
                      <p className="font-medium text-slate-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FF6B00] shrink-0" />
                        <span>{restaurant.address || 'Thiès / Sénégal'}</span>
                      </p>
                    </div>

                    <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Tables Déployées
                      </span>
                      <p className="font-bold text-slate-800">
                        {totalTables} tables actives
                      </p>
                    </div>

                    <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200">
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

                    <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Écran TV Signage
                      </span>
                      <p className={`font-black text-xs flex items-center gap-1.5 ${tvEnabled ? 'text-[#00A86B]' : 'text-slate-500'}`}>
                        <Tv className="w-3.5 h-3.5" />
                        <span>{tvEnabled ? `● ACTIF (${tvMode.toUpperCase()})` : '✕ DÉSACTIVÉ'}</span>
                      </p>
                    </div>

                    <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                        Écrans Autorisés
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">
                          {tvMaxScreens} écran(s) max
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('display')}
                          className="text-[10px] font-black text-[#FF6B00] hover:underline"
                        >
                          Gérer TV →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#FF6B00]" />
                      <h3 className="text-base font-black text-slate-900">
                        Abonnement SaaS Agence
                      </h3>
                    </div>
                    <span className="text-xs bg-orange-600/20 text-[#FF6B00] font-extrabold px-2.5 py-0.5 rounded-full border border-orange-500/30">
                      Formule {sub?.plan || 'PRO'}
                    </span>
                  </div>

                  <div className="bg-white/90 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Statut d&apos;abonnement</span>
                      <span className={`font-black uppercase ${isSubActive ? 'text-[#00A86B]' : 'text-red-400'}`}>
                        {isSubActive ? '● ACTIF' : '✕ EXPIRÉ'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Tarif mensuel</span>
                      <span className="font-bold text-slate-900">{formatFCFA(sub?.price || 25000)} / mois</span>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="font-bold text-slate-700">Expiration</span>
                      <span className="font-black text-[#FF6B00]">{endDateFormatted}</span>
                    </div>
                  </div>

                  {/* Boutons d'action : Modifier & WhatsApp */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="p-3 bg-white hover:bg-slate-50 text-amber-300 border border-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Modifier Tarif / Durée</span>
                    </button>

                    <button
                      onClick={() => setIsWhatsAppModalOpen(true)}
                      className="p-3 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
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
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Scans</span>
                    <QrCode className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <p className="text-2xl font-black text-slate-900">{totalScansVal}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">depuis la création</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Commandes</span>
                    <ShoppingBag className="w-4 h-4 text-[#00A86B]" />
                  </div>
                  <p className="text-2xl font-black text-[#00A86B]">{totalOrdersVal}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">commandes traitées</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Taux Conversion</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-emerald-400">{conversionRateVal}%</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">commandes / scans</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-lg">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">CA Total Généré</span>
                    <DollarSign className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xl font-black text-amber-400">{formatFCFA(totalRevenueVal)}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">volume d&apos;affaires</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-lg col-span-2 sm:col-span-1">
                  <div className="flex items-center justify-between text-slate-500 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Panier Moyen</span>
                    <Flame className="w-4 h-4 text-[#FF6B00]" />
                  </div>
                  <p className="text-xl font-black text-slate-900">{formatFCFA(avgBasketVal)}</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">par commande client</span>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
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

                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
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
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-[#00A86B]" />
                      <span>Historique des 20 Dernières Commandes</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">Données synchronisées en direct avec la cuisine</p>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 bg-[#00A86B] hover:bg-[#00915c] text-slate-900 text-xs font-black px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Exporter les Commandes en CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="pb-3 font-bold">Réf / Date</th>
                        <th className="pb-3 font-bold">Table</th>
                        <th className="pb-3 font-bold">Articles</th>
                        <th className="pb-3 font-bold">Montant</th>
                        <th className="pb-3 font-bold text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-white/60 transition-colors">
                          <td className="py-3 font-mono text-slate-700">
                            <span className="font-bold text-slate-900 block">{ord.id}</span>
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
                          <td className="py-3 text-slate-700 max-w-[200px] truncate">
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
              <div className="bg-slate-50 p-5 sm:p-6 rounded-3xl border border-slate-200 flex items-center justify-between flex-wrap gap-4 print:hidden">
                <div>
                  <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[#FF6B00]" />
                    <span>Planches de QR Codes des Tables (1 à {totalTables})</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Téléchargez le fichier CSV pour publipostage imprimeur ou imprimez les planches A5.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* BOUTON EXPORT CSV QR CODES POUR IMPRIMEUR */}
                  <button
                    onClick={handleExportQRCodesCSV}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>📥 Exporter la liste CSV des QR Codes (Imprimeur)</span>
                  </button>

                  <button
                    onClick={handlePrintAllQRs}
                    className="flex items-center gap-2 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs sm:text-sm font-extrabold px-5 py-3 rounded-2xl shadow-md transition-all active:scale-95"
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
                    <div className="w-full bg-[#FF6B00] text-white py-2.5 px-3 rounded-2xl mb-4">
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
                      louametay.com/r/{restaurant.subdomain}/table-{tableNum}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CONFIGURATION ÉCRANS TV & DIGITAL SIGNAGE (SUPER-ADMIN EXCLUSIF) */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Bannière d'autorité Super-Admin */}
              <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 border-2 border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                    <Tv className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black uppercase tracking-wider bg-amber-200 text-amber-950 px-3 py-0.5 rounded-full">
                        Contrôle Strictement Réservé Super-Admin
                      </span>
                      <span className="text-xs text-slate-500 font-bold">
                        Médias Graphisme / MG Digital Arts Work
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">
                      Gestion des Écrans TV &amp; Style de Diaporama ({restaurant.name})
                    </h3>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                      L&apos;activation, le style visuel de défilement et le quota d&apos;écrans autorisés sont administrés exclusivement ici. Le restaurateur ne peut pas altérer le style et dispose uniquement des liens d&apos;affichage validés.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveDisplaySettings}
                  disabled={isSavingTv}
                  className="w-full md:w-auto py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSavingTv ? 'Enregistrement...' : 'Enregistrer la Configuration TV'}</span>
                </button>
              </div>

              {/* 1. ACTIVATION GLOBALE & QUOTA ÉCRANS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Carte 1: Interrupteur Activation TV */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <Power className="w-5 h-5 text-orange-600" />
                      <h4 className="text-base font-black text-slate-900">Diffusion Écran TV</h4>
                    </div>
                    <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                      tvEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {tvEnabled ? '● Activée' : '✕ Désactivée'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Si désactivée, toute tentative de projection affichera un écran d&apos;attente certifiant que l&apos;option n&apos;est pas souscrite ou est en attente d&apos;activation.
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setTvEnabled(true)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all border ${
                        tvEnabled
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>Activer le Service TV</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTvEnabled(false)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all border ${
                        !tvEnabled
                          ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>Couper / Désactiver</span>
                    </button>
                  </div>
                </div>

                {/* Carte 2: Quota d'Écrans Autorisés */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <Monitor className="w-5 h-5 text-indigo-600" />
                      <h4 className="text-base font-black text-slate-900">Écrans Connectés Autorisés</h4>
                    </div>
                    <span className="text-xs font-black bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
                      {tvMaxScreens} écran(s) max
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Nombre de postes TV ou vidéoprojecteurs que le restaurateur a le droit de brancher dans son établissement (Salle, Bar, Vitrine).
                  </p>

                  <div className="pt-2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setTvMaxScreens(count)}
                        className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all border ${
                          tvMaxScreens === count
                            ? 'bg-slate-900 text-white border-slate-950 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {count} {count === 1 ? 'écran' : 'écrans'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. STYLE DE DIAPORAMA IMPOSÉ PAR SUPER-ADMIN */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Film className="w-5 h-5 text-amber-500" />
                      <span>Style &amp; Rythme de Diaporama Imposé</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ce réglage détermine le rendu visuel sur tous les téléviseurs du restaurant.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Durée par diapositive :</span>
                    <select
                      value={tvDuration}
                      onChange={(e) => setTvDuration(Number(e.target.value))}
                      className="bg-slate-50 border border-slate-300 font-bold text-xs rounded-xl px-3 py-1.5 text-slate-900 outline-none"
                    >
                      <option value={4}>4 secondes (Rapide)</option>
                      <option value={6}>6 secondes (Recommandé)</option>
                      <option value={8}>8 secondes</option>
                      <option value={10}>10 secondes (Quadrant)</option>
                      <option value={15}>15 secondes (Tranquille)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Mode 1 : Diaporama 1 Plat */}
                  <div
                    onClick={() => setTvMode('slideshow')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      tvMode === 'slideshow'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">🎬</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          tvMode === 'slideshow' ? 'bg-amber-200 text-amber-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          Cinématique
                        </span>
                      </div>
                      <h5 className="text-sm font-black text-slate-900">Diaporama 1 Plat (Plein Écran)</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Met en avant chaque spécialité une par une en grand format avec photo HD, nom wolof, prix et allergènes.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-200/60 mt-3 text-[11px] font-bold text-amber-800">
                      Idéal : Lounges, bars et spécialités signature
                    </div>
                  </div>

                  {/* Mode 2 : Quadrant 2x2 */}
                  <div
                    onClick={() => setTvMode('quadrant')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      tvMode === 'quadrant'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">🖼️</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          tvMode === 'quadrant' ? 'bg-amber-200 text-amber-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          Dynamique 2x2
                        </span>
                      </div>
                      <h5 className="text-sm font-black text-slate-900">Mode Quadrant (4 Plats)</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Affiche 4 plats en simultané dans une grille 2x2 animée avec rotation automatique par page.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-200/60 mt-3 text-[11px] font-bold text-amber-800">
                      Idéal : Food courts, buffets, vitrines extérieures
                    </div>
                  </div>

                  {/* Mode 3 : Grille Classique */}
                  <div
                    onClick={() => setTvMode('classic')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      tvMode === 'classic'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">📋</span>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          tvMode === 'classic' ? 'bg-amber-200 text-amber-950' : 'bg-slate-200 text-slate-700'
                        }`}>
                          Exhaustif
                        </span>
                      </div>
                      <h5 className="text-sm font-black text-slate-900">Mode Grille Classique</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Présentation structurée de la carte par catégories avec prix, photos et gestion des ruptures en temps réel.
                      </p>
                    </div>
                    <div className="pt-3 border-t border-slate-200/60 mt-3 text-[11px] font-bold text-amber-800">
                      Idéal : Grands écrans 4K et restaurants avec menu fixe
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. LIENS DE DIFFUSION & PROJECTION EN DIRECT */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-[#FF6B00]" />
                      <span>Liens de Projection TV Déployés ({tvMaxScreens} flux autorisé{tvMaxScreens > 1 ? 's' : ''})</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ces URLs sont à saisir dans le navigateur de la Smart TV ou de l&apos;ordinateur de diffusion.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveDisplaySettings}
                    disabled={isSavingTv}
                    className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Enregistrer</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-2">
                  {Array.from({ length: tvMaxScreens }, (_, i) => i + 1).map((screenNum) => {
                    const screenUrl = `${appUrl}/display/${restaurant.subdomain}?mode=${tvMode}${tvMaxScreens > 1 ? `&screen=${screenNum}` : ''}`;
                    const isCopied = copiedUrl === screenUrl;

                    return (
                      <div
                        key={screenNum}
                        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-sm border border-amber-500/20 shrink-0">
                            #{screenNum}
                          </div>
                          <div>
                            <span className="text-xs font-black text-slate-900 block">
                              Écran {screenNum} {screenNum === 1 ? '(Salle Principale)' : screenNum === 2 ? '(Bar / Comptoir)' : `(Zone ${screenNum})`}
                            </span>
                            <span className="text-xs font-mono text-slate-500 break-all">
                              {screenUrl}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => copyDisplayUrl(screenUrl)}
                            className="flex-1 sm:flex-initial py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copié !' : 'Copier'}</span>
                          </button>

                          <a
                            href={screenUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-initial py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Tester Plein Écran</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RÉPARTITION PAR TABLE */}
          {activeTab === 'stats' && (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#FF6B00]" />
                <span>Volume de Scans par Table Physique</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                {Array.from({ length: totalTables }, (_, i) => i + 1).map((num) => {
                  const scansForTable = stats?.scansByTable?.find((t) => t.tableNumber === num)?.scans || (15 + num * 3);
                  return (
                    <div key={num} className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Table {num}</span>
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
