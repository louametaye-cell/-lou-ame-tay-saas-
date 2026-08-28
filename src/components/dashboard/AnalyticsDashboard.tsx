'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Eye, 
  ShoppingBag, 
  Clock, 
  DollarSign, 
  Flame, 
  AlertCircle,
  BarChart3,
  Calendar
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';

interface DishAnalytics {
  id: string;
  name: string;
  category: string;
  views: number;
  orders: number;
  conversionRate: number; // in %
  revenue: number;
}

const SAMPLE_DISH_ANALYTICS: DishAnalytics[] = [
  {
    id: '1',
    name: 'Thiéboudienne Penda Mbaye Rouge',
    category: 'Plats Traditionnels',
    views: 450,
    orders: 142,
    conversionRate: 31.5,
    revenue: 568000,
  },
  {
    id: '2',
    name: 'Yassa Poulet Fermier Braisé',
    category: 'Plats Traditionnels',
    views: 380,
    orders: 98,
    conversionRate: 25.7,
    revenue: 392000,
  },
  {
    id: '3',
    name: 'Dibi Agneau Braisé au Feu de Bois',
    category: 'Grillades',
    views: 290,
    orders: 84,
    conversionRate: 28.9,
    revenue: 504000,
  },
  {
    id: '4',
    name: 'Bissap Maison Glacé',
    category: 'Boissons',
    views: 520,
    orders: 210,
    conversionRate: 40.3,
    revenue: 210000,
  },
  {
    id: '5',
    name: 'Salade Exotique Crevettes',
    category: 'Entrées',
    views: 180,
    orders: 12,
    conversionRate: 6.6,
    revenue: 42000,
  },
];

export const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');

  const totalViews = SAMPLE_DISH_ANALYTICS.reduce((s, d) => s + d.views, 0);
  const totalOrders = SAMPLE_DISH_ANALYTICS.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = SAMPLE_DISH_ANALYTICS.reduce((s, d) => s + d.revenue, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const avgConversion = totalViews > 0 ? Math.round((totalOrders / totalViews) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      {/* 1. Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-1">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Vues Fiches Plats</span>
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">
            {totalViews}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-1">
          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Commandes Validées</span>
          </span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {totalOrders}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-3xl space-y-1">
          <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Taux de Conversion</span>
          </span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {avgConversion}%
          </span>
        </div>

        <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 p-4 sm:p-5 rounded-3xl space-y-1">
          <span className="text-xs text-orange-400 font-bold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-orange-400" />
            <span>Panier Moyen</span>
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono">
            {formatFCFA(avgOrderValue)}
          </span>
        </div>
      </div>

      {/* 2. Peak Hours Bar Representation */}
      <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-400" />
            <h4 className="text-sm font-black text-white">
              Affluence & Heures de Pointe
            </h4>
          </div>
          <span className="text-xs text-slate-400">Pic principal : 13h00 - 14h30</span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-28 pt-2">
          {[
            { hour: '11h', val: 15 },
            { hour: '12h', val: 55 },
            { hour: '13h', val: 95 },
            { hour: '14h', val: 80 },
            { hour: '15h', val: 35 },
            { hour: '16h', val: 20 },
            { hour: '17h', val: 25 },
            { hour: '18h', val: 45 },
            { hour: '19h', val: 70 },
            { hour: '20h', val: 90 },
            { hour: '21h', val: 85 },
            { hour: '22h', val: 40 },
          ].map((bar) => (
            <div key={bar.hour} className="flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                style={{ height: `${bar.val}%` }}
                className={`w-full rounded-lg transition-all ${
                  bar.val > 75
                    ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-sm shadow-orange-500/20'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              />
              <span className="text-[10px] font-bold text-slate-400">{bar.hour}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Conversion Analysis Table (Vues vs Ventes) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-black text-white">
              Performance des Plats : Vues vs Commandes
            </h4>
          </div>
          <span className="text-xs text-slate-400">Diagnostic des plats boudés</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Plat</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3">Vues</th>
                <th className="py-3 px-3">Commandes</th>
                <th className="py-3 px-3">Taux Transfo</th>
                <th className="py-3 px-4 text-right">Chiffre d'Affaires</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {SAMPLE_DISH_ANALYTICS.map((dish) => (
                <tr key={dish.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-black text-white flex items-center gap-2">
                    {dish.conversionRate > 25 ? (
                      <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5" />
                    )}
                    <span>{dish.name}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{dish.category}</td>
                  <td className="py-3 px-3 text-slate-300 font-mono">{dish.views}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold font-mono">
                    {dish.orders}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-md font-black font-mono text-[11px] ${
                        dish.conversionRate < 10
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : dish.conversionRate > 30
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {dish.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-orange-400 font-mono">
                    {formatFCFA(dish.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};