'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Maximize2, Minimize2, Sparkles, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatFCFA } from '@/lib/utils';
import { SlideItem, getAllergenEmoji } from './SlideshowDisplay';

interface QuadrantDisplayProps {
  slides: SlideItem[];
  restaurantName: string;
  currentTime: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  orderMenuUrl: string;
}

const QUADRANT_SIZE = 4; // 4 plats simultanés (grille 2x2)

export const QuadrantDisplay: React.FC<QuadrantDisplayProps> = ({
  slides,
  restaurantName,
  currentTime,
  isFullscreen,
  onToggleFullscreen,
  orderMenuUrl,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalPages = Math.max(1, Math.ceil(slides.length / QUADRANT_SIZE));
  const currentSlides = slides.slice(
    currentPage * QUADRANT_SIZE,
    (currentPage + 1) * QUADRANT_SIZE
  );

  // Auto-pagination every 10 seconds
  useEffect(() => {
    if (isPaused || slides.length <= QUADRANT_SIZE) return;
    const interval = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 10000);
    return () => clearInterval(interval);
  }, [isPaused, slides.length, totalPages]);

  // Fill empty slots with stylish placeholders
  const displaySlides: SlideItem[] = [...currentSlides];
  while (displaySlides.length < QUADRANT_SIZE && displaySlides.length > 0) {
    displaySlides.push({
      id: `placeholder-${displaySlides.length}`,
      name: 'Bientôt disponible',
      description: 'Découvrez bientôt nos nouvelles créations culinaires.',
      price: 0,
      imageUrl: '/images/placeholder-small.jpg',
      isSpecial: false,
      allergens: [],
      category: 'À venir',
    });
  }

  return (
    <div
      className="min-h-screen bg-[#111111] flex flex-col justify-between p-4 sm:p-6 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. HEADER */}
      <header className="flex items-center justify-between border-b border-slate-800 pb-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md">
            🖼️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                Mode Quadrant 2x2
              </span>
              {isPaused && (
                <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
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

      {/* 2. 2x2 QUADRANT GRID */}
      <main className="max-w-7xl w-full mx-auto my-3 flex-1 flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
          <AnimatePresence mode="wait">
            {displaySlides.map((slide, index) => {
              const isPlaceholder = slide.id.startsWith('placeholder-');

              if (isPlaceholder) {
                return (
                  <motion.div
                    key={`placeholder-${index}-${currentPage}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 0.4, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    className="bg-slate-900/40 rounded-3xl border border-dashed border-slate-800 p-6 flex flex-col items-center justify-center text-slate-500 aspect-video"
                  >
                    <span className="text-4xl mb-2">⏳</span>
                    <p className="text-base font-bold text-slate-400">Emplacement Libre</p>
                    <span className="text-xs">Bientôt de nouvelles spécialités</span>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={`${slide.id}-${currentPage}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 rounded-3xl overflow-hidden shadow-xl border border-slate-800/80 hover:border-emerald-500/50 transition-all flex flex-col sm:flex-row group"
                >
                  {/* Photo Section */}
                  <div className="relative w-full sm:w-2/5 h-44 sm:h-auto bg-slate-800 shrink-0 overflow-hidden">
                    {slide.imageUrl && slide.imageUrl !== '/images/placeholder-small.jpg' ? (
                      <Image
                        src={slide.imageUrl}
                        alt={slide.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-orange-600/30 to-emerald-600/30">
                        🍽️
                      </div>
                    )}

                    {slide.isSpecial && (
                      <div className="absolute top-3 left-3 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>SPÉCIALITÉ</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-[10px] text-amber-300 font-bold px-2 py-0.5 rounded-md">
                      {slide.category}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight truncate leading-tight">
                        {slide.name}
                      </h3>
                      {slide.nameWolof && (
                        <p className="text-xs font-bold text-amber-400 truncate">
                          🇸🇳 {slide.nameWolof}
                        </p>
                      )}
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 font-medium">
                        {slide.description || 'Préparation artisanale traditionnelle.'}
                      </p>
                    </div>

                    <div className="pt-2 flex items-end justify-between border-t border-slate-800/80">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Prix
                        </span>
                        <span className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                          {formatFCFA(slide.price)}
                        </span>
                      </div>

                      {/* Allergens */}
                      {slide.allergens && slide.allergens.length > 0 && (
                        <div className="flex gap-1" title={slide.allergens.join(', ')}>
                          {slide.allergens.slice(0, 3).map((alg) => (
                            <span key={alg} className="text-sm bg-slate-800 p-1 rounded-lg">
                              {getAllergenEmoji(alg)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </main>

      {/* 3. FOOTER CONTROLS & PAGINATION */}
      <footer className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all font-bold"
            title="Page Précédente"
          >
            ◀
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentPage ? 'bg-amber-500 w-6' : 'bg-slate-700 w-2'
                }`}
                aria-label={`Page ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => (prev + 1) % totalPages)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all font-bold"
            title="Page Suivante"
          >
            ▶
          </button>

          <span className="text-slate-400 font-bold ml-2">
            Page {currentPage + 1} / {totalPages} • {slides.length} plats
          </span>
        </div>

        <div className="flex items-center gap-3">
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