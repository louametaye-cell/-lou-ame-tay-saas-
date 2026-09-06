'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ZonesManagerPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneType, setNewZoneType] = useState('TABLES');

  const fetchZones = async () => {
    try {
      const res = await fetch('/api/tenant/zones');
      const data = await res.json();
      setZones(data.zones || []);
    } catch (e) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim()) return;

    try {
      const res = await fetch('/api/tenant/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newZoneName, type: newZoneType })
      });
      if (res.ok) {
        toast.success('Zone créée');
        setNewZoneName('');
        fetchZones();
      }
    } catch (e) {
      toast.error('Erreur lors de la création');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette zone ? Les tables associées pourraient être affectées.')) return;
    try {
      const res = await fetch(`/api/tenant/zones/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Zone supprimée');
        fetchZones();
      }
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <MapPin className="text-orange-500" /> Gestion des Zones
        </h1>
        <Link href="/dashboard" className="text-sm font-bold text-slate-500 hover:text-slate-800">
          Retour au Dashboard
        </Link>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold mb-4 text-slate-700">Ajouter une nouvelle zone</h2>
        <form onSubmit={handleCreateZone} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-bold text-slate-600 mb-1">Nom de la zone</label>
            <input 
              type="text" 
              value={newZoneName} 
              onChange={(e) => setNewZoneName(e.target.value)} 
              placeholder="Ex: Piscine, Salle VIP..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-bold text-slate-600 mb-1">Type</label>
            <select 
              value={newZoneType} 
              onChange={(e) => setNewZoneType(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-orange-500 outline-none bg-white"
            >
              <option value="TABLES">Zone à Tables</option>
              <option value="FREE_ZONE">Zone Libre (Transat/Chambre)</option>
            </select>
          </div>
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-sm">
              <th className="p-4 font-bold border-b">Nom de la zone</th>
              <th className="p-4 font-bold border-b">Type</th>
              <th className="p-4 font-bold border-b">Tables liées</th>
              <th className="p-4 font-bold border-b text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Chargement...</td></tr>
            ) : zones.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Aucune zone configurée.</td></tr>
            ) : (
              zones.map((zone) => (
                <tr key={zone.id} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{zone.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-lg ${zone.type === 'TABLES' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {zone.type === 'TABLES' ? 'Tables' : 'Zone Libre'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-sm">{zone._count?.tables || 0}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(zone.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
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
