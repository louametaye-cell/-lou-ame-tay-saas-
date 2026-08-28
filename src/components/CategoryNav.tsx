'use client';

import React from 'react';
import { CategoryType, Language } from '@/types';
import { translateCategoryName } from '@/lib/translation-engine';

interface CategoryNavProps {
  categories: CategoryType[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
  lang?: Language;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
  lang = 'FR',
}) => {
  return (
    <div className="sticky top-[124px] sm:top-[132px] z-20 bg-[#FFF8F0]/95 backdrop-blur-md border-b border-orange-200/80 py-3 shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1">
          {categories.map((category) => {
            const isActive = activeCategoryId === category.id;
            const icon = category.icon || '🍽️';
            const translatedLabel = translateCategoryName(category.name, lang);

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`min-h-[48px] flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-base font-extrabold whitespace-nowrap active:scale-95 transition-transform shrink-0 shadow-sm ${
                  isActive
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                    : 'bg-white text-gray-800 hover:bg-orange-50 hover:text-green-700 border border-orange-100'
                }`}
              >
                <span className="text-[28px] leading-none">{icon}</span>
                <span>{translatedLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
