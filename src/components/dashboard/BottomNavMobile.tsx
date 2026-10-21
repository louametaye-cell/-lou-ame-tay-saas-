'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Receipt, Utensils, Settings } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const navItems: NavItem[] = [
  {
    name: 'Accueil',
    href: '/dashboard',
    icon: Home,
    exact: true,
  },
  {
    name: 'Commandes',
    href: '/dashboard/orders',
    icon: Receipt,
  },
  {
    name: 'Menu',
    href: '/dashboard/menu',
    icon: Utensils,
  },
  {
    name: 'Plus',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function BottomNavMobile() {
  const pathname = usePathname();

  // On n'affiche la barre mobile QUE sur les routes /dashboard/*
  if (!pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav 
      aria-label="Navigation Mobile Gérant"
      className="block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);

          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-all duration-150 select-none ${
                isActive
                  ? 'text-emerald-600 font-black'
                  : 'text-slate-400 hover:text-slate-700 font-semibold'
              }`}
            >
              <div
                className={`p-1.5 rounded-2xl transition-transform active:scale-90 flex items-center justify-center ${
                  isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'
                }`}
              >
                <IconComponent className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavMobile;
