'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  Receipt, 
  ArrowLeft, 
  Printer, 
  Clock, 
  Banknote, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  DollarSign,
  Calendar,
  Filter,
  RefreshCw,
  Store
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';
import { EscPosPrinterService } from '@/services/EscPosPrinterService';
import { CashSessionType } from '@/types';

export default function CashClosuresSupervisionPage() {
  const [sessions, setSessions] = useState<CashSessionType[]>([]);
  const [summary, setSummary] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    sessionsCount: 0,
    discrepanciesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantName, setRestaurantName] = useState('Mon Restaurant');
  const [activeSession, setActiveSession] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get('restaurantId') || '';
      const storedId = queryId || localStorage.getItem('current_restaurant_id') || '';
      const storedName = localStorage.getItem('current_restaurant_name') || 'Mon Restaurant';
      setRestaurantId(storedId);
      setRestaurantName(storedName);

      if (storedId) {
        fetchHistory(storedId);
        fetchLiveSession(storedId);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchLiveSession = async (tId: string) => {
    try {
      const res = await fetch(`/api/cashier/session?restaurantId=${encodeURIComponent(tId)}`);
      const data = await res.json();
      if (data.success && data.session && data.session.status === 'OPEN') {
        setActiveSession(data.session);
      } else {
        setActiveSession(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHistory = async (tId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tenant/cash-sessions?restaurantId=${encodeURIComponent(tId)}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
        setSummary(data.summary || {});
      } else {
        toast.error(data.error || 'Erreur lors du chargement des clôtures');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintZ = (session: any) => {
    try {
      EscPosPrinterService.printZReport(session, restaurantName);
      toast.success(`Impression du Ticket Z de ${session.cashier?.name || 'la session'} lancée`);
    } catch (e) {
      toast.error('Erreur lors de l\'impression du rapport Z');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Retour au Tableau de Bord"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">Traçabilité & Clôtures de Caisse</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Comptabilité & Audit
                </span>
              </div>
              <p className="text-xs text-slate-500">{restaurantName} • Suivi des fonds de caisse, ventes par canal et rapports Z</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/cashiers"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 transition-all border border-slate-200"
            >
              <Users className="w-4 h-4 text-slate-600" />
              <span>Gérer les Caissiers</span>
            </Link>
            <button
              onClick={() => {
                fetchHistory(restaurantId);
                fetchLiveSession(restaurantId);
                toast.info('Données actualisées');
              }}
              className="p-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all border border-slate-200"
              title="Rafraîchir"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* SESSION ACTIVE EN DIRECT (SI CAISSE OUVERTE) */}
        {activeSession ? (
          <section className="bg-linear-to-r from-emerald-600 to-teal-700 text-white p-6 sm:p-8 rounded-3xl shadow-lg border border-emerald-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-white backdrop-blur-xs flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                    SESSION EN COURS DE SERVICE
                  </span>
                  <span className="text-xs font-medium text-emerald-100">
                    Ouverte le {new Date(activeSession.openedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <span>Caissier en poste :</span>
                  <span className="underline decoration-emerald-300 underline-offset-4">
                    {activeSession.cashier?.name} ({activeSession.cashier?.shift || 'Matin'})
                  </span>
                </h2>

                <div className="flex flex-wrap gap-4 text-xs font-bold text-emerald-100 pt-2">
                  <span className="bg-black/20 px-3 py-1.5 rounded-xl">
                    Fond de démarrage : <strong>{formatFCFA(activeSession.openingFloat)}</strong>
                  </span>
                  <span className="bg-black/20 px-3 py-1.5 rounded-xl">
                    Espèces théoriques actuelles : <strong>{formatFCFA(activeSession.liveTotals?.expectedCash || activeSession.openingFloat)}</strong>
                  </span>
                  <span className="bg-black/20 px-3 py-1.5 rounded-xl">
                    Commandes servies : <strong>{activeSession.liveTotals?.orderCount || 0}</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center w-full sm:w-auto">
                  <p className="text-[11px] font-bold text-emerald-200 uppercase">Recettes de la session</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {formatFCFA(activeSession.liveTotals?.totalRevenue || 0)}
                  </p>
                </div>

                <Link
                  href={`/cashier${restaurantId ? `?restaurantId=${restaurantId}` : ''}`}
                  target="_blank"
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-sm bg-white text-emerald-800 hover:bg-emerald-50 shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>Accéder à la Caisse</span>
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Aucune session de caisse ouverte en ce moment</h3>
                <p className="text-xs text-slate-500">
                  Le prochain caissier devra s'identifier avec son code PIN et saisir son fond de roulement pour démarrer.
                </p>
              </div>
            </div>
            <Link
              href={`/cashier${restaurantId ? `?restaurantId=${restaurantId}` : ''}`}
              target="_blank"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-xs transition-all"
            >
              <Store className="w-4 h-4" />
              <span>Ouvrir une Caisse</span>
            </Link>
          </section>
        )}

        {/* STATISTIQUES GLOBALES */}
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recettes Clôturées</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{formatFCFA(summary.totalRevenue || 0)}</h3>
            <p className="text-xs text-slate-400 mt-1">Cumul des sessions terminées</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sessions Clôturées</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.sessionsCount || 0}</h3>
            <p className="text-xs text-slate-400 mt-1">Nombre de shifts enregistrés</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Commandes Clôturées</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.totalOrders || 0}</h3>
            <p className="text-xs text-slate-400 mt-1">Tickets de caisse encaissés</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contrôle des Écarts</p>
            <h3 className={`text-2xl font-black mt-1 ${summary.discrepanciesCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {summary.discrepanciesCount > 0 ? `${summary.discrepanciesCount} écart(s)` : '0 écart (100%)'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Équilibre tiroir-caisse</p>
          </div>
        </section>

        {/* TABLEAU DES CLÔTURES DE CAISSE (RAPPORTS Z) */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-600" />
                <span>Historique Infalsifiable des Clôtures (Rapports Z)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Chaque ligne représente un shift terminé avec ventilation par moyen de paiement et écart physique calculé.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">Chargement de l'historique des caisses...</div>
          ) : sessions.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <p className="font-bold text-base">Aucune clôture de caisse archivée pour l'instant.</p>
              <p className="text-xs">Les clôtures apparaîtront ici automatiquement dès qu'un caissier terminera son shift.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-black text-xs uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-6">Caissier & Shift</th>
                    <th className="py-3.5 px-6">Date & Durée</th>
                    <th className="py-3.5 px-6 text-right">Fond départ</th>
                    <th className="py-3.5 px-6 text-right">Espèces</th>
                    <th className="py-3.5 px-6 text-right">Wave / OM / Yas</th>
                    <th className="py-3.5 px-6 text-right">CA Total</th>
                    <th className="py-3.5 px-6 text-center">Écart Caisse</th>
                    <th className="py-3.5 px-6 text-center">Rapport Z</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sessions.map((s: any) => {
                    const discrepancy = Number(s.cashDiscrepancy) || 0;
                    const isClosed = s.status === 'CLOSED';
                    const mobileMoneyTotal = (Number(s.totalWave) || 0) + (Number(s.totalOM) || 0) + (Number(s.totalYas) || 0);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6 font-medium">
                          <div className="font-black text-slate-900">{s.cashier?.name || 'Caissier Inconnu'}</div>
                          <div className="text-[11px] text-slate-400 font-bold uppercase">{s.cashier?.shift || 'STANDARD'}</div>
                        </td>

                        <td className="py-4 px-6 text-xs text-slate-600">
                          <div className="font-bold text-slate-800">
                            {new Date(s.openedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(s.openedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {' ➔ '}
                            {s.closedAt
                              ? new Date(s.closedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                              : 'En cours'}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right font-mono font-bold text-slate-700">
                          {formatFCFA(Number(s.openingFloat))}
                        </td>

                        <td className="py-4 px-6 text-right font-mono font-bold text-slate-900">
                          {formatFCFA(Number(s.totalCash))}
                        </td>

                        <td className="py-4 px-6 text-right font-mono text-xs text-slate-600">
                          <div>{formatFCFA(mobileMoneyTotal)}</div>
                          <div className="text-[10px] text-slate-400">
                            W: {formatFCFA(Number(s.totalWave))} | OM: {formatFCFA(Number(s.totalOM))}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right font-mono font-black text-sm text-slate-900">
                          {formatFCFA(Number(s.totalRevenue))}
                        </td>

                        <td className="py-4 px-6 text-center">
                          {!isClosed ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 animate-pulse">
                              En cours
                            </span>
                          ) : discrepancy === 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                              0 FCFA (Équilibré)
                            </span>
                          ) : discrepancy > 0 ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 border border-blue-200">
                              +{formatFCFA(discrepancy)} (Excédent)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-800 border border-red-200">
                              {formatFCFA(discrepancy)} (Manquant)
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => handlePrintZ(s)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 mx-auto transition-colors border border-slate-200"
                            title="Réimprimer le ticket Z 80mm"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>Ticket Z</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
