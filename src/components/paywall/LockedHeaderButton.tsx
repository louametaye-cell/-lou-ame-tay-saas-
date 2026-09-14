'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { FeatureKey, hasAccessToFeature, getFeaturePaywallInfo } from '@/lib/plan-permissions';
import { FeatureUpgradeModal } from './FeatureUpgradeModal';

interface LockedHeaderButtonProps {
  featureKey: FeatureKey;
  currentPlanSlug?: string | null;
  restaurantName?: string;
  href: string;
  label: string;
  title?: string;
  className?: string;
  externalLink?: boolean;
}

export const LockedHeaderButton: React.FC<LockedHeaderButtonProps> = ({
  featureKey,
  currentPlanSlug = 'tambali',
  restaurantName = 'Mon Restaurant',
  href,
  label,
  title,
  className = '',
  externalLink = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isUnlocked = hasAccessToFeature(currentPlanSlug, featureKey);
  const paywall = getFeaturePaywallInfo(featureKey);

  if (isUnlocked) {
    if (externalLink) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          title={title}
        >
          {label}
        </a>
      );
    }
    return (
      <Link href={href} className={className} title={title}>
        {label}
      </Link>
    );
  }

  // Version verrouillée valorisante : badge cadenas, au clic modal valorisant
  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-1.5 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-900 border border-dashed border-amber-300 text-xs font-bold px-3 py-2.5 rounded-2xl transition-all shadow-2xs cursor-pointer group`}
        title={`Fonctionnalité ${paywall.name} disponible avec le pack ${paywall.requiredPlanName} — Cliquez pour en savoir plus`}
      >
        <Lock className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
        <span>{label}</span>
      </button>

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
