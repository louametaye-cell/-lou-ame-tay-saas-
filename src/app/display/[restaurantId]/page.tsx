'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { 
  Sparkles, 
  Clock, 
  Maximize2, 
  Minimize2, 
  QrCode, 
  Flame, 
  CheckCircle2, 
  RefreshCw,
  UtensilsCrossed,
  MapPin,
  Phone
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatFCFA } from '@/lib/utils';

interface DisplayMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  isSpecialOfTheDay?: boolean;
}

interface DisplayCategory {
  id: string;
  name: string;
  icon?: string;
  items: DisplayMenuItem[];
}

interface DisplayMenuData {
  restaurantId: string;
  restaurantName: string;
  subdomain: string;
  restaurantAddress: string;
  restaurantPhone: string;
  logoUrl?: string;
  bannerUrl?: string;
  currency: string;
  categories: DisplayCategory[];
  updatedAt: string;
}

export default function DisplayMenuPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  const [data, setData] = useState<DisplayMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  // Clock in Senegal GMT
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setCurrentDate(
        now.toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Menu Data with 30-second live auto-refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }

    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/display/${params.restaurantId}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
    const interval = setInterval(fetchMenu, 30000);
    return () => clearInterval(interval);
  }, [params.restaurantId]);

  // Fullscreen toggle handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          setIsFullscreen(false);
        }).catch(() => {});
      }
    }
  };

  // Keyboard shortcut 'F' for Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="w-16 h-16 border-4 border-[#00A86B] border-t-transparent rounded-full animate-spin" />
        <h2 className="text-2xl font-black tracking-wide text-[#00A86B]">
          CHARGEMENT DE L'ÉCRAN MENU TV...
        </h2>
        <p className="text-sm text-slate-400">Lou Ame Tay ? • Connexion temps réel</p>
      </div>
    );
  }

  const qrUrl = `${baseUrl}/r/${data.subdomain || params.restaurantId}`;

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white font-sans selection:bg-[#FF6B00] selection:text-white p-6 sm:p-10 flex flex-col justify-between relative overflow-x-hidden">
      
      {/* 1. TOP HEADER TV (RESTAURANT BRAND, LIVE CLOCK & UPDATE STATUS) */}
      <header className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Brand & Address */}
        <div className="flex items-center gap-5 text-center md:text-left">
          {data.logoUrl && (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden shadow-xl border-2 border-[#FF6B00] bg-black/40 shrink-0 hidden sm:block">
              <Image
                src={data.logoUrl}
                alt={data.restaurantName}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-[#FF6B00] bg-[#FF6B00]/10 px-3 py-1 rounded-full border border-[#FF6B00]/30 inline-block mb-1">
              ✨ MENU DU JOUR &amp; SPÉCIALITÉS
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-[#00A86B] tracking-tight drop-shadow-md">
              {data.restaurantName}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 flex items-center justify-center md:justify-start gap-2">
              <MapPin className="w-5 h-5 text-[#FF6B00]" />
              <span>{data.restaurantAddress}</span>
            </p>
          </div>
        </div>

        {/* Right: Live Clock & Live Pulse & Fullscreen Button */}
        <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
          <div className="bg-black/50 border border-white/15 px-5 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
            <Clock className="w-6 h-6 text-[#00A86B] animate-pulse" />
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider block">
                {currentTime}
              </span>
              <span className="text-xs text-slate-400 capitalize font-medium block">
                {currentDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>🔄 Mis à jour en temps réel</span>
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/15 transition-all"
              title="Plein écran (Raccourci: Touche F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. 3-COLUMNS RESPONSIVE GRID FOR 4K / 1080P TV */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 flex-1">
        {data.categories.map((category) => (
          <section
            key={category.id}
            className="bg-white/[0.05] backdrop-blur-lg rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl flex flex-col justify-between hover:border-white/20 transition-all"
          >
            <div>
              {/* Category Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                <h2 className="text-2xl sm:text-3xl font-black text-[#FF6B00] tracking-tight flex items-center gap-2.5">
                  <span>{category.icon || '🍽️'}</span>
                  <span>{category.name}</span>
                </h2>
                <span className="text-xs font-black text-slate-400 bg-white/10 px-3 py-1 rounded-full">
                  {category.items.length} choix
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {category.items.map((item) => {
                  const isOut = !item.isAvailable;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3.5 rounded-2xl border transition-all ${
                        isOut
                          ? 'bg-red-950/20 border-red-500/30 opacity-45'
                          : item.isSpecialOfTheDay
                          ? 'bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border-amber-500/50 shadow-lg'
                          : 'bg-white/[0.04] border-white/5 hover:bg-white/[0.08]'
                      }`}
                    >
                      {/* Photo Vignette 80x80px */}
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black/40 border border-white/10 shrink-0 shadow-md">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
                            🍽️
                          </div>
                        )}
                        {item.isSpecialOfTheDay && (
                          <span className="absolute top-1 left-1 bg-[#FF6B00] text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                            ⭐ DU JOUR
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-lg sm:text-xl font-black text-white leading-tight ${isOut ? 'line-through text-slate-400' : ''}`}>
                            {item.name}
                          </h3>
                        </div>

                        {item.description && (
                          <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-snug">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Price in Green #00A86B & Out of stock badge */}
                      <div className="text-right shrink-0 space-y-1 pl-2">
                        <p className={`text-xl sm:text-2xl font-black text-[#00A86B] font-mono tracking-tight ${isOut ? 'line-through opacity-50' : ''}`}>
                          {formatFCFA(item.price)}
                        </p>

                        {isOut && (
                          <span className="inline-block bg-red-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                            ⚠️ Rupture
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* 3. FOOTER WITH GIANT ORDER QR CODE */}
      <footer className="mt-8 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="p-3 bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 rounded-2xl shadow-md shrink-0">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-lg sm:text-xl font-black text-white">
              Lou Ame Tay ? • Menu Numérique &amp; Commande Instantanée
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              Scannez le QR Code pour parcourir le menu, choisir vos options et commander sans attendre depuis votre table ou au comptoir.
            </p>
          </div>
        </div>

        {/* Giant QR Code box */}
        <div className="flex items-center gap-4 bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/15 shrink-0">
          <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
            <QRCodeSVG
              value={qrUrl}
              size={84}
              level="H"
              marginSize={1}
            />
          </div>
          <div className="text-left space-y-0.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#00A86B] block">
              📱 Scannez ici :
            </span>
            <span className="text-xs font-mono font-bold text-white block truncate max-w-[180px]">
              {qrUrl.replace(/^https?:\/\//, '')}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Wave • OM • Espèces
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}