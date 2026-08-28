'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Store, 
  ArrowLeft, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Phone, 
  MapPin, 
  Calendar, 
  RefreshCw, 
  Search,
  Filter,
  AlertTriangle,
  Play,
  Clock,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { SaaSTenant, SaaSPlan } from '@/types/saas';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';
import { SuperAdminAuthGuard } from '@/components/super-admin/SuperAdminAuthGuard';

export default function SuperAdminTenantsListPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State (Scale 1000 clients)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Test Modal state
  const [testingTenant, setTestingTenant] = useState<any | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isTesting, setIsTesting] = useState(false);

  // Upgrade Modal state
  const [upgradingTenant, setUpgradingTenant] = useState<any | null>(null);
  const [selectedNewPlanId, setSelectedNewPlanId] = useState<string>('plan_pro');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCronRunning, setIsCronRunning] = useState(false);

  const fetchData = async () => {
    try {
      const [resTenants, resPlans] = await Promise.all([
        fetch('/api/admin/tenants?sortBy=lastSeenAt'),
        fetch('/api/admin/plans'),
      ]);

      if (resTenants.ok && resPlans.ok) {
        const dataTenants = await resTenants.json();
        const dataPlans = await resPlans.json();
        setTenants(dataTenants.tenants || []);
        setPlans(dataPlans.plans || []);
      }
    } catch (e) {
      toast.error('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered tenants list
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const query = searchQuery.toLowerCase().trim();
      const matchQuery = 
        !query ||
        t.businessName.toLowerCase().includes(query) ||
        (t.ownerName && t.ownerName.toLowerCase().includes(query)) ||
        t.phone.includes(query) ||
        t.subdomain.toLowerCase().includes(query);

      const matchCity = selectedCity === 'ALL' || (t.city && t.city.toLowerCase() === selectedCity.toLowerCase());
      const matchStatus = selectedStatus === 'ALL' || t.subscriptionStatus === selectedStatus;

      return matchQuery && matchCity && matchStatus;
    });
  }, [tenants, searchQuery, selectedCity, selectedStatus]);

  // Real-time counter metrics
  const activeCount = tenants.filter((t) => t.subscriptionStatus === 'ACTIVE').length;
  const pastDueCount = tenants.filter((t) => t.subscriptionStatus === 'PAST_DUE').length;
  const suspendedCount = tenants.filter((t) => t.subscriptionStatus === 'SUSPENDED').length;

  const handleRun3Strikes = async () => {
    setIsCronRunning(true);
    try {
      const res = await fetch('/api/cron/three-strikes', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Audit 3-Strikes terminé : ${data.data.suspendedCount} suspendus, ${data.data.strike2Count + data.data.strike1Count} relances.`);
        fetchData();
      } else {
        toast.error('Erreur lors du déclenchement');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setIsCronRunning(false);
    }
  };

  // Run live restriction test on a tenant
  const runLiveTest = async (tenant: any) => {
    setTestingTenant(tenant);
    setIsTesting(true);
    setTestResults({});

    const featuresToTest = [
      { key: 'KITCHEN_DISPLAY_KDS', label: '1. Envoi Cuisine & Écran KDS' },
      { key: 'WAVE_ORANGE_MONEY', label: '2. Paiement Wave & Orange Money' },
      { key: 'MULTI_ZONE', label: '3. Multi-Zones (Terrasse / Piscine)' },
      { key: 'BILINGUAL_MENU', label: '4. Menu Bilingue FR / EN' },
    ];

    const results: Record<string, any> = {};

    for (const feat of featuresToTest) {
      try {
        const res = await fetch(`/api/admin/tenants/${tenant.id}/check-access`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ featureKey: feat.key }),
        });

        const data = await res.json();
        results[feat.key] = {
          label: feat.label,
          allowed: res.ok && data.allowed,
          status: res.status,
          message: data.message || data.error,
          code: data.code,
        };
      } catch (err) {
        results[feat.key] = { label: feat.label, allowed: false, message: 'Erreur réseau' };
      }
    }

    setTestResults(results);
    setIsTesting(false);
  };

  // Perform Upgrade
  const handleUpgrade = async () => {
    if (!upgradingTenant) return;
    setIsUpgrading(true);

    try {
      const res = await fetch(`/api/admin/tenants/${upgradingTenant.id}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlanId: selectedNewPlanId, periodMonths: 1 }),
      });

      if (res.ok) {
        toast.success(`Restaurant surclassé avec succès !`);
        setUpgradingTenant(null);
        fetchData();
      } else {
        toast.error('Erreur lors du surclassement');
      }
    } catch (e) {
      toast.error('Erreur de communication');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <SuperAdminAuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-slate-900 pb-20">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link
                href="/super-admin"
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-400" />
                  <span>Tableau de Bord 1 000 Restaurants</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Pilotage global des abonnements, filtrage par ville et gestion autonome des impayés
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRun3Strikes}
                disabled={isCronRunning}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-orange-500/40 text-orange-400 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all"
                title="Exécuter l'audit 3-Strikes nocturne"
              >
                <Zap className="w-4 h-4" />
                <span>{isCronRunning ? 'Audit en cours...' : 'Exécuter 3-Strikes'}</span>
              </button>

              <Link
                href="/super-admin/plans"
                className="flex items-center gap-1.5 bg-gradient-to-r from-orange-600 to-amber-600 text-slate-900 text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-lg transition-all"
              >
                <Layers className="w-4 h-4" />
                <span>Gérer les Packs</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
          {/* Real-time KPI Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/90 border border-emerald-900/40 rounded-3xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">Clients Actifs (En règle)</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</div>
                <span className="text-[11px] text-emerald-500/80 font-bold">Menus 100% opérationnels</span>
              </div>
              <span className="w-4 h-4 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
            </div>

            <div className="bg-white/90 border border-amber-900/40 rounded-3xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">Impayés (Strikes 1 & 2)</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{pastDueCount}</div>
                <span className="text-[11px] text-amber-500/80 font-bold">Relances WhatsApp actives</span>
              </div>
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>

            <div className="bg-white/90 border border-red-900/40 rounded-3xl p-5 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500">Suspendus (Strike 3)</span>
                <div className="text-2xl font-black text-red-400 mt-1">{suspendedCount}</div>
                <span className="text-[11px] text-red-500/80 font-bold">Menus coupés (&gt; 3 jours)</span>
              </div>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
          </div>

          {/* Search Bar & Filters Controls */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-3xl p-5 shadow-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Recherche par nom, patron, téléphone (+221), sous-domaine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 outline-none focus:border-orange-500"
                />
              </div>

              {/* City Filter */}
              <div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-xs text-slate-800 outline-none focus:border-orange-500"
                >
                  <option value="ALL">📍 Toutes les villes</option>
                  <option value="Dakar">Dakar</option>
                  <option value="Thiès">Thiès</option>
                  <option value="Saly Portudal">Saly / Mbour</option>
                  <option value="Saint-Louis">Saint-Louis</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-3 text-xs text-slate-800 outline-none focus:border-orange-500"
                >
                  <option value="ALL">⚡ Tous les statuts</option>
                  <option value="ACTIVE">🟢 Actifs uniquement</option>
                  <option value="PAST_DUE">🟠 Impayés (Past Due)</option>
                  <option value="SUSPENDED">🔴 Suspendus (Strike 3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tenants Table Card */}
          <div className="bg-white border border-slate-200 shadow-xs rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Résultats ({filteredTenants.length} restaurants affichés)
              </h2>
              <button
                onClick={fetchData}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-white border-b border-slate-200 shadow-xs text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Restaurant</th>
                    <th className="py-3.5 px-4">Ville</th>
                    <th className="py-3.5 px-4">Pack Actuel</th>
                    <th className="py-3.5 px-4">Statut</th>
                    <th className="py-3.5 px-4">Expiration</th>
                    <th className="py-3.5 px-4 text-center">Facture PDF</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredTenants.map((t) => {
                    const planName = t.plan?.name || 'Starter';
                    const isStarter = planName.toLowerCase().includes('starter');
                    const isPro = planName.toLowerCase().includes('pro');
                    const isPremium = planName.toLowerCase().includes('premium');
                    const isSuspended = t.subscriptionStatus === 'SUSPENDED';
                    const isPastDue = t.subscriptionStatus === 'PAST_DUE';

                    return (
                      <tr key={t.id} className="hover:bg-slate-50/40 transition-colors">
                        {/* Restaurant Name */}
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-orange-400 font-black text-xs">
                              {t.businessName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span>{t.businessName}</span>
                              <span className="block text-[11px] text-slate-500 font-normal">
                                /{t.subdomain} • {t.phone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* City */}
                        <td className="py-3.5 px-4 text-slate-700">
                          {t.city || 'Dakar'}
                        </td>

                        {/* Current Plan Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1.5 border ${
                              isPremium
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : isPro
                                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                : 'bg-slate-800 text-slate-700 border-slate-200'
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{planName}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 ${
                              isSuspended
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : isPastDue
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isSuspended ? 'bg-red-400' : isPastDue ? 'bg-amber-400 animate-bounce' : 'bg-emerald-400 animate-pulse'
                            }`} />
                            {t.subscriptionStatus}
                          </span>
                        </td>

                        {/* Expiration */}
                        <td className="py-3.5 px-4 text-xs text-slate-500">
                          {t.subscriptionExpiresAt
                            ? new Date(t.subscriptionExpiresAt).toLocaleDateString('fr-FR')
                            : 'Illimité'}
                        </td>

                        {/* Invoice PDF Link */}
                        <td className="py-3.5 px-4 text-center">
                          <a
                            href={`/api/admin/invoices?tenantId=${t.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 underline font-bold"
                          >
                            Facture PDF
                          </a>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 sm:px-6 text-right space-x-2">
                          <button
                            onClick={() => runLiveTest(t)}
                            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-orange-400 hover:text-orange-300 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            <span>Tester</span>
                          </button>

                          <button
                            onClick={() => {
                              setUpgradingTenant(t);
                              setSelectedNewPlanId(isStarter ? 'plan_pro' : 'plan_premium');
                            }}
                            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-90 active:scale-95 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm"
                          >
                            Pack
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Live Test Modal */}
        {testingTenant && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 shadow-xs rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                    Simulateur Droits & Restrictions
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{testingTenant.businessName}</h3>
                  <p className="text-xs text-slate-500">Pack : {testingTenant.plan?.name} • Statut : {testingTenant.subscriptionStatus}</p>
                </div>
                <button
                  onClick={() => setTestingTenant(null)}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-50"
                >
                  ✕
                </button>
              </div>

              {isTesting ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Vérification en cours...</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {Object.entries(testResults).map(([key, res]: [string, any]) => (
                    <div
                      key={key}
                      className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                        res.allowed
                          ? 'bg-emerald-950/20 border-emerald-900/40'
                          : 'bg-red-950/20 border-red-900/40'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-900 block mb-0.5">{res.label}</span>
                        <p className={`text-[11px] ${res.allowed ? 'text-emerald-400' : 'text-red-400'}`}>
                          {res.message}
                        </p>
                      </div>
                      <span
                        className={`font-black px-2.5 py-1 rounded-xl text-[10px] shrink-0 ${
                          res.allowed
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {res.allowed ? '200 OK' : '403 BLOQUÉ'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => setTestingTenant(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal */}
        {upgradingTenant && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 shadow-xs rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <span>Changer le Pack du Restaurant</span>
              </h3>
              <p className="text-xs text-slate-500">
                Sélectionnez le pack pour <strong>{upgradingTenant.businessName}</strong>
              </p>

              <div className="space-y-2">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedNewPlanId(p.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedNewPlanId === p.id
                        ? 'bg-slate-50 border-orange-500 ring-2 ring-orange-500/20'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">Pack {p.name}</span>
                      <span className="text-xs text-orange-400 font-extrabold">{formatFCFA(p.price)}/mois</span>
                    </div>
                    {selectedNewPlanId === p.id && (
                      <CheckCircle2 className="w-5 h-5 text-orange-400" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setUpgradingTenant(null)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="bg-orange-600 hover:bg-orange-700 text-slate-900 text-xs font-black px-5 py-2.5 rounded-xl shadow-lg"
                >
                  {isUpgrading ? 'Application...' : 'Valider'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SuperAdminAuthGuard>
  );
}
