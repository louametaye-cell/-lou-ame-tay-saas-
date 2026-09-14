'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useKitchenOrders } from '@/hooks/useKitchenOrders';
import { KitchenHeader, KitchenFilter, OrderTicketGrid } from '@/components/kitchen';
import { KitchenAlertManager } from '@/components/kitchen/KitchenAlertManager';
import { KitchenHistory } from '@/components/KitchenHistory';
import { History, LayoutGrid, ChefHat, AlertTriangle, Lock, Sparkles, ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react';
import { hasAccessToFeature, getFeaturePaywallInfo, buildUpgradeWhatsAppUrl, PLANS_REGISTRY } from '@/lib/plan-permissions';

interface KitchenKDSViewProps {
  initialRestaurantId?: string;
}

export default function KitchenKDSView({ initialRestaurantId }: KitchenKDSViewProps = {}) {
  const [restaurantName, setRestaurantName] = useState('Écran Cuisine (KDS)');
  const [restaurantId, setRestaurantId] = useState<string | undefined>(undefined);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState<KitchenFilter>('ALL');
  const [activeTab, setActiveTab] = useState<'LIVE' | 'HISTORY'>('LIVE');
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [currentPlanSlug, setCurrentPlanSlug] = useState<string>('tambali');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = initialRestaurantId || params.get('restaurantId') || '';

      let effectiveId = queryId;
      if (queryId) {
        localStorage.setItem('current_restaurant_id', queryId);
        setRestaurantId(queryId);
      } else {
        effectiveId = localStorage.getItem('current_restaurant_id') || '';
        if (effectiveId) setRestaurantId(effectiveId);
      }

      const storedName = localStorage.getItem('current_restaurant_name');
      if (storedName) setRestaurantName(storedName);

      if (effectiveId) {
        fetch(`/api/tenant/branding?restaurantId=${encodeURIComponent(effectiveId)}`)
          .then((r) => r.json())
          .then((d) => {
            const slug = d.plan?.slug?.toLowerCase() || (d.isTambali ? 'tambali' : 'tambali');
            setCurrentPlanSlug(slug);
            const rName = d.name || d.restaurant?.name || d.businessName;
            if (rName) {
              setRestaurantName(rName);
              localStorage.setItem('current_restaurant_name', rName);
            }
          })
          .catch(() => {})
          .finally(() => setIsLoadingDetails(false));
      } else {
        setIsLoadingDetails(false);
      }
    }
  }, [initialRestaurantId]);

  const {
    orders,
    isLoading,
    isConnected,
    updateOrderStatus,
    refetch,
  } = useKitchenOrders({
    restaurantId,
    isAudioEnabled,
    pollIntervalMs: 3500,
  });

  // Calculate live counts
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const pendingCount = pendingOrders.length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const servedCount = orders.filter((o) => o.status === 'SERVED').length;
  const urgentCount = orders.filter((o) => {
    if (o.status === 'SERVED' || o.status === 'CANCELLED') return false;
    const diffMs = Date.now() - new Date(o.createdAt).getTime();
    return diffMs / (1000 * 60) >= 15;
  }).length;

  const handleAcknowledgeAll = async () => {
    for (const ord of pendingOrders) {
      await updateOrderStatus(ord.id, 'PREPARING');
    }
  };

  // 🔒 Contrôle Paywall : L'écran Cuisine KDS requiert au minimum la formule XÉWEUL (ou NDAJÉ événementiel)
  const isKdsAllowed = hasAccessToFeature(currentPlanSlug, 'KITCHEN_KDS');
  if (!isKdsAllowed && !isLoadingDetails) {
    const paywall = getFeaturePaywallInfo('KITCHEN_KDS');
    const targetPlan = PLANS_REGISTRY[paywall.requiredPlan];
    const whatsappUrl = buildUpgradeWhatsAppUrl(
      restaurantName,
      currentPlanSlug,
      paywall.requiredPlan,
      paywall.name
    );

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="w-16 h-16 bg-amber-500/15 text-amber-400 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/30 shadow-inner">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Formule {paywall.requiredPlanName} requise</span>
            </div>
            <h1 className="text-xl font-black text-white">{paywall.name}</h1>
            <p className="text-xs text-amber-200/90 font-medium bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 leading-relaxed text-left">
              💡 {paywall.benefit}
            </p>
          </div>

          <div className="space-y-2 text-left text-xs text-slate-300">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">Inclus dans la formule {paywall.requiredPlanName} :</span>
            {paywall.concreteUnlocks.map((u, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{u}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-left">
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">Tarif {paywall.requiredPlanName}</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Sans engagement</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xl font-black text-white">{targetPlan.priceMonthly.toLocaleString('fr-FR')}</span>
              <span className="text-[11px] text-slate-400 ml-1 font-bold">FCFA/m</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Mettre à niveau via WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 text-slate-400 hover:text-white font-bold text-xs transition-colors"
            >
              Retourner au tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si aucun établissement n'est spécifié, écran de sécurité hermétique
  if (!restaurantId && !isLoadingDetails) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-900/90 border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-lg">
            <ChefHat className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>Établissement Non Spécifié</span>
            </div>
            <h1 className="text-xl font-black text-white">Écran Cuisine KDS</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pour des raisons de sécurité et d'étanchéité multi-restaurant, chaque cuisine dispose de son propre lien dédié.
              Veuillez ouvrir le lien fourni par la direction (ex: <code className="text-amber-300 font-mono text-[11px]">/r/votre-restaurant/kitchen</code>) ou vous connecter depuis votre tableau de bord gérant.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-2xl transition-all shadow-md"
            >
              🔐 Se connecter au Portail Gérant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-500 selection:text-white pb-20">
      {/* 1. KDS Fixed Header */}
      <KitchenHeader
        restaurantName={restaurantName}
        isConnected={isConnected}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled((prev) => !prev)}
        counts={{
          pending: pendingCount,
          preparing: preparingCount,
          ready: readyCount,
          served: servedCount,
          urgent: urgentCount,
        }}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 pt-5 space-y-6">
        {/* Repeating Alert Banner if pending orders */}
        <KitchenAlertManager
          pendingOrders={pendingOrders}
          onAcknowledgeAll={handleAcknowledgeAll}
        />

        {/* View Tabs Selector */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('LIVE')}
              className={`min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                activeTab === 'LIVE'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tickets en Direct ({pendingCount + preparingCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('HISTORY')}
              className={`min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                activeTab === 'HISTORY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historique ({servedCount})</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono font-medium">
            {pendingCount + preparingCount} en cuisine • {servedCount} servie(s)
          </div>
        </div>

        {/* Tab 1: Live KDS Grid */}
        {activeTab === 'LIVE' && (
          <OrderTicketGrid
            orders={orders}
            onUpdateStatus={updateOrderStatus}
            restaurantName={restaurantName}
            activeFilter={activeFilter}
          />
        )}

        {/* Tab 2: History View */}
        {activeTab === 'HISTORY' && (
          <KitchenHistory
            restaurantId={restaurantId}
            restaurantName={restaurantName}
          />
        )}
      </main>
    </div>
  );
}
