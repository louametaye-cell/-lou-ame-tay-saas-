'use client';

import React, { useEffect, useRef } from 'react';
import { CategoryType, Language } from '@/types';
import { translateCategoryName } from '@/lib/translation-engine';

interface CategoryNavbarProps {
  categories: CategoryType[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  lang?: Language;
}

export const CategoryNavbar: React.FC<CategoryNavbarProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  lang = 'FR',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active pill into view inside the navbar
  useEffect(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector<HTMLButtonElement>(
      `[data-category-id="${activeCategoryId}"]`
    );
    if (activeBtn) {
      activeBtn.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeCategoryId]);

  return (
    <nav className="sticky top-[118px] sm:top-[128px] z-20 bg-[#FFF8F0]/95 backdrop-blur-md border-b border-orange-200/80 py-2.5 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div
          ref={containerRef}
          className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {categories.map((category, index) => {
            const isActive = activeCategoryId === category.id;
            const icon = category.icon || '🍽️';
            const translatedLabel = translateCategoryName(category.name, lang);
            const isSpecialCategory =
              index === 0 ||
              category.name.toLowerCase().includes('lou ame tay') ||
              category.name.toLowerCase().includes('jour');

            return (
              <button
                key={category.id}
                data-category-id={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className={`min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap active:scale-95 transition-all shrink-0 shadow-xs border ${
                  isActive
                    ? isSpecialCategory
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-600 shadow-md shadow-orange-500/20 scale-[1.02]'
                      : 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20 scale-[1.02]'
                    : isSpecialCategory
                    ? 'bg-amber-50/90 text-amber-900 border-amber-300 hover:bg-amber-100/80'
                    : 'bg-white text-slate-800 border-orange-100 hover:bg-orange-50 hover:text-emerald-700'
                }`}
              >
                <span className="text-base sm:text-lg leading-none shrink-0">{icon}</span>
                <span>{translatedLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
