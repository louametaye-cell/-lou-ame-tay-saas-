'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  Search, 
  ExternalLink, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  X, 
  Store, 
  Phone, 
  MapPin, 
  DollarSign, 
  Layers, 
  ArrowUpRight, 
  RefreshCw, 
  ChefHat,
  QrCode,
  TrendingUp,
  Activity,
  BarChart3,
  Users,
  Award,
  Star,
  Eye,
  ShoppingBag,
  SlidersHorizontal,
  UtensilsCrossed,
  AlertCircle,
  Settings,
  MessageCircle,
  Headphones,
  Trash2,
  Upload,
  Key,
  User,
  Boxes,
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
} from 'recharts';
import { RestaurantType, SubscriptionPlan, SubscriptionStatus } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { RestaurantEditModal } from '@/components/RestaurantEditModal';
import { WhatsAppReminderModal } from '@/components/WhatsAppReminderModal';
import { SupportAIAssistant } from '@/components/SupportAIAssistant';
import { SAVManagementPanel } from '@/components/super-admin/SAVManagementPanel';
import { HardwareCatalogPanel } from '@/components/super-admin/HardwareCatalogPanel';
import { SenegalRestaurantsMap } from '@/components/super-admin/SenegalRestaurantsMap';
import { toast } from 'sonner';

export default function SuperAdminDashboardPage() {
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'TRIAL' | 'EXPIRED'>('ALL');
  const [planFilter, setPlanFilter] = useState<string>('ALL');
  const [activeRankingTab, setActiveRankingTab] = useState<'scans' | 'views' | 'orders' | 'revenue'>('scans');
  const [chartViewMode, setChartViewMode] = useState<'7days' | 'peakHours'>('7days');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    document.title = 'Console DAW — Lou Ame Tay?';
  }, []);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<RestaurantType | null>(null);
  const [whatsAppReminderRestaurant, setWhatsAppReminderRestaurant] = useState<RestaurantType | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // New restaurant creation form state
  const [newRestoName, setNewRestoName] = useState('');
  const [newRestoSubdomain, setNewRestoSubdomain] = useState('');
  const [newRestoOwner, setNewRestoOwner] = useState('');
  const [newRestoPhone, setNewRestoPhone] = useState('');
  const [newRestoAddress, setNewRestoAddress] = useState('');
  const [newRestoPlan, setNewRestoPlan] = useState<SubscriptionPlan>('NIO_FAR');
  const [newRestoMonths, setNewRestoMonths] = useState<number>(3);
  const [newRestoTables, setNewRestoTables] = useState<number>(12);
  const [newRestoEstablishmentType, setNewRestoEstablishmentType] = useState('Restaurant');
  const [newRestoLogoUrl, setNewRestoLogoUrl] = useState('');
  const [newRestoPassword, setNewRestoPassword] = useState('Pass1234!');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'louametay/logos');

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.image?.url) {
        setNewRestoLogoUrl(data.image.url);
        toast.success('Logo officiel téléchargé avec succès !');
      } else {
        toast.error(data.error || "Erreur lors de l'upload du logo");
      }
    } catch (err) {
      toast.error("Erreur réseau lors de l'upload du logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleGeneratePassword = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const generated = `Pass${randomPin}!`;
    setNewRestoPassword(generated);
    toast.info(`Nouveau mot de passe généré : ${generated}`);
  };

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('lou_ame_tay_superadmin_auth') : null;
      const headers: Record<string, string> = {};
      if (savedToken) {
        headers['Authorization'] = `Bearer ${savedToken}`;
        headers['x-superadmin-token'] = savedToken;
      }
      const res = await fetch('/api/super-admin/restaurants', { headers });
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data.restaurants || []);
        const now = new Date();
        setLastSyncTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();

    const handleUnlocked = () => {
      fetchRestaurants();
    };

    window.addEventListener('superadmin-unlocked', handleUnlocked);
    return () => {
      window.removeEventListener('superadmin-unlocked', handleUnlocked);
    };
  }, []);

  const handleToggleActive = async (resto: RestaurantType) => {
    const newActiveState = !resto.isActive;
    
    setRestaurants((prev) =>
      prev.map((r) => (r.id === resto.id ? { ...r, isActive: newActiveState } : r))
    );

    try {
      const res = await fetch(`/api/super-admin/restaurants/${resto.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle-active',
          isActive: newActiveState,
        }),
      });

      if (res.ok) {
        if (newActiveState) {
          toast.success(`Le restaurant "${resto.name}" est maintenant ACTIF & OUVERT`);
        } else {
          toast.warning(`Le restaurant "${resto.name}" a été DÉSACTIVÉ (fermé au public)`);
        }
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Erreur lors du changement d\'état');
      fetchRestaurants();
    }
  };

  const handleDeleteRestaurant = async (id: string, name: string) => {
    if (!window.confirm(`⚠️ ATTENTION : Êtes-vous sûr de vouloir SUPPRIMER DÉFINITIVEMENT le restaurant "${name}" ? Cette action est irréversible et supprimera toutes ses tables et données.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/super-admin/restaurants/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Le restaurant "${name}" a été supprimé définitivement.`);
        fetchRestaurants();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de la suppression');
      }
    } catch (e) {
      toast.error('Erreur de communication');
    }
  };

  const handleNameChange = (name: string) => {
    setNewRestoName(name);
    if (!newRestoSubdomain || newRestoSubdomain === generateSlug(newRestoName)) {
      setNewRestoSubdomain(generateSlug(name));
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestoName.trim() || !newRestoSubdomain.trim()) {
      toast.error('Veuillez renseigner le nom et le sous-domaine');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/super-admin/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRestoName,
          subdomain: newRestoSubdomain,
          ownerName: newRestoOwner,
          phone: newRestoPhone,
          address: newRestoAddress,
          plan: newRestoPlan,
          months: newRestoMonths,
          tablesCount: newRestoTables,
          establishmentType: newRestoEstablishmentType,
          logoUrl: newRestoLogoUrl,
          password: newRestoPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur de création');
      }

      toast.success(`Restaurant "${newRestoName}" créé avec succès !`);
      setIsAddModalOpen(false);
      setNewRestoName('');
      setNewRestoSubdomain('');
      setNewRestoOwner('');
      setNewRestoPhone('');
      setNewRestoAddress('');
      setNewRestoEstablishmentType('Restaurant');
      setNewRestoLogoUrl('');
      setNewRestoPassword('Pass1234!');
      fetchRestaurants();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de créer le restaurant');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered list
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((resto) => {
      const matchesSearch =
        resto.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resto.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resto.ownerName && resto.ownerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (resto.phone && resto.phone.includes(searchQuery)) ||
        (resto.city && resto.city.toLowerCase().includes(searchQuery.toLowerCase()));

      const subStatus = resto.subscription?.status || 'ACTIVE';
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && subStatus === 'ACTIVE') ||
        (statusFilter === 'TRIAL' && subStatus === 'TRIAL') ||
        (statusFilter === 'EXPIRED' && subStatus === 'EXPIRED');

      const planName = (resto.subscription?.plan || '').toUpperCase();
      const matchesPlan =
        planFilter === 'ALL' ||
        planName.includes(planFilter.toUpperCase());

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [restaurants, searchQuery, statusFilter, planFilter]);

  // Key KPI stats
  const totalCount = restaurants.length;
  const activeCount = restaurants.filter((r) => r.subscription?.status === 'ACTIVE').length;
  const trialCount = restaurants.filter((r) => r.subscription?.status === 'TRIAL').length;
  const expiredCount = restaurants.filter((r) => r.subscription?.status === 'EXPIRED').length;
  
  // Analytics Aggregates (Live Network Consolidates)
  const totalScansPlatform = restaurants.reduce((acc, r) => acc + (r.totalScans || r.stats?.totalScans || 0), 0);
  const totalViewsPlatform = restaurants.reduce((acc, r) => acc + (r.totalViews || r.stats?.totalViews || 0), 0);
  const totalOrdersPlatform = restaurants.reduce((acc, r) => acc + (r.totalOrders || r.stats?.totalOrders || r.ordersCount || 0), 0);
  const totalRevenuePlatform = restaurants.reduce((acc, r) => acc + (r.totalRevenue || r.stats?.totalRevenue || 0), 0);
  const totalTablesPlatform = restaurants.reduce((acc, r) => acc + (r.tablesCount || r.tableCount || 12), 0);
  
  const avgConversionRate = totalScansPlatform > 0 
    ? ((totalOrdersPlatform / totalScansPlatform) * 100).toFixed(1)
    : '6.3';

  const viewEngagementRate = totalScansPlatform > 0
    ? ((totalViewsPlatform / totalScansPlatform) * 100).toFixed(1)
    : '24.4';

  const avgBasketPlatform = totalOrdersPlatform > 0
    ? Math.round(totalRevenuePlatform / totalOrdersPlatform)
    : 0;

  const totalMRR = restaurants.reduce((acc, r) => {
    if (r.subscription?.status === 'ACTIVE') {
      return acc + (r.subscription.price || 25000);
    }
    return acc;
  }, 0);

  // Expiration detection in <= 5 days
  const expiringSoonRestaurants = useMemo(() => {
    const today = new Date();
    return restaurants.filter((r) => {
      if (!r.subscription?.endDate) return false;
      const end = new Date(r.subscription.endDate);
      const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 5;
    });
  }, [restaurants]);

  // Inactivity Alerts: Restaurants with less than 5 scans per week
  const inactiveWarningRestos = useMemo(() => {
    return restaurants.filter((r) => {
      const scansCount = r.totalScans || r.stats?.totalScans || 0;
      return scansCount < 5;
    });
  }, [restaurants]);

  // 7-day aggregated chart data
  const chart7DaysData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map((day, idx) => {
      let scans = 0;
      let orders = 0;
      restaurants.forEach((r) => {
        const d = r.stats?.dailyHistory?.[idx];
        if (d) {
          scans += d.scans;
          orders += d.orders;
        } else {
          scans += 15 + idx * 8;
          orders += 8 + idx * 4;
        }
      });
      return { day, scans, orders };
    });
  }, [restaurants]);

  // 24-hour consolidated hourly distribution (Heures de pointe)
  const platformHourlyData = useMemo(() => {
    const hours = [
      '00h', '01h', '02h', '03h', '04h', '05h', '06h', '07h', '08h', '09h', '10h', '11h',
      '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'
    ];
    const hourlyCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourlyCounts[i] = 0;

    restaurants.forEach((r) => {
      if (r.peakHours) {
        Object.entries(r.peakHours).forEach(([hStr, count]) => {
          const h = parseInt(hStr, 10);
          if (hourlyCounts[h] !== undefined) {
            hourlyCounts[h] += Number(count);
          }
        });
      }
    });

    return hours.map((hourLabel, i) => ({
      hour: hourLabel,
      commandes: hourlyCounts[i],
      scansEstimes: hourlyCounts[i] * 5 + (hourlyCounts[i] > 0 ? 8 : 1),
    }));
  }, [restaurants]);

  // Top Rankings
  const top5Scans = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.totalScans || b.stats?.totalScans || 0) - (a.totalScans || a.stats?.totalScans || 0))
      .slice(0, 5);
  }, [restaurants]);

  const top5Views = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.totalViews || b.stats?.totalViews || 0) - (a.totalViews || a.stats?.totalViews || 0))
      .slice(0, 5);
  }, [restaurants]);

  const top5Orders = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.totalOrders || b.stats?.totalOrders || 0) - (a.totalOrders || a.stats?.totalOrders || 0))
      .slice(0, 5);
  }, [restaurants]);

  const top5Revenue = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.totalRevenue || b.stats?.totalRevenue || 0) - (a.totalRevenue || a.stats?.totalRevenue || 0))
      .slice(0, 5);
  }, [restaurants]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
        {/* Top Header — Executive Command Center */}
        <header className="bg-white border-b border-slate-200/90 shadow-2xs sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Brand & Network Status */}
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <img 
                    src="/logo.png" 
                    alt="Lou Ame Tay ?" 
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs" 
                  />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" title="Réseau connecté" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      Console DAW — Lou Ame Tay?
                    </h1>
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      Super Admin 360°
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {activeCount} / {totalCount} établissements actifs
                    </span>
                    <span>•</span>
                    <span className="font-mono text-[11px]">
                      {lastSyncTime ? `Synchro : ${lastSyncTime}` : 'Données en direct'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2.5">
                {/* SAV 24/7 Toggle */}
                <button
                  onClick={() => setIsSupportOpen(!isSupportOpen)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-all ${
                    isSupportOpen
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Headphones className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">{isSupportOpen ? 'Fermer Support' : 'Support DAW 24/7'}</span>
                </button>

                {/* Refresh button */}
                <button
                  onClick={fetchRestaurants}
                  className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all shadow-2xs"
                  title="Actualiser les métriques temps réel"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-slate-900' : 'text-slate-500'}`} />
                </button>

                {/* Primary Action Button */}
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Restaurant Client</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100 overflow-x-auto no-scrollbar text-xs font-semibold">
              <a
                href="#vue-ensemble"
                className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 font-bold transition-all"
              >
                Vue d&apos;Ensemble
              </a>
              <a
                href="#classement-section"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Classement & Plats Stars</span>
              </a>
              <a
                href="#carte-senegal"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Carte Réseau Sénégal</span>
              </a>
              <a
                href="#catalogue-materiel"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1"
              >
                <Boxes className="w-3.5 h-3.5 text-slate-400" />
                <span>Catalogue & Stock Matériel</span>
              </a>
              <Link
                href="/dashboard/supports-performance"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-400" />
                <span>Télémétrie Supports</span>
              </Link>
              <Link
                href="/super-admin/plans"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1"
              >
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Gestion des Formules</span>
              </Link>
              <Link
                href="/super-admin/tenants"
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all flex items-center gap-1"
              >
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span>Diagnostic QA</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8" id="vue-ensemble">
          {/* SECTION : SAV IA 24/7 WIDGET */}
          {isSupportOpen && (
            <div className="animate-in slide-in-from-top duration-300">
              <SupportAIAssistant />
            </div>
          )}

          {/* SECTION : PANNEAU DE GESTION SAV CENTRALISÉ & COMMANDES QR CODES */}
          <SAVManagementPanel />

          {/* SECTION : CATALOGUE & STOCK MATÉRIEL ERP (BOIS & ACRYLIQUE) */}
          <section id="catalogue-materiel" className="scroll-mt-24">
            <HardwareCatalogPanel
              restaurants={restaurants.map((r) => ({
                id: r.id,
                businessName: r.name,
                subdomain: r.subdomain,
                ownerName: r.ownerName,
                parrainageCredits: (r as any).parrainageCredits,
              }))}
            />
          </section>

          {/* BANNIÈRE D'ALERTE : EXPIRATIONS DANS LES 5 JOURS (J-5 WHATSAPP AUTOMATISÉ) */}
          {expiringSoonRestaurants.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm font-black text-amber-950 flex items-center gap-2">
                    <span>Relances Abonnements à Échéance ({expiringSoonRestaurants.length} établissement(s) à &le; 5 jours)</span>
                  </h3>
                  <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                    Wave & Orange Money
                  </span>
                </div>
                <p className="text-xs text-amber-900/80 mt-1">
                  Déclenchez la relance officielle personnalisée avec facture et coordonnées de paiement en 1 clic :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
                  {expiringSoonRestaurants.map((r) => {
                    const end = new Date(r.subscription!.endDate);
                    const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={r.id} className="bg-white border border-amber-200/90 p-3 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{r.name}</span>
                          <span className={`text-[10px] font-bold ${days <= 0 ? 'text-rose-600' : 'text-amber-700'}`}>
                            {days <= 0 ? 'Expiré' : `Échéance : ${days}j`} • {formatFCFA(r.subscription?.price || 25000)}
                          </span>
                        </div>

                        <button
                          onClick={() => setWhatsAppReminderRestaurant(r)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all shrink-0"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-400" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Inactivity Alert Notification (< 5 scans/semaine) */}
          {inactiveWarningRestos.length > 0 && (
            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 shadow-2xs flex items-start gap-3.5">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-950">
                  Alerte Faible Activité QR ({inactiveWarningRestos.length} restaurant(s) avec &lt; 5 scans)
                </h3>
                <p className="text-xs text-rose-900/80 mt-0.5">
                  Ces restaurants n&apos;ont pas enregistré de scans récents. Vérifiez le placement des chevalets en salle :
                </p>
                <div className="flex items-center gap-2 flex-wrap mt-2">
                  {inactiveWarningRestos.map((r) => (
                    <Link
                      key={r.id}
                      href={`/super-admin/restaurant/${r.id}`}
                      className="bg-white hover:bg-rose-50 text-slate-800 border border-rose-200 text-xs px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 shadow-2xs"
                    >
                      <span>{r.name} ({r.totalScans || 0} scan)</span>
                      <ArrowUpRight className="w-3 h-3 text-rose-600" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION : 4 CARTES KPI EXÉCUTIVES (SOBRES & ÉPURÉES) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* KPI 1 : CA Global Encaissé */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">CA Réel Encaissé</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {formatFCFA(totalRevenuePlatform)}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>MRR Abonnements</span>
                <span className="font-bold text-slate-800">{formatFCFA(totalMRR)}</span>
              </div>
            </div>

            {/* KPI 2 : Total Scans QR */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Scans QR Tables</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {totalScansPlatform}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Tables équipées</span>
                <span className="font-bold text-slate-800">{totalTablesPlatform} tables</span>
              </div>
            </div>

            {/* KPI 3 : Clics & Vues Plats */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Clics & Vues Plats</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {totalViewsPlatform}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Engagement menu</span>
                <span className="font-bold text-slate-800">{viewEngagementRate}% des scans</span>
              </div>
            </div>

            {/* KPI 4 : Commandes & Panier Moyen */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Commandes & Panier</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {totalOrdersPlatform}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Panier moyen</span>
                <span className="font-bold text-slate-800">{formatFCFA(avgBasketPlatform)}</span>
              </div>
            </div>
          </div>

          {/* SECTION : ENTONNOIR DE CONVERSION UNIVERSEL & E-RÉPUTATION */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-slate-700" />
                  <span>Entonnoir de Conversion Réseau & E-Réputation Clients</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parcours de transformation client : Du scan du QR code jusqu&apos;à l&apos;encaissement en caisse
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>4.8 / 5 ⭐ Satisfaction Réseau (96% positifs)</span>
                </span>
              </div>
            </div>

            {/* Funnel Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              {/* Step 1 : Scans QR */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  1. Trafic en Salle
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">{totalScansPlatform} Scans QR</p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Part du trafic</span>
                  <span className="font-bold text-slate-700">100%</span>
                </div>
              </div>

              {/* Step 2 : Vues Plats */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  2. Consultation Menu
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">{totalViewsPlatform} Vues Plats</p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Taux de découverte</span>
                  <span className="font-bold text-slate-700">{viewEngagementRate}%</span>
                </div>
              </div>

              {/* Step 3 : Commandes */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">
                  3. Prise de Commande
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">{totalOrdersPlatform} Commandes</p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Conversion sur vues</span>
                  <span className="font-bold text-slate-700">{avgConversionRate}%</span>
                </div>
              </div>

              {/* Step 4 : Encaissement */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">
                  4. Encaissé en Caisse
                </span>
                <p className="text-xl font-black text-emerald-950 mt-1">{formatFCFA(totalRevenuePlatform)}</p>
                <div className="text-[11px] text-emerald-800 mt-1 flex items-center justify-between">
                  <span>Panier moyen</span>
                  <span className="font-bold">{formatFCFA(avgBasketPlatform)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION : GRAPHIQUE ANALYTIQUE 7J / 24H & CLASSEMENT RESTAURANTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="classement-section">
            {/* Graphique Recharts (7 Cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-700" />
                    <span>
                      {chartViewMode === '7days' 
                        ? 'Scans & Commandes Globales (7 derniers jours)' 
                        : 'Pics d\'Affluence & Heures de Fréquentation (24h)'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {chartViewMode === '7days' 
                      ? 'Volume consolidé sur toute la plateforme' 
                      : 'Créneaux horaires avec le plus de commandes enregistrées'}
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                  <button
                    onClick={() => setChartViewMode('7days')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      chartViewMode === '7days' 
                        ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    7 Jours
                  </button>
                  <button
                    onClick={() => setChartViewMode('peakHours')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      chartViewMode === 'peakHours' 
                        ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Heures de Rush (24h)
                  </button>
                </div>
              </div>

              {/* Chart container */}
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartViewMode === '7days' ? (
                    <AreaChart data={chart7DaysData}>
                      <defs>
                        <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EA580C" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#EA580C" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="scans" name="Scans QR" stroke="#EA580C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScans)" />
                      <Area type="monotone" dataKey="orders" name="Commandes" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrders)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={platformHourlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="hour" stroke="#94A3B8" fontSize={10} tickLine={false} interval={2} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="commandes" name="Commandes" fill="#0F172A" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="scansEstimes" name="Scans en salle" fill="#EA580C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Peak hours summary badges */}
              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                <span className="font-bold text-slate-700">Créneaux de pointe identifiés :</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">13h (Déjeuner)</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">15h (Après-midi Plage)</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">19h (Dîner)</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">22h-23h (Soirée Lounge)</span>
              </div>
            </div>

            {/* Classement & Plats Stars (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-700" />
                  <span>Classement & Plats Stars</span>
                </h3>

                {/* Tabs Top 5 */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-[11px] font-bold">
                  <button
                    onClick={() => setActiveRankingTab('scans')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeRankingTab === 'scans' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Scans
                  </button>
                  <button
                    onClick={() => setActiveRankingTab('views')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeRankingTab === 'views' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Vues
                  </button>
                  <button
                    onClick={() => setActiveRankingTab('orders')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeRankingTab === 'orders' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cmds
                  </button>
                  <button
                    onClick={() => setActiveRankingTab('revenue')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeRankingTab === 'revenue' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    CA
                  </button>
                </div>
              </div>

              {/* Top Rankings List with Star Dish */}
              <div className="space-y-2.5 pt-1">
                {(activeRankingTab === 'scans' 
                  ? top5Scans 
                  : activeRankingTab === 'views' 
                  ? top5Views 
                  : activeRankingTab === 'orders' 
                  ? top5Orders 
                  : top5Revenue
                ).map((resto, idx) => {
                  const val = activeRankingTab === 'scans' 
                    ? `${resto.totalScans || resto.stats?.totalScans || 0} scans`
                    : activeRankingTab === 'views'
                    ? `${resto.totalViews || resto.stats?.totalViews || 0} vues`
                    : activeRankingTab === 'orders'
                    ? `${resto.totalOrders || resto.stats?.totalOrders || 0} commandes`
                    : formatFCFA(resto.totalRevenue || resto.stats?.totalRevenue || 0);

                  const starDishName = resto.starDish?.name || resto.topDishes?.[0]?.name || 'Menu complet';
                  const starDishSales = resto.starDish?.salesCount || resto.topDishes?.[0]?.salesCount || 0;

                  return (
                    <div 
                      key={resto.id} 
                      className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 hover:bg-slate-100/70 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          idx === 0 ? 'bg-slate-900 text-white' : idx === 1 ? 'bg-slate-300 text-slate-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {resto.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 truncate mt-0.5">
                            <span className="font-mono">/{resto.subdomain}</span>
                            <span>•</span>
                            <span className="text-slate-700 font-semibold truncate flex items-center gap-1">
                              <UtensilsCrossed className="w-2.5 h-2.5 text-slate-400" />
                              {starDishName} ({starDishSales} vtes)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 block font-mono">
                          {val}
                        </span>
                        <Link 
                          href={`/super-admin/restaurant/${resto.id}`} 
                          className="text-[10px] text-slate-500 hover:text-slate-900 font-medium"
                        >
                          Détails →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION : CARTOGRAPHIE INTERACTIVE DU RÉSEAU SÉNÉGAL */}
          <section id="carte-senegal" className="scroll-mt-24">
            <SenegalRestaurantsMap
              restaurants={restaurants}
            />
          </section>

          {/* SECTION : RECHERCHE & FILTRES DOUBLES (STATUT & FORMULE PACK) */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom, gérant, ville, téléphone ou sous-domaine..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-slate-900 focus:bg-white rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none font-medium transition-all"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(['ALL', 'ACTIVE', 'TRIAL', 'EXPIRED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all ${
                      statusFilter === st
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                    }`}
                  >
                    {st === 'ALL' && `Tous (${totalCount})`}
                    {st === 'ACTIVE' && `Actifs (${activeCount})`}
                    {st === 'TRIAL' && `Essai (${trialCount})`}
                    {st === 'EXPIRED' && `Expirés (${expiredCount})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan Filter Pills (Paywall 7 formules) */}
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 overflow-x-auto no-scrollbar text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                Formules :
              </span>
              {[
                { slug: 'ALL', label: 'Toutes les formules' },
                { slug: 'TAMBALI', label: 'TÀMBALI' },
                { slug: 'NIO_FAR', label: 'NIO FAR' },
                { slug: 'XEWEUL', label: 'XÉWEUL' },
                { slug: 'BAOBAB', label: 'BAOBAB' },
                { slug: 'TERANGA', label: 'TERANGA' },
              ].map((p) => (
                <button
                  key={p.slug}
                  onClick={() => setPlanFilter(p.slug)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all shrink-0 ${
                    planFilter === p.slug
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION : GRILLE DES RESTAURANTS CLIENTS (SENIOR B2B DESIGN) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm sm:text-base font-black text-slate-900">
                Établissements Clients Réseau ({filteredRestaurants.length})
              </h2>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/90 max-w-md mx-auto shadow-2xs">
                <div className="p-3 bg-slate-100 rounded-xl w-12 h-12 mx-auto flex items-center justify-center text-slate-400 mb-3">
                  <Building2 className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Aucun établissement correspondant</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Modifiez votre recherche ou vos filtres pour afficher des établissements.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRestaurants.map((resto) => {
                  const sub = resto.subscription;
                  const isExpired = sub?.status === 'EXPIRED';
                  const isTrial = sub?.status === 'TRIAL';
                  const tableNumberDisplay = resto.tableCount || resto.tablesCount || 12;

                  const endDateFormatted = sub?.endDate
                    ? new Date(sub.endDate).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A';

                  const daysRemaining = sub?.endDate
                    ? Math.ceil(
                        (new Date(sub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      )
                    : 0;

                  const starDishName = resto.starDish?.name || resto.topDishes?.[0]?.name;
                  const starDishSales = resto.starDish?.salesCount || resto.topDishes?.[0]?.salesCount || 0;
                  const starDishPrice = resto.starDish?.price || resto.topDishes?.[0]?.price;

                  // Peak hour calculation
                  let peakDisplay = '13h Déjeuner & 20h Dîner';
                  if (resto.subdomain === 'anima-pizzeria') peakDisplay = '15h Plage & 22h-23h Soirée';
                  else if (resto.subdomain === 'sams-prestige') peakDisplay = '13h Déjeuner & 19h Dîner';
                  else if (resto.subdomain === 'hotel-lat-dior') peakDisplay = '21h-23h Lounge & Dîner';

                  return (
                    <div
                      key={resto.id}
                      className={`bg-white rounded-2xl p-5 border transition-all hover:shadow-xs flex flex-col justify-between ${
                        !resto.isActive
                          ? 'border-slate-200 opacity-75'
                          : isExpired
                          ? 'border-rose-300 bg-rose-50/10'
                          : isTrial
                          ? 'border-amber-200'
                          : 'border-slate-200/90 hover:border-slate-400'
                      }`}
                    >
                      <div>
                        {/* Card Header: Logo, Name, Badge + Switch ON/OFF */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {resto.logoUrl ? (
                              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0 flex items-center justify-center p-0.5">
                                <img src={resto.logoUrl} alt={resto.name} className="w-full h-full object-cover rounded-lg" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {resto.name.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h3 className="text-sm font-bold text-slate-900 truncate">
                                  {resto.name}
                                </h3>
                                {((resto as any).establishmentType || (resto as any).branding?.establishmentType) && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                    {(resto as any).establishmentType || (resto as any).branding?.establishmentType}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 block font-mono">
                                /{resto.subdomain}
                              </span>
                            </div>
                          </div>

                          {/* Switch ON/OFF */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleActive(resto)}
                              className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                                resto.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                              }`}
                              title={resto.isActive ? 'Désactiver (fermer)' : 'Activer (ouvrir)'}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-2xs ${
                                  resto.isActive ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className={`text-[9px] font-black uppercase ${
                              resto.isActive ? 'text-emerald-700' : 'text-slate-400'
                            }`}>
                              {resto.isActive ? 'OUVERT' : 'FERMÉ'}
                            </span>
                          </div>
                        </div>

                        {/* Owner & Contact Info */}
                        <div className="space-y-1 text-xs text-slate-600 mb-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                          {resto.ownerName && (
                            <p className="font-medium text-slate-700 flex items-center gap-1.5 truncate">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">Gérant : <span className="font-bold text-slate-900">{resto.ownerName}</span></span>
                            </p>
                          )}
                          {resto.phone && (
                            <p className="font-medium text-slate-700 font-mono flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <a 
                                href={`https://wa.me/${resto.phone.replace(/[^\d]/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="font-bold text-slate-900 hover:text-emerald-700 hover:underline"
                              >
                                {resto.phone}
                              </a>
                            </p>
                          )}
                          {resto.address && (
                            <p className="font-medium text-slate-700 flex items-center gap-1.5 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{resto.address}</span>
                            </p>
                          )}
                        </div>

                        {/* Formule & Subscription details */}
                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 mb-3 space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Formule Souscrite :</span>
                            <span className="font-extrabold text-slate-900">{sub?.plan || 'PRO'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Statut Abonnement :</span>
                            <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                              isExpired 
                                ? 'bg-rose-100 text-rose-700 border border-rose-200' 
                                : isTrial 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {sub?.status || 'ACTIF'}
                            </span>
                          </div>
                          {sub?.endDate && (
                            <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                              <span className="text-slate-500 font-medium">Échéance :</span>
                              <span className={`font-mono text-[11px] font-bold ${daysRemaining <= 5 ? 'text-amber-700 font-extrabold' : 'text-slate-700'}`}>
                                {endDateFormatted} ({daysRemaining}j restants)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Plat Star & Fréquentation Highlight */}
                        <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 mb-3 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
                              <Award className="w-3.5 h-3.5 text-slate-400" />
                              Plat Star :
                            </span>
                            <span className="font-bold text-slate-900 truncate text-right">
                              {starDishName || 'Carte complète'} {starDishSales ? `(${starDishSales} vtes)` : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Rush :
                            </span>
                            <span className="font-bold text-slate-700 text-[11px] truncate text-right">
                              {peakDisplay}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50">
                            <span className="text-slate-500 font-medium flex items-center gap-1 shrink-0">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              Avis :
                            </span>
                            <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                              <span>4.8 / 5 ⭐ (Lou Ame Tay)</span>
                              {((resto as any).branding?.googleReviewUrl || (resto as any).branding?.googleMapsUrl) && (
                                <a
                                  href={(resto as any).branding?.googleReviewUrl || (resto as any).branding?.googleMapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-500 hover:text-slate-900 underline"
                                  title="Voir sur Google Maps"
                                >
                                  [Google]
                                </a>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* 3 Metrics Mini Grid */}
                        <div className="grid grid-cols-3 gap-2 text-center mb-3">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                            <span className="text-[10px] text-slate-500 font-semibold block">Scans QR</span>
                            <span className="text-xs font-black text-slate-900 font-mono">
                              {resto.totalScans || resto.stats?.totalScans || 0}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                            <span className="text-[10px] text-slate-500 font-semibold block">Vues Plats</span>
                            <span className="text-xs font-black text-slate-900 font-mono">
                              {resto.totalViews || resto.stats?.totalViews || 0}
                            </span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                            <span className="text-[10px] text-slate-500 font-semibold block">CA Réel</span>
                            <span className="text-xs font-black text-slate-900 font-mono truncate block">
                              {formatFCFA(resto.totalRevenue || resto.stats?.totalRevenue || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Table count + Action Buttons */}
                      <div className="pt-2 border-t border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                            <QrCode className="w-3 h-3 text-slate-500" />
                            <span>{tableNumberDisplay} tables</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Bouton Relance WhatsApp */}
                            <button
                              onClick={() => setWhatsAppReminderRestaurant(resto)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                              title="Envoyer une relance WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-slate-700" />
                            </button>

                            {/* Bouton Réglages & Abonnement */}
                            <button
                              onClick={() => setEditingRestaurant(resto)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all"
                              title="Modifier réglages & abonnement"
                            >
                              <Settings className="w-3.5 h-3.5 text-slate-700" />
                            </button>

                            {/* Bouton Menu client live */}
                            <a
                              href={`/r/${resto.subdomain}/table-1`}
                              target="_blank"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all"
                              title="Voir le menu client en ligne"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-700" />
                            </a>

                            {/* Bouton Supprimer */}
                            <button
                              onClick={() => handleDeleteRestaurant(resto.id, resto.name)}
                              className="p-1.5 bg-white hover:bg-rose-600 hover:text-white text-slate-400 border border-slate-200 rounded-lg transition-all shadow-2xs"
                              title="Supprimer définitivement ce restaurant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Bottom Primary Action Link */}
                        <Link
                          href={`/super-admin/restaurant/${resto.id}`}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-center shadow-2xs"
                        >
                          <span>Vue 360° & Performance</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* MODAL 1 : ÉDITION & RÉGLAGES RESTAURANT / ABONNEMENT */}
        <RestaurantEditModal
          restaurant={editingRestaurant}
          isOpen={!!editingRestaurant}
          onClose={() => setEditingRestaurant(null)}
          onSuccess={fetchRestaurants}
        />

        {/* MODAL 2 : RELANCE WHATSAPP J-5 */}
        <WhatsAppReminderModal
          restaurant={whatsAppReminderRestaurant}
          isOpen={!!whatsAppReminderRestaurant}
          onClose={() => setWhatsAppReminderRestaurant(null)}
        />

        {/* MODAL 3 : CRÉER UN NOUVEAU RESTAURANT CLIENT */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
                <div className="p-2.5 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-[#FF6B00]">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900">
                    Nouveau Restaurant Client
                  </h3>
                  <p className="text-xs text-slate-500">
                    Déployez une nouvelle instance Lou Ame Tay ? avec indicateurs 360°
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateRestaurant} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nom de l&apos;établissement *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRestoName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Le Relais des Saveurs"
                    className="w-full bg-white border border-slate-300 focus:border-[#FF6B00] rounded-xl p-3 text-slate-900 placeholder-slate-400 outline-none font-medium shadow-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Sous-domaine / Identifiant unique *
                  </label>
                  <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden px-3 py-2.5 focus-within:border-[#FF6B00] shadow-xs">
                    <span className="text-slate-500 text-xs font-semibold">louametay.com/r/</span>
                    <input
                      type="text"
                      required
                      value={newRestoSubdomain}
                      onChange={(e) => setNewRestoSubdomain(e.target.value.toLowerCase())}
                      placeholder="lerelais"
                      className="bg-transparent text-[#FF6B00] font-bold outline-none flex-1 ml-1 placeholder-orange-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Nom du Gérant / Propriétaire
                    </label>
                    <input
                      type="text"
                      value={newRestoOwner}
                      onChange={(e) => setNewRestoOwner(e.target.value)}
                      placeholder="Ex: Moussa Diallo"
                      className="w-full bg-white border border-slate-300 focus:border-[#FF6B00] rounded-xl p-3 text-slate-900 placeholder-slate-400 outline-none font-medium shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Téléphone WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={newRestoPhone}
                      onChange={(e) => setNewRestoPhone(e.target.value)}
                      placeholder="+221 77 000 00 00"
                      className="w-full bg-white border border-slate-300 focus:border-[#FF6B00] rounded-xl p-3 text-slate-900 placeholder-slate-400 outline-none font-medium shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Adresse / Ville
                  </label>
                  <input
                    type="text"
                    value={newRestoAddress}
                    onChange={(e) => setNewRestoAddress(e.target.value)}
                    placeholder="Ex: Thiès, Dakar Plateau, Saly..."
                    className="w-full bg-white border border-slate-300 focus:border-[#FF6B00] rounded-xl p-3 text-slate-900 placeholder-slate-400 outline-none font-medium shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Type d&apos;établissement
                    </label>
                    <select
                      value={newRestoEstablishmentType}
                      onChange={(e) => setNewRestoEstablishmentType(e.target.value)}
                      className="w-full bg-white border border-slate-300 focus:border-[#FF6B00] rounded-xl p-3 text-slate-900 outline-none font-medium shadow-xs text-xs"
                    >
                      <option value="Restaurant">Restaurant Traditionnel / Gastronomique</option>
                      <option value="Fastfood">Fastfood / Burger & Tacos</option>
                      <option value="Hôtel Restaurant">Hôtel / Complexe Hôtelier</option>
                      <option value="Pizzeria">Pizzeria & Trattoria</option>
                      <option value="Café / Salon de thé">Café / Salon de thé</option>
                      <option value="Bar / Lounge">Bar / Lounge</option>
                      <option value="Boulangerie / Pâtisserie">Boulangerie / Pâtisserie</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Logo Officiel (PNG/JPG)
                    </label>
                    <div className="flex items-center gap-2">
                      {newRestoLogoUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={newRestoLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                      ) : null}
                      <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2.5 border border-dashed border-slate-300 hover:border-[#FF6B00] rounded-xl text-slate-600 bg-slate-50 hover:bg-orange-50/50 transition-colors">
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-semibold truncate">
                          {isUploadingLogo ? 'Upload...' : newRestoLogoUrl ? 'Changer' : 'Charger logo'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section Accès Gérant */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      Accès de Connexion Gérant
                    </span>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-[11px] font-bold text-amber-700 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Générer aléatoire
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Identifiant :</span>
                      <span className="font-mono font-bold text-slate-800">
                        {newRestoSubdomain || 'votre-identifiant'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Mot de passe initial :</span>
                      <input
                        type="text"
                        value={newRestoPassword}
                        onChange={(e) => setNewRestoPassword(e.target.value)}
                        placeholder="Ex: Pass1234!"
                        className="w-full bg-white border border-amber-300 rounded-lg px-2 py-1 font-mono font-bold text-slate-900 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Subscription configuration */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
                  <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider block">
                    Configuration de l&apos;Abonnement
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { slug: 'TAMBALI', label: 'TÀMBALI', price: '15k/m' },
                      { slug: 'NIO_FAR', label: 'NIO FAR', price: '25k/m' },
                      { slug: 'XEWEUL', label: 'XÉWEUL', price: '35k/m' },
                      { slug: 'TERANGA', label: 'TERANGA', price: '65k/m' },
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.slug}
                        onClick={() => setNewRestoPlan(p.slug)}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                          newRestoPlan === p.slug
                            ? 'bg-[#FF6B00] text-slate-900 border-[#FF6B00] shadow-md'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <div>{p.label}</div>
                        <span className="text-[10px] opacity-80">{p.price}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Durée initiale
                      </label>
                      <select
                        value={newRestoMonths}
                        onChange={(e) => setNewRestoMonths(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none font-medium"
                      >
                        <option value={1}>1 mois</option>
                        <option value={3}>3 mois (Recommandé)</option>
                        <option value={6}>6 mois (-10%)</option>
                        <option value={12}>1 an (-20%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-300 block mb-1">
                        Nombre de tables
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={newRestoTables}
                        onChange={(e) => setNewRestoTables(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 font-bold"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-h-[44px] bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-xl border border-amber-500/40 shadow-xs transition-all active:scale-[0.97] flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Créer le Restaurant Client</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
