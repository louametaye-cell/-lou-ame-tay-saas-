'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  categories: any[];
  items: any[];
  updatedAt: string;
}

export default function DisplayMenuPage({
  params,
}: {
  params: { restaurantId: string };
}) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'classic'; // 'classic' | 'slideshow' | 'quadrant'

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
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <h2 className="text-2xl font-black tracking-wide text-emerald-400">
          CHARGEMENT DE L'ÉCRAN MENU PUBLIC TV...
        </h2>
        <p className="text-sm text-slate-400">Lou Ame Tay ? • Mode {mode.toUpperCase()}</p>
      </div>
    );
  }

  const orderMenuUrl = `${baseUrl}/r/${data.subdomain || params.restaurantId}`;

  // Mode 2 : Diaporama (Slideshow 1 plat 6s)
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

  // Mode 3 : Quadrant (2x2 10s)
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