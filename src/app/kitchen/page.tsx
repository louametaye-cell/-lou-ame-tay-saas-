'use client';

import React, { useState } from 'react';
import { useKitchenOrders } from '@/hooks/useKitchenOrders';
import { KitchenHeader, KitchenFilter, OrderTicketGrid } from '@/components/kitchen';
import { KitchenAlertManager } from '@/components/kitchen/KitchenAlertManager';
import { KitchenHistory } from '@/components/KitchenHistory';
import { History, LayoutGrid } from 'lucide-react';

export default function DashboardKitchenPage() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState<KitchenFilter>('ALL');
  const [activeTab, setActiveTab] = useState<'LIVE' | 'HISTORY'>('LIVE');

  const {
    orders,
    isLoading,
    isConnected,
    updateOrderStatus,
    refetch,
  } = useKitchenOrders({
    isAudioEnabled,
    pollIntervalMs: 3500,
  });

  // Calculate live counts
  const pendingOrders = orders.filter((o) => o.status === 'PENDING');
  const pendingCount = pendingOrders.length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white pb-20">
      {/* 1. KDS Fixed Header */}
      <KitchenHeader
        restaurantName="Chez Fatou & Frères - Thiès"
        isConnected={isConnected}
        isAudioEnabled={isAudioEnabled}
        onToggleAudio={() => setIsAudioEnabled((prev) => !prev)}
        counts={{
          pending: pendingCount,
          preparing: preparingCount,
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
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('LIVE')}
              className={`min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                activeTab === 'LIVE'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-white'
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
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Historique ({servedCount})</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {pendingCount + preparingCount} en cuisine • {servedCount} servie(s)
          </div>
        </div>

        {/* Tab 1: Live KDS Grid */}
        {activeTab === 'LIVE' && (
          <OrderTicketGrid
            orders={orders}
            onUpdateStatus={updateOrderStatus}
            restaurantName="Chez Fatou & Frères"
            activeFilter={activeFilter}
          />
        )}

        {/* Tab 2: History View */}
        {activeTab === 'HISTORY' && (
          <KitchenHistory />
        )}
      </main>
    </div>
  );
}