'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Package, 
  CheckCircle2, 
  Truck, 
  X, 
  RefreshCw,
} from 'lucide-react';
import { SupportTicketType, QRCodePhysicalOrder, TicketStatus, QRCodeOrderStatus } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

export const SAVManagementPanel: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketType[]>([]);
  const [qrOrders, setQrOrders] = useState<QRCodePhysicalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal treatment
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketType | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [newStatus, setNewStatus] = useState<TicketStatus>('EN_COURS');
  const [isTreating, setIsTreating] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [ticketsRes, qrRes] = await Promise.all([
        fetch('/api/super-admin/tickets'),
        fetch('/api/super-admin/qrcode-orders'),
      ]);

      if (ticketsRes.ok) {
        const tData = await ticketsRes.json();
        setTickets(tData.tickets || []);
      }

      if (qrRes.ok) {
        const qData = await qrRes.json();
        setQrOrders(qData.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openTicketTreatment = (t: SupportTicketType) => {
    setSelectedTicket(t);
    setNewStatus(t.status === 'OUVERT' ? 'EN_COURS' : t.status);
    setReplyMessage('');
  };

  const handleUpdateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsTreating(true);
    try {
      const res = await fetch(`/api/super-admin/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          replyMessage: replyMessage.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success(`Ticket ${selectedTicket.subject} mis à jour (${newStatus})`);
        setSelectedTicket(null);
        fetchData();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Erreur lors de la mise à jour du ticket');
    } finally {
      setIsTreating(false);
    }
  };

  const handleUpdateQrStatus = async (orderId: string, status: QRCodeOrderStatus) => {
    try {
      const res = await fetch('/api/super-admin/qrcode-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });

      if (res.ok) {
        toast.success(`Commande marquée comme : ${status}`);
        fetchData();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Erreur de mise à jour commande');
    }
  };

  const openTicketsCount = tickets.filter((t) => t.status !== 'RESOLU').length;
  const urgentTicketsCount = tickets.filter((t) => t.priority === 'URGENTE' && t.status !== 'RESOLU').length;
  const pendingQrCount = qrOrders.filter((q) => q.status !== 'LIVRE').length;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 text-slate-900 font-sans">
      {/* Top Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-50 text-[#FF6B00] border border-orange-200 rounded-2xl">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>📋 GESTION SAV & COMMANDES SUPPORTS</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pilotage centralisé des réclamations restaurateurs et fabrication des chevalets QR.
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-all font-bold"
          title="Rafraîchir les données"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">🆕 Tickets ouverts</span>
          <span className="text-lg font-black text-slate-900">({openTicketsCount})</span>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
          <span className="text-xs font-bold text-amber-950">⚡ Urgents (24h/24)</span>
          <span className="text-lg font-black text-[#FF6B00]">({urgentTicketsCount})</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">📦 Commandes QR</span>
          <span className="text-lg font-black text-slate-900">({pendingQrCount})</span>
        </div>
      </div>

      {/* SECTION 1: TICKETS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>─── TICKETS SUPPORT ───</span>
          </span>
        </div>

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <p className="text-xs font-semibold text-slate-600">Aucun ticket de support pour le moment.</p>
            </div>
          ) : (
            tickets.map((t) => {
              const isUrgent = t.priority === 'URGENTE';
              const isResolved = t.status === 'RESOLU';

              return (
                <div
                  key={t.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 transition-all ${
                    isResolved
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : isUrgent
                      ? 'bg-amber-50/80 border-amber-300'
                      : 'bg-white border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isUrgent
                            ? 'bg-[#FF6B00] text-white'
                            : t.priority === 'HAUTE'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        [{t.priority}]
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">{t.subject}</h4>
                    </div>

                    <p className="text-xs text-slate-500 font-medium">
                      {t.restaurantName} - {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-slate-700 font-medium line-clamp-1">{t.message}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                        t.status === 'RESOLU'
                          ? 'bg-slate-100 text-slate-700 border border-slate-300'
                          : t.status === 'EN_COURS'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-orange-100 text-orange-900 border border-orange-300'
                      }`}
                    >
                      {t.status}
                    </span>

                    <button
                      onClick={() => openTicketTreatment(t)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all"
                    >
                      Traiter le ticket
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 2: COMMANDES QR CODES */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>─── COMMANDES QR CODES ───</span>
          </span>
        </div>

        <div className="space-y-3">
          {qrOrders.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
              <p className="text-xs font-semibold text-slate-600">Aucune commande de chevalets en attente.</p>
            </div>
          ) : (
            qrOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#FF6B00]" />
                    <h4 className="font-extrabold text-sm text-slate-900">
                      📦 {ord.restaurantName} - {ord.tableCount} tables - {formatFCFA(ord.price)}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Statut : <span className="text-slate-900 font-bold">{ord.status === 'EN_COURS_IMPRESSION' ? 'En cours d\'impression' : ord.status === 'EXPEDIE' ? 'Expédié' : 'Livré'}</span> • Format : {ord.format} • Ville : {ord.city}
                  </p>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {ord.status === 'EN_COURS_IMPRESSION' && (
                    <button
                      onClick={() => handleUpdateQrStatus(ord.id, 'EXPEDIE')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Marquer comme expédié</span>
                    </button>
                  )}

                  {ord.status === 'EXPEDIE' && (
                    <button
                      onClick={() => handleUpdateQrStatus(ord.id, 'LIVRE')}
                      className="px-4 py-2 bg-[#FF6B00] hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Marquer comme livré</span>
                    </button>
                  )}

                  {ord.status === 'LIVRE' && (
                    <span className="text-xs text-slate-800 font-bold bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl">
                      ✓ Livré au client
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL DE TRAITEMENT TICKET SAV */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4 pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase text-[#FF6B00] block">
                Traitement Ticket SAV #{selectedTicket.id.slice(-6).toUpperCase()}
              </span>
              <h3 className="font-black text-lg text-slate-900">{selectedTicket.subject}</h3>
              <p className="text-xs text-slate-500 font-medium">Établissement : {selectedTicket.restaurantName}</p>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-800">
                <span className="text-[10px] font-bold text-slate-500 block mb-1">Message initial :</span>
                <p className="font-medium">{selectedTicket.message}</p>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">Changer le statut du ticket</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 outline-none font-bold"
                >
                  <option value="OUVERT">OUVERT (En attente)</option>
                  <option value="EN_COURS">EN COURS (Pris en charge)</option>
                  <option value="RESOLU">RESOLU (Problème réglé)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-900 block mb-1">
                  Répondre au restaurateur (Notification & Fil de messages)
                </label>
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Écrivez votre message d'assistance ou la confirmation de résolution..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 outline-none resize-none focus:border-[#FF6B00] font-medium"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Fermer
                </button>

                <button
                  type="submit"
                  disabled={isTreating}
                  className="bg-[#FF6B00] hover:bg-orange-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {isTreating ? 'Enregistrement...' : 'Enregistrer & Notifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
