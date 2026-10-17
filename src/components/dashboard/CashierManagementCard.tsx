'use client';

import React, { useState } from 'react';
import {
  Lock,
  Pencil,
  RotateCcw,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Calendar,
  Sun,
  Moon,
  Clock,
  X,
  Save,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export interface CashierCardItem {
  id: string;
  tenantId: string;
  name: string;
  phone?: string | null;
  pinCode?: string;
  shift?: string;
  schedule?: string | null;
  isActive: boolean;
  hasOpenSession?: boolean;
  sessions?: Array<{ id: string; status: string }>;
  _count?: {
    sessions?: number;
    orders?: number;
  };
}

interface CashierManagementCardProps {
  cashier: CashierCardItem;
  restaurantId: string;
  restaurantSubdomain?: string;
  restaurantName?: string;
  onRefresh: () => void;
  compact?: boolean;
}

export function CashierManagementCard({
  cashier,
  restaurantId,
  restaurantSubdomain,
  restaurantName,
  onRefresh,
  compact = false,
}: CashierManagementCardProps) {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'reset'>('edit');
  const [newPin, setNewPin] = useState('');
  const [isSubmittingPin, setIsSubmittingPin] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const hasOpenSession =
    Boolean(cashier.hasOpenSession) ||
    Boolean(cashier.sessions?.some((s) => s.status === 'OPEN'));

  const openEditPinModal = () => {
    setModalMode('edit');
    setNewPin('');
    setModalError(null);
    setModalSuccess(null);
    setIsPinModalOpen(true);
  };

  const openResetPinModal = () => {
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setModalMode('reset');
    setNewPin(generated);
    setModalError(null);
    setModalSuccess(null);
    setIsPinModalOpen(true);
  };

  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    const cleanPin = newPin.trim();
    if (!/^\d{4}$/.test(cleanPin)) {
      setModalError('Le nouveau code PIN doit comporter exactement 4 chiffres.');
      return;
    }

    try {
      setIsSubmittingPin(true);
      const res = await fetch(`/api/tenant/cashiers/${cashier.id}/pin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(restaurantId ? { 'x-tenant-token': restaurantId } : {}),
        },
        body: JSON.stringify({
          newPin: cleanPin,
          restaurantId,
          tenantId: restaurantId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || 'Erreur lors de la modification du code PIN.';
        setModalError(errMsg);
        toast.error(errMsg);
        return;
      }

      const successMsg =
        data.message || `Code PIN de ${cashier.name} mis à jour avec succès.`;
      setModalSuccess(successMsg);
      toast.success(successMsg);
      onRefresh();

      setTimeout(() => {
        setIsPinModalOpen(false);
        setNewPin('');
        setModalSuccess(null);
      }, 900);
    } catch {
      const netErr = 'Erreur réseau lors de la connexion au serveur.';
      setModalError(netErr);
      toast.error(netErr);
    } finally {
      setIsSubmittingPin(false);
    }
  };

  const handleDeactivateOrReactivate = async () => {
    if (cashier.isActive && hasOpenSession) {
      toast.error(
        "Impossible de désactiver le compte : session de caisse en cours. Effectuez d'abord la clôture Z."
      );
      return;
    }

    if (cashier.isActive) {
      const confirmed = window.confirm(
        `Désactiver le compte caissier de « ${cashier.name} » ?\n\nSes historiques de sessions et clôtures Z seront intégralement conservés.`
      );
      if (!confirmed) return;

      try {
        setIsTogglingStatus(true);
        const res = await fetch(
          `/api/tenant/cashiers/${cashier.id}?restaurantId=${encodeURIComponent(restaurantId)}`,
          {
            method: 'DELETE',
            headers: restaurantId ? { 'x-tenant-token': restaurantId } : {},
          }
        );
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(data.message || 'Compte caissier désactivé avec succès.');
          onRefresh();
        } else {
          toast.error(data.error || 'Impossible de désactiver ce compte.');
        }
      } catch {
        toast.error('Erreur réseau lors de la désactivation.');
      } finally {
        setIsTogglingStatus(false);
      }
    } else {
      try {
        setIsTogglingStatus(true);
        const res = await fetch(`/api/tenant/cashiers/${cashier.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(restaurantId ? { 'x-tenant-token': restaurantId } : {}),
          },
          body: JSON.stringify({
            isActive: true,
            restaurantId,
          }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success(`Compte de ${cashier.name} réactivé.`);
          onRefresh();
        } else {
          toast.error(data.error || 'Erreur lors de la réactivation.');
        }
      } catch {
        toast.error('Erreur réseau.');
      } finally {
        setIsTogglingStatus(false);
      }
    }
  };

  const handleSendWhatsAppAccess = () => {
    if (!cashier.phone) {
      toast.error('Numéro de téléphone non renseigné pour ce caissier');
      return;
    }
    const cleanPhone = cashier.phone.replace(/[^0-9]/g, '');
    const targetResto = restaurantSubdomain || restaurantId;
    const message = encodeURIComponent(
      `Bonjour ${cashier.name},\nVoici votre lien d'accès au Poste Caisse de ${restaurantName || 'Lou Ame Tay ?'} :\n` +
        `🔗 Accès caisse : https://www.louametay.com/cashier?restaurantId=${targetResto}\n` +
        `🔐 Utilisez votre code PIN personnel à 4 chiffres.\nBon service !`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const renderShiftBadge = (shift?: string) => {
    switch (shift) {
      case 'MORNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            Matin (08h - 16h)
          </span>
        );
      case 'EVENING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            Soir (16h - 00h)
          </span>
        );
      case 'NIGHT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300">
            <Moon className="w-3.5 h-3.5 text-purple-600" />
            Nuit (00h - 08h)
          </span>
        );
      case 'FULL_DAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Journée Continue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            {shift || 'Standard'}
          </span>
        );
    }
  };

  return (
    <>
      <div
        className={`bg-white rounded-3xl border p-5 shadow-xs flex flex-col justify-between gap-4 transition-all ${
          cashier.isActive
            ? 'border-slate-200 hover:border-emerald-300'
            : 'border-slate-200 opacity-70 bg-slate-50'
        }`}
      >
        <div className="space-y-3.5">
          {/* En-tête : Identité & Statut */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-slate-900 text-base">{cashier.name}</h3>
                {!cashier.isActive && (
                  <span className="text-[11px] font-black px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                    Compte désactivé
                  </span>
                )}
                {hasOpenSession && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Session en cours
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{cashier.phone || 'Aucun téléphone renseigné'}</span>
              </p>
            </div>

            <div>{renderShiftBadge(cashier.shift)}</div>
          </div>

          {!compact && cashier.schedule && (
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>{cashier.schedule}</span>
            </div>
          )}

          {/* Zone Code PIN sécurisée : jamais de hash bcrypt, uniquement •••• avec cadenas */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Code PIN Caisse
                </span>
                <span
                  className="font-mono font-black text-lg tracking-widest text-slate-900 select-none"
                  data-testid={`cashier-pin-masked-${cashier.id}`}
                >
                  ••••
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={openEditPinModal}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-black bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="Modifier le code PIN à 4 chiffres"
              >
                <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                <span>Modifier le PIN</span>
              </button>

              <button
                type="button"
                onClick={openResetPinModal}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-black bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
                title="Générer et réinitialiser un nouveau code PIN"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                <span>Réinitialiser</span>
              </button>
            </div>
          </div>

          {!compact && cashier._count && (
            <div className="text-xs text-slate-500 flex items-center justify-between px-1">
              <span>
                Sessions : <strong className="text-slate-800">{cashier._count.sessions || 0}</strong>
              </span>
              <span>
                Commandes : <strong className="text-slate-800">{cashier._count.orders || 0}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Actions Pied de Carte */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="relative group inline-block">
            <button
              type="button"
              disabled={(cashier.isActive && hasOpenSession) || isTogglingStatus}
              onClick={handleDeactivateOrReactivate}
              title={
                cashier.isActive && hasOpenSession
                  ? "Impossible de désactiver le compte : session de caisse en cours. Effectuez d'abord la clôture Z."
                  : cashier.isActive
                  ? 'Désactiver le compte (Soft Delete)'
                  : 'Réactiver ce compte caissier'
              }
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                cashier.isActive && hasOpenSession
                  ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                  : cashier.isActive
                  ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700 cursor-pointer'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800 cursor-pointer'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>
                {cashier.isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
              </span>
            </button>

            {cashier.isActive && hasOpenSession && (
              <div className="hidden group-hover:block absolute bottom-full left-0 mb-2 w-64 p-2.5 bg-slate-900 text-white text-[11px] font-bold rounded-xl shadow-lg z-20 pointer-events-none">
                Session de caisse ouverte : effectuez d&apos;abord la clôture Z avant de désactiver ce compte.
              </div>
            )}
          </div>

          {cashier.phone && (
            <button
              type="button"
              onClick={handleSendWhatsAppAccess}
              className="min-h-[44px] px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-200 cursor-pointer ml-auto"
              title="Envoyer le lien d'accès caisse sur WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Lien WhatsApp</span>
            </button>
          )}
        </div>
      </div>

      {/* MODALE SHADCN/UI DE MODIFICATION / RÉINITIALISATION DU CODE PIN */}
      {isPinModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`modal-pin-title-${cashier.id}`}
        >
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id={`modal-pin-title-${cashier.id}`}
                    className="text-base font-black text-slate-900"
                  >
                    {modalMode === 'reset'
                      ? 'Réinitialiser le code PIN'
                      : 'Modifier le code PIN'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Caissier : <strong className="text-slate-800">{cashier.name}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPinModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {hasOpenSession && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs font-bold leading-relaxed">
                  Impossible de modifier le PIN : session de caisse en cours. Effectuez d&apos;abord la clôture Z.
                </div>
              </div>
            )}

            {modalError && (
              <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-500 text-rose-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs font-black leading-relaxed">{modalError}</div>
              </div>
            )}

            {modalSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500 text-emerald-950 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs font-black leading-relaxed">{modalSuccess}</div>
              </div>
            )}

            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <label
                  htmlFor={`new-pin-input-${cashier.id}`}
                  className="block text-xs font-black text-slate-800 mb-2"
                >
                  Nouveau code PIN (4 chiffres)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`new-pin-input-${cashier.id}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{4}"
                    value={newPin}
                    onChange={(e) => {
                      setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                      if (modalError) setModalError(null);
                    }}
                    placeholder="Ex: 2580"
                    autoFocus
                    required
                    className="flex-1 px-4 py-3.5 bg-slate-50 border-2 border-slate-300 focus:border-emerald-600 focus:bg-white rounded-2xl font-mono font-black text-2xl tracking-[0.5em] text-center text-slate-900 outline-hidden transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
                      setNewPin(randomPin);
                      setModalError(null);
                    }}
                    className="min-h-[52px] px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-black border border-slate-300 flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Générer un PIN aléatoire à 4 chiffres"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Générer</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Le code PIN sera haché avec bcrypt (coût 10) avant d&apos;être enregistré en base de données.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="min-h-[48px] px-4 py-2.5 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPin || newPin.length !== 4}
                  className="min-h-[48px] px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSubmittingPin ? 'Enregistrement...' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
