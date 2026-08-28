'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Headphones, 
  Plus, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  User, 
  Bot, 
  MessageSquare,
  Sparkles,
  X,
  Store
} from 'lucide-react';
import { SupportTicketType, TicketPriority, TicketStatus } from '@/types';
import { toast } from 'sonner';

interface TicketCardProps {
  ticket: SupportTicketType;
  onSelect: (ticket: SupportTicketType) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(ticket)}
      className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer space-y-3"
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
              ticket.priority === 'URGENTE'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : ticket.priority === 'HAUTE'
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {ticket.priority}
          </span>
          <h4 className="font-extrabold text-sm text-gray-900">{ticket.subject}</h4>
        </div>

        <span
          className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
            ticket.status === 'RESOLU'
              ? 'bg-emerald-100 text-emerald-800'
              : ticket.status === 'EN_COURS'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {ticket.status === 'RESOLU' ? '✓ Résolu' : ticket.status === 'EN_COURS' ? '⏳ En cours' : '⚡ Ouvert'}
        </span>
      </div>

      <p className="text-xs text-gray-600 line-clamp-2">{ticket.message}</p>

      <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-100">
        <span>#{ticket.id.slice(-6).toUpperCase()}</span>
        <span>Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
      </div>
    </div>
  );
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketType | null>(null);

  // New ticket modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MOYENNE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Thread reply state
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dashboard/tickets?restaurantId=resto_thies_01');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        if (selectedTicket) {
          const updated = (data.tickets || []).find((t: SupportTicketType) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'resto_thies_01',
          restaurantName: 'Chez Fatou & Frères',
          subject: newSubject,
          message: newMessage,
          priority: newPriority,
        }),
      });

      if (res.ok) {
        toast.success('Ticket SAV ouvert avec succès !');
        setIsNewModalOpen(false);
        setNewSubject('');
        setNewMessage('');
        fetchTickets();
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Erreur lors de l\'ouverture du ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    setIsReplying(true);
    try {
      const res = await fetch(`/api/dashboard/tickets/${selectedTicket.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyText.trim(),
          sender: 'CLIENT',
          senderName: 'Chez Fatou (Restaurateur)',
        }),
      });

      if (res.ok) {
        toast.success('Message envoyé !');
        setReplyText('');
        fetchTickets();
      }
    } catch (e) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2">
                <span>🎫 Tickets SAV & Assistance 24/7</span>
              </h2>
              <p className="text-xs text-gray-500">
                Signalez un problème technique ou demandez l&apos;aide d&apos;un conseiller.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Ouvrir un ticket</span>
          </button>
        </div>

        {/* Tickets List or Details View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tickets list */}
          <div className={`space-y-3 ${selectedTicket ? 'lg:col-span-5' : 'lg:col-span-12'}`}>
            {tickets.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
                <div className="text-4xl mb-3">🎫</div>
                <h3 className="font-bold text-gray-900">Aucun ticket pour le moment</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Cliquez sur &quot;Ouvrir un ticket&quot; pour soumettre une demande au support.
                </p>
              </div>
            ) : (
              tickets.map((t) => (
                <TicketCard
                  key={t.id}
                  ticket={t}
                  onSelect={(ticket) => setSelectedTicket(ticket)}
                />
              ))
            )}
          </div>

          {/* Right Column: Ticket Conversation Thread */}
          {selectedTicket && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 shadow-xl p-6 space-y-4 flex flex-col h-[520px]">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        selectedTicket.priority === 'URGENTE'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedTicket.priority}
                    </span>
                    <h3 className="font-extrabold text-base text-gray-900">{selectedTicket.subject}</h3>
                  </div>
                  <span className="text-[11px] text-gray-400">
                    Statut : <strong className="text-gray-700">{selectedTicket.status}</strong>
                  </span>
                </div>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                {/* Initial Description */}
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-2xl">
                  <div className="flex items-center justify-between text-gray-500 mb-1">
                    <span className="font-bold text-gray-900">Demande initiale du restaurateur :</span>
                    <span>{new Date(selectedTicket.createdAt).toLocaleTimeString('fr-FR')}</span>
                  </div>
                  <p className="text-gray-700">{selectedTicket.message}</p>
                </div>

                {/* AI Automated Suggestion */}
                {selectedTicket.aiSuggestedSolution && (
                  <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl text-indigo-950">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
                      <Bot className="w-4 h-4" />
                      <span>Réponse immédiate IA 24/7 :</span>
                    </div>
                    <p>{selectedTicket.aiSuggestedSolution}</p>
                  </div>
                )}

                {/* Dynamic Thread Messages */}
                {selectedTicket.messages?.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl max-w-[85%] ${
                      m.sender === 'CLIENT'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 ml-auto'
                        : 'bg-gray-100 text-gray-900 mr-auto'
                    }`}
                  >
                    <span className="font-bold block text-[10px] opacity-70 mb-0.5">
                      {m.sender === 'CLIENT' ? 'Vous' : m.senderName || 'Support Lou Ame Tay'}
                    </span>
                    <p>{m.content}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="flex items-center gap-2 pt-2 border-t border-gray-100">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Écrivez votre réponse au support..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-emerald-600"
                />
                <button
                  type="submit"
                  disabled={isReplying || !replyText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-4 py-3 rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* MODAL OUVRIR UN TICKET */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsNewModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-2xl">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">
                  Ouvrir un nouveau ticket SAV
                </h3>
                <p className="text-xs text-gray-500">
                  Assistance technique & opérationnelle disponible 24/7
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Sujet du problème *
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ex: Problème d'impression ou ajout de plat..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Niveau d&apos;Urgence
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none font-bold"
                >
                  <option value="BASSE">Priorité Basse (Question générale)</option>
                  <option value="MOYENNE">Priorité Moyenne (Modification menu)</option>
                  <option value="HAUTE">Priorité Haute (Blocage partiel)</option>
                  <option value="URGENTE">Priorité Urgente (Panne bloquante 24h/24)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Détail de votre demande *
                </label>
                <textarea
                  required
                  rows={4}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Expliquez votre problème avec le maximum de détails..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs outline-none resize-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {isSubmitting ? 'Ouverture...' : 'Valider le Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
