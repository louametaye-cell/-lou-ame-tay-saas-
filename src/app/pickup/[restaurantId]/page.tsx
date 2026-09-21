'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Store,
  Zap,
  ShoppingBag,
  Timer
} from 'lucide-react';

interface OrderItem {
  id: string;
  shortId: string;
  tableNumber: number;
  isExpress: boolean;
  status: string;
  itemCount: number;
  shortSummary?: string;
  createdAt: string;
  preparedAt?: string | null;
  servedAt?: string | null;
}

interface RestaurantInfo {
  id: string;
  name: string;
  subdomain: string;
  logoUrl: string;
  tagline: string;
  currency: string;
}

function getElapsedMinutes(createdAt: string): string {
  try {
    const ms = Date.now() - new Date(createdAt).getTime();
    const mins = Math.max(0, Math.floor(ms / 60000));
    if (mins < 1) return '< 1 min';
    return `${mins} min`;
  } catch {
    return '1 min';
  }
}

export default function FastFoodPickupBoardPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [preparingOrders, setPreparingOrders] = useState<OrderItem[]>([]);
  const [readyOrders, setReadyOrders] = useState<OrderItem[]>([]);
  const [recentlyServed, setRecentlyServed] = useState<OrderItem[]>([]);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTambaliPlan, setIsTambaliPlan] = useState<boolean>(false);

  // Set to track which orders have already chimed so we don't repeat for the same order
  const alertedOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef<boolean>(true);

  // Live Clock (GMT Senegal)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio API Synthesized Ding-Dong Chime
  const playDingDongChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const now = ctx.currentTime;
      // Tone 1 : Note Mi (587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Tone 2 : Note La (880 Hz) après 0.22s
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.22);
      gain2.gain.setValueAtTime(0.4, now + 0.22);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.22);
      osc2.stop(now + 0.95);
    } catch (e) {
      console.warn('Erreur audio chime:', e);
    }
  };

  // Web Speech API Text-to-Speech Announcement - Strictly anonymized without customer names
  const speakReadyOrder = (order: OrderItem) => {
    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;

      const orderNumberText = order.shortId.replace('#', '');
      const announcement = `Commande numéro ${orderNumberText} est prête au guichet !`;

      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      // Small delay so it speaks after the ding-dong chime
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 500);
    } catch (e) {
      console.warn('Erreur vocalisation:', e);
    }
  };

  // Fetch Pickup Board Data
  const fetchData = async () => {
    try {
      if (!restaurantId) return;
      const res = await fetch(`/api/pickup/${encodeURIComponent(restaurantId)}`);
      if (res.status === 403) {
        setIsTambaliPlan(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (data.isTambali) {
          setIsTambaliPlan(true);
          return;
        }
        if (data.success) {
          setRestaurant(data.restaurant);
          setPreparingOrders(data.preparing || []);
          const incomingReady: OrderItem[] = data.ready || [];
          setReadyOrders(incomingReady);
          setRecentlyServed(data.recentlyServed || []);
          setLastRefreshed(new Date());

          // Trigger audio chime & voice announcement for NEW ready orders
          if (!isInitialLoadRef.current && isSoundEnabled) {
            incomingReady.forEach((ord) => {
              if (!alertedOrderIdsRef.current.has(ord.id)) {
                alertedOrderIdsRef.current.add(ord.id);
                playDingDongChime();
                speakReadyOrder(ord);
              }
            });
          } else if (isInitialLoadRef.current) {
            // First load: just memorize existing ready orders without blasting sound
            incomingReady.forEach((ord) => alertedOrderIdsRef.current.add(ord.id));
            isInitialLoadRef.current = false;
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
  }, [restaurantId, isSoundEnabled]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (isTambaliPlan) {
    const whatsappUrl = `https://wa.me/221762312003?text=${encodeURIComponent(
      `Bonjour Lou Ame Tay ?, je souhaite débloquer l'Écran de Retrait Guichet TV (Formule XÉWEUL à 35 000 FCFA/m) pour mon établissement ${restaurantId}.`
    )}`;

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Store className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <span>Formule XÉWEUL requise</span>
            </div>
            <h1 className="text-xl font-black text-white">Écran de Retrait Guichet TV</h1>
            <p className="text-xs text-amber-200/90 font-medium bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 leading-relaxed text-left">
              💡 Affichez les numéros de commande prêts sur écran TV avec carillon sonore et annonce vocale pour fluidifier le retrait.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-left">
            <div>
              <span className="text-[11px] text-slate-400 block font-bold">Tarif formule XÉWEUL</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Sans engagement</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-xl font-black text-white">35 000</span>
              <span className="text-[11px] text-slate-400 ml-1 font-bold">FCFA/m</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>Mettre à niveau via WhatsApp</span>
              <span>→</span>
            </a>

            <a
              href={`/r/${restaurantId}`}
              className="inline-flex items-center justify-center w-full py-2.5 px-4 text-slate-400 hover:text-white font-bold text-xs transition-colors"
            >
              Voir le Menu Digital
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col justify-between font-sans select-none overflow-hidden">
      {/* 1. TOP HEADER BRANDING & CONTROLS */}
      <header className="bg-[#0F172A] border-b border-slate-800 px-6 py-4 flex items-center justify-between gap-4 z-20 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={restaurant?.logoUrl || '/logo.png'}
            alt={restaurant?.name || 'Restaurant'}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md shadow-emerald-500/10"
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                {restaurant?.name || 'Lou Ame Tay ?'}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                DIRECT GUICHET EN SALLE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {restaurant?.tagline || 'Suivez l\'état de votre commande en direct sur cet écran'}
            </p>
          </div>
        </div>

        {/* Right Info: Clock & Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-emerald-400">
              {currentTime || '12:00:00'}
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Heure Dakar • GMT 🇸🇳
            </span>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <button
              type="button"
              onClick={() => {
                setIsSoundEnabled((prev) => !prev);
                if (!isSoundEnabled) playDingDongChime();
              }}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-2 text-xs font-bold ${
                isSoundEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
              title={isSoundEnabled ? 'Son et annonces vocales activés' : 'Mode silencieux'}
            >
              {isSoundEnabled ? (
                <>
                  <Volume2 className="w-5 h-5 text-emerald-400" />
                  <span className="hidden sm:inline">Son &amp; Voix Actifs</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-5 h-5 text-slate-400" />
                  <span className="hidden sm:inline">Silencieux</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-all"
              title="Basculer en plein écran TV"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN TWO-COLUMN STATUS BOARD */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800/80 p-4 sm:p-6 gap-6 sm:gap-8 overflow-hidden">
        {/* COLONNE GAUCHE 🔵 : EN PRÉPARATION */}
        <section className="flex flex-col bg-slate-900/50 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-2xl backdrop-blur-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                  <span>EN PRÉPARATION</span>
                  <span className="text-sm font-bold font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/40">
                    {preparingOrders.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Vos plats sont actuellement en cours de cuisson en cuisine</p>
              </div>
            </div>
          </div>

          {/* Grille des commandes en préparation */}
          <div className="flex-1 overflow-y-auto pr-1">
            {preparingOrders.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <ChefHat className="w-12 h-12 text-slate-700 animate-pulse" />
                <p className="text-base font-bold text-slate-400">Aucune commande en attente de cuisson</p>
                <p className="text-xs max-w-xs text-slate-600">
                  Toutes les commandes transmises ont déjà été préparées ou servies.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {preparingOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-[#0B1222] border border-blue-500/30 hover:border-blue-400 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all shadow-md group relative overflow-hidden text-center"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-600 to-cyan-500" />
                    
                    {/* Header: Lieu + Chrono */}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-2 border-b border-slate-800">
                      <span className="flex items-center gap-1.5">
                        {ord.isExpress ? (
                          <span className="text-amber-400 flex items-center gap-1 font-black">
                            <Zap className="w-3.5 h-3.5" /> Comptoir
                          </span>
                        ) : (
                          <span className="text-slate-300 font-black">Table {ord.tableNumber}</span>
                        )}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-500/30 text-blue-300 font-mono text-[11px]">
                        <Timer className="w-3 h-3 text-blue-400" />
                        {getElapsedMinutes(ord.createdAt)}
                      </span>
                    </div>

                    {/* XXL Giant Order Number */}
                    <div className="my-3 font-mono text-4xl sm:text-5xl font-black tracking-widest text-blue-400 group-hover:scale-105 transition-transform drop-shadow-md">
                      {ord.shortId}
                    </div>

                    {/* Status & Short Items Summary */}
                    <div className="space-y-1.5">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        En préparation
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-medium truncate text-center">
                        <span className="text-blue-400 font-bold mr-1">{ord.itemCount} art.</span>
                        {ord.shortSummary ? `• ${ord.shortSummary}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* COLONNE DROITE 🟢 : PRÊTES AU GUICHET */}
        <section className="flex flex-col bg-slate-900/50 rounded-3xl border border-emerald-900/40 p-5 sm:p-6 shadow-2xl backdrop-blur-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-400 tracking-wide flex items-center gap-2">
                  <span>PRÊT À RETIRER</span>
                  <span className="text-sm font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 animate-pulse">
                    {readyOrders.length}
                  </span>
                </h2>
                <p className="text-xs text-emerald-200/70">Veuillez vous présenter au comptoir muni de votre ticket</p>
              </div>
            </div>
          </div>

          {/* Grille des commandes prêtes */}
          <div className="flex-1 overflow-y-auto pr-1 relative z-10">
            {readyOrders.length === 0 ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-slate-700" />
                <p className="text-base font-bold text-slate-400">Aucune commande en attente de retrait</p>
                <p className="text-xs max-w-xs text-slate-600">
                  Dès qu'un plat est prêt en cuisine, son numéro clignotera ici en vert géant.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {readyOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-linear-to-br from-[#064E3B] to-[#022C22] border-2 border-emerald-400 rounded-3xl p-5 sm:p-6 flex flex-col justify-between text-center shadow-xl shadow-emerald-950/50 animate-in fade-in zoom-in-95 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-emerald-400 via-teal-300 to-emerald-500 animate-pulse" />

                    {/* Header: Lieu + Chrono + Statut */}
                    <div className="flex items-center justify-between text-xs font-black text-emerald-300 uppercase tracking-widest pb-2 border-b border-emerald-500/30">
                      <span className="flex items-center gap-1">
                        {ord.isExpress ? '⚡ RETRAIT GUICHET' : `TABLE ${ord.tableNumber}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 border border-emerald-400/40 text-emerald-200 font-mono text-xs">
                          <Timer className="w-3 h-3 text-emerald-400" />
                          {getElapsedMinutes(ord.createdAt)}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
                          PRÊT !
                        </span>
                      </div>
                    </div>

                    {/* Le numéro de commande en très grand (lisibilité à 10 mètres, remplace le nom du client) */}
                    <div className="my-3 font-mono text-5xl sm:text-6xl md:text-7xl font-black tracking-widest text-white drop-shadow-[0_4px_16px_rgba(16,185,129,0.4)]">
                      {ord.shortId}
                    </div>

                    {/* Résumé court des plats et nombre d'articles */}
                    <div className="bg-black/35 border border-emerald-400/30 rounded-2xl px-3 py-2 text-xs sm:text-sm text-emerald-100 font-medium">
                      <div className="flex items-center justify-center gap-2 font-bold text-emerald-300 mb-0.5">
                        <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{ord.itemCount} article{ord.itemCount > 1 ? 's' : ''} à retirer</span>
                      </div>
                      <div className="text-emerald-200/90 text-xs truncate max-w-full">
                        {ord.shortSummary}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 3. BOTTOM TICKER TAPE (BANDEAU DÉFILANT) */}
      <footer className="bg-[#0F172A] border-t border-slate-800 px-6 py-3 flex items-center justify-between text-xs font-bold text-slate-300 z-20">
        <div className="flex items-center gap-2 overflow-hidden w-full">
          <span className="px-2.5 py-1 bg-orange-500 text-slate-950 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0">
            INFO SALLE
          </span>
          <div className="truncate text-slate-300 text-xs sm:text-sm">
            📢 Bienvenue chez <strong className="text-white">{restaurant?.name || 'notre établissement'}</strong> • Munissez-vous de votre ticket de caisse pour le retrait • Scannez le QR Code de votre table pour commander • Bon appétit !
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-slate-500 text-[11px] shrink-0 pl-4 border-l border-slate-800">
          <span>Lou Ame Tay ? TV Signage</span>
          <span>•</span>
          <span className="text-emerald-400 font-mono">Sync 3.5s</span>
        </div>
      </footer>
    </div>
  );
}
