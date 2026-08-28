'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Headphones, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  Sparkles,
  MessageSquare,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';
import { SupportTicketType, TicketStatus, TicketPriority } from '@/types';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const SupportAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: '👋 Bonjour ! Je suis votre Assistant IA Support 24/7 dédié à Lou Ame Tay. Je peux vous aider à renouveler un abonnement, générer vos QR codes, configurer vos plats ou résoudre un problème technique en cuisine.',
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const [tickets, setTickets] = useState<SupportTicketType[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets'>('chat');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MOYENNE');
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/super-admin/support/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (e) {
      console.error('Erreur tickets:', e);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isAiTyping) return;

    const userText = inputMessage.trim();
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsAiTyping(true);

    try {
      const res = await fetch('/api/super-admin/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (e) {
      toast.error('Erreur de réponse de l\'assistant IA');
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;

    try {
      const res = await fetch('/api/super-admin/support/tickets', {
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
        toast.success('Ticket SAV enregistré ! L\'IA et un technicien sont mobilisés.');
        setNewSubject('');
        setNewMessage('');
        setIsCreatingTicket(false);
        fetchTickets();
      }
    } catch (e) {
      toast.error('Erreur lors de la création du ticket');
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      const res = await fetch('/api/super-admin/support/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status }),
      });

      if (res.ok) {
        toast.success(`Statut du ticket mis à jour : ${status}`);
        fetchTickets();
      }
    } catch (e) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="bg-[#0f1422] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-white">
                Service Après-Vente (SAV) & Assistance IA 24/7
              </h3>
              <span className="bg-indigo-950 text-indigo-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                IA Active 24/7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Résolution instantanée des pannes, questions techniques et gestion des tickets restaurateurs
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Chatbot IA 24/7</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'tickets'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Tickets SAV ({tickets.filter((t) => t.status !== 'RESOLU').length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CHATBOT IA 24/7 */}
      {activeTab === 'chat' && (
        <div className="space-y-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-4 h-[360px] overflow-y-auto space-y-3.5 pr-2">
            {messages.map((msg) => {
              const isAi = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    isAi ? 'mr-auto' : 'ml-auto flex-row-reverse'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isAi
                        ? 'bg-indigo-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isAi
                        ? 'bg-[#151b2e] border border-indigo-500/20 text-slate-100'
                        : 'bg-emerald-700 text-white'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <span className="text-[10px] opacity-60 block mt-1.5 text-right">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold p-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>L&apos;IA Lou Ame Tay réfléchit et formule sa réponse...</span>
              </div>
            )}
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Posez une question technique (Ex: Comment renouveler par Wave ? Problème QR Code ?)..."
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl p-3.5 text-sm text-white outline-none shadow-inner"
            />
            <button
              type="submit"
              disabled={isAiTyping || !inputMessage.trim()}
              className="min-h-[48px] px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: TICKETS SAV */}
      {activeTab === 'tickets' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Tickets Support des Restaurateurs
            </span>
            <button
              onClick={() => setIsCreatingTicket(!isCreatingTicket)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ouvrir un Nouveau Ticket</span>
            </button>
          </div>

          {/* Formulaire de création de ticket */}
          {isCreatingTicket && (
            <form onSubmit={handleCreateTicket} className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
              <h4 className="text-xs font-black text-indigo-300 uppercase">Création Ticket Assistance</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Objet du ticket (Ex: Panne affichage table 4)"
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                />

                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                >
                  <option value="BASSE">Priorité Basse</option>
                  <option value="MOYENNE">Priorité Moyenne</option>
                  <option value="HAUTE">Priorité Haute</option>
                  <option value="URGENTE">Priorité Urgente (24h/24)</option>
                </select>
              </div>

              <textarea
                required
                rows={3}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Détail du problème rencontré par le restaurateur..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 resize-none"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingTicket(false)}
                  className="px-3 py-1.5 bg-slate-900 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-black"
                >
                  Valider le Ticket
                </button>
              </div>
            </form>
          )}

          {/* Liste des Tickets */}
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {tickets.map((t) => {
              const isResolved = t.status === 'RESOLU';
              return (
                <div
                  key={t.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          t.priority === 'URGENTE'
                            ? 'bg-red-950 text-red-400 border border-red-500/30'
                            : t.priority === 'HAUTE'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <h4 className="text-sm font-bold text-white">{t.subject}</h4>
                    </div>

                    {/* Statut Toggle */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateTicketStatus(t.id, 'OUVERT')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          t.status === 'OUVERT' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Ouvert
                      </button>
                      <button
                        onClick={() => handleUpdateTicketStatus(t.id, 'EN_COURS')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          t.status === 'EN_COURS' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        En cours
                      </button>
                      <button
                        onClick={() => handleUpdateTicketStatus(t.id, 'RESOLU')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          t.status === 'RESOLU' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        ✓ Résolu
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">{t.message}</p>

                  {t.aiSuggestedSolution && (
                    <div className="bg-indigo-950/40 border border-indigo-500/20 p-2.5 rounded-xl text-xs text-indigo-300">
                      <span className="font-bold block text-[10px] uppercase text-indigo-400 mb-0.5">
                        🤖 Solution IA Recommandée :
                      </span>
                      <p>{t.aiSuggestedSolution}</p>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                    <span>Restaurant : {t.restaurantName}</span>
                    <span>Créé le {new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
