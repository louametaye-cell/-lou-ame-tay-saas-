'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  KeyRound, 
  Clock, 
  Sun, 
  Moon, 
  Calendar, 
  ShieldCheck, 
  ArrowLeft, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  Briefcase,
  Store,
  Receipt
} from 'lucide-react';
import { CashierType, CashierShift } from '@/types';

export default function CashiersManagementPage() {
  const [cashiers, setCashiers] = useState<CashierType[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantName, setRestaurantName] = useState('Mon Restaurant');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [shift, setShift] = useState<CashierShift>('MORNING');
  const [schedule, setSchedule] = useState('08h00 - 16h00 (Lundi au Samedi)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('current_restaurant_id') || '';
      const storedName = localStorage.getItem('current_restaurant_name') || 'Mon Restaurant';
      setRestaurantId(storedId);
      setRestaurantName(storedName);

      if (storedId) {
        fetchCashiers(storedId);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchCashiers = async (tId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tenant/cashiers?restaurantId=${encodeURIComponent(tId)}`);
      const data = await res.json();
      if (data.success) {
        setCashiers(data.cashiers || []);
      } else {
        toast.error(data.error || 'Erreur lors du chargement des caissiers');
      }
    } catch (e) {
      toast.error('Erreur réseau lors de la récupération des caissiers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCashier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Le nom du caissier est requis');
      return;
    }
    if (!/^\d{4}$/.test(pinCode.trim())) {
      toast.error('Le code PIN doit comporter exactement 4 chiffres');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/tenant/cashiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          name: name.trim(),
          phone: phone.trim() || undefined,
          pinCode: pinCode.trim(),
          shift,
          schedule: schedule.trim() || undefined
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`Caissier « ${data.cashier.name} » ajouté avec succès !`);
        setName('');
        setPhone('');
        setPinCode('');
        setShift('MORNING');
        setSchedule('08h00 - 16h00 (Lundi au Samedi)');
        fetchCashiers(restaurantId);
      } else {
        toast.error(data.error || 'Erreur lors de la création du caissier');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (cashier: CashierType) => {
    try {
      const res = await fetch(`/api/tenant/cashiers/${cashier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !cashier.isActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(cashier.isActive ? 'Caissier désactivé' : 'Caissier réactivé');
        fetchCashiers(restaurantId);
      } else {
        toast.error(data.error || 'Erreur de modification');
      }
    } catch (e) {
      toast.error('Erreur serveur');
    }
  };

  const togglePinVisibility = (id: string) => {
    setShowPins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getShiftBadge = (s: CashierShift) => {
    switch (s) {
      case 'MORNING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            Shift Matin (08h - 16h)
          </span>
        );
      case 'EVENING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            Shift Soir (16h - 00h)
          </span>
        );
      case 'NIGHT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300">
            <Moon className="w-3.5 h-3.5 text-purple-600" />
            Shift Nuit (00h - 08h)
          </span>
        );
      case 'FULL_DAY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            Journée Continue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-600" />
            Horaires Personnalisés
          </span>
        );
    }
  };

  const activeCount = cashiers.filter((c) => c.isActive).length;
  const morningCount = cashiers.filter((c) => c.isActive && c.shift === 'MORNING').length;
  const eveningCount = cashiers.filter((c) => c.isActive && c.shift === 'EVENING').length;

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
                <h1 className="text-xl font-black text-slate-900">Équipe Caissiers & Plannings</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-orange-100 text-orange-800 border border-orange-200">
                  Espace Gérant
                </span>
              </div>
              <p className="text-xs text-slate-500">{restaurantName} • Définition des profils et codes PIN de caisse</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/cash-closures"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center gap-2 transition-all border border-slate-200"
            >
              <Receipt className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Traçabilité & Clôtures</span>
            </Link>
            <Link
              href={`/cashier${restaurantId ? `?restaurantId=${restaurantId}` : ''}`}
              target="_blank"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2 shadow-xs transition-all"
            >
              <Store className="w-4 h-4" />
              <span>Ouvrir l'Écran Caisse POS</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Caissiers Actifs</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{activeCount}</h3>
              <p className="text-xs text-slate-400 mt-1">Équipe autorisée à encaisser</p>
            </div>
            <div className="p-3.5 bg-blue-100 text-blue-800 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shift Matin</p>
              <h3 className="text-3xl font-black text-amber-700 mt-1">{morningCount}</h3>
              <p className="text-xs text-slate-400 mt-1">Créneau 08h00 - 16h00</p>
            </div>
            <div className="p-3.5 bg-amber-100 text-amber-800 rounded-2xl">
              <Sun className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shift Soir</p>
              <h3 className="text-3xl font-black text-indigo-700 mt-1">{eveningCount}</h3>
              <p className="text-xs text-slate-400 mt-1">Créneau 16h00 - 00h00</p>
            </div>
            <div className="p-3.5 bg-indigo-100 text-indigo-800 rounded-2xl">
              <Moon className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Formulaire d'Ajout de Caissier */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2.5 bg-orange-100 text-orange-800 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Ajouter un Caissier ou Caissière</h2>
              <p className="text-xs text-slate-500">
                Attribuez un code PIN unique à 4 chiffres que votre employé utilisera pour déverrouiller la caisse tactile.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateCashier} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom & Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Aminata Diallo"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Téléphone portable
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: +221 77 123 45 67"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Code PIN Caisse (4 chiffres) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 1234"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono tracking-widest font-black focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Sert à s'identifier sur l'écran caisse en 2 secondes.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Créneau de Travail (Shift) <span className="text-red-500">*</span>
              </label>
              <select
                value={shift}
                onChange={(e) => {
                  const s = e.target.value as CashierShift;
                  setShift(s);
                  if (s === 'MORNING') setSchedule('08h00 - 16h00 (Lundi au Samedi)');
                  else if (s === 'EVENING') setSchedule('16h00 - 00h00 (Lundi au Samedi)');
                  else if (s === 'NIGHT') setSchedule('00h00 - 08h00 (Service de nuit)');
                  else if (s === 'FULL_DAY') setSchedule('10h00 - 23h00 (Journée continue)');
                }}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
              >
                <option value="MORNING">🌅 Shift Matin (08h00 - 16h00)</option>
                <option value="EVENING">🌆 Shift Soir (16h00 - 00h00)</option>
                <option value="NIGHT">🌙 Shift Nuit (00h00 - 08h00)</option>
                <option value="FULL_DAY">☀️ Journée Continue</option>
                <option value="CUSTOM">⚙️ Horaires Spéciaux</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Planning Hebdomadaire & Précisions
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Ex: Lundi au Samedi, Repos Dimanche"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-hidden focus:border-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-2xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer le Caissier'}</span>
              </button>
            </div>
          </form>
        </section>

        {/* Liste des Caissiers */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-slate-600" />
              <span>Caissiers Enregistrés ({cashiers.length})</span>
            </h2>
            <button
              onClick={() => fetchCashiers(restaurantId)}
              className="text-xs font-bold text-orange-800 hover:text-orange-900"
            >
              🔄 Actualiser la liste
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
              Chargement des profils caissiers...
            </div>
          ) : cashiers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 space-y-2">
              <p className="font-bold text-base">Aucun caissier enregistré pour le moment.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Créez les profils de votre équipe (ex: un pour le shift du matin, un pour le shift du soir) pour permettre la traçabilité des ouvertures et fermetures de caisse.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cashiers.map((c: any) => (
                <div
                  key={c.id}
                  className={`bg-white rounded-3xl border p-6 shadow-xs flex flex-col justify-between transition-all ${
                    c.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                          {c.name}
                          {!c.isActive && (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full">
                              Inactif
                            </span>
                          )}
                        </h3>
                        {c.phone && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {c.phone}
                          </p>
                        )}
                      </div>
                      <div>{getShiftBadge(c.shift)}</div>
                    </div>

                    {/* Planning */}
                    {c.schedule && (
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{c.schedule}</span>
                      </div>
                    )}

                    {/* PIN Code Box */}
                    <div className="p-3 bg-orange-50/60 border border-orange-200/60 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-orange-600" />
                        <span className="text-xs font-bold text-slate-700">Code PIN de connexion :</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm tracking-widest text-slate-900">
                          {showPins[c.id] ? c.pinCode : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePinVisibility(c.id)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="Afficher/Masquer le PIN"
                        >
                          {showPins[c.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Sessions count info */}
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Sessions clôturées : <strong>{c._count?.sessions || 0}</strong></span>
                      <span>Commandes : <strong>{c._count?.orders || 0}</strong></span>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                        c.isActive
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {c.isActive ? 'Désactiver le compte' : 'Réactiver le compte'}
                    </button>

                    <Link
                      href={`/cashier${restaurantId ? `?restaurantId=${restaurantId}` : ''}`}
                      className="text-xs font-bold text-slate-700 hover:text-orange-600 flex items-center gap-1"
                    >
                      <span>Tester Caisse</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
