'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Calendar, 
  Sun, 
  Moon, 
  Plus, 
  Clock, 
  Utensils, 
  ChevronRight,
  Flame,
  Check
} from 'lucide-react';
import { MenuItemType, Language, CurrencyCode, ExchangeRates } from '@/types';
import { 
  DayMultiSpecialSchedule, 
  ScheduledDishSlot, 
  DayOfWeek, 
  getCurrentDayOfWeek,
  getCurrentMealPeriod,
  getStoredWeeklySchedule
} from '@/lib/weekly-schedule';
import { formatFCFA, formatConvertedPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface WeeklyMenuCustomerBannerProps {
  onQuickAdd: (item: MenuItemType) => void;
  onOpenDetails: (item: MenuItemType) => void;
  lang?: Language;
  currency?: CurrencyCode;
  exchangeRates?: ExchangeRates;
}

export const WeeklyMenuCustomerBanner: React.FC<WeeklyMenuCustomerBannerProps> = ({
  onQuickAdd,
  onOpenDetails,
  lang = 'FR',
  currency = 'FCFA',
  exchangeRates,
}) => {
  const schedule = useMemo(() => getStoredWeeklySchedule(), []);
  const today = useMemo(() => getCurrentDayOfWeek(), []);
  const currentPeriod = useMemo(() => getCurrentMealPeriod(), []);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(today);
  const [selectedPeriod, setSelectedPeriod] = useState<'LUNCH' | 'DINNER'>(currentPeriod);

  const activeDaySchedule = useMemo(() => {
    return schedule.find((s) => s.day === selectedDay) || schedule[0];
  }, [schedule, selectedDay]);

  const displayedDishes = useMemo(() => {
    return activeDaySchedule.dishes.filter((d) => d.isEnabled && d.period === selectedPeriod);
  }, [activeDaySchedule, selectedPeriod]);

  // If no dishes for this period, show all enabled dishes for that day
  const finalDishes = displayedDishes.length > 0 ? displayedDishes : activeDaySchedule.dishes.filter((d) => d.isEnabled);

  const isSelectedDayToday = selectedDay === today;

  const handleAddDishToCart = (slot: ScheduledDishSlot) => {
    const menuItem: MenuItemType = {
      id: slot.dishId || `dish_${slot.slotId}`,
      name: slot.dishName,
      nameWolof: slot.wolofDishName,
      wolofName: slot.wolofDishName,
      description: slot.description,
      price: slot.price,
      imageUrl: slot.imageUrl,
      isAvailable: true,
      preparationTime: 15,
      allergens: [],
      categoryId: 'cat_plats',
      isSpecialOfTheDay: true,
    };
    onQuickAdd(menuItem);
  };

  const handleOpenDishModal = (slot: ScheduledDishSlot) => {
    const menuItem: MenuItemType = {
      id: slot.dishId || `dish_${slot.slotId}`,
      name: slot.dishName,
      nameWolof: slot.wolofDishName,
      wolofName: slot.wolofDishName,
      description: slot.description,
      price: slot.price,
      imageUrl: slot.imageUrl,
      isAvailable: true,
      preparationTime: 15,
      allergens: [],
      categoryId: 'cat_plats',
      isSpecialOfTheDay: true,
    };
    onOpenDetails(menuItem);
  };

  return (
    <section className="space-y-3.5 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm">
      {/* Header Banner */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-500 text-slate-950 rounded-2xl shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-slate-950 tracking-tight">
                Emploi du Temps : Lou Ame Tay ?
              </h2>
              {isSelectedDayToday && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider animate-pulse">
                  🌟 Aujourd'hui
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {activeDaySchedule.dayLabel} ({activeDaySchedule.wolofDay}) • « {activeDaySchedule.catchphrase} »
            </p>
          </div>
        </div>

        {/* Meal Period Toggle (Midi / Soir) */}
        <div className="flex items-center gap-1 bg-white border border-amber-200 p-1 rounded-2xl text-xs font-bold shadow-2xs">
          <button
            type="button"
            onClick={() => setSelectedPeriod('LUNCH')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              selectedPeriod === 'LUNCH'
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Midi (12h-16h)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedPeriod('DINNER')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              selectedPeriod === 'DINNER'
                ? 'bg-indigo-600 text-white font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Soir (18h-00h)</span>
          </button>
        </div>
      </div>

      {/* 7 Days Pills Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {schedule.map((dayPlan) => {
          const isSelected = selectedDay === dayPlan.day;
          const isToday = today === dayPlan.day;

          return (
            <button
              key={dayPlan.day}
              type="button"
              onClick={() => setSelectedDay(dayPlan.day)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 border ${
                isSelected
                  ? 'bg-slate-950 text-amber-400 border-slate-950 font-black shadow-sm scale-[1.02]'
                  : isToday
                  ? 'bg-amber-100 text-amber-950 border-amber-400 font-black'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{dayPlan.badgeEmoji}</span>
              <span>{dayPlan.dayLabel.slice(0, 3)}.</span>
              {isToday && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dishes Cards for Selected Day & Period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
        {finalDishes.map((dish) => {
          const formattedPrice = formatFCFA(dish.price);
          const convertedPrice =
            currency !== 'FCFA' && exchangeRates
              ? formatConvertedPrice(dish.price, currency, exchangeRates)
              : null;

          return (
            <div
              key={dish.slotId}
              onClick={() => handleOpenDishModal(dish)}
              className="bg-white rounded-3xl overflow-hidden border-2 border-amber-200 hover:border-amber-400 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group cursor-pointer"
            >
              {/* Photo & Badge */}
              <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                <img
                  src={dish.imageUrl || '/placeholder-food.jpg'}
                  alt={dish.dishName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{dish.slotLabel}</span>
                  </span>

                  <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                    {dish.period === 'LUNCH' ? '☀️ Déjeuner' : '🌙 Dîner'}
                  </span>
                </div>

                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                  <span className="text-sm font-black font-mono">
                    {formattedPrice}
                  </span>
                  {convertedPrice && (
                    <span className="text-[11px] font-bold text-amber-300 font-mono">
                      ≈ {convertedPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {dish.dishName}
                  </h3>
                  {dish.wolofDishName && (
                    <span className="text-[11px] text-amber-700 font-bold block truncate">
                      « {dish.wolofDishName} »
                    </span>
                  )}
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                    {dish.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500 font-bold">
                    {activeDaySchedule.dayLabel}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddDishToCart(dish);
                    }}
                    className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1 shadow-2xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Commander</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};