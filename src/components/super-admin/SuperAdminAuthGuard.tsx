'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lock, ShieldCheck, ArrowRight, KeyRound, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface SuperAdminAuthGuardProps {
  children: React.ReactNode;
}

const STORAGE_TOKEN_KEY = 'lou_ame_tay_superadmin_auth';
const STORAGE_LAST_ACTIVITY_KEY = 'lou_ame_tay_admin_last_activity';
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes en millisecondes

export const SuperAdminAuthGuard: React.FC<SuperAdminAuthGuardProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lockReason, setLockReason] = useState<'inactivity' | 'manual' | null>(null);

  // Verrouillage automatique pour inactivité
  const handleAutoLock = useCallback(async () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_LAST_ACTIVITY_KEY);
    try {
      await fetch('/api/super-admin/auth', { method: 'DELETE' });
    } catch {
      // Ignorer erreur réseau
    }
    setIsAuthenticated(false);
    setLockReason('inactivity');
    toast.warning("Session verrouillée automatiquement suite à 15 minutes d'inactivité.");
  }, []);

  // Déconnexion complète
  const handleLogout = useCallback(async (showToast = true) => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_LAST_ACTIVITY_KEY);
    try {
      await fetch('/api/super-admin/auth', { method: 'DELETE' });
    } catch {
      // Ignorer
    }
    setIsAuthenticated(false);
    setLockReason(null);
    if (showToast) {
      toast.info('Session Super Admin déconnectée');
    }
  }, []);

  // Verrouillage manuel immédiat
  const handleManualLock = useCallback(async () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_LAST_ACTIVITY_KEY);
    try {
      await fetch('/api/super-admin/auth', { method: 'DELETE' });
    } catch {
      // Ignorer
    }
    setIsAuthenticated(false);
    setLockReason('manual');
    toast.info('Session Super Admin verrouillée.');
  }, []);

  // 1. Initialisation au montage du composant
  useEffect(() => {
    const checkInitialSession = async () => {
      const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);
      const lastActivityStr = localStorage.getItem(STORAGE_LAST_ACTIVITY_KEY);
      const now = Date.now();

      if (!savedToken) {
        setIsAuthenticated(false);
        return;
      }

      // Vérifier si la dernière activité a dépassé le délai de 15 minutes
      if (lastActivityStr) {
        const lastActivity = parseInt(lastActivityStr, 10);
        if (!isNaN(lastActivity) && now - lastActivity > INACTIVITY_TIMEOUT_MS) {
          await handleAutoLock();
          return;
        }
      }

      // Validation optimiste immédiate si structure de token valide (évite tout scintillement)
      if (savedToken.startsWith('admin:') || savedToken === 'admin_authorized_token') {
        setIsAuthenticated(true);
        localStorage.setItem(STORAGE_LAST_ACTIVITY_KEY, String(now));
      }

      // Vérification serveur en arrière-plan (cookie HttpOnly + header)
      try {
        const res = await fetch('/api/super-admin/auth', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            'x-superadmin-token': savedToken,
          },
        });
        if (res.ok) {
          setIsAuthenticated(true);
          localStorage.setItem(STORAGE_LAST_ACTIVITY_KEY, String(Date.now()));
        } else {
          await handleLogout(false);
        }
      } catch {
        // En cas de micro-coupure réseau, on préserve l'état optimiste
      }
    };

    checkInitialSession();
  }, [handleAutoLock, handleLogout]);

  // 2. Écouteurs d'inactivité (15 minutes de grâce, réinitialisation à chaque action utilisateur)
  useEffect(() => {
    if (!isAuthenticated) return;

    let lastRecorded = Date.now();

    const recordUserActivity = () => {
      const now = Date.now();
      // Throttle de 3 secondes pour ne pas surcharger le CPU
      if (now - lastRecorded > 3000) {
        lastRecorded = now;
        localStorage.setItem(STORAGE_LAST_ACTIVITY_KEY, String(now));
      }
    };

    const checkInactivityTimer = () => {
      const lastStr = localStorage.getItem(STORAGE_LAST_ACTIVITY_KEY);
      const last = lastStr ? parseInt(lastStr, 10) : lastRecorded;
      if (Date.now() - last >= INACTIVITY_TIMEOUT_MS) {
        handleAutoLock();
      }
    };

    // Événements d'interaction de l'administrateur
    const userEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    userEvents.forEach((ev) => window.addEventListener(ev, recordUserActivity, { passive: true }));

    // Contrôle d'inactivité toutes les 10 secondes
    const interval = setInterval(checkInactivityTimer, 10000);

    return () => {
      userEvents.forEach((ev) => window.removeEventListener(ev, recordUserActivity));
      clearInterval(interval);
    };
  }, [isAuthenticated, handleAutoLock]);

  // Soumission du mot de passe
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/super-admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem(STORAGE_TOKEN_KEY, data.token);
        localStorage.setItem(STORAGE_LAST_ACTIVITY_KEY, String(Date.now()));
        setPassword('');
        setLockReason(null);
        setIsAuthenticated(true);
        toast.success("Bienvenue dans l'espace Super Admin Agence !");
      } else {
        toast.error(data.error || 'Mot de passe administrateur incorrect');
      }
    } catch {
      toast.error('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  // Écran de chargement initial (neutre et ultra-rapide)
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Écran d'authentification / verrouillage
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[url('/login-bg.jpg')] bg-cover bg-center bg-no-repeat relative text-slate-900 flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Dark Gradient Overlay for Maximum Legibility & Mobile Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/75 to-slate-950/95 backdrop-blur-[2px] pointer-events-none" />

        {/* Floating Glassmorphism Authentication Card */}
        <div className="w-full max-w-md backdrop-blur-2xl bg-white/90 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 overflow-hidden">
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
              <p className="text-xs text-orange-500 font-bold uppercase tracking-wider mt-1">
                Lou Ame Tay ? • Agence Digitale MDA
              </p>
            </div>
            <p className="text-[12px] text-slate-600">
              Pilotage centralisé, gestion des abonnements et SAV 24/7
            </p>
          </div>

          {/* Bannière explicative si verrouillage automatique d'inactivité */}
          {lockReason === 'inactivity' && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex items-center gap-3 text-amber-900 text-xs animate-in fade-in duration-300">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-amber-950">Session verrouillée pour inactivité</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  15 minutes sans interaction détectée. Veuillez saisir votre mot de passe pour déverrouiller.
                </p>
              </div>
            </div>
          )}

          {/* Bannière si verrouillage manuel */}
          {lockReason === 'manual' && (
            <div className="mb-4 bg-slate-500/10 border border-slate-400/30 rounded-2xl p-3.5 flex items-center gap-3 text-slate-800 text-xs animate-in fade-in duration-300">
              <Lock className="w-5 h-5 text-slate-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Session verrouillée manuellement</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Saisissez votre mot de passe Super-Admin pour déverrouiller l&apos;écran.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-orange-500" />
                <span>Mot de passe d&apos;accès sécurisé</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe Super-Admin..."
                className="w-full bg-slate-50/90 border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 rounded-2xl px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] bg-amber-400 hover:bg-amber-500 active:scale-[0.97] text-slate-950 font-black text-sm py-3.5 px-4 rounded-2xl border border-amber-500/40 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chiffrement AES 256 • Auto-lock 15m</span>
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
      <div className="bg-slate-950 text-slate-300 border-b border-slate-800 px-4 py-1.5 text-xs flex items-center justify-between print:hidden shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide">Portail Super Admin • MDA</span>
          <span className="text-slate-700">|</span>
          <span className="hidden sm:inline text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-orange-400 inline" />
            <span>Verrouillage auto : 15 min d&apos;inactivité</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualLock}
            title="Verrouiller la session immédiatement"
            className="text-amber-400 hover:text-amber-300 text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Verrouiller</span>
          </button>
          <button
            onClick={() => handleLogout(true)}
            className="text-red-400 hover:text-red-300 text-[11px] font-bold underline transition-colors cursor-pointer"
          >
            Déconnexion
          </button>
        </div>
      </div>

      {children}
    </div>
  );
};

