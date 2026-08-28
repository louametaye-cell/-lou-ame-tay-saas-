'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Store, 
  MessageCircle, 
  ArrowRight, 
  Leaf, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Volume2, 
  ShieldCheck, 
  Lock,
  TreePine,
  Recycle,
  Globe2
} from 'lucide-react';

export default function HomePage() {
  const whatsappNumber = '221774587474';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=Bonjour%20Lou%20Ame%20Tay,%20je%20souhaite%20rejoindre%20le%20mouvement%20éco-responsable%20et%20digitaliser%20le%20menu%20de%20mon%20restaurant.`;

  return (
    <div className="min-h-screen bg-[url('/eco-restaurant-bg.jpg')] bg-cover bg-center bg-no-repeat relative text-white font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Dark Ambient Overlay for Perfect Contrast & Legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950/95 backdrop-blur-[2px] pointer-events-none" />

      {/* ========================================================================= */}
      {/* 1. HEADER (Logo + Slogan + Espace Resto + WhatsApp)                       */}
      {/* ========================================================================= */}
      <header className="relative z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-md sticky top-0 px-4 sm:px-8 py-3.5 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Slogan */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Lou Ame Tay ?" 
              className="w-11 h-11 rounded-2xl object-cover border border-orange-500/40 shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform" 
            />
            <div>
              <span className="text-lg sm:text-xl font-black text-white tracking-tight block">
                Lou Ame Tay ?
              </span>
              <span className="text-[10px] sm:text-[11px] text-orange-400 font-extrabold uppercase tracking-wider block -mt-1">
                Menu Digital & Cuisine Directe
              </span>
            </div>
          </Link>

          {/* Boutons d'accès */}
          <div className="flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/30"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp : 77 458 74 74</span>
            </a>

            <Link
              href="/login"
              className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B00] via-orange-600 to-[#00A86B] hover:opacity-95 active:scale-95 text-white text-xs sm:text-sm font-black px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-orange-600/30"
            >
              <Store className="w-4 h-4" />
              <span>Espace Resto</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION : SLOGAN & ENGAGEMENT ÉCOLOGIQUE FORT                     */}
      {/* ========================================================================= */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-16 flex-1 flex flex-col justify-center text-center items-center">
        {/* Badge Écologie & Durabilité */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider mb-6 shadow-lg shadow-emerald-950/40 backdrop-blur-md">
          <Leaf className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>Engagement Éco-Responsable • Sénégal Durable 2026 🇸🇳</span>
        </div>

        {/* Titre & Slogan de Marque */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl drop-shadow-md">
          Scannez. Commandez. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-amber-400 to-[#00A86B]">
            Moins de papier, plus d&apos;impact.
          </span>
        </h1>

        {/* Message Fort pour la Transition Écologique */}
        <div className="mt-6 max-w-3xl backdrop-blur-xl bg-slate-900/80 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-left sm:text-center">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs sm:text-sm uppercase tracking-wide">
            <TreePine className="w-4 h-4" />
            <span>Pourquoi digitaliser votre restaurant maintenant ?</span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            Chaque année, des milliers de menus papier et de cartes plastifiées sont imprimés puis jetés à la poubelle au moindre changement de prix ou de plat. 
            Avec <strong className="text-orange-400 font-black">Lou Ame Tay ?</strong>, supprimez définitivement le papier jetable, réduisez l&apos;empreinte carbone de votre établissement et offrez à vos convives une expérience gastronomique moderne, instantanée et 100% respectueuse de l&apos;environnement.
          </p>

          {/* 3 Stats Éco-Responsables */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-left">
            <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-2xl border border-emerald-500/20">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Recycle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">0 Déchet Papier</h4>
                <p className="text-[11px] text-slate-400">100% Zéro gaspillage</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-2xl border border-orange-500/20">
              <div className="p-2 bg-orange-500/10 text-orange-400 rounded-xl">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Modif en 1 Clic</h4>
                <p className="text-[11px] text-slate-400">0 Frais de réimpression</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-2xl border border-blue-500/20">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Sénégal Vert</h4>
                <p className="text-[11px] text-slate-400">Dakar • Thiès • Saly</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. BOUTONS D'ACTION (WhatsApp & Espace Resto)                         */}
        {/* ===================================================================== */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto">
          {/* Bouton WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 active:scale-[0.98] text-white font-black text-base sm:text-lg py-4 px-8 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 group"
          >
            <MessageCircle className="w-6 h-6 shrink-0 fill-current" />
            <span>Rejoindre le Mouvement Éco-Digital (WhatsApp)</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </a>

          {/* Bouton Espace Restaurateur */}
          <Link
            href="/login"
            className="w-full sm:w-auto backdrop-blur-md bg-slate-900/90 hover:bg-slate-800 active:scale-[0.98] text-white border border-white/20 font-black text-base sm:text-lg py-4 px-8 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5"
          >
            <Store className="w-5 h-5 text-orange-400" />
            <span>Accéder à mon Espace Resto</span>
          </Link>
        </div>

        {/* Numéro WhatsApp */}
        <p className="text-xs sm:text-sm text-slate-400 font-medium mt-3 flex items-center gap-1.5">
          <span>📞 Contact & Déploiement en 24h :</span>
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-emerald-400 font-black hover:underline"
          >
            +221 77 458 74 74
          </a>
        </p>

        {/* ===================================================================== */}
        {/* 4. LES 3 AVANTAGES OPÉRATIONNELS                                      */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 sm:mt-14 w-full text-left">
          <div className="backdrop-blur-xl bg-slate-900/70 rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col justify-between space-y-3">
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl w-fit">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Ouverture &lt; 2s</h3>
              <p className="text-xs text-slate-400 mt-1">
                Le client scanne le chevalet de table avec son smartphone. Zéro appli à installer.
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Fluide & instantané
            </span>
          </div>

          <div className="backdrop-blur-xl bg-slate-900/70 rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col justify-between space-y-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl w-fit">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">BIP Sonore Cuisine</h3>
              <p className="text-xs text-slate-400 mt-1">
                Alerte sonore immédiate sur tablette ou téléphone avec numéro de table précis.
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              0 Erreur de prise de commande
            </span>
          </div>

          <div className="backdrop-blur-xl bg-slate-900/70 rounded-3xl p-5 border border-white/10 shadow-xl flex flex-col justify-between space-y-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Chevalets Durables</h3>
              <p className="text-xs text-slate-400 mt-1">
                Supports de table en PVC rigide ou bois lavable, réutilisables à l&apos;infini.
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Étanche & durable
            </span>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. FOOTER AVEC BOUTON SAAS DISCRET                                        */}
      {/* ========================================================================= */}
      <footer className="relative z-20 border-t border-white/10 bg-slate-950/80 backdrop-blur-md py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-400">
            © 2026 <strong>Lou Ame Tay ?</strong> • Déployé au Sénégal 🇸🇳 (Dakar, Thiès, Saly, Mbour, Saint-Louis).
          </p>

          <div className="flex items-center gap-4 text-xs">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Assistance WhatsApp : 77 458 74 74</span>
            </a>

            <span className="text-slate-600">|</span>

            {/* Bouton Discret SaaS Agence */}
            <Link
              href="/super-admin"
              className="text-slate-500 hover:text-slate-300 text-[11px] flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity"
              title="Portail SaaS Agence"
            >
              <Lock className="w-3 h-3" />
              <span>SaaS Agence</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
