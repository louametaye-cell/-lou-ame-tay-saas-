'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Store, 
  ArrowLeft, 
  Layers, 
  XCircle, 
  Sparkles, 
  Phone, 
  RefreshCw, 
  Search,
  AlertTriangle,
  Zap,
  Trash2,
  Settings
} from 'lucide-react';
import { SaaSPlan } from '@/types/saas';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';
import { SuperAdminAuthGuard } from '@/components/super-admin/SuperAdminAuthGuard';

export default function SuperAdminTenantsListPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Upgrade Modal state
  const [upgradingTenant, setUpgradingTenant] = useState<any | null>(null);
  const [selectedNewPlanId, setSelectedNewPlanId] = useState<string>('plan_pro');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isCronRunning, setIsCronRunning] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
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
        (t.businessName && t.businessName.toLowerCase().includes(query)) ||
        (t.ownerName && t.ownerName.toLowerCase().includes(query)) ||
        (t.phone && t.phone.includes(query)) ||
        (t.subdomain && t.subdomain.toLowerCase().includes(query));

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
      if (res.ok) {
        const data = await res.json();
        toast.success(`Audit 3-Strikes terminé ! ${data.suspended || 0} suspension(s) effectuée(s).`);
        fetchData();
      } else {
        toast.error('Erreur lors de l\'exécution 3-Strikes');
      }
    } catch (e) {
      toast.error('Erreur serveur');
    } finally {
      setIsCronRunning(false);
    }
  };

  const handleUpgradeTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upgradingTenant || !selectedNewPlanId) return;

    setIsUpgrading(true);
    try {
      const res = await fetch(`/api/admin/tenants/${upgradingTenant.id}/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPlanId: selectedNewPlanId,
          periodMonths: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'Pack mis à jour avec succès !');
        setUpgradingTenant(null);
        fetchData();
      } else {
        toast.error('Erreur lors de la mise à jour du pack');
      }
    } catch (e) {
      toast.error('Erreur de communication');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleDeleteTenant = async (tenantId: string, name: string) => {
    if (!window.confirm(`⚠️ ATTENTION : Êtes-vous sûr de vouloir SUPPRIMER DÉFINITIVEMENT le restaurant "${name}" ? Cette action est irréversible et supprimera toutes ses tables et données.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/super-admin/restaurants/${tenantId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Le restaurant "${name}" a été supprimé définitivement.`);
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de la suppression');
      }
    } catch (e) {
      toast.error('Erreur de communication');
    }
  };

  return (
    <SuperAdminAuthGuard>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 shadow-xs px-4 sm:px-8 py-4 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/super-admin"
                className="p-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Store className="w-6 h-6 text-[#FF6B00]" />
                  <span>Tableau de Bord 1 000 Restaurants</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  Pilotage global des abonnements, filtrage par ville et gestion des restaurants clients
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRun3Strikes}
                disabled={isCronRunning}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-xs"
                title="Exécuter l'audit 3-Strikes nocturne"
              >
                <Zap className="w-4 h-4 text-[#FF6B00]" />
                <span>{isCronRunning ? 'Audit en cours...' : 'Exécuter 3-Strikes'}</span>
              </button>

              <Link
                href="/super-admin/plans"
                className="flex items-center gap-1.5 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
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
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600">Clients Actifs (En règle)</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{activeCount}</div>
                <span className="text-[11px] text-slate-500 font-medium">Menus 100% opérationnels</span>
              </div>
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-950">Impayés (Strikes 1 & 2)</span>
                <div className="text-2xl font-black text-[#FF6B00] mt-1">{pastDueCount}</div>
                <span className="text-[11px] text-amber-900 font-medium">Relances WhatsApp actives</span>
              </div>
              <AlertTriangle className="w-5 h-5 text-[#FF6B00]" />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-600">Suspendus (Strike 3)</span>
                <div className="text-2xl font-black text-slate-900 mt-1">{suspendedCount}</div>
                <span className="text-[11px] text-slate-500 font-medium">Menus coupés (&gt; 3 jours)</span>
              </div>
              <XCircle className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Search Bar & Filters Controls */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Search input */}
              <div className="md:col-span-2 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Recherche par nom, patron, téléphone (+221), sous-domaine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-2xl pl-10 pr-4 py-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#FF6B00] font-medium"
                />
              </div>

              {/* City Filter */}
              <div>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-3 text-xs text-slate-900 outline-none focus:border-[#FF6B00] font-bold"
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
                  className="w-full bg-white border border-slate-300 rounded-2xl px-3.5 py-3 text-xs text-slate-900 outline-none focus:border-[#FF6B00] font-bold"
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
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Résultats ({filteredTenants.length} restaurants affichés)
              </h2>
              <button
                onClick={fetchData}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
                title="Actualiser les données"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
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
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                        Aucun restaurant trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => {
                      const planName = t.plan?.name || 'Starter';
                      const isStarter = planName.toLowerCase().includes('starter');
                      const isPro = planName.toLowerCase().includes('pro');
                      const isPremium = planName.toLowerCase().includes('premium');
                      const isSuspended = t.subscriptionStatus === 'SUSPENDED';
                      const isPastDue = t.subscriptionStatus === 'PAST_DUE';

                      return (
                        <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Restaurant Name */}
                          <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF6B00] font-black text-xs shrink-0">
                                {t.businessName ? t.businessName.substring(0, 2).toUpperCase() : 'RT'}
                              </div>
                              <div>
                                <Link href={`/super-admin/restaurant/${t.id}`} className="hover:text-[#FF6B00] transition-colors">
                                  <span>{t.businessName}</span>
                                </Link>
                                <span className="block text-[11px] text-slate-500 font-medium">
                                  /{t.subdomain} • {t.phone || 'Sans tel'}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* City */}
                          <td className="py-3.5 px-4 text-slate-700 font-medium">
                            {t.city || 'Dakar'}
                          </td>

                          {/* Current Plan Badge */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-3 py-1 rounded-xl text-xs font-black inline-flex items-center gap-1.5 border ${
                                isPremium
                                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                                  : isPro
                                  ? 'bg-orange-100 text-orange-950 border-orange-300'
                                  : 'bg-slate-100 text-slate-800 border-slate-300'
                              }`}
                            >
                              <Sparkles className="w-3 h-3 text-[#FF6B00]" />
                              <span>{planName}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 ${
                                isSuspended
                                  ? 'bg-slate-100 text-slate-700 border-slate-300'
                                  : isPastDue
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-slate-900 text-white border-slate-900'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                isSuspended ? 'bg-slate-500' : isPastDue ? 'bg-[#FF6B00] animate-bounce' : 'bg-emerald-400 animate-pulse'
                              }`} />
                              {t.subscriptionStatus}
                            </span>
                          </td>

                          {/* Expiration */}
                          <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
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
                              className="text-xs text-[#FF6B00] hover:underline font-bold"
                            >
                              Facture PDF
                            </a>
                          </td>

                          {/* Actions (Surclasser Pack + Supprimer Restaurant) */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setUpgradingTenant(t);
                                  setSelectedNewPlanId(isStarter ? 'plan_pro' : 'plan_premium');
                                }}
                                className="bg-[#FF6B00] hover:bg-orange-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                                title="Modifier le pack du restaurant"
                              >
                                Pack
                              </button>

                              <button
                                onClick={() => handleDeleteTenant(t.id, t.businessName)}
                                className="bg-slate-900 hover:bg-red-600 text-white text-xs font-bold p-1.5 rounded-xl transition-all shadow-2xs flex items-center justify-center"
                                title="Supprimer définitivement ce restaurant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Upgrade Plan Modal */}
        {upgradingTenant && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
              <div className="mb-4 pb-3 border-b border-slate-100">
                <span className="text-[10px] font-black uppercase text-[#FF6B00]">Changement de Formule</span>
                <h3 className="text-lg font-black text-slate-900">{upgradingTenant.businessName}</h3>
                <p className="text-xs text-slate-500 font-medium">Sélectionnez le nouveau pack d&apos;abonnement</p>
              </div>

              <form onSubmit={handleUpgradeTenant} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-900 block mb-1">Choisir un Pack Tarifaire</label>
                  <select
                    value={selectedNewPlanId}
                    onChange={(e) => setSelectedNewPlanId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 font-bold outline-none"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatFCFA(p.price)} / mois
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setUpgradingTenant(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:text-slate-900"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isUpgrading}
                    className="bg-[#FF6B00] hover:bg-orange-600 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all"
                  >
                    {isUpgrading ? 'Mise à jour...' : 'Valider le Pack'}
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
