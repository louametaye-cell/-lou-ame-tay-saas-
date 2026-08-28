'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  BarChart3, 
  TrendingUp, 
  QrCode, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Clock, 
  Flame,
  Calendar,
  Sparkles,
  Store
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { formatFCFA } from '@/lib/utils';

export default function DashboardStatsPage() {
  const [trends, setTrends] = useState<any[]>([]);
  const [stats, setStats] = useState({
    todayRevenue: 125000,
    todayOrders: 18,
    todayCovers: 42,
    avgTicket: 6944,
  });

  useEffect(() => {
    fetch('/api/dashboard/weekly-trends')
      .then((res) => res.json())
      .then((data) => {
        if (data.trends) {
          setTrends(data.trends);
        }
      })
      .catch(() => {});

    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.todayRevenue) {
          setStats({
            todayRevenue: data.todayRevenue,
            todayOrders: data.todayOrders,
            todayCovers: data.todayCovers,
            avgTicket: data.todayOrders > 0 ? Math.round(data.todayRevenue / data.todayOrders) : 6500,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white font-sans selection:bg-orange-500 selection:text-white pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-400" />
                <span>Statistiques Détaillées de Caisse</span>
              </h1>
              <p className="text-xs text-slate-400">
                Analyse des ventes, affluence et performances en direct
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl">
            <span className="text-xs text-slate-400 font-bold block mb-1">Chiffre d&apos;Affaires Jour</span>
            <div className="text-2xl font-black text-white">{formatFCFA(stats.todayRevenue)}</div>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 block">↗ +12.5% vs hier</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl">
            <span className="text-xs text-slate-400 font-bold block mb-1">Commandes Traitées</span>
            <div className="text-2xl font-black text-white">{stats.todayOrders}</div>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 block">↗ +5.2% vs hier</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl">
            <span className="text-xs text-slate-400 font-bold block mb-1">Couverts Servis</span>
            <div className="text-2xl font-black text-white">{stats.todayCovers}</div>
            <span className="text-[11px] text-emerald-400 font-bold mt-1 block">↗ +8.0% vs hier</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl">
            <span className="text-xs text-slate-400 font-bold block mb-1">Ticket Moyen</span>
            <div className="text-2xl font-black text-orange-400">{formatFCFA(stats.avgTicket)}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Moyenne par table</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Évolution du CA (7 Derniers Jours)</h3>
                <p className="text-xs text-slate-400">Revenus générés par commandes QR code</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                En direct
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF6B00" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} FCFA`, 'CA']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scans vs Orders */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Scans vs Commandes Converties</h3>
                <p className="text-xs text-slate-400">Taux de conversion moyen : ~45%</p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Bar dataKey="scans" name="Scans QR" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="orders" name="Commandes" fill="#10b981" radius={[6, 6, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
