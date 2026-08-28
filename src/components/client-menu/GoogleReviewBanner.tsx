'use client';

import React from 'react';
import { Star, ExternalLink, Sparkles } from 'lucide-react';

interface GoogleReviewBannerProps {
  googleReviewUrl?: string | null;
  restaurantName: string;
}

export const GoogleReviewBanner: React.FC<GoogleReviewBannerProps> = ({
  googleReviewUrl,
  restaurantName,
}) => {
  if (!googleReviewUrl || !googleReviewUrl.trim()) return null;

  return (
    <aside aria-label="Avis Google" className="my-6 px-4">
      <a
        href={googleReviewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 text-white shadow-lg hover:shadow-orange-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all border border-amber-300/40"
      >
        {/* Glow ambient */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 bg-white text-amber-600 rounded-2xl flex items-center justify-center shadow-md shrink-0 group-hover:rotate-6 transition-transform">
              <Star className="w-6 h-6 fill-amber-500 stroke-amber-600" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1 text-amber-100 text-xs font-bold">
                <span className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-300 stroke-amber-400" />
                  ))}
                </span>
                <span className="ml-1 uppercase tracking-wider text-[10px] bg-black/20 px-1.5 py-0.5 rounded">
                  Avis 5 Étoiles
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black tracking-tight text-white mt-0.5 truncate">
                Vous appréciez votre repas chez {restaurantName} ?
              </h4>
              <p className="text-xs text-amber-100 font-medium truncate">
                Laissez-nous un avis Google en 10 secondes !
              </p>
            </div>
          </div>

          <div className="hidden xs:flex items-center gap-1 bg-white/20 group-hover:bg-white text-white group-hover:text-slate-900 font-black text-xs px-3.5 py-2 rounded-xl transition-all shrink-0">
            <span>Avis ⭐</span>
            <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>
      </a>
    </aside>
  );
};
