'use client';

import React from 'react';
import Image from 'next/image';
import { Search, Bell } from 'lucide-react';
import { RestaurantType, Language } from '@/types';
import { getUIText } from '@/lib/translation-engine';

interface HeaderProps {
  restaurant: RestaurantType;
  tableNumber: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onCallWaiter: () => void;
  lang?: Language;
}

export const Header: React.FC<HeaderProps> = ({
  restaurant,
  tableNumber,
  searchQuery,
  onSearchChange,
  onCallWaiter,
  lang = 'FR',
}) => {
  const t = getUIText(lang);

  return (
    <header className="bg-[#FFF8F0] border-b border-orange-200/80 sticky top-0 z-30 shadow-sm backdrop-blur-md">
      {/* Top Banner Bar */}
      <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-md border-2 border-[#FF6B00]/40 bg-white shrink-0">
              <Image
                src={restaurant.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'}
                alt={restaurant.name}
                fill
                className="object-cover"
                sizes="56px"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight flex items-center gap-1.5">
                  <span>👋 Lou Ame Tay ?</span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-bold text-[#FF6B00]">
                {restaurant.name} • <span className="text-gray-600 font-medium">{t.scanChooseOrder}</span>
              </p>
            </div>
          </div>

          {/* Right Action: Table Number Badge & Call Waiter */}
          <div className="flex items-center gap-2">
            <div className="bg-[#00A86B] text-white text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-2xl shadow-md flex items-center gap-1">
              <span>{t.table}</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded-lg text-white font-mono">
                {tableNumber < 10 ? `0${tableNumber}` : tableNumber}
              </span>
            </div>

            <button
              onClick={onCallWaiter}
              className="p-2.5 bg-white hover:bg-orange-50 text-[#FF6B00] border-2 border-orange-200 rounded-2xl transition-all shadow-sm active:scale-95 flex items-center justify-center"
              title={t.callWaiter}
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="mt-3 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-white border border-orange-200/90 focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-gray-900 placeholder-gray-400 outline-none shadow-inner transition-all"
          />
        </div>
      </div>
    </header>
  );
};
