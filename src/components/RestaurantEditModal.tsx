'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Calendar, 
  DollarSign, 
  Clock, 
  Trash2, 
  Check, 
  AlertTriangle,
  Building,
  User,
  Phone,
  MapPin,
  Layers,
  Plus
} from 'lucide-react';
import { RestaurantType, SubscriptionPlan, SubscriptionStatus } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface RestaurantEditModalProps {
  restaurant: RestaurantType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RestaurantEditModal: React.FC<RestaurantEditModalProps> = ({
  restaurant,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tableCount, setTableCount] = useState(12);
  const [isActive, setIsActive] = useState(true);

  const [plan, setPlan] = useState<SubscriptionPlan>('PRO');
  const [price, setPrice] = useState(25000);
  const [status, setStatus] = useState<SubscriptionStatus>('ACTIVE');
  const [endDate, setEndDate] = useState('');

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || '');
      setOwnerName(restaurant.ownerName || '');
      setPhone(restaurant.phone || '');
      setAddress(restaurant.address || '');
      setTableCount(restaurant.tableCount || restaurant.tablesCount || 12);
      setIsActive(restaurant.isActive ?? true);

      if (restaurant.subscription) {
        setPlan(restaurant.subscription.plan || 'PRO');
        setPrice(restaurant.subscription.price || 25000);
        setStatus(restaurant.subscription.status || 'ACTIVE');
        if (restaurant.subscription.endDate) {
          const d = new Date(restaurant.subscription.endDate);
          setEndDate(d.toISOString().split('T')[0]);
        }
      }
    }
  }, [restaurant]);

  if (!isOpen || !restaurant) return null;

  const handleExtendMonths = (months: number) => {
    const current = endDate ? new Date(endDate) : new Date();
    const base = current > new Date() ? current : new Date();
    base.setMonth(base.getMonth() + months);
    setEndDate(base.toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setIsActive(true);
    toast.success(`Abonnement prolongé de +${months} mois !`, {
      description: `Nouvelle échéance : ${base.toLocaleDateString('fr-FR')}`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/super-admin/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          ownerName,
          phone,
          address,
          tableCount: Number(tableCount),
          isActive,
          plan,
          price: Number(price),
          status,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        toast.success('Paramètres et abonnement mis à jour avec succès !');
        onSuccess();
        onClose();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous certain de vouloir supprimer définitivement "${restaurant.name}" ? Toutes les données associées seront effacées.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/super-admin/restaurants/${restaurant.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Restaurant ${restaurant.name} supprimé avec succès.`);
        onSuccess();
        onClose();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f1422] border-2 border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="p-5 bg-[#151b2e] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Réglages & Abonnement : {restaurant.name}
              </h2>
              <p className="text-xs text-slate-400">
                Sous-domaine : <span className="font-mono text-emerald-400 font-bold">{restaurant.subdomain}.louametay.sn</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-sm">
          {/* SECTION 1 : INFOS GÉNÉRALES RESTAURANT */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>1. Profil de l&apos;Établissement</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Nom du Restaurant</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Nom du Gérant / Propriétaire</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ex: Fatou Diop"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 outline-none text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Téléphone (WhatsApp)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 outline-none text-sm font-semibold font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Nombre de Tables</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tableCount}
                  onChange={(e) => setTableCount(parseInt(e.target.value, 10) || 12)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 outline-none text-sm font-semibold font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-400 block mb-1">Adresse physique</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Avenue Lamine Guèye, Thiès / Dakar..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-400 outline-none text-sm"
                />
              </div>
            </div>

            {/* Switch Actif / Inactif */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <div>
                <span className="font-black text-white text-sm block">Statut d&apos;Ouverture du Restaurant</span>
                <span className="text-xs text-slate-400">Si désactivé, le client verra la page "Restaurant fermé".</span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  isActive ? 'bg-emerald-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* SECTION 2 : GESTION FINANCIÈRE DE L'ABONNEMENT */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>2. Paramètres Financiers & Validité de l&apos;Abonnement</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Plan Tarifaire</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-400 outline-none text-sm font-semibold"
                >
                  <option value="STARTER">STARTER (15 000 FCFA)</option>
                  <option value="PRO">PRO (25 000 FCFA)</option>
                  <option value="ENTERPRISE">ENTERPRISE (50 000 FCFA)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Tarif Mensuel Ajusté (FCFA)</label>
                <input
                  type="number"
                  step="500"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-400 focus:border-emerald-400 outline-none text-sm font-black font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">Statut Abonnement</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-400 outline-none text-sm font-semibold"
                >
                  <option value="ACTIVE">ACTIVE (Opérationnel)</option>
                  <option value="TRIAL">TRIAL (Essai gratuit)</option>
                  <option value="EXPIRED">EXPIRED (Expiré)</option>
                  <option value="CANCELLED">CANCELLED (Résilié)</option>
                </select>
              </div>
            </div>

            {/* Date d'expiration & Prolongations rapides */}
            <div className="pt-2 space-y-3">
              <label className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Date d&apos;Expiration de la Période :</span>
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white focus:border-emerald-400 outline-none text-sm font-mono"
              />

              {/* Boutons de Prolongation Rapide 1-Clic */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  ⚡ Prolongation Rapide en 1 Clic :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExtendMonths(1)}
                    className="p-2.5 bg-slate-900 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
                  >
                    +1 Mois
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtendMonths(3)}
                    className="p-2.5 bg-slate-900 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
                  >
                    +3 Mois (Trimestre)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtendMonths(6)}
                    className="p-2.5 bg-slate-900 hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-xs font-bold transition-all active:scale-95 text-center"
                  >
                    +6 Mois (Semestre)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtendMonths(12)}
                    className="p-2.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black transition-all active:scale-95 text-center"
                  >
                    +1 An (Annuel)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-3 bg-red-950/50 hover:bg-red-900/70 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer le Restaurant</span>
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isSubmitting ? 'Enregistrement...' : 'Sauvegarder les modifications'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
