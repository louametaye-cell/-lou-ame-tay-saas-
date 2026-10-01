'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  ChefHat, 
  UserCheck, 
  Plus, 
  QrCode, 
  Phone, 
  Trash2, 
  Printer, 
  X, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';

interface WaiterMember {
  id: string;
  name: string;
  phone?: string | null;
  qrCodeSlug: string;
  isActive: boolean;
}

interface CookMember {
  id: string;
  name: string;
  phone?: string;
  shift: string;
  specialty: string;
}

export default function DashboardTeamPage() {
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantName, setRestaurantName] = useState('Mon Restaurant');
  const [restaurantSubdomain, setRestaurantSubdomain] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [waiters, setWaiters] = useState<WaiterMember[]>([]);
  const [cooks, setCooks] = useState<CookMember[]>([]);

  // Modal Ajout Membre
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState<'WAITER' | 'COOK'>('WAITER');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberShift, setNewMemberShift] = useState('FULL_DAY');
  const [newMemberSpecialty, setNewMemberSpecialty] = useState('Cuisine Générale');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal QR Code Serveur
  const [selectedWaiterQr, setSelectedWaiterQr] = useState<WaiterMember | null>(null);

  const fetchTeam = async () => {
    try {
      setIsLoading(true);
      const storedId = localStorage.getItem('current_restaurant_id') || '';
      const storedName = localStorage.getItem('current_restaurant_name') || '';
      const storedSub = localStorage.getItem('current_restaurant_subdomain') || '';
      const effectiveId = storedId || storedSub || 'anima-pizzeria';

      setRestaurantId(effectiveId);
      if (storedName) setRestaurantName(storedName);
      if (storedSub) setRestaurantSubdomain(storedSub);

      const res = await fetch(`/api/tenant/team?restaurantId=${effectiveId}`);
      if (res.ok) {
        const data = await res.json();
        setWaiters(data.waiters || []);
        setCooks(data.cooks || []);
      }
    } catch (err) {
      console.error('Erreur chargement équipe:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Équipe — Espace Gérant Lou Ame Tay?';
    fetchTeam();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) {
      toast.error('Le nom du membre est obligatoire');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/tenant/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          role: newMemberRole,
          name: newMemberName.trim(),
          phone: newMemberPhone.trim(),
          shift: newMemberShift,
          specialty: newMemberSpecialty.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || 'Membre ajouté avec succès !');
        setIsAddModalOpen(false);
        setNewMemberName('');
        setNewMemberPhone('');
        fetchTeam();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Erreur lors de l\'ajout');
      }
    } catch {
      toast.error('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: string, role: 'WAITER' | 'COOK', name: string) => {
    if (!window.confirm(`Retirer ${name} de l'équipe ?`)) return;
    try {
      const res = await fetch(`/api/tenant/team?restaurantId=${restaurantId}&memberId=${memberId}&role=${role}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success(`${name} a été retiré(e) de l'équipe`);
        fetchTeam();
      } else {
        toast.error('Erreur lors du retrait');
      }
    } catch {
      toast.error('Erreur réseau');
    }
  };

  const getShiftBadge = (shift: string) => {
    switch (shift) {
      case 'MORNING':
        return { label: 'Matin (08h - 16h)', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'EVENING':
        return { label: 'Soir (16h - 00h)', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'NIGHT':
        return { label: 'Nuit (00h - 08h)', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      default:
        return { label: 'Journée Complète', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-500 selection:text-white pb-24">
      {/* 1. Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="min-h-[44px] min-w-[44px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center transition-all border border-slate-200 active:scale-95 shadow-2xs cursor-pointer"
              title="Retour au Tableau de Bord"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>👥 Équipe &amp; Personnel</span>
                <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2.5 py-0.5 rounded-lg border border-amber-200 hidden sm:inline">
                  {restaurantName}
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Gérez la brigade cuisine et le service en salle avec badges QR d'appel personnel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="min-h-[46px] px-5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un membre</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-8">
        
        {/* SECTION 1 : SERVEURS EN SALLE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Serveurs &amp; Personnel de Salle</h2>
                <p className="text-xs text-slate-500">
                  Chaque serveur dispose d'un QR code personnel pour l'assignation directe des tables et l'appel client.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              {waiters.length} serveur(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {waiters.map((w) => (
              <div
                key={w.id}
                className="bg-white border-2 border-slate-200 hover:border-emerald-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center border border-emerald-200">
                        {w.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 leading-tight">{w.name}</h3>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{w.phone || 'Pas de numéro'}</span>
                        </span>
                      </div>
                    </div>

                    <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">
                      Actif
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Badge QR :</span>
                    <span className="font-mono text-emerald-700 font-bold">{w.qrCodeSlug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setSelectedWaiterQr(w)}
                    className="flex-1 min-h-[40px] px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-emerald-200 cursor-pointer"
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Badge QR Personnel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMember(w.id, 'WAITER', w.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="Supprimer le serveur"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {waiters.length === 0 && !isLoading && (
              <div className="col-span-full p-8 bg-white border border-dashed border-slate-300 rounded-3xl text-center space-y-2">
                <Users className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Aucun serveur enregistré</p>
                <p className="text-xs text-slate-500">Ajoutez les membres de votre équipe en salle pour activer les appels table.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2 : BRIGADE CUISINE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Brigade Cuisine &amp; Chefs</h2>
                <p className="text-xs text-slate-500">
                  Organisation de la brigade en cuisine pour le suivi opérationnel sur l'Écran Cuisine (KDS).
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              {cooks.length} cuisinier(s)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cooks.map((c) => {
              const badge = getShiftBadge(c.shift);
              return (
                <div
                  key={c.id}
                  className="bg-white border-2 border-slate-200 hover:border-amber-300 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-black flex items-center justify-center border border-amber-200">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 leading-tight">{c.name}</h3>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{c.phone || 'Pas de numéro'}</span>
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs">
                      <span className="text-slate-500 font-bold block text-[10px] uppercase tracking-wider">
                        Spécialité / Poste :
                      </span>
                      <span className="font-black text-amber-950 mt-0.5 block">
                        👨‍🍳 {c.specialty}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(c.id, 'COOK', c.name)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Retirer le cuisinier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {cooks.length === 0 && !isLoading && (
              <div className="col-span-full p-8 bg-white border border-dashed border-slate-300 rounded-3xl text-center space-y-2">
                <ChefHat className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Aucun cuisinier enregistré</p>
                <p className="text-xs text-slate-500">Ajoutez les membres de votre brigade cuisine pour organiser les shifts.</p>
              </div>
            )}
          </div>
        </section>

        {/* MODAL AJOUT MEMBRE */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900">Ajouter un Membre d'Équipe</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                {/* Choix Rôle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Poste / Rôle</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewMemberRole('WAITER')}
                      className={`p-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newMemberRole === 'WAITER'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Serveur (Salle)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMemberRole('COOK')}
                      className={`p-3 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        newMemberRole === 'COOK'
                          ? 'border-amber-500 bg-amber-50 text-amber-950'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Cuisinier (Brigade)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom Complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Moussa Diop"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="+221 77 000 00 00"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                  />
                </div>

                {newMemberRole === 'COOK' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Shift / Plage Horaire</label>
                      <select
                        value={newMemberShift}
                        onChange={(e) => setNewMemberShift(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      >
                        <option value="MORNING">Matin (08h - 16h)</option>
                        <option value="EVENING">Soir (16h - 00h)</option>
                        <option value="NIGHT">Nuit (00h - 08h)</option>
                        <option value="FULL_DAY">Journée complète</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Spécialité</label>
                      <input
                        type="text"
                        placeholder="Ex: Pizzaiolo, Grillardin, Chef de Partie"
                        value={newMemberSpecialty}
                        onChange={(e) => setNewMemberSpecialty(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 outline-hidden"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-slate-600 font-bold text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Valider'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL QR CODE SERVEUR */}
        {selectedWaiterQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-black text-slate-900 text-sm">
                  Badge Personnel — {selectedWaiterQr.name}
                </span>
                <button onClick={() => setSelectedWaiterQr(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-center shadow-xs">
                <QRCodeSVG
                  value={`https://www.louametay.com/waiter/${selectedWaiterQr.qrCodeSlug}`}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>

              <p className="text-xs text-slate-500 font-medium">
                Badge nominatif du serveur à imprimer ou porter sur le tablier.
              </p>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer le badge</span>
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
