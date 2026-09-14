'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Users, Plus, Trash2, QrCode, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function WaitersManagerPage() {
  const [waiters, setWaiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [restaurantName, setRestaurantName] = useState('Mon Restaurant');

  const fetchWaiters = async (tId?: string) => {
    const id = tId || restaurantId || (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : '') || '';
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/tenant/waiters?tenantId=${encodeURIComponent(id)}`);
      const data = await res.json();
      setWaiters(data.waiters || []);
    } catch (e) {
      toast.error('Erreur lors de la récupération des serveurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('current_restaurant_id') || '';
      const storedName = localStorage.getItem('current_restaurant_name') || 'Mon Restaurant';
      setRestaurantId(storedId);
      setRestaurantName(storedName);
      fetchWaiters(storedId);
    }
  }, []);

  const handleCreateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error('Le nom du serveur est obligatoire');
      return;
    }
    const id = restaurantId || (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : '') || '';
    if (!id) {
      toast.error('Session gérant introuvable, veuillez vous reconnecter');
      return;
    }

    try {
      const res = await fetch('/api/tenant/waiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          phone: newPhone.trim() || undefined,
          tenantId: id,
        }),
      });
      const data = await res.json();
      if (res.ok && data.waiter) {
        toast.success(`Serveur ${data.waiter.name} créé avec succès`);
        setNewName('');
        setNewPhone('');
        fetchWaiters(id);
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (e) {
      toast.error('Erreur de connexion lors de la création');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment désactiver ce serveur ?')) return;
    try {
      const res = await fetch(`/api/tenant/waiters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Serveur retiré du service');
        fetchWaiters(restaurantId);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handlePrintQR = (slug: string, name: string) => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/w/${slug}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Badge Serveur - ${name}</title>
            <style>
              body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f1f5f9; }
              .badge { background: white; padding: 40px; border-radius: 20px; text-align: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); width: 350px; }
              img { width: 250px; height: 250px; margin: 20px 0; }
              h1 { color: #0f172a; font-size: 24px; margin: 0; }
              p { color: #64748b; margin-top: 5px; }
              .footer { font-size: 12px; color: #94a3b8; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="badge">
              <h1>${name}</h1>
              <p>Scannez pour commander</p>
              <img src="${qrUrl}" alt="QR Code" />
              <div class="footer">Lou Ame Tay ? - ${restaurantName}</div>
            </div>
            <script>
              setTimeout(() => window.print(), 500);
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users className="text-orange-500" /> Gestion de l&apos;Équipe de Salle
          </h1>
          <p className="text-xs text-slate-500 font-bold">{restaurantName} • Badges &amp; Shifts Serveurs</p>
        </div>
        <Link
          href="/dashboard"
          className="p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-all border border-slate-200 shadow-2xs"
          title="Retour au Dashboard"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-xs border border-slate-200">
        <h2 className="text-base font-black mb-4 text-slate-800">Ajouter un nouveau serveur</h2>
        <form onSubmit={handleCreateWaiter} className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-600 mb-1">Nom complet</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Moussa Diop"
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-orange-500 outline-none text-sm font-bold"
              required
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-600 mb-1">Téléphone (Optionnel)</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="Ex: +221 77 000 00 00"
              className="w-full p-3 rounded-2xl border border-slate-200 focus:border-orange-500 outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black h-12 px-6 rounded-2xl flex items-center gap-2 transition-all w-full sm:w-auto justify-center shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-black uppercase">
              <th className="p-4 border-b border-slate-100">Nom</th>
              <th className="p-4 border-b border-slate-100">Téléphone</th>
              <th className="p-4 border-b border-slate-100 text-center">Commandes Rattachées</th>
              <th className="p-4 border-b border-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-400 font-bold">
                  Chargement des serveurs...
                </td>
              </tr>
            ) : waiters.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 space-y-1">
                  <div className="font-bold">Aucun serveur configuré.</div>
                  <div className="text-xs text-slate-400">Ajoutez les membres de votre équipe ci-dessus pour leur générer leur badge QR.</div>
                </td>
              </tr>
            ) : (
              waiters.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{w.name}</td>
                  <td className="p-4 text-slate-600 font-mono text-xs">{w.phone || '-'}</td>
                  <td className="p-4 text-center text-slate-700 font-mono font-bold">{w._count?.orders || 0}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePrintQR(w.qrCodeSlug, w.name)}
                        className="text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                        title="Imprimer le badge QR"
                      >
                        <QrCode className="w-4 h-4 text-orange-600" />
                        <span>Badge QR</span>
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-colors"
                        title="Supprimer ce serveur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
