'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LifeBuoy, 
  ArrowLeft, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  Send, 
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { SuperAdminAuthGuard } from '@/components/super-admin/SuperAdminAuthGuard';

export default function SuperAdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (e) {
      toast.error('Erreur chargement des tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <SuperAdminAuthGuard>
      <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-orange-500 selection:text-white pb-20">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Link
                href="/super-admin"
                className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <LifeBuoy className="w-5 h-5 text-orange-400" />
                  <span>Helpdesk & Support Client (1000 Restaurants)</span>
                </h1>
                <p className="text-xs text-slate-400">
                  Traitement des demandes techniques, facturation, réimpressions QR et relais WhatsApp
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href="https://wa.me/221774587474"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebd5b] text-black text-xs font-black px-3.5 py-2.5 rounded-xl shadow-lg transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Ouvrir WhatsApp Agence</span>
              </a>

              <button
                onClick={fetchTickets}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Tickets d&apos;Assistance ({tickets.length})
              </h2>

              <div className="space-y-3">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                      selectedTicket?.id === t.id
                        ? 'bg-slate-900 border-orange-500 shadow-xl ring-2 ring-orange-500/20'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-white text-sm">{t.restaurantName}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        t.priority === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : t.priority === 'HIGH'
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {t.priority}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-200 mb-1">{t.subject}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{t.message}</p>

                    <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 pt-2 border-t border-slate-800/80">
                      <span>Catégorie : {t.category}</span>
                      <span>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Ticket Details */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 h-fit sticky top-24 space-y-4 shadow-xl">
              {selectedTicket ? (
                <>
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs font-black text-orange-400 uppercase">
                      Ticket #{selectedTicket.id}
                    </span>
                    <h3 className="text-base font-black text-white">{selectedTicket.restaurantName}</h3>
                    <p className="text-xs text-slate-400 mt-1">{selectedTicket.subject}</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {selectedTicket.message}
                  </div>

                  <div className="space-y-2 pt-2">
                    <a
                      href={`https://wa.me/221774587474?text=${encodeURIComponent(`Bonjour, concernant votre ticket #${selectedTicket.id} (${selectedTicket.subject}) sur Lou Ame Tay ? : `)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebd5b] text-black font-black text-xs py-3 rounded-xl shadow-lg transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Répondre par WhatsApp Client</span>
                    </a>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                  <LifeBuoy className="w-8 h-8 mx-auto text-slate-600 animate-pulse" />
                  <p>Sélectionnez un ticket pour voir les détails et répondre.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </SuperAdminAuthGuard>
  );
}
