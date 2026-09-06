'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { ClassicDisplay } from '@/components/display/ClassicDisplay';
import { SlideshowDisplay } from '@/components/display/SlideshowDisplay';
import { QuadrantDisplay } from '@/components/display/QuadrantDisplay';

interface DisplayMenuData {
  restaurantId: string;
  restaurantName: string;
  subdomain: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  currency: string;
  isEnabled?: boolean;
  displaySettings?: {
    isEnabled: boolean;
    mode: 'classic' | 'slideshow' | 'quadrant';
    slideDuration?: number;
    maxScreens?: number;
  };
  categories: any[];
  items: any[];
  updatedAt: string;
}

export default function DisplayMenuPage({
  params,
}: {
  params?: { restaurantId: string } | Promise<{ restaurantId: string }>;
}) {
  const routeParams = useParams();
  const restaurantId = (routeParams?.restaurantId as string) || (params as any)?.restaurantId;
  const searchParams = useSearchParams();

  const [data, setData] = useState<DisplayMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
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
        if (!restaurantId) return;
        const res = await fetch(`/api/display/${restaurantId}`);
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
  }, [restaurantId]);

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
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-2xl font-black tracking-wide text-emerald-400">
          CHARGEMENT DE L'ÉCRAN MENU PUBLIC TV...
        </h2>
        <p className="text-sm text-slate-400">Lou Ame Tay ? • Connexion affichage direct</p>
      </div>
    );
  }

  // Si le Super-Admin a désactivé la diffusion pour cet établissement
  if (data.isEnabled === false || data.displaySettings?.isEnabled === false) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center text-white p-6 text-center space-y-5 select-none font-sans">
        <div className="w-20 h-20 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center text-4xl border border-amber-500/30 shadow-lg">
          📺
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {data.restaurantName || 'Écran Menu TV'}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {data.subdomain} • Lou Ame Tay ?
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md space-y-3 shadow-xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase">
            <span>Option TV Désactivée</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            La diffusion sur écran TV est actuellement fermée ou en attente d&apos;activation pour cet établissement.
          </p>
          <div className="pt-2 border-t border-slate-800">
            <p className="text-xs text-slate-500 mb-1">Pour activer cette option :</p>
            <p className="text-xs font-bold text-emerald-400">
              Médias Graphisme / MG Digital Arts Work : +221 77 458 74 74
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Priorité : Paramètre d'URL 'mode' si fourni, sinon le mode imposé par le Super-Admin (par défaut 'slideshow')
  const mode = searchParams.get('mode') || data.displaySettings?.mode || 'slideshow';
  const orderMenuUrl = `${baseUrl}/r/${data.subdomain || restaurantId}`;

  // Mode 2 : Diaporama (Slideshow 1 plat)
  if (mode === 'slideshow') {
    return (
      <SlideshowDisplay
        slides={data.items || []}
        restaurantName={data.restaurantName}
        currentTime={currentTime}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        orderMenuUrl={orderMenuUrl}
      />
    );
  }

  // Mode 3 : Quadrant (2x2)
  if (mode === 'quadrant') {
    return (
      <QuadrantDisplay
        slides={data.items || []}
        restaurantName={data.restaurantName}
        currentTime={currentTime}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        orderMenuUrl={orderMenuUrl}
      />
    );
  }

  // Mode 1 : Classique (Grille complète)
  return (
    <ClassicDisplay
      data={data}
      currentTime={currentTime}
      isFullscreen={isFullscreen}
      onToggleFullscreen={toggleFullscreen}
      orderMenuUrl={orderMenuUrl}
    />
  );
}