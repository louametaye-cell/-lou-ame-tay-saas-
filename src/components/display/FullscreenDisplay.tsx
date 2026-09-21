'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Maximize2, Minimize2, ChefHat, Sparkles, QrCode, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatFCFA } from '@/lib/utils';
import { SlideItem, getAllergenEmoji } from './SlideshowDisplay';

export interface DisplayCategory {
  id: string;
  name: string;
  icon?: string;
  items?: any[];
}

interface FullscreenDisplayProps {
  slides: SlideItem[];
  categories?: DisplayCategory[];
  initialCategory?: string | null;
  restaurantName: string;
  restaurantLogo?: string | null;
  currentTime: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  orderMenuUrl: string;
}

export const FullscreenDisplay: React.FC<FullscreenDisplayProps> = ({
  slides,
  categories = [],
  initialCategory = null,
  restaurantName,
  restaurantLogo,
  currentTime,
  isFullscreen,
  onToggleFullscreen,
  orderMenuUrl,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'ALL');

  // Filtrer les plats selon la catégorie sélectionnée (ou tous les plats)
  const filteredSlides = useMemo(() => {
    if (!activeCategory || activeCategory === 'ALL') return slides;
    const match = slides.filter(
      (s) =>
        s.category?.toLowerCase() === activeCategory.toLowerCase() ||
        s.category?.toLowerCase().includes(activeCategory.toLowerCase())
    );
    return match.length > 0 ? match : slides;
  }, [slides, activeCategory]);

  const validSlides = filteredSlides.length > 0 ? filteredSlides : [];

  useEffect(() => {
    if (isPaused || validSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validSlides.length);
    }, 7000); // Défilement automatique toutes les 7 secondes
    return () => clearInterval(timer);
  }, [isPaused, validSlides.length]);

  // Raccourcis clavier (Flèches gauche/droite et Espace pour pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % validSlides.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + validSlides.length) % validSlides.length);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [validSlides.length]);

  if (validSlides.length === 0) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <ChefHat className="w-20 h-20 text-emerald-400 mb-4 animate-bounce" />
        <h2 className="text-3xl font-black">Menu En Cours de Préparation</h2>
        <p className="text-slate-400 mt-2">Aucun plat disponible pour l&apos;affichage plein écran.</p>
      </div>
    );
  }

  const slide = validSlides[currentIndex % validSlides.length];
  const hasRealImage = slide?.imageUrl && slide.imageUrl !== '/images/placeholder-small.jpg';

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. ARRIÈRE-PLAN : IMAGE DU PLAT EN PLEIN ÉCRAN TOTAL AVEC FONDU CINÉMATOGRAPHIQUE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide?.id || `${activeCategory}-${currentIndex}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0 w-full h-full"
        >
          {hasRealImage ? (
            <Image
              src={slide.imageUrl}
              alt={slide.name}
              fill
              priority
              className="object-cover object-center brightness-[0.88] contrast-[1.05]"
              sizes="100vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-zinc-900 to-black flex items-center justify-center">
              <ChefHat className="w-48 h-48 text-emerald-500/20" />
            </div>
          )}

          {/* Dégradé supérieur pour en-tête */}
          <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
          {/* Dégradé inférieur puissant pour le nom, le prix et le QR Code */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/95 via-black/75 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* 2. EN-TÊTE FLOTTANT : LOGO, NOM RESTAURANT, SÉLECTEUR DE CATÉGORIES & HORLOGE */}
      <header className="absolute top-0 inset-x-0 z-20 px-6 sm:px-12 py-6 flex items-center justify-between pointer-events-auto gap-4">
        
        {/* Identité Établissement */}
        <div className="flex items-center gap-3.5 bg-black/60 backdrop-blur-md px-5 py-3 rounded-3xl border border-white/15 shadow-2xl shrink-0">
          {restaurantLogo ? (
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white/10 shrink-0 border border-white/20">
              <Image src={restaurantLogo} alt={restaurantName} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/30">
              🍽️
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-emerald-400" />
                <span>Plein Écran TV</span>
              </span>
              {isPaused && (
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                  ⏸ Pause
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
              {restaurantName}
            </h1>
          </div>
        </div>

        {/* Sélecteur de Catégories Interactif en Plein Écran */}
        {categories && categories.length > 0 && (
          <div className="hidden md:flex items-center gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-3xl border border-white/15 shadow-2xl max-w-2xl overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setActiveCategory('ALL');
                setCurrentIndex(0);
              }}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🍽️</span>
              <span>Tous les plats ({slides.length})</span>
            </button>

            {categories.map((cat) => {
              const isSelected = activeCategory === cat.name;
              const count = slides.filter(
                (s) => s.category?.toLowerCase() === cat.name.toLowerCase()
              ).length;
              if (count === 0) return null;

              return (
                <button
                  key={cat.id || cat.name}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.name);
                    setCurrentIndex(0);
                  }}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{cat.icon || '🏷️'}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`text-[11px] px-1.5 py-0.2 rounded-md ${
                      isSelected
                        ? 'bg-black/20 text-slate-950 font-bold'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Horloge & Plein Écran Natif */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="bg-black/60 backdrop-blur-md px-5 py-3 rounded-3xl border border-white/15 shadow-2xl flex items-center gap-2.5 text-white font-mono text-base sm:text-lg font-bold">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>{currentTime}</span>
          </div>

          <button
            type="button"
            onClick={onToggleFullscreen}
            className="p-3.5 bg-black/60 hover:bg-black/80 text-white rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl transition-all active:scale-95 cursor-pointer"
            title={isFullscreen ? 'Quitter Plein Écran (F)' : 'Activer Plein Écran (F)'}
            aria-label="Mode Plein Écran"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* 3. FLÈCHES DE NAVIGATION LATÉRALES DISCRÈTES */}
      <div className="absolute inset-y-0 inset-x-4 z-10 flex items-center justify-between pointer-events-none">
        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev - 1 + validSlides.length) % validSlides.length)}
          className="pointer-events-auto p-3.5 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-90 cursor-pointer"
          title="Plat Précédent (Flèche Gauche)"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % validSlides.length)}
          className="pointer-events-auto p-3.5 rounded-full bg-black/40 hover:bg-black/70 text-white/70 hover:text-white backdrop-blur-md border border-white/10 transition-all active:scale-90 cursor-pointer"
          title="Plat Suivant (Flèche Droite)"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* 4. ZONE PRINCIPALE BAS DE PAGE : INFOS DU PLAT, PRIX XXL & QR CODE GÉANT */}
      <div className="absolute bottom-0 inset-x-0 z-20 px-6 sm:px-12 pb-8 sm:pb-12 pt-16 flex flex-col lg:flex-row items-end justify-between gap-8 pointer-events-auto">
        
        {/* Colonne Gauche : Détails du Plat & Prix XXL */}
        <div className="flex-1 max-w-4xl space-y-4">
          
          {/* Badges Spécialité & Catégorie */}
          <div className="flex flex-wrap items-center gap-2.5">
            {slide?.isSpecial && (
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-2xl shadow-xl animate-bounce">
                <ChefHat className="w-4 h-4" />
                <span>SPÉCIALITÉ DU CHEF</span>
              </div>
            )}
            {slide?.category && (
              <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-slate-950 font-black text-xs sm:text-sm px-4 py-1.5 rounded-2xl shadow-lg border border-emerald-300/40">
                <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                <span className="uppercase tracking-wider">{slide.category}</span>
              </div>
            )}
            {slide?.allergens && slide.allergens.length > 0 && (
              <div className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-slate-300 text-xs px-3 py-1.5 rounded-2xl border border-white/15">
                {slide.allergens.slice(0, 3).map((alg) => (
                  <span key={alg} title={alg}>
                    {getAllergenEmoji(alg)} {alg}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Nom du Plat (XXL géant) */}
          <div className="space-y-1">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
              {slide?.name}
            </h2>
            {slide?.nameWolof && (
              <p className="text-2xl sm:text-3xl text-amber-400 font-black tracking-wide drop-shadow-md">
                🇸🇳 {slide.nameWolof}
              </p>
            )}
          </div>

          {/* Description Appétissante */}
          <p className="text-lg sm:text-2xl text-slate-200 font-medium leading-relaxed max-w-3xl drop-shadow-md line-clamp-3">
            {slide?.description || 'Préparé à la minute avec des ingrédients frais du terroir sénégalais.'}
          </p>

          {/* PRIX GÉANT FCFA (Vert Émeraude Ultra-Lumineux) */}
          <div className="pt-2 flex items-baseline gap-4">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-emerald-300/80 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30">
              Prix au Menu
            </span>
            <div className="text-5xl sm:text-7xl lg:text-8xl font-mono font-black text-emerald-400 tracking-tight drop-shadow-[0_4px_24px_rgba(52,211,153,0.45)]">
              {formatFCFA(slide?.price || 0)}
            </div>
          </div>
        </div>

        {/* Colonne Droite : QR CODE GÉANT POUR COMMANDER DIRECTEMENT */}
        <div className="shrink-0 flex flex-col items-center">
          <div className="relative bg-white p-3.5 sm:p-5 rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.8)] border-4 border-emerald-400/90 flex flex-col items-center gap-2.5 transition-transform hover:scale-105">
            
            {/* Label Au-dessus du QR */}
            <div className="flex items-center gap-1.5 text-slate-900 font-black text-xs sm:text-sm uppercase tracking-wider">
              <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Scannez &amp; Commandez</span>
            </div>

            {/* QR Code SVG Haute Résolution */}
            <div className="rounded-2xl overflow-hidden bg-white p-1">
              <QRCodeSVG
                value={orderMenuUrl}
                size={140}
                level="H"
                includeMargin={false}
              />
            </div>

            {/* Sous-titre sous le QR */}
            <div className="text-center">
              <p className="text-[11px] font-mono font-bold text-slate-600 leading-tight">
                Menu Mobile Instantané
              </p>
              <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wide mt-0.5">
                100% Sans Attente
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* 5. JAUGE DE PROGRESSION DISCRÈTE TOUT EN BAS */}
      <div className="absolute bottom-0 inset-x-0 z-30 h-1.5 bg-white/10">
        <div
          key={`${activeCategory}-${currentIndex}`}
          className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all ease-linear"
          style={{
            animation: !isPaused ? 'fullscreenProgress 7s linear forwards' : 'none',
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes fullscreenProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
