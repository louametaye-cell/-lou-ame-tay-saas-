'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Bot, X, RotateCcw, Send, ChevronLeft, ArrowDown } from 'lucide-react';

export interface AissatouChatProps {
  variant?: 'gerant' | 'super-admin';
  restaurantId?: string;
  restaurantName?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'aissatou';
  text: string;
  timestamp: string;
}

export function AissatouChat({
  variant = 'gerant',
  restaurantId,
  restaurantName,
}: AissatouChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = variant === 'super-admin';

  // Chips de suggestions de questions selon l'espace
  const chips = isSuperAdmin
    ? [
        '📈 Quel est mon MRR actuel ?',
        '⚠️ Quels restaurants sont en retard ?',
        '🪵 Stock de supports QR en bois ?',
        '🏆 Top 3 des restaurants par volume ?',
        '🤝 Dois-je recruter un commercial ?',
      ]
    : [
        '🍗 Mon plat star aujourd\'hui ?',
        '🌊 Combien j\'ai encaissé en Wave ?',
        '⚠️ Quels sont mes plats en rupture ?',
        '⏰ Heure de rush aujourd\'hui ?',
        '💰 Mon CA total du jour ?',
      ];

  const defaultWelcomeText = isSuperAdmin
    ? `Bonjour Monsieur le CEO ! Je suis **Aissatou**, votre Directrice Financière et Stratégique chez DAW Digital Arts Work. Je suis à votre disposition pour analyser vos revenus récurrents (MRR), vos abonnements restaurants, vos factures et vos stocks de matériel.`
    : `Bonjour Monsieur le Gérant ! Je suis **Aissatou**, votre copilote de gestion pour **${restaurantName || 'votre restaurant'}**. Posez-moi des questions sur vos ventes en direct, vos encaissements Wave, vos plats les plus vendus ou vos alertes de stock.`;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'aissatou',
      text: defaultWelcomeText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Auto-scroll vers le dernier message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Réinitialiser la conversation
  const handleResetConversation = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'aissatou',
        text: defaultWelcomeText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Envoi d'une question
  const handleSendMessage = async (textToSend?: string) => {
    const q = (textToSend || inputMessage).trim();
    if (!q || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsThinking(true);

    try {
      const endpoint = isSuperAdmin ? '/api/super-admin/ai-copilot' : '/api/tenant/ai-copilot';
      const effectiveRestoId = restaurantId || (typeof window !== 'undefined' ? localStorage.getItem('current_restaurant_id') : '');

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(effectiveRestoId ? { 'x-tenant-token': effectiveRestoId } : {}),
        },
        body: JSON.stringify({
          question: q,
          restaurantId: effectiveRestoId,
        }),
      });

      const data = await res.json();
      const answerText = data.answer || "Désolée, je n'ai pas pu analyser cette question à cet instant. Réessayez dans un court instant.";

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'aissatou',
        text: answerText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'aissatou',
          text: "Une erreur de communication est survenue. Veuillez vérifier votre connexion.",
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* 1. BOUTON FLOTTANT (FAB) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Ouvrir Aissatou"
          className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer ${
            isSuperAdmin
              ? 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-amber-600 text-amber-300 shadow-indigo-950/40 ring-2 ring-amber-400/30'
              : 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-emerald-900/30 ring-2 ring-emerald-400/30'
          }`}
        >
          {/* Pulsation douce */}
          <span
            className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
              isSuperAdmin ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />

          <div className="relative">
            {isSuperAdmin ? (
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-6" />
            ) : (
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-12" />
            )}

            {/* Pastille verte clignotante en ligne */}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>

          {/* Tooltip au survol */}
          <span className="sr-only">Aissatou IA</span>
        </button>
      )}

      {/* 2. PANNEAU DE CHAT (DRAWER COULISSANT) */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
            // Mobile : Plein écran | Desktop : Volet 420px flottant
            'inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[420px] md:max-h-[640px] md:h-[85vh] md:rounded-3xl md:border md:border-slate-200'
          }`}
        >
          {/* EN-TÊTE DU CHAT */}
          <header
            className={`p-4 border-b flex items-center justify-between gap-3 shrink-0 ${
              isSuperAdmin
                ? 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-slate-800'
                : 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border-emerald-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Bouton retour visible sur mobile */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="md:hidden p-1.5 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Avatar Personnalisé d'Aissatou */}
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${
                    isSuperAdmin
                      ? 'bg-gradient-to-tr from-amber-500 to-indigo-600 text-white'
                      : 'bg-gradient-to-tr from-emerald-400 to-teal-200 text-emerald-950'
                  }`}
                >
                  {isSuperAdmin ? <Bot className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>
                {/* Pastille En ligne */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight">Aissatou</h3>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isSuperAdmin
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/40'
                    }`}
                  >
                    IA Direct
                  </span>
                </div>
                <p className="text-[11px] opacity-80 font-medium">
                  {isSuperAdmin ? 'Directrice Stratégique DAW' : 'Copilote de Gestion CHR'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Option effacer la conversation */}
              <button
                type="button"
                onClick={handleResetConversation}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Effacer la conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Fermer */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* CORPS DE DISCUSSION (MESSAGES) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isUser
                        ? isSuperAdmin
                          ? 'bg-indigo-900 text-white rounded-tr-xs'
                          : 'bg-emerald-600 text-white rounded-tr-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-medium">{m.text}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 px-1 font-mono">
                    {m.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Indicateur d'attente (Aissatou réfléchit) */}
            {isThinking && (
              <div className="flex flex-col items-start space-y-1">
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-500 shadow-xs flex items-center gap-2">
                  <span className="inline-flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                  </span>
                  <span className="font-medium text-slate-600">Aissatou analyse les données...</span>
                </div>
              </div>
            )}

            {/* SUGGESTIONS RAPIDES (CHIPS) sous le message initial */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                  Questions Fréquentes :
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {chips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip.replace(/^[^\wÀ-ÿ]+/, '').trim())}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isSuperAdmin
                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ZONE DE SAISIE INFÉRIEURE */}
          <footer className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isSuperAdmin
                    ? "Posez votre question stratégique au CEO..."
                    : "Posez votre question à Aissatou..."
                }
                disabled={isThinking}
                className="flex-1 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-transparent focus:border-slate-300 rounded-full px-4 py-3 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isThinking}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
                  isSuperAdmin
                    ? 'bg-indigo-950 hover:bg-indigo-900 text-amber-300 shadow-md'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                }`}
                aria-label="Envoyer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </footer>
        </div>
      )}
    </>
  );
}

export default AissatouChat;
