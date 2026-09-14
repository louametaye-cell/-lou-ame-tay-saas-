'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock, Sparkles } from 'lucide-react';
import { 
  FeatureKey, 
  hasAccessToFeature, 
  getFeaturePaywallInfo 
} from '@/lib/plan-permissions';
import { FeatureUpgradeModal } from './FeatureUpgradeModal';

interface LockedFeatureCardProps {
  featureKey: FeatureKey;
  currentPlanSlug?: string | null;
  restaurantName?: string;
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
  externalLink?: boolean;
}

export const LockedFeatureCard: React.FC<LockedFeatureCardProps> = ({
  featureKey,
  currentPlanSlug = 'tambali',
  restaurantName = 'Mon Restaurant',
  href,
  title,
  description,
  icon,
  iconBgColor = 'bg-slate-100',
  iconColor = 'text-slate-800',
  className = '',
  externalLink = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isUnlocked = hasAccessToFeature(currentPlanSlug, featureKey);
  const paywall = getFeaturePaywallInfo(featureKey);

  // 1. CAS DÉBLOQUÉ : Lien interactif fluide vers la fonctionnalité incluse
  if (isUnlocked) {
    if (externalLink) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-5 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all group flex flex-col justify-between ${className}`}
        >
          <div>
            <div className={`p-3 ${iconBgColor} ${iconColor} rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform`}>
              {icon}
            </div>
            <h4 className="text-sm font-black text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
          </div>
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={`p-5 bg-white border border-slate-200 rounded-3xl shadow-xs hover:border-emerald-500 hover:shadow-sm transition-all group flex flex-col justify-between ${className}`}
      >
        <div>
          <div className={`p-3 ${iconBgColor} ${iconColor} rounded-2xl w-fit mb-3 group-hover:scale-105 transition-transform`}>
            {icon}
          </div>
          <h4 className="text-sm font-black text-slate-900">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{description}</p>
        </div>
      </Link>
    );
  }

  // 2. CAS VERROUILLÉ : Carte VISIBLE, VALORISANTE avec cadenas & bénéfice concret
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        className={`p-5 bg-slate-50/80 border border-dashed border-amber-300 hover:border-amber-400 rounded-3xl shadow-2xs hover:shadow-sm transition-all group cursor-pointer flex flex-col justify-between relative overflow-hidden ${className}`}
        title={`Fonctionnalité disponible avec la formule ${paywall.requiredPlanName}`}
      >
        {/* Ruban Badge Pack Requis */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-amber-100/90 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
          <Lock className="w-3 h-3 text-amber-600" />
          <span>{paywall.requiredPlanName}</span>
        </div>

        <div>
          {/* Icône avec pastille cadenas */}
          <div className="relative w-fit mb-3">
            <div className={`p-3 ${iconBgColor} opacity-75 rounded-2xl w-fit group-hover:scale-105 transition-transform`}>
              {icon}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs">
              <Lock className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          {/* Titre & Bénéfice concret */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-black text-slate-800 group-hover:text-amber-900 transition-colors">
                {title}
              </h4>
            </div>
            <p className="text-xs text-amber-900 font-medium leading-snug line-clamp-2">
              🔒 {paywall.benefit}
            </p>
          </div>
        </div>

        {/* Bouton miniature d'invitation au clic */}
        <div className="pt-3 mt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-amber-800 group-hover:text-amber-950">
          <span>Débloquer avec {paywall.requiredPlanName}</span>
          <span className="text-xs">→</span>
        </div>
      </div>

      {/* Modal d'upgrade contextuel */}
      <FeatureUpgradeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        featureKey={featureKey}
        currentPlanSlug={currentPlanSlug}
        restaurantName={restaurantName}
      />
    </>
  );
};
