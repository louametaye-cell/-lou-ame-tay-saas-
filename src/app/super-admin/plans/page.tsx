'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  Save, 
  Plus, 
  DollarSign, 
  Sliders, 
  HelpCircle,
  TrendingUp,
  Zap,
  Lock,
  Utensils,
  Store,
  Users
} from 'lucide-react';
import { SaaSPlan, SaaSFeature } from '@/types/saas';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';
import { SuperAdminAuthGuard } from '@/components/super-admin/SuperAdminAuthGuard';

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [features, setFeatures] = useState<SaaSFeature[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan_starter');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Active editable plan
  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const fetchData = async () => {
    try {
      const [resPlans, resFeats] = await Promise.all([
        fetch('/api/admin/plans'),
        fetch('/api/admin/features'),
      ]);

      if (resPlans.ok && resFeats.ok) {
        const dataPlans = await resPlans.json();
        const dataFeats = await resFeats.json();
        setPlans(dataPlans.plans || []);
        setFeatures(dataFeats.features || []);
        if (dataPlans.plans?.length > 0 && !selectedPlanId) {
          setSelectedPlanId(dataPlans.plans[0].id);
        }
      }
    } catch (e) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePriceChange = (newPrice: number) => {
    if (!activePlan) return;
    setPlans((prev) =>
      prev.map((p) => (p.id === activePlan.id ? { ...p, price: newPrice } : p))
    );
  };

  const handleDescriptionChange = (newDesc: string) => {
    if (!activePlan) return;
    setPlans((prev) =>
      prev.map((p) => (p.id === activePlan.id ? { ...p, description: newDesc } : p))
    );
  };

  const handleToggleFeature = (featureKey: string) => {
    if (!activePlan) return;
    const currentPf = activePlan.features.find((f) => f.featureKey === featureKey);

    const updatedFeatures = activePlan.features.map((f) => {
      if (f.featureKey === featureKey) {
        return { ...f, isActive: !f.isActive };
      }
      return f;
    });

    // If feature was not yet in plan, add it
    if (!currentPf) {
      updatedFeatures.push({
        id: `pf_${activePlan.id}_${featureKey}`,
        planId: activePlan.id,
        featureId: `feat_${featureKey.toLowerCase()}`,
        featureKey,
        isActive: true,
        limitValue: null,
      });
    }

    setPlans((prev) =>
      prev.map((p) => (p.id === activePlan.id ? { ...p, features: updatedFeatures } : p))
    );
  };

  const handleLimitChange = (featureKey: string, limitValue: number | null) => {
    if (!activePlan) return;
    const updatedFeatures = activePlan.features.map((f) => {
      if (f.featureKey === featureKey) {
        return { ...f, limitValue };
      }
      return f;
    });

    setPlans((prev) =>
      prev.map((p) => (p.id === activePlan.id ? { ...p, features: updatedFeatures } : p))
    );
  };

  const handleSavePlan = async () => {
    if (!activePlan) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/plans/${activePlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: activePlan.price,
          description: activePlan.description,
          features: activePlan.features,
          colorTheme: activePlan.colorTheme,
          isRecommended: activePlan.isRecommended,
        }),
      });

      if (res.ok) {
        toast.success(`Pack "${activePlan.name}" enregistré avec succès !`);
      } else {
        toast.error('Erreur lors de la sauvegarde');
      }
    } catch (e) {
      toast.error('Erreur de communication');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SuperAdminAuthGuard>
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500 selection:text-white pb-20">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link
                href="/super-admin"
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-400" />
                  <span>Gestion des Packs & Fonctionnalités SaaS</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Configurez les prix, activez les options et ajustez les plafonds d&apos;utilisation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/super-admin/tenants"
                className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>Liste des Restaurants</span>
              </Link>

              <button
                onClick={handleSavePlan}
                disabled={isSaving}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B00] to-orange-600 hover:opacity-90 active:scale-95 text-white text-xs sm:text-sm font-extrabold px-4 sm:px-5 py-2.5 rounded-xl shadow-lg transition-all"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer le Pack</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
          {/* Plan Selector Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((p) => {
              const isSelected = p.id === activePlan?.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-900 border-orange-500 shadow-xl ring-2 ring-orange-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Pack {p.name}
                    </span>
                    {p.isRecommended && (
                      <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black px-2 py-0.5 rounded-full">
                        ⭐ Populaire
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-white">
                    {formatFCFA(p.price)}
                    <span className="text-xs text-slate-400 font-normal"> /mois</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {p.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Plan Editor Form */}
          {activePlan && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-orange-400" />
                    <span>Configuration du Pack : {activePlan.name}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modifiez le tarif mensuel et cochez/décochez les droits d&apos;accès
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300">
                  Slug: {activePlan.slug}
                </span>
              </div>

              {/* Price & Description Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-orange-400" />
                    <span>Tarif Mensuel (FCFA)</span>
                  </label>
                  <input
                    type="number"
                    value={activePlan.price}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-sm font-bold text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    Description Commerciale
                  </label>
                  <input
                    type="text"
                    value={activePlan.description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Features Matrix Table */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                  Matrice des Fonctionnalités & Limites
                </h3>

                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-slate-950/90 border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-3.5 px-4 sm:px-6">Fonctionnalité</th>
                        <th className="py-3.5 px-4">Catégorie</th>
                        <th className="py-3.5 px-4 text-center">Inclus ?</th>
                        <th className="py-3.5 px-4 sm:px-6 text-right">Limite / Plafond</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {features.map((feat) => {
                        const pf = activePlan.features.find((f) => f.featureKey === feat.keyName);
                        const isIncluded = pf?.isActive ?? false;
                        const limitVal = pf?.limitValue;

                        return (
                          <tr key={feat.id} className="hover:bg-slate-800/40 transition-colors">
                            {/* Feature Name & Desc */}
                            <td className="py-3.5 px-4 sm:px-6">
                              <span className="font-bold text-white block">{feat.label}</span>
                              <span className="text-[11px] text-slate-400">{feat.description}</span>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4">
                              <span className="bg-slate-950 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-800">
                                {feat.category}
                              </span>
                            </td>

                            {/* Toggle Switch */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleFeature(feat.keyName)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                  isIncluded
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30 opacity-70'
                                }`}
                              >
                                {isIncluded ? '✅ ACTIF' : '❌ BLOQUÉ'}
                              </button>
                            </td>

                            {/* Limit Value */}
                            <td className="py-3.5 px-4 sm:px-6 text-right">
                              {feat.valueType === 'NUMERIC' ? (
                                <div className="inline-flex items-center gap-2 justify-end">
                                  <input
                                    type="number"
                                    min={1}
                                    placeholder="Illimité (vide)"
                                    value={limitVal ?? ''}
                                    onChange={(e) =>
                                      handleLimitChange(
                                        feat.keyName,
                                        e.target.value ? Number(e.target.value) : null
                                      )
                                    }
                                    className="w-24 bg-slate-950 border border-slate-700 rounded-xl p-1.5 text-xs text-right text-white outline-none focus:border-orange-500"
                                  />
                                  <span className="text-xs text-slate-400">max</span>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">
                                  {isIncluded ? 'Accès complet' : 'Verrouillé'}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </SuperAdminAuthGuard>
  );
}
