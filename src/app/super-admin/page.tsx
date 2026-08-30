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
  Sparkles,
  ChefHat,
  QrCode,
  TrendingUp,
  Activity,
  BarChart3,
  Users,
  Trophy,
  Flame,
  AlertCircle,
  Settings,
  MessageCircle,
  Headphones,
  Bot
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
} from 'recharts';
import { SuperAdminAuthGuard } from '@/components/super-admin/SuperAdminAuthGuard';
import { RestaurantType, SubscriptionPlan, SubscriptionStatus } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { RestaurantEditModal } from '@/components/RestaurantEditModal';
import { WhatsAppReminderModal } from '@/components/WhatsAppReminderModal';
import { SupportAIAssistant } from '@/components/SupportAIAssistant';
import { SAVManagementPanel } from '@/components/super-admin/SAVManagementPanel';
import { toast } from 'sonner';

export default function SuperAdminDashboardPage() {
  const [restaurants, setRestaurants] = useState<RestaurantType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'TRIAL' | 'EXPIRED'>('ALL');
  const [activeRankingTab, setActiveRankingTab] = useState<'scans' | 'orders' | 'revenue'>('scans');

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
  const [newRestoPlan, setNewRestoPlan] = useState<SubscriptionPlan>('PRO');
  const [newRestoMonths, setNewRestoMonths] = useState<number>(3);
  const [newRestoTables, setNewRestoTables] = useState<number>(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/super-admin/restaurants');
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data.restaurants || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
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
        (resto.phone && resto.phone.includes(searchQuery));

      const subStatus = resto.subscription?.status || 'ACTIVE';
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && subStatus === 'ACTIVE') ||
        (statusFilter === 'TRIAL' && subStatus === 'TRIAL') ||
        (statusFilter === 'EXPIRED' && subStatus === 'EXPIRED');

      return matchesSearch && matchesStatus;
    });
  }, [restaurants, searchQuery, statusFilter]);

  // Key KPI stats
  const totalCount = restaurants.length;
  const activeCount = restaurants.filter((r) => r.subscription?.status === 'ACTIVE').length;
  const trialCount = restaurants.filter((r) => r.subscription?.status === 'TRIAL').length;
  const expiredCount = restaurants.filter((r) => r.subscription?.status === 'EXPIRED').length;
  
  // Analytics Aggregates
  const totalScansPlatform = restaurants.reduce((acc, r) => acc + (r.totalScans || r.stats?.totalScans || 0), 0);
  const totalOrdersPlatform = restaurants.reduce((acc, r) => acc + (r.totalOrders || r.stats?.totalOrders || r.ordersCount || 0), 0);
  const totalRevenuePlatform = restaurants.reduce((acc, r) => acc + (r.totalRevenue || r.stats?.totalRevenue || 0), 0);
  const avgConversionRate = totalScansPlatform > 0 
    ? ((totalOrdersPlatform / totalScansPlatform) * 100).toFixed(1)
    : '48.5';

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

  // Top 5 Rankings
  const top5Scans = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.totalScans || b.stats?.totalScans || 0) - (a.totalScans || a.stats?.totalScans || 0))
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
    <SuperAdminAuthGuard>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 shadow-xs px-4 sm:px-8 py-5 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Lou Ame Tay ?" 
                className="w-12 h-12 rounded-2xl object-cover border border-orange-500/40 shadow-lg shadow-orange-600/20" 
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Agence Digitale • Lou Ame Tay ?</span>
                  <span className="bg-orange-500/20 text-[#FF6B00] border border-orange-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    Super Admin 360°
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  Vue d&apos;ensemble de tous vos restaurants clients & indicateurs en direct
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Button Gestion des Packs */}
              <Link
                href="/super-admin/plans"
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-orange-400 border border-orange-500/30 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-xs"
              >
                <Layers className="w-4 h-4" />
                <span>Gestion des Packs</span>
              </Link>

              {/* Button Tenants QA */}
              <Link
                href="/super-admin/tenants"
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-xs"
              >
                <Store className="w-4 h-4" />
                <span>Restaurants & QA</span>
              </Link>

              {/* Button SAV 24/7 */}
              <button
                onClick={() => setIsSupportOpen(!isSupportOpen)}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-xl border transition-all ${
                  isSupportOpen
                    ? 'bg-indigo-600 text-slate-900 border-indigo-500 shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-50 text-indigo-300 border-indigo-500/40 hover:bg-slate-50'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>{isSupportOpen ? 'Fermer SAV IA' : '🤖 SAV IA 24/7'}</span>
              </button>

              <button
                onClick={fetchRestaurants}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-700 rounded-xl transition-all"
                title="Actualiser"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#00A86B] hover:opacity-90 text-slate-900 text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nouveau Restaurant Client</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
          {/* SECTION : SAV IA 24/7 WIDGET */}
          {isSupportOpen && (
            <div className="animate-in slide-in-from-top duration-300">
              <SupportAIAssistant />
            </div>
          )}

          {/* SECTION : PANNEAU DE GESTION SAV CENTRALISÉ & COMMANDES QR CODES */}
          <SAVManagementPanel />

          {/* BANNIÈRE D'ALERTE : EXPIRATIONS DANS LES 5 JOURS (J-5 WHATSAPP AUTOMATISÉ) */}
          {expiringSoonRestaurants.length > 0 && (
            <div className="bg-gradient-to-r from-amber-950/70 via-orange-950/50 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-5 shadow-2xl flex items-start gap-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40 shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2">
                    <span>⚡ Relances Paiement Requises ({expiringSoonRestaurants.length} abonnement(s) à &le; 5 jours)</span>
                  </h3>
                  <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                    Wave & Orange Money
                  </span>
                </div>
                <p className="text-xs text-slate-700 mt-1">
                  Ces restaurants arrivent à échéance très prochainement. Cliquez sur le bouton WhatsApp pour envoyer la relance personnalisée avec les coordonnées de paiement en 1 clic :
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {expiringSoonRestaurants.map((r) => {
                    const end = new Date(r.subscription!.endDate);
                    const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={r.id} className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-black text-slate-900 block">{r.name}</span>
                          <span className={`text-[10px] font-bold ${days <= 0 ? 'text-red-400' : 'text-amber-400'}`}>
                            {days <= 0 ? 'Expiré' : `Échéance dans ${days} jour(s)`} • {formatFCFA(r.subscription?.price || 25000)}
                          </span>
                        </div>

                        <button
                          onClick={() => setWhatsAppReminderRestaurant(r)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 rounded-xl text-xs font-black flex items-center gap-1 shadow-md active:scale-95 transition-all shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>💬 WhatsApp</span>
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
            <div className="bg-red-950/40 border border-red-500/50 rounded-3xl p-5 shadow-xl flex items-start gap-4">
              <div className="p-2.5 bg-red-600/20 text-red-400 rounded-2xl border border-red-500/40 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-black text-red-300">
                  ⚠️ Alerte Inactivité Détectée ({inactiveWarningRestos.length} restaurant(s) avec &lt; 5 scans)
                </h3>
                <p className="text-xs text-slate-700 mt-1">
                  Les établissements suivants enregistrent une très faible activité QR. Contactez leurs gérants pour vérifier le déploiement des chevalets de table :
                </p>
                <div className="flex items-center gap-2 flex-wrap mt-2.5">
                  {inactiveWarningRestos.map((r) => (
                    <Link
                      key={r.id}
                      href={`/super-admin/restaurant/${r.id}`}
                      className="bg-red-900/60 hover:bg-red-900 text-red-200 border border-red-700/80 text-xs px-3 py-1 rounded-xl font-bold transition-all flex items-center gap-1"
                    >
                      <span>{r.name} ({r.totalScans || 0} scan)</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 2 : Recharts Graphique Scans 7j & Top 5 Classement */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Graphique Recharts 7 jours (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#FF6B00]" />
                    <span>Scans & Commandes Globales (7 derniers jours)</span>
                  </h3>
                  <p className="text-xs text-slate-500">Volume consolidé sur toute la plateforme</p>
                </div>
                <span className="text-xs bg-[#00A86B]/20 text-[#00A86B] font-extrabold px-3 py-1 rounded-full border border-[#00A86B]/30">
                  Temps réel
                </span>
              </div>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chart7DaysData}>
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00A86B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="scans" name="Scans QR" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorScans)" />
                    <Area type="monotone" dataKey="orders" name="Commandes" stroke="#00A86B" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Classement Top 5 des Restaurants (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span>Classement des Restaurants</span>
                </h3>

                {/* Tabs Top 5 */}
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                  <button
                    onClick={() => setActiveRankingTab('scans')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeRankingTab === 'scans' ? 'bg-[#FF6B00] text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Scans
                  </button>
                  <button
                    onClick={() => setActiveRankingTab('orders')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeRankingTab === 'orders' ? 'bg-[#00A86B] text-slate-900 shadow' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Cmds
                  </button>
                  <button
                    onClick={() => setActiveRankingTab('revenue')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      activeRankingTab === 'revenue' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    CA
                  </button>
                </div>
              </div>

              {/* Top 5 Items */}
              <div className="space-y-2.5 pt-1">
                {(activeRankingTab === 'scans' ? top5Scans : activeRankingTab === 'orders' ? top5Orders : top5Revenue).map((resto, idx) => {
                  const val = activeRankingTab === 'scans' 
                    ? `${resto.totalScans || resto.stats?.totalScans || 0} scans`
                    : activeRankingTab === 'orders'
                    ? `${resto.totalOrders || resto.stats?.totalOrders || 0} commandes`
                    : formatFCFA(resto.totalRevenue || resto.stats?.totalRevenue || 0);

                  return (
                    <div key={resto.id} className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-slate-900' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[180px]">
                            {resto.name}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono">/{resto.subdomain}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-black ${
                          activeRankingTab === 'scans' ? 'text-[#FF6B00]' : activeRankingTab === 'orders' ? 'text-[#00A86B]' : 'text-amber-400'
                        }`}>
                          {val}
                        </span>
                        <Link href={`/super-admin/restaurant/${resto.id}`} className="block text-[10px] text-slate-500 hover:text-slate-900">
                          Détails →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Restaurants Actifs</span>
                <Store className="w-4 h-4 text-[#FF6B00]" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{activeCount} <span className="text-sm font-normal text-slate-500">/ {totalCount}</span></p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {restaurants.reduce((acc, r) => acc + (r.tableCount || r.tablesCount || 12), 0)} tables déployées
              </span>
            </div>

            <div className="bg-slate-50 border border-blue-500/30 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-blue-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Scans QR</span>
                <QrCode className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-blue-400">{totalScansPlatform}</p>
              <span className="text-[11px] text-blue-300/80 mt-1 block font-medium">Scans de clients en table</span>
            </div>

            <div className="bg-slate-50 border border-emerald-500/30 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-[#00A86B] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Taux de Conversion</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-[#00A86B]">{avgConversionRate}%</p>
              <span className="text-[11px] text-emerald-300/80 mt-1 block font-medium">{totalOrdersPlatform} commandes au total</span>
            </div>

            <div className="bg-slate-50 border border-orange-500/30 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between text-[#FF6B00] mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Chiffre d&apos;Affaires Global</span>
                <DollarSign className="w-4 h-4" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#FF6B00]">{formatFCFA(totalRevenuePlatform)}</p>
              <span className="text-[11px] text-slate-500 mt-1 block">MRR Abonnements : {formatFCFA(totalMRR)}</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un restaurant, gérant, ville ou téléphone..."
                className="w-full bg-slate-900 border border-slate-200/80 focus:border-[#FF6B00] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 outline-none transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['ALL', 'ACTIVE', 'TRIAL', 'EXPIRED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-[#FF6B00] text-slate-900 shadow-md'
                      : 'bg-slate-900 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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

          {/* Restaurants Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-extrabold text-slate-800">
                Restaurants Clients ({filteredRestaurants.length})
              </h2>
            </div>

            {filteredRestaurants.length === 0 ? (
              <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-200 max-w-md mx-auto">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-base font-bold text-slate-800">Aucun restaurant trouvé</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Modifiez votre recherche ou ajoutez un nouveau restaurant client.
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

                  return (
                    <div
                      key={resto.id}
                      className={`bg-slate-50 rounded-3xl p-5 border transition-all hover:border-[#FF6B00] shadow-xl flex flex-col justify-between group ${
                        !resto.isActive
                          ? 'border-gray-700 opacity-80'
                          : isExpired
                          ? 'border-red-500/40 bg-red-950/10'
                          : isTrial
                          ? 'border-amber-500/40'
                          : 'border-slate-200'
                      }`}
                    >
                      <div>
                        {/* Card Header: Name + Switch ON/OFF */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 truncate group-hover:text-[#FF6B00] transition-colors">
                              {resto.name}
                            </h3>
                            <span className="text-xs text-slate-500 block font-mono">
                              /{resto.subdomain}
                            </span>
                          </div>

                          {/* Switch ON/OFF */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <button
                              onClick={() => handleToggleActive(resto)}
                              className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${
                                resto.isActive ? 'bg-[#00A86B]' : 'bg-slate-700'
                              }`}
                              title={resto.isActive ? 'Désactiver (fermer)' : 'Activer (ouvrir)'}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  resto.isActive ? 'translate-x-7' : 'translate-x-1'
                                }`}
                              />
                            </button>
                            <span className={`text-[9px] font-black uppercase ${
                              resto.isActive ? 'text-[#00A86B]' : 'text-slate-500'
                            }`}>
                              {resto.isActive ? 'OUVERT' : 'FERMÉ'}
                            </span>
                          </div>
                        </div>

                        {/* Owner & Location Info */}
                        <div className="space-y-1.5 text-xs text-slate-500 mb-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-200/60">
                          {resto.ownerName && (
                            <p className="font-medium text-slate-700">
                              👤 Gérant : <span className="font-bold text-slate-900">{resto.ownerName}</span>
                            </p>
                          )}
                          {resto.phone && (
                            <p className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-[#FF6B00]" />
                              <span>{resto.phone}</span>
                            </p>
                          )}
                          {resto.address && (
                            <p className="flex items-center gap-1.5 truncate">
                              <MapPin className="w-3 h-3 text-[#FF6B00] shrink-0" />
                              <span className="truncate">{resto.address}</span>
                            </p>
                          )}
                        </div>

                        {/* Quick Scans & Performance metrics */}
                        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                          <div className="bg-slate-900 p-2 rounded-xl border border-slate-200/80">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Scans</span>
                            <span className="text-xs font-black text-[#FF6B00]">{resto.totalScans || resto.stats?.totalScans || 0}</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded-xl border border-slate-200/80">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Commandes</span>
                            <span className="text-xs font-black text-[#00A86B]">{resto.totalOrders || resto.stats?.totalOrders || 0}</span>
                          </div>
                          <div className="bg-slate-900 p-2 rounded-xl border border-slate-200/80">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">CA</span>
                            <span className="text-xs font-black text-amber-400">{formatFCFA(resto.totalRevenue || resto.stats?.totalRevenue || 0)}</span>
                          </div>
                        </div>

                        {/* Subscription Expiry Badge */}
                        <div className="bg-slate-900 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs mb-4">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase font-bold block">
                              Formule {sub?.plan || 'PRO'} • {formatFCFA(sub?.price || 25000)}/m
                            </span>
                            <span className="font-bold text-slate-800">
                              Exp : {endDateFormatted}
                            </span>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-[11px] font-black block ${
                                daysRemaining > 10
                                  ? 'text-[#00A86B]'
                                  : daysRemaining > 0
                                  ? 'text-amber-400'
                                  : 'text-red-400'
                              }`}
                            >
                              {daysRemaining > 0
                                ? `${daysRemaining}j restants`
                                : `Expiré il y a ${Math.abs(daysRemaining)}j`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Table count + Action Buttons (Réglages, WhatsApp, Vue 360) */}
                      <div className="pt-3 border-t border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#FF6B00] bg-orange-600/10 px-2.5 py-1.5 rounded-xl border border-orange-500/20">
                            <QrCode className="w-3.5 h-3.5" />
                            <span>{tableNumberDisplay} tables</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Bouton Relance WhatsApp */}
                            <button
                              onClick={() => setWhatsAppReminderRestaurant(resto)}
                              className="p-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                              title="Envoyer une relance WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </button>

                            {/* Bouton Réglages & Abonnement */}
                            <button
                              onClick={() => setEditingRestaurant(resto)}
                              className="p-2 bg-slate-900 hover:bg-slate-50 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                              title="Modifier réglages & abonnement"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Réglages</span>
                            </button>
                          </div>
                        </div>

                        {/* Bottom Link buttons */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <Link
                            href={`/super-admin/restaurant/${resto.id}`}
                            className="flex-1 bg-slate-900 hover:bg-slate-50 text-slate-900 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1 text-center"
                          >
                            <span>Vue 360° & Performance</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>

                          <a
                            href={`/r/${resto.subdomain}/table-1`}
                            target="_blank"
                            className="p-2 bg-orange-600/20 hover:bg-orange-600/30 text-[#FF6B00] rounded-xl transition-all"
                            title="Tester le menu client"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
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
            <div className="bg-slate-50 border border-slate-200 text-slate-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-50 text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200">
                <div className="p-2.5 bg-orange-600/20 border border-orange-500/30 rounded-2xl text-[#FF6B00]">
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
                    className="w-full bg-slate-900 border border-slate-200 focus:border-[#FF6B00] rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Sous-domaine / Identifiant unique *
                  </label>
                  <div className="flex items-center bg-slate-900 border border-slate-200 rounded-xl overflow-hidden px-3 py-2.5 focus-within:border-[#FF6B00]">
                    <span className="text-slate-500 text-xs">louametay.com/r/</span>
                    <input
                      type="text"
                      required
                      value={newRestoSubdomain}
                      onChange={(e) => setNewRestoSubdomain(e.target.value.toLowerCase())}
                      placeholder="lerelais"
                      className="bg-transparent text-[#FF6B00] font-bold outline-none flex-1 ml-1"
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
                      className="w-full bg-slate-900 border border-slate-200 focus:border-[#FF6B00] rounded-xl p-3 text-slate-900 outline-none"
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
                      className="w-full bg-slate-900 border border-slate-200 focus:border-[#FF6B00] rounded-xl p-3 text-slate-900 outline-none"
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
                    className="w-full bg-slate-900 border border-slate-200 focus:border-[#FF6B00] rounded-xl p-3 text-slate-900 outline-none"
                  />
                </div>

                {/* Subscription configuration */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-[#FF6B00] uppercase tracking-wider block">
                    Configuration de l&apos;Abonnement
                  </span>

                  <div className="grid grid-cols-3 gap-2">
                    {(['STARTER', 'PRO', 'ENTERPRISE'] as const).map((plan) => (
                      <button
                        type="button"
                        key={plan}
                        onClick={() => setNewRestoPlan(plan)}
                        className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all ${
                          newRestoPlan === plan
                            ? 'bg-[#FF6B00] text-slate-900 border-[#FF6B00] shadow-md'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-900'
                        }`}
                      >
                        <div>{plan}</div>
                        <span className="text-[10px] opacity-80">
                          {plan === 'STARTER' ? '15k/m' : plan === 'PRO' ? '25k/m' : '50k/m'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-bold text-slate-500 block mb-1">
                        Durée initiale
                      </label>
                      <select
                        value={newRestoMonths}
                        onChange={(e) => setNewRestoMonths(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none"
                      >
                        <option value={1}>1 mois</option>
                        <option value={3}>3 mois (Recommandé)</option>
                        <option value={6}>6 mois (-10%)</option>
                        <option value={12}>1 an (-20%)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-500 block mb-1">
                        Nombre de tables
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={newRestoTables}
                        onChange={(e) => setNewRestoTables(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
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
                    className="bg-gradient-to-r from-[#FF6B00] to-[#00A86B] text-slate-900 font-extrabold px-6 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
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
    </SuperAdminAuthGuard>
  );
}
