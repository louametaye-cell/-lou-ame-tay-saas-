'use client';

import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  QrCode, 
  TrendingUp, 
  Layers, 
  MapPin, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles, 
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Package,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

export default function SupportsPerformancePage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [assignedSupportId, setAssignedSupportId] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dashboard/supports-performance');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
      toast.error('Erreur chargement performances supports');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Performance Supports Physiques — Lou Ame Tay?';
    fetchData();
  }, []);

  const handleAssignSupport = async (tableId: string, supportId: string) => {
    try {
      setIsUpdating(true);
      const res = await fetch('/api/dashboard/supports-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, supportId }),
      });

      if (res.ok) {
        toast.success('Support physique associé à la table !');
        fetchData();
        setSelectedTableId(null);
      } else {
        toast.error('Erreur lors de l\'association');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-sm font-bold text-slate-600">Chargement de la télémétrie des supports...</span>
        </div>
      </div>
    );
  }

  const { summary, supportsPerformance, byMaterial, bySpace, byFinish, catalog, tables } = data;

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-900 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md">
            <QrCode className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>TRAÇABILITÉ DES SCANS PAR SUPPORT PHYSIQUE</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Analyse comparative de l&apos;engagement client selon les matériaux (Bois vs Acrylique) et les espaces.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all shadow-2xs"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualiser Télémétrie</span>
        </button>
      </div>

      {/* 4 GLOBAL KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">Scans QR Cumulés</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{summary.totalScans} scans</div>
            <span className="text-[11px] font-bold text-emerald-600">+{summary.scansToday} aujourd&apos;hui</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">Tables Équipées</span>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {summary.equippedTables} / {summary.totalTables}
            </div>
            <span className="text-[11px] font-bold text-slate-600">
              {Math.round((summary.equippedTables / (summary.totalTables || 1)) * 100)}% du parc couvert
            </span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">Support #1 Scanné</span>
            <div className="text-base font-black text-slate-900 truncate max-w-[180px]">
              {supportsPerformance[0]?.name || 'Cube VIP Bois'}
            </div>
            <span className="text-[11px] font-bold text-amber-600">
              {supportsPerformance[0]?.totalScans || 0} scans enregistrés
            </span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">Supports Non Assignés</span>
            <div className="text-2xl font-black text-slate-900 font-mono">{summary.unassignedTablesCount}</div>
            <span className="text-[11px] font-bold text-red-600">À configurer</span>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SECTION A : COMPARATIF PAR MATÉRIAU & FINITION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PAR MATÉRIAU */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Performance par Matériau</span>
          </h2>

          <div className="space-y-3">
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-amber-900 block">🪵 BOIS EXOTIQUE VIP</span>
                <span className="text-[10px] text-amber-800 font-medium">
                  {byMaterial.BOIS?.tablesCount || 0} tables équipées
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-amber-950">
                  {byMaterial.BOIS?.scans || 0}
                </span>
                <span className="block text-[10px] text-amber-800">scans</span>
              </div>
            </div>

            <div className="p-3 bg-cyan-50/60 rounded-xl border border-cyan-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-cyan-900 block">✨ ACRYLIQUE PREMIUM</span>
                <span className="text-[10px] text-cyan-800 font-medium">
                  {byMaterial.ACRYLIQUE?.tablesCount || 0} tables équipées
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-cyan-950">
                  {byMaterial.ACRYLIQUE?.scans || 0}
                </span>
                <span className="block text-[10px] text-cyan-800">scans</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-slate-700 block">⚙️ ALUMINIUM BROSSÉ</span>
                <span className="text-[10px] text-slate-600 font-medium">
                  {byMaterial.ALUMINIUM?.tablesCount || 0} tables
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black font-mono text-slate-900">
                  {byMaterial.ALUMINIUM?.scans || 0}
                </span>
                <span className="block text-[10px] text-slate-600">scans</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAR ESPACE / ZONE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Répartition par Emplacement</span>
          </h2>

          <div className="space-y-2.5">
            {[
              { key: 'TABLE', label: '🍽️ Tables Salle & Terrasse', color: 'slate' },
              { key: 'ROOM', label: '🛏️ Chambres d\'Hôtel', color: 'indigo' },
              { key: 'POOL', label: '🏊 Bord de Piscine (Transats)', color: 'blue' },
              { key: 'BEACH', label: '🏖️ Plage & Paillotes', color: 'amber' },
              { key: 'BAR', label: '🍸 Comptoir Bar / Lounge', color: 'purple' },
            ].map((space) => {
              const scans = bySpace[space.key]?.scans || 0;
              const count = bySpace[space.key]?.tablesCount || 0;
              const pct = summary.totalScans > 0 ? Math.round((scans / summary.totalScans) * 100) : 0;

              return (
                <div key={space.key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{space.label}</span>
                    <span className="font-mono text-slate-900">
                      {scans} scans ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PAR FINITION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Finition & Résistance</span>
          </h2>

          <div className="space-y-3">
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-950">🌊 Finition Marine (Sel & UV)</span>
                <span className="text-base font-black font-mono text-emerald-800">
                  {byFinish.MARINE_VERNIS?.scans || 0} scans
                </span>
              </div>
              <p className="text-[10px] text-emerald-800 font-medium">
                Conçu pour résister au climat tropical, air marin de Dakar/Saly et chlore de piscine.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">🏛️ Finition Standard</span>
                <span className="text-base font-black font-mono text-slate-900">
                  {byFinish.STANDARD?.scans || 0} scans
                </span>
              </div>
              <p className="text-[10px] text-slate-600 font-medium">
                Idéal pour les salles climatisées et les espaces intérieurs protégés.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B : ATTRIBUTION DES SUPPORTS AUX TABLES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-600" />
              <span>Inventaire des Tables & Supports Installés</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Configurez le support physique posé sur chaque table pour mesurer sa performance individuelle.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">{tables.length} tables répertoriées</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <th className="py-2.5 px-3">N° / Repère</th>
                <th className="py-2.5 px-3">Espace</th>
                <th className="py-2.5 px-3">Support Physique Installé</th>
                <th className="py-2.5 px-3">Matériau & Finition</th>
                <th className="py-2.5 px-3 text-center">Aujourd&apos;hui</th>
                <th className="py-2.5 px-3 text-center">Total Scans</th>
                <th className="py-2.5 px-3 text-right">Changer de Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tables.map((t: any) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-mono font-black text-sm text-slate-900">
                      Table #{t.tableNumber || t.identifier}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold text-[10px] text-slate-700">
                      {t.spaceType || 'TABLE'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {t.support ? (
                      <span className="font-extrabold text-slate-900">{t.support.name}</span>
                    ) : (
                      <span className="text-amber-800 font-bold italic text-[11px]">⚠️ Non assigné</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {t.support ? (
                      <span className="text-[10px] font-semibold text-slate-500">
                        {t.support.material} • {t.support.finishType}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                    +{t.scansToday || 0}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-black text-slate-900">
                    {t.totalScans || 0}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={t.support?.id || ''}
                      onChange={(e) => handleAssignSupport(t.id, e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-800 bg-white hover:border-emerald-500 focus:outline-hidden"
                    >
                      <option value="">-- Choisir un support --</option>
                      {catalog?.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.material})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
