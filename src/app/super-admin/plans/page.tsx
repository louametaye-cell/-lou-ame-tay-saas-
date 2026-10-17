'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Save, 
  DollarSign, 
  Sliders, 
  Lock,
  Store,
  Eye,
  X,
  HelpCircle
} from 'lucide-react';
import { SaaSPlan, SaaSFeature } from '@/types/saas';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

export default function SuperAdminPlansPage() {
  const [plans, setPlans] = useState<SaaSPlan[]>([]);
  const [features, setFeatures] = useState<SaaSFeature[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewModalPlan, setPreviewModalPlan] = useState<SaaSPlan | null>(null);

  // Active editable plan
  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  const fetchData = useCallback(async () => {
    try {
      const [resPlans, resFeats] = await Promise.all([
        fetch('/api/admin/plans'),
        fetch('/api/admin/features'),
      ]);

      if (resPlans.ok && resFeats.ok) {
        const dataPlans = await resPlans.json();
        const dataFeats = await resFeats.json();
        const loadedPlans = dataPlans.plans || [];
        setPlans(loadedPlans);
        setFeatures(dataFeats.features || []);
        if (loadedPlans.length > 0) {
          setSelectedPlanId((prev) => {
            const exists = loadedPlans.some((p: any) => p.id === prev);
            return exists ? prev : loadedPlans[0].id;
          });
        }
      }
    } catch (e) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    const exists = activePlan.features.some(
      (f: any) => f.featureKey === featureKey || f.keyName === featureKey
    );

    let updatedFeatures: any[];
    if (exists) {
      updatedFeatures = activePlan.features.map((f: any) => {
        if (f.featureKey === featureKey || f.keyName === featureKey) {
          return {
            ...f,
            featureKey,
            keyName: featureKey,
            isActive: !f.isActive
          };
        }
        return f;
      });
    } else {
      updatedFeatures = [
        ...activePlan.features,
        {
          id: `pf_${activePlan.id}_${featureKey}`,
          planId: activePlan.id,
          featureKey,
          keyName: featureKey,
          isActive: true,
          limitValue: null,
        }
      ];
    }

    setPlans((prev) =>
      prev.map((p) => (p.id === activePlan.id ? { ...p, features: updatedFeatures } : p))
    );
  };

  const handleLimitChange = (featureKey: string, limitValue: number | null) => {
    if (!activePlan) return;
    const updatedFeatures = activePlan.features.map((f: any) => {
      if (f.featureKey === featureKey || f.keyName === featureKey) {
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
        const data = await res.json();
        toast.success(`Pack "${activePlan.name}" enregistré avec succès dans la base de données !`);
        // Actualiser les données locales
        if (data.plan) {
          setPlans((prev) =>
            prev.map((p) => (p.id === activePlan.id ? {
              ...p,
              price: Number(data.plan.price),
              description: data.plan.description,
              features: data.plan.planFeatures ? data.plan.planFeatures.map((pf: any) => ({
                id: pf.id,
                planId: pf.planId,
                featureId: pf.featureId,
                featureKey: pf.feature?.keyName || '',
                keyName: pf.feature?.keyName || '',
                label: pf.feature?.label || '',
                isActive: Boolean(pf.isActive),
                limitValue: pf.limitValue
              })) : p.features
            } : p))
          );
        }
      } else {
        toast.error('Erreur lors de la sauvegarde du pack');
      }
    } catch (e) {
      toast.error('Erreur de communication avec le serveur');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      {/* Header Sticky */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/super-admin"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-2xl text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-500" />
                <span>Gestion des Formules & Verrous SaaS</span>
              </h1>
              <p className="text-xs text-slate-500">
                Configurez les prix, activez les options et auditez ce que voit chaque client
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/super-admin/tenants"
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all"
            >
              <Store className="w-4 h-4 text-emerald-600" />
              <span>Restaurants Partenaires</span>
            </Link>

            <button
              type="button"
              onClick={handleSavePlan}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer min-h-[44px]"
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
        {/* Titre de section */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Les 7 Formules Officielles du Marché</span>
              <span className="text-xs bg-orange-100 text-orange-800 font-bold px-2.5 py-0.5 rounded-full">
                {plans.length} formules
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Cliquez sur une formule pour l&apos;éditer, ou sur le bouton &quot;👁️ Voir ce que voit le client&quot; pour tester les verrous
            </p>
          </div>
        </div>

        {/* Plan Selector Tabs (7 Formules) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {plans.map((p) => {
            const isSelected = p.id === activePlan?.id;
            const activeFeaturesCount = p.features ? p.features.filter((f: any) => f.isActive).length : 0;
            const totalCount = features.length > 0 ? features.length : 22;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-white border-orange-500 shadow-xl ring-2 ring-orange-500/20'
                    : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Pack {p.name}
                    </span>
                    {p.isRecommended && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                        ⭐ Populaire
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {formatFCFA(p.price)}
                    <span className="text-xs text-slate-500 font-normal font-sans"> /mois</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                    {p.description}
                  </p>

                  {/* Badge de couverture fonctionnalités */}
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>{activeFeaturesCount} / {totalCount} fonctionnalités actives</span>
                  </div>
                </div>

                {/* BOUTON CLÉ : PRÉVISUALISER LE PACK (Ce que voit le client) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewModalPlan(p);
                  }}
                  className="mt-4 w-full py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 text-slate-800 text-xs font-black flex items-center justify-center gap-1.5 border border-slate-200 transition-all cursor-pointer min-h-[44px]"
                  title={`Prévisualiser ce que voit un client sous le pack ${p.name}`}
                >
                  <Eye className="w-4 h-4 text-orange-500" />
                  <span>👁️ Voir ce que voit le client</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Active Plan Editor Form */}
        {activePlan && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-orange-500" />
                  <span>Configuration des Droits d&apos;Accès : {activePlan.name}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Les modifications cochées/décochées sont directement enregistrées dans PostgreSQL Supabase
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewModalPlan(activePlan)}
                  className="px-4 py-2 bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-orange-500" />
                  <span>Prévisualiser ce pack</span>
                </button>
                <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
                  Slug: {activePlan.slug}
                </span>
              </div>
            </div>

            {/* Price & Description Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  <span>Tarif Mensuel (FCFA)</span>
                </label>
                <input
                  type="number"
                  value={activePlan.price}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm font-bold text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Description Commerciale
                </label>
                <input
                  type="text"
                  value={activePlan.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-sm text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Features Matrix Table */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>Matrice des Fonctionnalités & Verrous Métier</span>
                  <span className="text-xs text-slate-500 font-normal">
                    ({features.length} fonctionnalités répertoriées)
                  </span>
                </h3>
                <span className="text-xs text-slate-500 italic">
                  Vert = Inclus dans la formule | Rouge = Bloqué (Paywall affiché au restaurant)
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4 sm:px-6">Fonctionnalité</th>
                      <th className="py-3.5 px-4">Catégorie</th>
                      <th className="py-3.5 px-4 text-center">Statut d&apos;Accès</th>
                      <th className="py-3.5 px-4 sm:px-6 text-right">Plafond / Limite</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {features.map((feat) => {
                      const pf = activePlan.features.find(
                        (f: any) => f.featureKey === feat.keyName || f.keyName === feat.keyName
                      );
                      const isIncluded = pf ? Boolean(pf.isActive) : false;
                      const limitVal = pf?.limitValue;

                      return (
                        <tr 
                          key={feat.id} 
                          className={`transition-colors ${
                            isIncluded ? 'bg-emerald-50/20 hover:bg-emerald-50/40' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          {/* Feature Name & Desc */}
                          <td className="py-3.5 px-4 sm:px-6">
                            <span className="font-bold text-slate-900 block">{feat.label}</span>
                            <span className="text-[11px] text-slate-500 font-mono">{feat.keyName}</span>
                            {feat.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5">{feat.description}</p>
                            )}
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4">
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                              {feat.category}
                            </span>
                          </td>

                          {/* Toggle Switch */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFeature(feat.keyName)}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer min-h-[36px] ${
                                isIncluded
                                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-500 shadow-xs'
                                  : 'bg-rose-100 text-rose-800 border-2 border-rose-300 opacity-80 hover:opacity-100'
                              }`}
                            >
                              {isIncluded ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>🟢 INCLUS</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                                  <span>🔒 BLOQUÉ</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Limit Value */}
                          <td className="py-3.5 px-4 sm:px-6 text-right">
                            {feat.valueType === 'NUMERIC' ? (
                              <div className="inline-flex items-center gap-2 justify-end">
                                <input
                                  type="number"
                                  min={1}
                                  placeholder="Illimité"
                                  value={limitVal ?? ''}
                                  onChange={(e) =>
                                    handleLimitChange(
                                      feat.keyName,
                                      e.target.value ? Number(e.target.value) : null
                                    )
                                  }
                                  className="w-24 bg-slate-50 border border-slate-200 rounded-xl p-1.5 text-xs text-right text-slate-900 outline-none focus:border-orange-500"
                                />
                                <span className="text-xs text-slate-500">max</span>
                              </div>
                            ) : (
                              <span className={`text-xs font-bold ${isIncluded ? 'text-emerald-700' : 'text-slate-400'}`}>
                                {isIncluded ? 'Accès débloqué' : 'Verrouillé'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bouton d'enregistrement sous le tableau */}
              <div className="pt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-extrabold px-6 py-3 rounded-2xl shadow-lg transition-all cursor-pointer min-h-[48px]"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Enregistrer les Modifications du Pack {activePlan.name}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 👁️ MODALE D'INTELLIGENCE UX : "VOIR CE QUE VOIT LE CLIENT" */}
      {previewModalPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95">
            {/* Header de la Modale */}
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                    Pack {previewModalPlan.name}
                  </span>
                  <span className="text-xs font-bold text-orange-600 font-mono">
                    {formatFCFA(previewModalPlan.price)} / mois
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-orange-500" />
                  <span>👁️ Ce que voit un restaurant sous ce pack</span>
                </h3>
                <p className="text-xs text-slate-500">
                  État réel des droits d&apos;accès configurés en base de données PostgreSQL
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalPlan(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Résumé Chiffré Vert / Rouge */}
            <div className="p-4 sm:px-6 bg-slate-100/70 border-b border-slate-200 grid grid-cols-2 gap-3">
              {(() => {
                const includedCount = features.filter((feat) => {
                  const pf = previewModalPlan.features.find(
                    (f: any) => f.featureKey === feat.keyName || f.keyName === feat.keyName
                  );
                  return pf ? Boolean(pf.isActive) : false;
                }).length;
                const blockedCount = features.length - includedCount;

                return (
                  <>
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-emerald-950 font-mono">{includedCount}</div>
                        <div className="text-[11px] font-bold text-emerald-800">Fonctionnalités Incluses</div>
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center font-black">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-black text-rose-950 font-mono">{blockedCount}</div>
                        <div className="text-[11px] font-bold text-rose-800">Verrouillées (Paywall)</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Liste scrollable des fonctionnalités */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-2.5 flex-1">
              {features.map((feat) => {
                const pf = previewModalPlan.features.find(
                  (f: any) => f.featureKey === feat.keyName || f.keyName === feat.keyName
                );
                const isIncluded = pf ? Boolean(pf.isActive) : false;

                return (
                  <div
                    key={feat.id}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                      isIncluded
                        ? 'bg-emerald-50/50 border-emerald-200 text-slate-900'
                        : 'bg-rose-50/40 border-rose-200 text-slate-600'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {isIncluded ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {feat.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 pl-6">
                        {feat.description || feat.keyName}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isIncluded ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-black">
                          🟢 Inclus
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[11px] font-black">
                          🔒 Cadenas Paywall
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer de la modale */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalPlan(null)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors min-h-[44px]"
              >
                Fermer l&apos;Aperçu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
