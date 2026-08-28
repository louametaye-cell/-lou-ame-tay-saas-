'use client';

import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, ArrowRight, KeyRound, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface SuperAdminAuthGuardProps {
  children: React.ReactNode;
}

export const SuperAdminAuthGuard: React.FC<SuperAdminAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check localStorage session
    const saved = localStorage.getItem('lou_ame_tay_superadmin_auth');
    if (saved === 'admin_authorized_token') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/super-admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (res.ok) {
        localStorage.setItem('lou_ame_tay_superadmin_auth', 'admin_authorized_token');
        setIsAuthenticated(true);
        toast.success('Bienvenue dans l\'espace Super Admin Agence !');
      } else {
        toast.error('Mot de passe incorrect (Indice: admin123)');
      }
    } catch (err) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lou_ame_tay_superadmin_auth');
    setIsAuthenticated(false);
    toast.info('Session Super Admin déconnectée');
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center bg-no-repeat relative text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Dark Gradient Overlay for Maximum Legibility & Mobile Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95 backdrop-blur-[2px] pointer-events-none" />

        {/* Floating Glassmorphism Authentication Card */}
        <div className="w-full max-w-md backdrop-blur-2xl bg-white/85 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-orange-600/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-emerald-600/25 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Header */}
          <div className="text-center space-y-3 mb-6 relative z-10">
            <div className="relative inline-block">
              <img 
                src="/logo.png" 
                alt="Lou Ame Tay ?" 
                className="w-20 h-20 rounded-2xl mx-auto object-cover border-2 border-orange-500/50 shadow-xl shadow-orange-600/30 transition-transform hover:scale-105" 
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">
                Espace Super Admin
              </h1>
              <p className="text-xs text-orange-400 font-bold uppercase tracking-wider mt-1">
                Lou Ame Tay ? • Agence Digitale
              </p>
            </div>
            <p className="text-[12px] text-slate-700">
              Pilotage centralisé, gestion des abonnements et SAV 24/7
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                <span>Mot de passe d&apos;accès sécurisé</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe (admin123)..."
                className="w-full bg-slate-50/90 border border-slate-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-500 outline-none transition-all shadow-inner"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#FF6B00] via-orange-600 to-[#00A86B] hover:opacity-95 active:scale-[0.98] text-slate-900 font-black text-sm py-4 px-4 rounded-2xl shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Déverrouiller l&apos;Espace Agence</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-200/80 text-center relative z-10 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chiffrement AES 256</span>
            </span>
            <span className="text-slate-500">Sénégal 🇸🇳 2026</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Super Admin Top Control Ribbon */}
      <div className="bg-slate-50 text-slate-500 border-b border-slate-200 px-4 py-1.5 text-xs flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-800">Portail Agence Super Admin</span>
          <span className="text-slate-600">|</span>
          <span className="hidden sm:inline text-[11px]">Mode Gestionnaire Multi-Restaurants</span>
        </div>

        <button
          onClick={handleLogout}
          className="text-red-400 hover:text-red-300 text-[11px] font-bold underline transition-colors"
        >
          Déconnexion
        </button>
      </div>

      {children}
    </div>
  );
};
