'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconBadgeProps {
  icon: LucideIcon | React.ElementType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'amber' | 'emerald' | 'blue' | 'slate';
  className?: string;
  iconClassName?: string;
  shape?: 'circle' | 'rounded';
}

const SIZE_CONFIGS = {
  sm: { badge: 'w-7 h-7 p-1.5', icon: 16 },
  md: { badge: 'w-10 h-10 p-2.5', icon: 20 },
  lg: { badge: 'w-12 h-12 p-3', icon: 24 },
  xl: { badge: 'w-14 h-14 p-3.5', icon: 28 },
};

const VARIANT_CONFIGS = {
  amber: 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400',
  slate: 'bg-slate-500/10 border border-slate-500/20 text-slate-600 dark:text-slate-400',
};

/**
 * Reusable IconBadge component for Lucide SVG Icons.
 * Applies standardized amber glassmorphism background, padding, and trait strokeWidth={1.8}.
 */
export const IconBadge: React.FC<IconBadgeProps> = ({
  icon: IconComponent,
  size = 'md',
  variant = 'amber',
  className = '',
  iconClassName = '',
  shape = 'rounded',
}) => {
  const sizeConfig = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const variantClass = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.amber;
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${shapeClass} ${sizeConfig.badge} ${variantClass} ${className}`}
    >
      <IconComponent
        size={sizeConfig.icon}
        strokeWidth={1.8}
        className={`w-full h-full ${iconClassName}`}
      />
    </div>
  );
};
