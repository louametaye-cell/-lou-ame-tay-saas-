'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Download, 
  RotateCcw, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  FileText, 
  UtensilsCrossed, 
  Layers, 
  RefreshCw,
  Info
} from 'lucide-react';
import { RestaurantType } from '@/types';
import { toast } from 'sonner';

interface TenantBackupPanelProps {
  restaurants: RestaurantType[];
}

export function TenantBackupPanel({ restaurants }: TenantBackupPanelProps) {
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>('');
  const [isLoadingSnapshot, setIsLoadingSnapshot] = useState(false);
  const [localSnapshots, setLocalSnapshots] = useState<any[]>([]);
  const [currentSnapshot, setCurrentSnapshot] = useState<any | null>(null);

  // Modale de restauration
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'MENU_CATALOG' | 'FULL_CONFIG'>('MENU_CATALOG');
  const [superAdminPassword, setSuperAdminPassword] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastRestoreResult, setLastRestoreResult] = useState<any | null>(null);

  useEffect(() => {
    if (restaurants.length > 0 && !selectedSubdomain) {
      setSelectedSubdomain(restaurants[0].subdomain);
    }
  }, [restaurants, selectedSubdomain]);

  // Charger les snapshots récents lors du changement de sélection
  const fetchSnapshotsInfo = async (subdomain: string) => {
    if (!subdomain) return;
    setIsLoadingSnapshot(true);
    try {
      const res = await fetch(`/api/super-admin/tenants/${subdomain}/backup`);
      if (res.ok) {
        const data = await res.json();
        setCurrentSnapshot(data.snapshot);
        setLocalSnapshots(data.localSnapshots || []);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Impossible de charger les données du backup');
      }
    } catch {
      toast.error('Erreur réseau lors de la récupération des snapshots');
    } finally {
      setIsLoadingSnapshot(false);
    }
  };

  useEffect(() => {
    if (selectedSubdomain) {
      fetchSnapshotsInfo(selectedSubdomain);
    }
  }, [selectedSubdomain]);

  const handleCreateSnapshot = async (downloadAfter: boolean = false) => {
    if (!selectedSubdomain) return;
    setIsLoadingSnapshot(true);
    try {
      if (downloadAfter) {
        window.open(`/api/super-admin/tenants/${selectedSubdomain}/backup?download=true`, '_blank');
        toast.success(`Téléchargement du snapshot JSON de "${selectedSubdomain}" lancé !`);
      } else {
        const res = await fetch(`/api/super-admin/tenants/${selectedSubdomain}/backup`);
        if (res.ok) {
          const data = await res.json();
          setCurrentSnapshot(data.snapshot);
          setLocalSnapshots(data.localSnapshots || []);
          toast.success(`Nouveau snapshot créé avec succès pour "${selectedSubdomain}" !`);
        } else {
          const err = await res.json();
          toast.error(err.error || 'Erreur lors de la création du snapshot');
        }
      }
    } catch {
      toast.error('Erreur de communication avec le serveur');
    } finally {
      setIsLoadingSnapshot(false);
    }
  };

  const handleTriggerRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubdomain) return;
    if (!superAdminPassword.trim()) {
      toast.error('Veuillez saisir votre mot de passe Super-Admin pour valider');
      return;
    }

    setIsRestoring(true);
    const start = Date.now();
    try {
      const res = await fetch(`/api/super-admin/tenants/${selectedSubdomain}/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: restoreMode,
          snapshot: currentSnapshot,
          superAdminPassword: superAdminPassword.trim(),
        }),
      });

      const data = await res.json();
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);

      if (res.ok && data.success) {
        toast.success(`Restauration réussie en ${elapsed}s ! Sanctuaire financier vérifié.`);
        setLastRestoreResult(data.result);
        setIsRestoreModalOpen(false);
        setSuperAdminPassword('');
        fetchSnapshotsInfo(selectedSubdomain);
      } else {
        toast.error(data.error || 'Échec de la restauration');
      }
    } catch {
      toast.error('Erreur critique de communication');
    } finally {
      setIsRestoring(false);
    }
  };

  const currentResto = restaurants.find((r) => r.subdomain === selectedSubdomain);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden" id="sauvegardes-pra">
      {/* Header du panneau */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold tracking-tight">Plan de Reprise d&apos;Activité (PRA) & Sauvegardes</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
              RTO &lt; 5 min
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Snapshots granulaires multi-tenants avec étanchéité et Sanctuaire Financier Inviolable.
          </p>
        </div>

        {/* Sélecteur de restaurant */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-300 whitespace-nowrap">
            Établissement cible :
          </label>
          <select
            value={selectedSubdomain}
            onChange={(e) => setSelectedSubdomain(e.target.value)}
            className="bg-slate-800 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.subdomain}>
                {r.name} ({r.subdomain})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-6 space-y-6">
        {/* Bannière Sanctuaire Financier */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1 text-emerald-950">
            <div className="font-bold flex items-center gap-1.5">
              <span>Principe du Sanctuaire Financier (Section 11)</span>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-800 font-semibold px-2 py-0.2 rounded-full">
                Protection Active
              </span>
            </div>
            <p className="text-emerald-800/90 leading-relaxed">
              Une restauration ne supprime et n&apos;écrase <strong>JAMAIS</strong> les sessions de caisse, les clôtures Z ou les commandes encaissées (PAID). Si l&apos;Hôtel Lat-Dior a encaissé 17 000 FCFA ce matin, ces ventes restent gravées en base et sa caisse reste parfaitement juste.
            </p>
          </div>
        </div>

        {/* Vue de l'état actuel et actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Carte État Actuel */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UtensilsCrossed className="w-3.5 h-3.5 text-slate-500" />
                Catalogue & Menu
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                {currentSnapshot?.catalog?.menuItems?.length || 0} plats
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p>• Catégories : <strong>{currentSnapshot?.catalog?.categories?.length || 0}</strong></p>
              <p>• Tables : <strong>{currentSnapshot?.spaces?.tables?.length || 0}</strong></p>
              <p>• Staff actif : <strong>{(currentSnapshot?.staff?.waiters?.length || 0) + (currentSnapshot?.staff?.cashiers?.length || 0)} personnes</strong></p>
            </div>
          </div>

          {/* Carte Ancrage Financier */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Ancrage Financier (Base)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Vérifié
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p>• Commandes totales : <strong>{currentSnapshot?.financialAnchor?.totalOrdersCount || 0}</strong></p>
              <p>• Commandes payées : <strong>{currentSnapshot?.financialAnchor?.paidOrdersCount || 0}</strong></p>
              <p>• Sessions de caisse : <strong>{currentSnapshot?.financialAnchor?.cashSessionsCount || 0}</strong></p>
            </div>
          </div>

          {/* Actions Immédiates */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Actions PRA Immédiates</span>
              <span className="text-[11px] text-slate-500">Exécution en moins de 30 secondes chrono</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCreateSnapshot(false)}
                  disabled={isLoadingSnapshot}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSnapshot ? 'animate-spin' : ''}`} />
                  <span>Snapshot Maintenant</span>
                </button>
                <button
                  onClick={() => handleCreateSnapshot(true)}
                  disabled={isLoadingSnapshot}
                  title="Télécharger le fichier JSON du snapshot"
                  className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition-all shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setIsRestoreModalOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurer l&apos;Établissement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dernier résultat de restauration s'il existe */}
        {lastRestoreResult && (
          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2 border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Restauration validée avec succès ({lastRestoreResult.mode})
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{lastRestoreResult.restoredAt}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300 pt-1">
              <div>• Catégories : <strong>{lastRestoreResult.summary?.categoriesProcessed}</strong></div>
              <div>• Plats rétablis : <strong>{lastRestoreResult.summary?.menuItemsCreatedOrUpdated}</strong></div>
              <div>• Commandes préservées : <strong>{lastRestoreResult.summary?.preservedOrdersCount}</strong></div>
              <div>• Sessions caisse : <strong>{lastRestoreResult.summary?.preservedSessionsCount}</strong></div>
            </div>
          </div>
        )}
      </div>

      {/* MODALE DE RESTAURATION SÉCURISÉE */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900">
                <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm">Restauration d&apos;Urgence : {currentResto?.name}</h3>
              </div>
              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTriggerRestore} className="space-y-4">
              {/* Choix du mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Périmètre de restauration :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRestoreMode('MENU_CATALOG')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      restoreMode === 'MENU_CATALOG'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Carte & Plats Seuls</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Catégories, plats, prix et photos. Idéal suppression accidentelle.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRestoreMode('FULL_CONFIG')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      restoreMode === 'FULL_CONFIG'
                        ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Config Intégrale</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Carte + Tables + Staff + Profil (0 altération financière).</div>
                  </button>
                </div>
              </div>

              {/* Rappel sécurité */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Garantie Sanctuaire Financier :</strong> Les {currentSnapshot?.financialAnchor?.totalOrdersCount || 0} commandes et sessions de caisse en cours restent strictement préservées.
                </span>
              </div>

              {/* Mot de passe de validation */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Mot de passe Super-Admin (Obligatoire) :</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Saisir votre mot de passe Super-Admin..."
                  value={superAdminPassword}
                  onChange={(e) => setSuperAdminPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(false)}
                  className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isRestoring}
                  className="text-xs font-bold px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRestoring ? 'animate-spin' : ''}`} />
                  <span>{isRestoring ? 'Restauration en cours...' : 'Confirmer la Restauration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
