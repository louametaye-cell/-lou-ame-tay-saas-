'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Users, Plus, Trash2, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function WaitersManagerPage() {
  const [waiters, setWaiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const fetchWaiters = async () => {
    try {
      const res = await fetch('/api/tenant/waiters');
      const data = await res.json();
      setWaiters(data.waiters || []);
    } catch (e) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaiters();
  }, []);

  const handleCreateWaiter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const res = await fetch('/api/tenant/waiters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, phone: newPhone })
      });
      if (res.ok) {
        toast.success('Serveur ajouté');
        setNewName('');
        setNewPhone('');
        fetchWaiters();
      }
    } catch (e) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce serveur ?')) return;
    try {
      const res = await fetch(`/api/tenant/waiters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Serveur supprimé');
        fetchWaiters();
      }
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handlePrintQR = (slug: string, name: string) => {
    const url = `${window.location.origin}/w/${slug}`;
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
              <div class="footer">Lou Ame Tay ? - Service Numérique</div>
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
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Users className="text-orange-500" /> Gestion des Serveurs
        </h1>
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-800">
          Retour au Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-4 text-slate-700">Ajouter un serveur</h2>
        <form onSubmit={handleCreateWaiter} className="flex gap-4 items-end flex-wrap sm:flex-nowrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-slate-600 mb-1">Nom complet</label>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="Ex: Moussa Diop"
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-bold text-slate-600 mb-1">Téléphone (Optionnel)</label>
            <input 
              type="text" 
              value={newPhone} 
              onChange={(e) => setNewPhone(e.target.value)} 
              placeholder="Ex: 77 000 00 00"
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
            />
          </div>
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2 transition-colors w-full sm:w-auto justify-center">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm">
              <th className="p-4 font-bold border-b">Nom</th>
              <th className="p-4 font-bold border-b">Téléphone</th>
              <th className="p-4 font-bold border-b text-center">Commandes</th>
              <th className="p-4 font-bold border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Chargement...</td></tr>
            ) : waiters.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Aucun serveur configuré.</td></tr>
            ) : (
              waiters.map((w) => (
                <tr key={w.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{w.name}</td>
                  <td className="p-4 text-slate-600">{w.phone || '-'}</td>
                  <td className="p-4 text-center text-slate-600 font-mono text-sm">{w._count?.orders || 0}</td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button 
                      onClick={() => handlePrintQR(w.qrCodeSlug, w.name)} 
                      className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 p-2 rounded-lg transition-colors flex items-center gap-1 text-sm font-bold"
                      title="Imprimer le badge QR"
                    >
                      <QrCode className="w-5 h-5" /> QR Code
                    </button>
                    <button onClick={() => handleDelete(w.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
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
