'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Check, 
  Building, 
  Sparkles,
  Phone,
  MapPin,
  Users,
  Upload,
  Key,
  Lock,
  Image as ImageIcon
} from 'lucide-react';
import { RestaurantType } from '@/types';
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
  const [plans, setPlans] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tableCount, setTableCount] = useState(12);
  const [isActive, setIsActive] = useState(true);

  // Logo & Type d'établissement
  const [logoUrl, setLogoUrl] = useState('');
  const [establishmentType, setEstablishmentType] = useState('Restaurant');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Sécurité & Réinitialisation Mot de passe
  const [newPassword, setNewPassword] = useState('');

  const [selectedPlanSlug, setSelectedPlanSlug] = useState('xeweul');
  const [price, setPrice] = useState(35000);
  const [status, setStatus] = useState<string>('ACTIVE');
  const [endDate, setEndDate] = useState('');

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch available plans from BDD
  useEffect(() => {
    fetch('/api/admin/plans')
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) setPlans(data.plans);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || (restaurant as any).businessName || '');
      setOwnerName(restaurant.ownerName || '');
      setPhone(restaurant.phone || '');
      setAddress(restaurant.address || '');
      setTableCount(restaurant.tableCount || restaurant.tablesCount || 12);
      setIsActive(restaurant.isActive ?? true);

      const branding = (restaurant as any).branding || {};
      setLogoUrl(restaurant.logoUrl || branding.logoUrl || '');
      setEstablishmentType(branding.establishmentType || 'Restaurant');
      setNewPassword('');

      const planObj = (restaurant as any).plan;
      const currentPlanSlug = planObj?.slug || restaurant.subscription?.plan?.toLowerCase() || 'xeweul';
      setSelectedPlanSlug(currentPlanSlug);

      setPrice(restaurant.subscription?.price || Number(planObj?.price) || 35000);
      setStatus(restaurant.subscription?.status || 'ACTIVE');

      if (restaurant.subscription?.endDate) {
        const d = new Date(restaurant.subscription.endDate);
        if (!isNaN(d.getTime())) {
          setEndDate(d.toISOString().split('T')[0]);
        }
      }
    }
  }, [restaurant]);

  if (!isOpen || !restaurant) return null;

  const handlePlanChange = (slug: string) => {
    setSelectedPlanSlug(slug);
    const found = plans.find((p) => p.slug === slug || p.id === slug);
    if (found) {
      setPrice(found.price);
    }
  };

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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'louametay/logos');

      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success && data.image?.url) {
        setLogoUrl(data.image.url);
        toast.success('Logo officiel téléchargé avec succès !');
      } else {
        toast.error(data.error || "Erreur lors de l'upload du logo");
      }
    } catch (err) {
      toast.error('Erreur réseau lors de l\'upload du logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleGeneratePassword = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000);
    const generated = `Pass${randomPin}!`;
    setNewPassword(generated);
    toast.info(`Nouveau mot de passe généré : ${generated}`);
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
          establishmentType,
          logoUrl: logoUrl.trim() || undefined,
          newPassword: newPassword.trim() || undefined,
          plan: selectedPlanSlug,
          price: Number(price),
          status,
          endDate: endDate ? new Date(endDate).toISOString() : undefined,
        }),
      });

      if (res.ok) {
        toast.success('Paramètres et abonnement mis à jour avec succès dans la BDD !');
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`⚠️ ATTENTION : Êtes-vous certain de vouloir SUPPRIMER DÉFINITIVEMENT "${restaurant.name}" ? Cette action est irréversible.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/super-admin/restaurants/${restaurant.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success(`Restaurant ${restaurant.name} supprimé définitivement avec succès.`);
        onSuccess();
        onClose();
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la suppression');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la suppression');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header Light */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-orange-100 text-[#FF6B00] rounded-2xl border border-orange-200 shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Réglages & Abonnement : {restaurant.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Sous-domaine : <span className="font-mono text-[#FF6B00] font-bold">{restaurant.subdomain}.louametay.com</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white hover:bg-slate-200 border border-slate-200 text-slate-500 hover:text-slate-900 transition-all shadow-2xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content Light */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          
          {/* SECTION 1 : PROFIL ET SÉCURITÉ */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-[#FF6B00]" />
              <span>1. Profil de l&apos;Établissement</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nom du Restaurant</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#FF6B00] outline-none text-sm font-semibold shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nom du Gérant / Propriétaire</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ex: Fatou Diop"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#FF6B00] outline-none text-sm font-semibold shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Téléphone (WhatsApp)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#FF6B00] outline-none text-sm font-semibold font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de Tables</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tableCount}
                  onChange={(e) => setTableCount(parseInt(e.target.value, 10) || 12)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#FF6B00] outline-none text-sm font-semibold font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Type d&apos;Établissement</label>
                <select
                  value={establishmentType}
                  onChange={(e) => setEstablishmentType(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#FF6B00] outline-none text-sm font-semibold shadow-2xs"
                >
                  <option value="Restaurant">🍽️ Restaurant Traditionnel / Grillades</option>
                  <option value="Fastfood">⚡ Fastfood / Burger / Tacos</option>
                  <option value="Hôtel Restaurant">🏨 Hôtel Restaurant / Resort</option>
                  <option value="Pizzeria">🍕 Pizzeria / Trattoria</option>
                  <option value="Café">☕ Café / Salon de thé / Pâtisserie</option>
                  <option value="Bar / Lounge">🌴 Bar / Lounge / Maquis</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Logo Officiel de l&apos;Établissement</span>
                  <span className="text-[11px] text-slate-400 font-normal">JPG, PNG ou WebP</span>
                </label>
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-300">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-orange-200 bg-slate-50 shrink-0 relative flex items-center justify-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="URL du logo ou téléchargez un fichier..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs">
                        <Upload className="w-3.5 h-3.5 text-[#FF6B00]" />
                        <span>{isUploadingLogo ? 'Téléchargement...' : 'Télécharger un Logo (Fichier)'}</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                        />
                      </label>
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoUrl('')}
                          className="text-xs text-rose-600 hover:underline font-bold"
                        >
                          Effacer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">Adresse physique</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Avenue Lamine Guèye, Thiès / Dakar..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#FF6B00] outline-none text-sm shadow-2xs"
                />
              </div>
            </div>

            {/* Switch Actif / Inactif */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-200">
              <div>
                <span className="font-black text-slate-900 text-xs sm:text-sm block">Statut d&apos;Ouverture du Restaurant</span>
                <span className="text-xs text-slate-500 font-medium">Si désactivé, le client verra la page "Restaurant fermé".</span>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${isActive ? 'bg-[#00A86B]' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* SECTION 1.5 : SÉCURITÉ & IDENTIFIANTS GÉRANT */}
          <div className="space-y-4 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm">
            <h3 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>2. Sécurité & Accès de Connexion Gérant</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Nom d&apos;utilisateur / Identifiant</label>
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl font-mono text-amber-400 font-bold">
                  {restaurant.subdomain}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">Utilisé par le gérant pour se connecter sur /login.</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-300">Réinitialiser le Mot de Passe</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-[#FF6B00] hover:underline flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    <span>Générer</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Laisser vide pour ne pas modifier..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-white placeholder-slate-500 outline-none font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Si renseigné, remplace immédiatement l&apos;ancien mot de passe du gérant.</span>
              </div>
            </div>
          </div>

          {/* SECTION 2 : FORMULE ET TARIFICATION SAAS */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>2. Formule & Validité de l&apos;Abonnement</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Formule / Pack SaaS</label>
                <select
                  value={selectedPlanSlug}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#FF6B00] outline-none text-xs font-bold shadow-2xs"
                >
                  <option value="tambali">TÀMBALI (15 000 FCFA)</option>
                  <option value="nio-far">NIO FAR (25 000 FCFA)</option>
                  <option value="xeweul">XÉWEUL (35 000 FCFA)</option>
                  <option value="baobab">BAOBAB (46 800 FCFA)</option>
                  <option value="teranga">TERANGA (65 000 FCFA)</option>
                  <option value="buur">BUUR (80 000 FCFA)</option>
                  <option value="ndaje">NDAJÉ (Événementiel)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tarif Mensuel (FCFA)</label>
                <input
                  type="number"
                  step="500"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-[#FF6B00] focus:border-[#FF6B00] outline-none text-sm font-black font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Statut de Règlement</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#FF6B00] outline-none text-xs font-bold shadow-2xs"
                >
                  <option value="ACTIVE">🟢 ACTIVE (Opérationnel)</option>
                  <option value="TRIAL">🟠 TRIAL (Essai gratuit)</option>
                  <option value="PAST_DUE">⚠️ PAST_DUE (Impayé / Relance)</option>
                  <option value="SUSPENDED">🔴 SUSPENDED (Coupé)</option>
                </select>
              </div>
            </div>

            {/* Date d'expiration & Prolongations rapides */}
            <div className="pt-2 space-y-3">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF6B00]" />
                <span>Date d&apos;Expiration d&apos;Abonnement :</span>
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#FF6B00] outline-none text-xs font-mono font-bold shadow-2xs"
              />

              {/* Boutons de Prolongation Rapide 1-Clic */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  ⚡ Prolongation Rapide en 1 Clic :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleExtendMonths(1)}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 text-center shadow-2xs"
                  >
                    +1 Mois
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtendMonths(3)}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 text-center shadow-2xs"
                  >
                    +3 Mois
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtendMonths(6)}
                    className="p-2.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 text-center shadow-2xs"
                  >
                    +6 Mois
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExtendMonths(12)}
                    className="p-2.5 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-xl text-xs font-extrabold transition-all active:scale-95 text-center shadow-md"
                  >
                    +1 An (Annuel)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Controls Light */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Suppression...' : 'Supprimer le Restaurant'}</span>
            </button>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all"
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
