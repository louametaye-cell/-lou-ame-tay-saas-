import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Mail, MessageCircle, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Badge d'erreur */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Erreur 404 • Page Introuvable
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Oups ! Cette page n'existe pas.
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            L'adresse saisie est incorrecte ou le menu demandé a été déplacé.
          </p>
        </div>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
          <Link
            href="/"
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Home className="w-4 h-4" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>

        {/* Bloc d'assistance SAV officiel */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Besoin d'aide ou signalement d'un bug ?
          </span>
          <div className="flex items-center justify-center gap-3 text-xs flex-wrap">
            <a
              href="mailto:sav@louametay.online"
              className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-orange-600 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-orange-500" />
              <span>sav@louametay.online</span>
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="https://wa.me/221774587474"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>

      </div>

      <p className="mt-8 text-xs text-slate-400 font-medium">
        © 2026 Lou Ame Tay ? • DAW Digital Arts Work — by MG
      </p>
    </div>
  );
}
