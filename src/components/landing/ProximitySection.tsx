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
          
          {/* Left Column: Senegal Map Visual with Pings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 relative min-h-[360px] flex flex-col justify-between shadow-xs overflow-hidden"
          >
            {/* Background SVG Senegal Outline / Grid Map Graphic */}
            <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
              <svg viewBox="0 0 500 400" className="w-full h-full text-slate-900 fill-current">
                <path d="M50 150 Q100 80 200 120 T350 100 T450 200 T380 320 T200 350 T80 280 Z" />
              </svg>
            </div>

            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#00A86B] animate-pulse"></span>
                <span className="text-xs font-bold text-slate-800">Sénégal • Réseau de proximité</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Axe Thiès — Dakar — Mbour</span>
            </div>

            {/* Interactive Map Visual with Pins */}
            <div className="relative z-10 my-8 py-6 flex items-center justify-center gap-8 sm:gap-16">
              
              {/* Dakar Marker */}
              <div className="relative flex flex-col items-center group">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00A86B] rounded-full animate-ping opacity-75"></div>
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#00A86B] font-bold group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 fill-emerald-50 text-[#00A86B]" />
                </div>
                <span className="mt-2 text-xs font-black text-slate-900 bg-white/90 px-2.5 py-0.5 rounded-md border border-slate-200 shadow-xs">
                  Dakar
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">Almadies, Plateau, Ngor</span>
              </div>

              {/* Connecting Line */}
              <div className="flex-1 h-0.5 bg-dashed border-b-2 border-dashed border-emerald-300 relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-300 whitespace-nowrap">
                  30 min d'intervention
                </div>
              </div>

              {/* Thiès HQ Marker */}
              <div className="relative flex flex-col items-center group">
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6B00] rounded-full animate-ping opacity-75"></div>
                <div className="w-12 h-12 rounded-2xl bg-[#064E3B] text-white shadow-sm flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                  <Navigation className="w-6 h-6 text-emerald-300" />
                </div>
                <span className="mt-2 text-xs font-black text-white bg-[#064E3B] px-2.5 py-0.5 rounded-md shadow-xs">
                  Thiès (Siège)
                </span>
                <span className="text-[10px] text-slate-500 font-medium mt-0.5">Dixième, Randoulène, Centre</span>
              </div>

            </div>

            <div className="relative z-10 bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
                Support technique & installation en personne
              </span>
              <span className="font-bold text-[#00A86B]">7j/7</span>
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
                    📍 Basés à Thiès
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
