'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Maximize2, Minimize2, Sparkles, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatFCFA } from '@/lib/utils';

export interface SlideItem {
  id: string;
  name: string;
  nameWolof?: string;
  description: string;
  price: number;
  imageUrl: string;
  isSpecial: boolean;
  allergens: string[];
  category: string;
}

interface SlideshowDisplayProps {
  slides: SlideItem[];
  restaurantName: string;
  currentTime: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  orderMenuUrl: string;
}

export function getAllergenEmoji(allergen: string): string {
  const map: Record<string, string> = {
    GLUTEN: '🌾',
    CRUSTACES: '🦐',
    OEUFS: '🥚',
    'ŒUFS': '🥚',
    POISSON: '🐟',
    ARACHIDES: '🥜',
    SOJA: '🫘',
    LAIT: '🥛',
    FRUITS_A_COQUE: '🌰',
    CELERI: '🌿',
    MOUTARDE: '🟡',
    SESAME: '🌱',
    SULFITES: '🧪',
    LUPIN: '🌾',
    MOLLUSQUES: '🐚',
  };
  return map[allergen.toUpperCase()] || '⚠️';
}

export const SlideshowDisplay: React.FC<SlideshowDisplayProps> = ({
  slides,
  restaurantName,
  currentTime,
  isFullscreen,
  onToggleFullscreen,
  orderMenuUrl,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center text-white">
        <p className="text-2xl font-bold animate-pulse">⏳ Chargement des plats du jour...</p>
      </div>
    );
  }

  const slide = slides[currentIndex % slides.length];

  return (
    <div
      className="min-h-screen bg-[#121212] flex flex-col justify-between p-4 sm:p-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. TOP BAR */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-4 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center text-xl shadow-md">
            🎬
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                Mode Diaporama
              </span>
              {isPaused && (
                <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                  ⏸ Pause (Survol)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{restaurantName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2 text-white font-mono text-sm shadow-md">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{currentTime}</span>
          </div>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl border border-slate-700 transition-all shadow-md active:scale-95"
            title={isFullscreen ? 'Quitter Plein Écran' : 'Plein Écran'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN SLIDE CARD */}
      <main className="max-w-5xl w-full mx-auto my-4 flex-1 flex items-center justify-center">
        <div className="w-full bg-gradient-to-b from-slate-900/90 to-slate-950/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id || currentIndex}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8"
            >
              {/* Grand Format Image */}
              <div className="relative w-full md:w-1/2 h-64 sm:h-80 md:h-96 rounded-3xl overflow-hidden bg-slate-800 border-2 border-slate-700 shadow-2xl shrink-0">
                {slide.imageUrl && slide.imageUrl !== '/images/placeholder-small.jpg' ? (
                  <Image
                    src={slide.imageUrl}
                    alt={slide.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-600/40 to-emerald-600/40 text-7xl">
                    🍽️
                  </div>
                )}

                {slide.isSpecial && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>SPÉCIALITÉ DU CHEF</span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-amber-300 text-xs font-black px-3 py-1 rounded-xl border border-white/10">
                  📂 {slide.category}
                </div>
              </div>

              {/* Dish Content & Price */}
              <div className="w-full md:w-1/2 flex flex-col justify-between space-y-4 text-center md:text-left">
                <div>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {slide.name}
                  </h2>
                  {slide.nameWolof && (
                    <p className="text-lg sm:text-xl text-amber-400/90 font-bold mt-1">
                      🇸🇳 {slide.nameWolof}
                    </p>
                  )}
                </div>

                <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
                  {slide.description || 'Préparé à la minute avec des ingrédients frais du terroir.'}
                </p>

                {/* Price Display */}
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Prix au Menu
                  </span>
                  <div className="text-3xl sm:text-5xl font-black font-mono text-emerald-400 tracking-tight">
                    {formatFCFA(slide.price)}
                  </div>
                </div>

                {/* Allergens Icons */}
                {slide.allergens && slide.allergens.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-400">Allergènes :</span>
                    {slide.allergens.map((alg) => (
                      <span
                        key={alg}
                        className="bg-slate-800 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold"
                        title={alg}
                      >
                        <span>{getAllergenEmoji(alg)}</span>
                        <span>{alg}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Bar */}
          <div className="bg-slate-950/80 border-t border-slate-800/80 p-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all font-bold text-lg active:scale-95"
              title="Plat Précédent"
            >
              ◀
            </button>

            {/* Dots pagination */}
            <div className="flex items-center gap-1.5 max-w-md overflow-x-auto no-scrollbar px-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-emerald-500 w-8 shadow-xs shadow-emerald-500/50'
                      : 'bg-slate-700 hover:bg-slate-600 w-2.5'
                  }`}
                  aria-label={`Aller au plat ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => (prev + 1) % slides.length)}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all font-bold text-lg active:scale-95"
              title="Plat Suivant"
            >
              ▶
            </button>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="max-w-6xl mx-auto w-full flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">
            Plat {currentIndex + 1} sur {slides.length}
          </span>
          <span>•</span>
          <span>🔄 Défilement auto (6s)</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-lg">
            <QRCodeSVG value={orderMenuUrl} size={28} />
          </div>
          <span className="font-mono text-emerald-400 font-bold hidden sm:inline">
            Scanner pour commander
          </span>
        </div>
      </footer>
    </div>
  );
};