'use client';

import React from 'react';
import { MapPin, ShieldCheck, PhoneCall, Clock, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export const ProximitySection: React.FC = () => {
  return (
    <section id="notre-difference" className="py-24 bg-white border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-3xl mx-auto space-y-3 mb-16"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00A86B] block">
            Ancrage Local & Présence Terrain
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Notre différence : <span className="text-[#00A86B]">l'hyper-proximité</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Nous ne sommes pas une startup à l'autre bout du monde. Nous sommes vos voisins.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
          
          {/* Left Column: Senegal Real Google Maps Visual with Animations */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 sm:p-8 relative min-h-[420px] flex flex-col justify-between shadow-xl overflow-hidden group"
          >
            {/* Google Maps Style Realistic Map Canvas Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden opacity-90 transition-opacity">
              <svg viewBox="0 0 800 600" className="w-full h-full object-cover">
                {/* Map Ocean / Coastline Background */}
                <rect width="800" height="600" fill="#0F172A" />
                
                {/* Senegal Coastline & Ocean Water Accent */}
                <path
                  d="M 0,0 L 280,0 C 260,120 220,180 140,240 C 90,280 60,320 180,380 C 220,410 240,460 200,600 L 0,600 Z"
                  fill="#1E293B"
                  opacity="0.7"
                />
                <path
                  d="M 0,0 L 250,0 C 230,110 190,170 120,230 C 70,270 40,310 160,370 C 200,400 220,450 180,600 L 0,600 Z"
                  fill="#0F172A"
                />

                {/* Google Maps Styled Road Arterials & Highways */}
                {/* N1 Highway: Dakar -> Diamniadio -> Thiès */}
                <path
                  d="M 170,240 Q 260,230 330,220 T 480,180"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 170,240 Q 260,230 330,220 T 480,180"
                  fill="none"
                  stroke="#00A86B"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />

                {/* Highway to Mbour / Saly */}
                <path
                  d="M 330,220 Q 380,300 440,360"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                <path
                  d="M 330,220 Q 380,300 440,360"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeDasharray="5 3"
                />

                {/* Grid Coordinates Overlay */}
                <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeOpacity="0.3" />
                </pattern>
                <rect width="800" height="600" fill="url(#map-grid)" />

                {/* Radar Waves around Thiès HQ */}
                <circle cx="480" cy="180" r="45" fill="none" stroke="#00A86B" strokeWidth="1.5" opacity="0.4" className="animate-ping" />
                <circle cx="480" cy="180" r="90" fill="none" stroke="#00A86B" strokeWidth="1" opacity="0.2" className="animate-pulse" />
              </svg>
            </div>

            {/* Top Bar Indicator */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-slate-800/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00A86B] animate-pulse"></span>
                <span className="text-xs font-bold text-slate-100">Carte En Direct • Sénégal</span>
              </div>
              <span className="text-[11px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700/60 uppercase tracking-wider">
                Google Maps GPS
              </span>
            </div>

            {/* Map Markers Overlay */}
            <div className="relative z-10 my-6 py-4 flex items-center justify-between gap-4 px-2">
              
              {/* Dakar Marker */}
              <div className="relative flex flex-col items-center group">
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#00A86B] rounded-full animate-ping opacity-75"></div>
                <div className="w-11 h-11 rounded-2xl bg-white text-slate-900 border-2 border-emerald-400 shadow-xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-[#00A86B] fill-emerald-100" />
                </div>
                <span className="mt-2 text-xs font-black text-slate-900 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200 shadow-lg">
                  Dakar 📍
                </span>
                <span className="text-[10px] text-slate-300 font-semibold bg-slate-900/80 px-2 py-0.5 rounded-md mt-1 border border-slate-700">
                  Almadies, Plateau, Ngor
                </span>
              </div>

              {/* Live Connection Badge */}
              <div className="flex-1 flex flex-col items-center justify-center relative px-2">
                <div className="w-full h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-500 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00A86B] text-white text-[10px] font-black px-3 py-0.5 rounded-full border border-emerald-300 shadow-lg whitespace-nowrap animate-pulse">
                    ⚡ 30 min d'intervention
                  </div>
                </div>
                <span className="text-[9px] text-emerald-400 font-bold tracking-wider uppercase mt-3 bg-slate-900/90 px-2 py-0.5 rounded border border-emerald-800">
                  Axe Autoroute à péage N1
                </span>
              </div>

              {/* Thiès HQ Marker */}
              <div className="relative flex flex-col items-center group">
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B00] rounded-full animate-ping opacity-80"></div>
                <div className="w-12 h-12 rounded-2xl bg-[#00A86B] text-white shadow-2xl flex items-center justify-center font-bold group-hover:scale-110 transition-transform border-2 border-white">
                  <Navigation className="w-6 h-6 text-white" />
                </div>
                <span className="mt-2 text-xs font-black text-white bg-[#00A86B] px-3 py-1 rounded-lg shadow-lg border border-emerald-400">
                  Thiès (Siège 🎯)
                </span>
                <span className="text-[10px] text-slate-300 font-semibold bg-slate-900/80 px-2 py-0.5 rounded-md mt-1 border border-slate-700">
                  Dixième, Randoulène, Centre
                </span>
              </div>

            </div>

            {/* Bottom Floating Bar */}
            <div className="relative z-10 bg-slate-800/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs text-slate-200 shadow-md">
              <span className="font-semibold flex items-center gap-2 text-slate-100">
                <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
                Support technique & installation en personne
              </span>
              <span className="font-bold text-[#00A86B] bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                7j/7 sur place
              </span>
            </div>
          </motion.div>

          {/* Right Column: Info Cards & Team Photo Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* Information Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <h3 className="font-heading font-bold text-xl text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#00A86B]" />
                <span>Une présence réelle à vos côtés</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
                    <span>Basés à Thiès</span>
                  </span>
                  <p className="text-xs text-slate-600 font-normal">
                    Équipe technique et commerciale disponible sur l'axe Thiès — Dakar — Mbour.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    🚗 Déplacement en 30 min
                  </span>
                  <p className="text-xs text-slate-600 font-normal">
                    Intervention physique rapide dans votre établissement en cas de besoin.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    📱 Support WhatsApp 7j/7
                  </span>
                  <p className="text-xs text-slate-600 font-normal">
                    Ligne dédiée directe pour vos ajustements de carte ou d'équipements.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    🕐 Installation en 24h
                  </span>
                  <p className="text-xs text-slate-600 font-normal">
                    Configuration de votre carte, pose des QR codes et formation sur place.
                  </p>
                </div>
              </div>
            </div>

            {/* Team Photo Placeholder Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
              {/* Photo placeholder with round green border */}
              {/* <!-- PHOTO ÉQUIPE À AJOUTER --> */}
              <div className="w-20 h-20 rounded-full border-4 border-[#00A86B] overflow-hidden bg-white shrink-0 flex items-center justify-center text-center p-2 text-[10px] text-slate-500 font-bold border-dashed shadow-xs">
                [PHOTO ÉQUIPE À AJOUTER]
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-900 block">
                  Une équipe locale passionnée par la restauration
                </span>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  Des spécialistes du CHRECA sénégalais qui comprennent vos réalités de service quotidien.
                </p>
              </div>
            </div>

          </motion.div>

        </div>

      </div>
    </section>
  );
};
