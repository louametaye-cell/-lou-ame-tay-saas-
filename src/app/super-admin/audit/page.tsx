'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  History, 
  UserCheck, 
  FileText, 
  Lock,
  Calendar,
  Layers,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { SuperAdminAuthGuard } from '@/components/super-admin/SuperAdminAuthGuard';

export default function SuperAdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      toast.error('Erreur chargement journal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <SuperAdminAuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-orange-500 selection:text-slate-900 pb-20">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link
                href="/super-admin"
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  <span>Journal d&apos;Audit Légal & Sécurité (Audit Logs)</span>
                </h1>
                <p className="text-xs text-slate-500">
                  Traçabilité immuable des modifications de tarifs, suspensions et opérations système
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={fetchLogs}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
          <div className="bg-white border border-slate-200 shadow-xs rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Historique des Actions Administratives ({logs.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-white border-b border-slate-200 shadow-xs text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 sm:px-6">Date & Heure</th>
                    <th className="py-3.5 px-4">Auteur</th>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Cible</th>
                    <th className="py-3.5 px-4 sm:px-6">Détails</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500 text-xs">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>
                          <span>{log.actorName}</span>
                          <span className="block text-[10px] text-slate-500 font-normal">
                            Rôle : {log.actorRole}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-orange-400">
                        {log.targetResource}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-700 text-xs">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </SuperAdminAuthGuard>
  );
}
