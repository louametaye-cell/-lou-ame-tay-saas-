'use client';

import React, { useState, useMemo } from 'react';
import { 
  Lock, 
  X, 
  Banknote, 
  Smartphone, 
  CreditCard, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Plus,
  Minus
} from 'lucide-react';
import { formatFCFA, playOrderSound } from '@/lib/utils';
import { EscPosPrinterService } from '@/services/EscPosPrinterService';
import { toast } from 'sonner';

interface CashClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionClosed: (closedSession: any) => void;
  session: any;
  cashierName?: string;
  restaurantName?: string;
}

// Coupures officielles BCEAO (FCFA)
const DENOMINATIONS: number[] = [10000, 5000, 2000, 1000, 500, 250, 200, 100, 50];

export const CashClosureModal: React.FC<CashClosureModalProps> = ({
  isOpen,
  onClose,
  onSessionClosed,
  session,
  cashierName = 'Caissier(e)',
  restaurantName = 'LOU AME TAY ?'
}) => {
  // Mode : 'COUNTING' (Comptage à l'aveugle) ou 'RESULT' (Rapport Z certifié)
  const [step, setStep] = useState<'COUNTING' | 'RESULT'>('COUNTING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SECTION A : Coupures Espèces { [valeur]: quantité }
  const [denominations, setDenominations] = useState<Record<number, number>>({
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
    500: 0,
    250: 0,
    200: 0,
    100: 0,
    50: 0
  });

  // SECTION B : Mobile Money & TPE
  const [waveInput, setWaveInput] = useState<string>('');
  const [omInput, setOmInput] = useState<string>('');
  const [freeInput, setFreeInput] = useState<string>('');
  const [tpeInput, setTpeInput] = useState<string>('');

  // SECTION C : Observations
  const [closingNotes, setClosingNotes] = useState<string>('');

  // Résultat post-validation
  const [closureResult, setClosureResult] = useState<any>(null);

  // Calcul dynamique temps réel : Total Espèces
  const totalCashCounted = useMemo(() => {
    return Object.entries(denominations).reduce((acc, [denomStr, qty]) => {
      const denom = Number(denomStr);
      return acc + denom * (Number(qty) || 0);
    }, 0);
  }, [denominations]);

  // Calcul dynamique temps réel : Total Mobile & TPE
  const totalDigitalCounted = useMemo(() => {
    const wave = Math.max(0, Number(waveInput) || 0);
    const om = Math.max(0, Number(omInput) || 0);
    const free = Math.max(0, Number(freeInput) || 0);
    const tpe = Math.max(0, Number(tpeInput) || 0);
    return wave + om + free + tpe;
  }, [waveInput, omInput, freeInput, tpeInput]);

  // Grand Total Global Compté
  const grandTotalCounted = useMemo(() => {
    return totalCashCounted + totalDigitalCounted;
  }, [totalCashCounted, totalDigitalCounted]);

  // Handler modification de quantité d'une coupure
  const handleDenominationChange = (val: number, newQty: number) => {
    const qty = Math.max(0, Math.floor(newQty || 0));
    setDenominations((prev) => ({
      ...prev,
      [val]: qty
    }));
  };

  const handleDenominationStep = (val: number, delta: number) => {
    setDenominations((prev) => {
      const current = prev[val] || 0;
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        [val]: next
      };
    });
  };

  // Soumission de la clôture au serveur (calcul des écarts certifié côté serveur)
  const handleSubmitClosure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.id) {
      toast.error('Session invalide');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        sessionId: session.id,
        countedCash: totalCashCounted,
        countedWave: Math.max(0, Number(waveInput) || 0),
        countedOM: Math.max(0, Number(omInput) || 0),
        countedFree: Math.max(0, Number(freeInput) || 0),
        countedCard: Math.max(0, Number(tpeInput) || 0),
        denominations,
        notes: closingNotes.trim() || undefined
      };

      const res = await fetch('/api/cashier/session', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setClosureResult(data);
        setStep('RESULT');
        playOrderSound();
        toast.success('Clôture de caisse enregistrée et certifiée !');
      } else {
        toast.error(data.error || 'Erreur lors de la clôture de caisse');
      }
    } catch (err) {
      console.error('Erreur clôture:', err);
      toast.error('Erreur de communication avec le serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Impression du Rapport Z (80mm)
  const handlePrintZ = () => {
    if (!closureResult?.session) return;
    try {
      EscPosPrinterService.printZReport(closureResult.session, restaurantName);
      toast.success('Rapport Z envoyé à l\'impression !');
    } catch (e) {
      toast.error('Erreur lors de l\'impression du rapport');
    }
  };

  // Finalisation et fermeture définitive
  const handleFinishAndClose = () => {
    if (closureResult?.session) {
      onSessionClosed(closureResult.session);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 text-slate-900 my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER UNIFIÉ "EXECUTIVE CLEAN" */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Clôture Comptable de Caisse</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                  Rapport Z
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Caissier : <strong className="text-slate-800">{cashierName}</strong>
                {session?.openedAt && (
                  <span>
                    {' '}• Ouvert depuis {new Date(session.openedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>
          </div>

          {step === 'COUNTING' && (
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              title="Fermer la modale"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* CONTENU PRINCIPAL SCROLLABLE */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {/* ========================================================= */}
          {/* PHASE 1 : COMPTAGE À L'AVEUGLE (Saisie des Espèces & Soldes) */}
          {/* ========================================================= */}
          {step === 'COUNTING' && (
            <form onSubmit={handleSubmitClosure} className="space-y-6">

              {/* Règle d'or de la clôture à l'aveugle */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Protocole de Clôture à l'Aveugle Certifié :</span>
                  <p className="text-emerald-800 mt-0.5">
                    Saisissez en toute transparence les espèces réelles dénombrées dans votre tiroir ainsi que les soldes reçus sur vos téléphones Wave / Orange Money / TPE. 
                    Le système certifiera les écarts automatiquement dès validation.
                  </p>
                </div>
              </div>

              {/* SECTION A : COMPTAGE DES ESPÈCES (CALCULATEUR DE COUPURES) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-emerald-700" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Section A — Comptage des Espèces (FCFA)
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    BCEAO (9 coupures)
                  </span>
                </div>

                {/* Grille responsive des 9 coupures */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {DENOMINATIONS.map((denom) => {
                    const qty = denominations[denom] || 0;
                    const subtotal = denom * qty;
                    return (
                      <div
                        key={denom}
                        className={`p-3 rounded-2xl border transition-all ${
                          qty > 0 
                            ? 'bg-emerald-50/40 border-emerald-300 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Haut de la carte : Valeur de la coupure + Sous-total */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-slate-800">
                            {formatFCFA(denom)}
                          </span>
                          <span className={`text-[11px] font-mono font-bold ${qty > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {formatFCFA(subtotal)}
                          </span>
                        </div>

                        {/* Zone de contrôle quantité : Bouton - | Input | Bouton + */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDenominationStep(denom, -1)}
                            disabled={qty === 0}
                            className="w-9 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm transition-all shrink-0"
                            aria-label={`Diminuer coupure ${denom}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={qty === 0 ? '' : qty}
                            onChange={(e) => handleDenominationChange(denom, Number(e.target.value))}
                            placeholder="0"
                            className="w-full h-11 text-center font-mono font-black text-base bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                          />

                          <button
                            type="button"
                            onClick={() => handleDenominationStep(denom, 1)}
                            className="w-9 h-11 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-sm transition-all shrink-0"
                            aria-label={`Augmenter coupure ${denom}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Encart Total Espèces Section A */}
                <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                      Total Espèces Compté dans le Tiroir :
                    </span>
                  </div>
                  <div className="font-mono font-black text-xl text-slate-900">
                    {formatFCFA(totalCashCounted)}
                  </div>
                </div>
              </div>

              {/* SECTION B : SOLDES MOBILE MONEY & TPE (DIGITAL) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-cyan-700" />
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      Section B — Soldes Mobile Money & TPE (Digital)
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Soldes reçus sur terminaux
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Wave */}
                  <div className="p-3.5 bg-cyan-50/50 border border-cyan-200/80 rounded-2xl space-y-1.5">
                    <label className="flex items-center justify-between text-xs font-bold text-cyan-950">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                        Wave (Sénégal)
                      </span>
                      <span className="text-[10px] text-cyan-700 font-semibold">Solde encaissé</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        inputMode="numeric"
                        value={waveInput}
                        onChange={(e) => setWaveInput(e.target.value)}
                        placeholder="0"
                        className="w-full pr-14 pl-3 py-3 bg-white border border-cyan-200 rounded-xl font-mono font-black text-base text-cyan-950 focus:outline-hidden focus:border-cyan-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs font-bold text-cyan-600">FCFA</span>
                    </div>
                  </div>

                  {/* Orange Money */}
                  <div className="p-3.5 bg-orange-50/50 border border-orange-200/80 rounded-2xl space-y-1.5">
                    <label className="flex items-center justify-between text-xs font-bold text-orange-950">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                        Orange Money
                      </span>
                      <span className="text-[10px] text-orange-700 font-semibold">Solde encaissé</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        inputMode="numeric"
                        value={omInput}
                        onChange={(e) => setOmInput(e.target.value)}
                        placeholder="0"
                        className="w-full pr-14 pl-3 py-3 bg-white border border-orange-200 rounded-xl font-mono font-black text-base text-orange-950 focus:outline-hidden focus:border-orange-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs font-bold text-orange-600">FCFA</span>
                    </div>
                  </div>

                  {/* Free Money / Yas */}
                  <div className="p-3.5 bg-purple-50/50 border border-purple-200/80 rounded-2xl space-y-1.5">
                    <label className="flex items-center justify-between text-xs font-bold text-purple-950">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                        Free Money (Yas)
                      </span>
                      <span className="text-[10px] text-purple-700 font-semibold">Solde encaissé</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        inputMode="numeric"
                        value={freeInput}
                        onChange={(e) => setFreeInput(e.target.value)}
                        placeholder="0"
                        className="w-full pr-14 pl-3 py-3 bg-white border border-purple-200 rounded-xl font-mono font-black text-base text-purple-950 focus:outline-hidden focus:border-purple-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs font-bold text-purple-600">FCFA</span>
                    </div>
                  </div>

                  {/* Terminal Carte Bancaire / TPE */}
                  <div className="p-3.5 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-1.5">
                    <label className="flex items-center justify-between text-xs font-bold text-blue-950">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        Carte Bancaire / TPE
                      </span>
                      <span className="text-[10px] text-blue-700 font-semibold">Télécollecte</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        inputMode="numeric"
                        value={tpeInput}
                        onChange={(e) => setTpeInput(e.target.value)}
                        placeholder="0"
                        className="w-full pr-14 pl-3 py-3 bg-white border border-blue-200 rounded-xl font-mono font-black text-base text-blue-950 focus:outline-hidden focus:border-blue-500 transition-all"
                      />
                      <span className="absolute right-3.5 top-3.5 text-xs font-bold text-blue-600">FCFA</span>
                    </div>
                  </div>

                </div>

                {/* Encart Total Digital Section B */}
                <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wide">
                      Total Digital Compté (Mobile & TPE) :
                    </span>
                  </div>
                  <div className="font-mono font-black text-xl text-slate-900">
                    {formatFCFA(totalDigitalCounted)}
                  </div>
                </div>
              </div>

              {/* SECTION C : OBSERVATIONS & GRAND TOTAL COMPTÉ */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Observations / Remarques de fin de shift (facultatif) :
                  </label>
                  <input
                    type="text"
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    placeholder="Ex: Rendu de monnaie validé, rouleau ticket changé..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-slate-400 focus:bg-white transition-all"
                  />
                </div>

                {/* Grand Total Global Compté (Espèces + Digital) */}
                <div className="p-5 bg-emerald-50/70 border-2 border-emerald-500/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div>
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                      GRAND TOTAL COMPTÉ GLOBAL
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Espèces ({formatFCFA(totalCashCounted)}) + Digital ({formatFCFA(totalDigitalCounted)})
                    </span>
                  </div>
                  <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-800 tracking-tight">
                    {formatFCFA(grandTotalCounted)}
                  </div>
                </div>

                {/* Boutons d'Action */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all min-h-[50px]"
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 min-h-[50px]"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {isSubmitting ? 'Certification en cours...' : 'Valider la Clôture de Caisse (Rapport Z)'}
                    </span>
                  </button>
                </div>
              </div>

            </form>
          )}

          {/* ========================================================= */}
          {/* PHASE 2 : BILAN DE CLÔTURE CERTIFIÉ (Rapport Z avec Écarts) */}
          {/* ========================================================= */}
          {step === 'RESULT' && closureResult && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* Badge de succès */}
              <div className="text-center space-y-1.5 pb-2">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Session de Caisse Clôturée avec Succès !
                </h3>
                <p className="text-xs text-slate-500">
                  Le Rapport Z officiel a été certifié et enregistré en base de données sécurisée.
                </p>
              </div>

              {/* TABLEAU COMPARATIF MULTI-CANAUX (Théorique vs Compté vs Écart) */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="px-4 py-3 bg-slate-100 font-black text-xs text-slate-800 uppercase tracking-wider flex items-center justify-between">
                  <span>Tableau Comparatif Certifié (Shift Z)</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {new Date().toLocaleDateString('fr-FR')} • {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  
                  {/* En-tête des colonnes */}
                  <div className="grid grid-cols-12 px-4 py-2.5 bg-slate-50 font-bold text-slate-500 text-[11px]">
                    <div className="col-span-5">Moyen de Paiement</div>
                    <div className="col-span-3 text-right">Attendu</div>
                    <div className="col-span-2 text-right">Compté</div>
                    <div className="col-span-2 text-right">Écart</div>
                  </div>

                  {/* Lignes de chaque canal */}
                  {[
                    { key: 'cash', label: 'Espèces (Fond + Ventes)', icon: Banknote, color: 'text-emerald-700' },
                    { key: 'wave', label: 'Wave', icon: Smartphone, color: 'text-cyan-700' },
                    { key: 'orangeMoney', label: 'Orange Money', icon: Smartphone, color: 'text-orange-700' },
                    { key: 'freeMoney', label: 'Free Money (Yas)', icon: Smartphone, color: 'text-purple-700' },
                    { key: 'card', label: 'Cartes Bancaires / TPE', icon: CreditCard, color: 'text-blue-700' },
                  ].map((row) => {
                    const item = closureResult.comparison?.[row.key];
                    if (!item) return null;
                    const diff = Number(item.discrepancy) || 0;
                    const Icon = row.icon;

                    return (
                      <div key={row.key} className="grid grid-cols-12 px-4 py-3 items-center hover:bg-slate-50/50">
                        <div className="col-span-5 font-bold text-slate-800 flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${row.color}`} />
                          <span>{row.label}</span>
                        </div>
                        <div className="col-span-3 text-right font-mono text-slate-600">
                          {formatFCFA(item.expected)}
                        </div>
                        <div className="col-span-2 text-right font-mono font-bold text-slate-900">
                          {formatFCFA(item.counted)}
                        </div>
                        <div className="col-span-2 text-right font-mono font-black">
                          {diff === 0 ? (
                            <span className="text-emerald-700">0 F</span>
                          ) : diff > 0 ? (
                            <span className="text-blue-700">+{formatFCFA(diff)}</span>
                          ) : (
                            <span className="text-rose-700">-{formatFCFA(Math.abs(diff))}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Ligne TOTAL CONSOLIDÉ */}
                  {closureResult.comparison?.total && (() => {
                    const totalItem = closureResult.comparison.total;
                    const diff = Number(totalItem.discrepancy) || 0;
                    return (
                      <div className="grid grid-cols-12 px-4 py-3.5 bg-slate-100 font-black items-center text-sm">
                        <div className="col-span-5 text-slate-950">TOTAL CONSOLIDÉ :</div>
                        <div className="col-span-3 text-right font-mono text-slate-700">{formatFCFA(totalItem.expected)}</div>
                        <div className="col-span-2 text-right font-mono text-slate-950">{formatFCFA(totalItem.counted)}</div>
                        <div className="col-span-2 text-right font-mono">
                          {diff === 0 ? (
                            <span className="text-emerald-800">0 FCFA</span>
                          ) : diff > 0 ? (
                            <span className="text-blue-800">+{formatFCFA(diff)}</span>
                          ) : (
                            <span className="text-rose-800">-{formatFCFA(Math.abs(diff))}</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                </div>
              </div>

              {/* Bilan d'Écart Synthétique (Code couleur immuable Vert/Bleu/Rouge) */}
              {(() => {
                const totalDiff = Number(closureResult.comparison?.total?.discrepancy) || 0;
                if (totalDiff === 0) {
                  return (
                    <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-950">
                      <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                      <div>
                        <div className="font-black text-sm">Caisse Parfaitement Équilibrée !</div>
                        <div className="text-xs text-emerald-800">
                          Le montant compté correspond exactement aux ventes et au fond de caisse initial (Écart : 0 FCFA).
                        </div>
                      </div>
                    </div>
                  );
                } else if (totalDiff > 0) {
                  return (
                    <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-2xl flex items-center gap-3 text-blue-950">
                      <DollarSign className="w-6 h-6 text-blue-700 shrink-0" />
                      <div>
                        <div className="font-black text-sm">Excédent de Caisse Constaté : +{formatFCFA(totalDiff)}</div>
                        <div className="text-xs text-blue-800">
                          Le montant déclaré dépasse le montant théorique enregistré.
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-3 text-rose-950">
                      <AlertTriangle className="w-6 h-6 text-rose-700 shrink-0" />
                      <div>
                        <div className="font-black text-sm">Déficit / Manquant de Caisse Constaté : -{formatFCFA(Math.abs(totalDiff))}</div>
                        <div className="text-xs text-rose-800">
                          Le montant déclaré est inférieur au montant attendu. Ce manquant a été enregistré dans le journal d'audit.
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}

              {/* Actions Post-Clôture */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintZ}
                  className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 min-h-[50px]"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Imprimer Rapport Z (80mm)</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishAndClose}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 min-h-[50px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Terminer & Fermer Session</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
