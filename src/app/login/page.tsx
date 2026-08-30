'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Store, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  ChefHat, 
  Phone, 
  Lock, 
  HelpCircle,
  MessageCircle,
  QrCode,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { toast } from 'sonner';

interface RestaurantItem {
  id: string;
  name: string;
  subdomain: string;
  ownerName: string;
  address: string;
  plan: string;
}

export default function RestaurantLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [pin, setPin] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);
  const [restaurantsList, setRestaurantsList] = useState<RestaurantItem[]>([]);

  useEffect(() => {
    // Fetch registered restaurants for quick demo selection
    fetch('/api/auth/restaurant')
      .then((res) => res.json())
      .then((data) => {
        if (data.restaurants) {
          setRestaurantsList(data.restaurants);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Veuillez renseigner votre identifiant ou sous-domaine');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: identifier.trim(),
          pin: pin.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('current_restaurant_id', data.restaurant.id);
        localStorage.setItem('current_restaurant_subdomain', data.restaurant.subdomain);
        localStorage.setItem('current_restaurant_name', data.restaurant.name);
        toast.success(data.message || 'Connexion réussie !');
        router.push(`/dashboard?restaurantId=${data.restaurant.id}`);
      } else {
        toast.error(data.error || 'Identifiants invalides');
      }
    } catch (err) {
      toast.error('Erreur de communication avec le serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (resto: RestaurantItem) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantId: resto.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('current_restaurant_id', resto.id);
        localStorage.setItem('current_restaurant_subdomain', resto.subdomain);
        localStorage.setItem('current_restaurant_name', resto.name);
        toast.success(`Connexion directe : ${resto.name}`);
        router.push(`/dashboard?restaurantId=${resto.id}`);
      }
    } catch (err) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between font-sans selection:bg-orange-500 selection:text-slate-900">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 bg-slate-50/80 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="Lou Ame Tay ?" 
              className="w-10 h-10 rounded-2xl object-cover border border-orange-500/40 shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform" 
            />
            <div>
              <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight block">
                Lou Ame Tay ?
              </span>
              <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block -mt-1">
                Portail Restaurateurs
              </span>
            </div>
          </Link>

        </div>
      </header>

      {/* Main Content : Split Screen */}
      <main className="max-w-7xl mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-4 sm:p-8 my-auto">
        {/* Left Column : Branding & Slogan (5 cols) */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Espace Professionnel Abonnés</span>
          </div>

          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
            <img 
              src="/logo-louametay-final.jpg" 
              alt="Lou Ame Tay ?" 
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-2 border-orange-500/40 shadow-2xl shadow-orange-600/30" 
            />
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Lou Ame Tay ?
              </h1>
              <p className="text-orange-400 font-extrabold text-sm sm:text-base tracking-wide mt-1">
                Scannez • Commandez • Savourez !
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md">
                La solution SaaS n°1 au Sénégal pour digitaliser vos menus, accélérer votre service et booster vos ventes.
              </p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2 bg-orange-500/10 text-orange-600 rounded-xl shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Bip Sonore Cuisine</h4>
                <p className="text-[11px] text-slate-500">Alerte instantanée dès qu'un client passe commande à table.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Gestion des Ruptures</h4>
                <p className="text-[11px] text-slate-500">Basculez un plat en rupture en 1 clic sans réimprimer le menu.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2 bg-blue-500/10 text-blue-600 rounded-xl shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Statistiques de Vente</h4>
                <p className="text-[11px] text-slate-500">Suivez les scans, plats populaires et votre chiffre d'affaires.</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200/60 rounded-2xl p-3.5 flex items-start gap-3 shadow-xs hover:shadow-md transition-shadow">
              <div className="p-2 bg-purple-500/10 text-purple-600 rounded-xl shrink-0">
                <QrCode className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Chevalets A5 / PVC</h4>
                <p className="text-[11px] text-slate-500">Commandez vos QR codes plastifiés étanches livrés en 24h.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column : Login Form Card (6 cols) */}
        <div className="lg:col-span-6">
          <div className="backdrop-blur-2xl bg-slate-900/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient Lighting */}
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-6 relative z-10">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Store className="w-6 h-6 text-orange-400" />
                <span>Connexion Restaurant</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Accédez à la gestion de votre menu, commandes et QR codes
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 relative z-10">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>Identifiant ou Sous-domaine</span>
                  <span className="text-[11px] text-slate-400 font-normal">Ex: chezfatou ou palmiersaly</span>
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nom de domaine ou téléphone..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-orange-400" />
                    <span>Code PIN / Mot de passe</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-normal">Défaut : 1234</span>
                </label>
                <input
                  type="password"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Code PIN d'accès..."
                  className="w-full bg-slate-800/80 border border-slate-700/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-2xl px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-[0.98] text-white font-black text-sm py-4 px-4 rounded-2xl shadow-xl shadow-orange-500/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Accéder à mon Dashboard</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Access Pills */}
            {restaurantsList.length > 0 && (
              <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-2.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ou testez en 1 clic un établissement pilote :</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {restaurantsList.slice(0, 3).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleQuickLogin(r)}
                      disabled={isLoading}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5 text-orange-400" />
                      <span>{r.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Support Contact */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
              <a
                href="https://wa.me/221774587474?text=Bonjour%20Lou%20Ame%20Tay,%20j'ai%20besoin%20d'aide%20pour%20me%20connecter%20à%20mon%20espace%20restaurant."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Assistance WhatsApp 24/7</span>
              </a>

              <span className="text-slate-400 text-[11px]">Sénégal 🇸🇳 2026</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-4 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Lou Ame Tay ? • Plateforme SaaS de Menu Digital pour Restaurants au Sénégal</p>
        <div className="mt-1.5 flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium">
          <Link href="/kitchen" className="hover:text-orange-500 transition-colors cursor-pointer">Portail Cuisine</Link>
          <span>•</span>
          <Link href="/super-admin" className="hover:text-orange-500 transition-colors cursor-pointer">Console Super-Admin</Link>
        </div>
      </footer>
    </div>
  );
}
