'use client';

import React, { useState } from 'react';
import { Play, CheckCircle2, ArrowRight, Smartphone, ChefHat, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemoVideoSectionProps {
  youtubeId?: string;
}

export const DemoVideoSection: React.FC<DemoVideoSectionProps> = ({ youtubeId }) => {
  const [hasVideoError, setHasVideoError] = useState(false);

  // Helper to extract YouTube video ID if full URL is passed
  const getYoutubeEmbedId = (idOrUrl?: string) => {
    if (!idOrUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = idOrUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : idOrUrl;
  };

  const activeYoutubeId = getYoutubeEmbedId(youtubeId);

  return (
    <section id="demo-video" className="py-20 bg-slate-50 border-b border-slate-200/80 relative">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-12"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00A86B] block">
            Démonstrateur Visuel
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Voyez <span className="text-[#00A86B]">Lou Ame Tay ?</span> en action
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            30 secondes pour comprendre comment ça marche dans votre restaurant.
          </p>
        </motion.div>

        {/* Video Player Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group aspect-video flex items-center justify-center"
        >
          {activeYoutubeId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeYoutubeId}?rel=0&autoplay=0`}
              title="Démo vidéo Lou Ame Tay"
              className="w-full h-full border-0 rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          ) : !hasVideoError ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              controls
              controlsList="nodownload"
              preload="metadata"
              className="w-full h-full object-cover"
              onError={() => setHasVideoError(true)}
            >
              <source src="/demo-louametay.mp4" type="video/mp4" />
              <source src="/videos%20demo%20scan%20qr%20code.mp4" type="video/mp4" />
              Votre navigateur ne prend pas en charge la lecture de vidéos HTML5.
            </video>
          ) : null}

          {/* Placeholder Overlay when Video is missing or loading */}
          {hasVideoError && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#00A86B]/20 border-2 border-[#00A86B] flex items-center justify-center text-[#00A86B] shadow-lg animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <div className="space-y-1">
                <span className="text-lg font-extrabold text-white font-heading block">
                  Démo vidéo - Bientôt disponible
                </span>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Découvrez la simulation interactive du parcours client à table vers la cuisine ci-dessous.
                </p>
              </div>
            </div>
          )}

          {/* Top Video Badge overlay */}
          <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/60 text-white text-[11px] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse"></span>
            <span>Démo en situation réelle sur table</span>
          </div>
        </motion.div>

        {/* 3 Mini Text Steps Below Video */}
        <div className="mt-8 max-w-4xl mx-auto bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 text-center sm:text-left text-xs sm:text-sm font-bold text-slate-900">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-300 text-[#00A86B] flex items-center justify-center font-black text-xs shrink-0">1</span>
              <span>Scan en 1 sec</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-300 text-[#00A86B] flex items-center justify-center font-black text-xs shrink-0">2</span>
              <span>Choix en 30 sec</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-300 text-[#00A86B] flex items-center justify-center font-black text-xs shrink-0">3</span>
              <span>Commande en cuisine</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
