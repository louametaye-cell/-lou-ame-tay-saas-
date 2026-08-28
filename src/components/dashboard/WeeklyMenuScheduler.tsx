'use client';

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Sparkles, 
  Save, 
  Utensils, 
  Moon, 
  Sun, 
  Check, 
  RotateCcw,
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight
} from 'lucide-react';
import { CategoryType, MenuItemType } from '@/types';
import { 
  DayMultiSpecialSchedule, 
  ScheduledDishSlot, 
  DayOfWeek, 
  DEFAULT_WEEKLY_MULTI_SCHEDULE,
  getCurrentDayOfWeek,
  getStoredWeeklySchedule,
  saveStoredWeeklySchedule
} from '@/lib/weekly-schedule';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface WeeklyMenuSchedulerProps {
  categories: CategoryType[];
}

export const WeeklyMenuScheduler: React.FC<WeeklyMenuSchedulerProps> = ({ categories }) => {
  const [schedule, setSchedule] = useState<DayMultiSpecialSchedule[]>(() => {
    return getStoredWeeklySchedule();
  });

  const today = useMemo(() => getCurrentDayOfWeek(), []);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(today);
  const [isSaving, setIsSaving] = useState(false);

  // All menu items flattened for dropdown
  const allDishes = useMemo(() => {
    const list: MenuItemType[] = [];
    categories.forEach((cat) => {
      (cat.items || []).forEach((item) => {
        list.push(item);
      });
    });
    return list;
  }, [categories]);

  const activeDaySchedule = useMemo(() => {
    return schedule.find((s) => s.day === selectedDay) || schedule[0];
  }, [schedule, selectedDay]);

  // Handle selecting a dish from dropdown for a slot
  const handleSelectDishForSlot = (slotId: string, dishId: string) => {
    const foundDish = allDishes.find((d) => d.id === dishId);
    if (!foundDish) return;

    setSchedule((prev) => {
      return prev.map((dayPlan) => {
        if (dayPlan.day !== selectedDay) return dayPlan;

        const updatedDishes = dayPlan.dishes.map((slot) => {
          if (slot.slotId !== slotId) return slot;

          return {
            ...slot,
            dishId: foundDish.id,
            dishName: foundDish.name,
            wolofDishName: foundDish.wolofName || foundDish.nameWolof || '',
            price: foundDish.price,
            imageUrl: foundDish.imageUrl,
            description: foundDish.description,
            isEnabled: true,
          };
        });

        return { ...dayPlan, dishes: updatedDishes };
      });
    });

    toast.success(`Plat « ${foundDish.name} » associé au créneau`);
  };

  // Update field of a slot
  const handleUpdateSlotField = (slotId: string, field: keyof ScheduledDishSlot, value: any) => {
    setSchedule((prev) => {
      return prev.map((dayPlan) => {
        if (dayPlan.day !== selectedDay) return dayPlan;

        const updatedDishes = dayPlan.dishes.map((slot) => {
          if (slot.slotId !== slotId) return slot;
          return { ...slot, [field]: value };
        });

        return { ...dayPlan, dishes: updatedDishes };
      });
    });
  };

  // Save changes to storage
  const handleSaveAll = () => {
    setIsSaving(true);
    saveStoredWeeklySchedule(schedule);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('💾 Emploi du Temps Hebdomadaire enregistré avec succès !');
    }, 400);
  };

  // Reset to Senegalese default gastronomy
  const handleResetDefault = () => {
    if (confirm('Voulez-vous réinitialiser l\'emploi du temps avec les classiques de la gastronomie sénégalaise ?')) {
      setSchedule(DEFAULT_WEEKLY_MULTI_SCHEDULE);
      saveStoredWeeklySchedule(DEFAULT_WEEKLY_MULTI_SCHEDULE);
      toast.success('🔄 Planning réinitialisé avec les classiques du Sénégal (Ceeb, Mafé, Yassa, Kaldou, Ceeb Blanc...)');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-slate-950 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-slate-950 text-amber-400 rounded-2xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">
              Emploi du Temps des Plats du Jour (Lundi au Dimanche)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-950/80 font-medium">
            Programmez 2 à 3 plats par jour (Midi &amp; Soirée). Le menu client s'adapte automatiquement selon le jour réel.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefault}
            className="px-3.5 py-2.5 bg-white/30 hover:bg-white/40 active:scale-95 text-slate-950 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all"
            title="Réinitialiser avec les classiques sénégalais"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Classiques Sénégal</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 active:scale-95 text-amber-400 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer le Planning'}</span>
          </button>
        </div>
      </div>

      {/* 2. 7 Days Segmented Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {schedule.map((dayPlan) => {
          const isSelected = selectedDay === dayPlan.day;
          const isToday = today === dayPlan.day;

          return (
            <button
              key={dayPlan.day}
              type="button"
              onClick={() => setSelectedDay(dayPlan.day)}
              className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-between text-center gap-1.5 relative ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-black ring-2 ring-amber-400'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
              }`}
            >
              {isToday && (
                <span className="absolute -top-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                  Aujourd'hui
                </span>
              )}

              <span className="text-lg">{dayPlan.badgeEmoji}</span>
              <span className="text-xs font-black block leading-tight">
                {dayPlan.dayLabel}
              </span>
              <span className="text-[10px] opacity-75 font-semibold block">
                « {dayPlan.wolofDay} »
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Day Catchphrase Banner */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-950 font-bold">
          <span className="text-xl">{activeDaySchedule.badgeEmoji}</span>
          <div>
            <span className="font-black text-sm block">
              {activeDaySchedule.dayLabel} ({activeDaySchedule.wolofDay})
            </span>
            <span className="text-amber-800 text-xs font-normal italic">
              « {activeDaySchedule.catchphrase} »
            </span>
          </div>
        </div>

        <span className="text-[11px] font-bold bg-amber-200/80 text-amber-900 px-3 py-1 rounded-xl">
          3 Créneaux configurables
        </span>
      </div>

      {/* 4. 3 Slots for the Selected Day (Midi Star, Incontournable Midi, Soirée) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {activeDaySchedule.dishes.map((slot) => {
          const isEnabled = slot.isEnabled;
          const isLunch = slot.period === 'LUNCH';

          return (
            <div
              key={slot.slotId}
              className={`rounded-3xl border-2 transition-all p-5 flex flex-col justify-between space-y-4 shadow-xs ${
                !isEnabled
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : isLunch && slot.slotType === 'LUNCH_STAR'
                  ? 'bg-amber-50/40 border-amber-400 ring-1 ring-amber-300'
                  : isLunch
                  ? 'bg-white border-orange-300'
                  : 'bg-indigo-50/40 border-indigo-300'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl text-white font-black text-xs ${
                      slot.slotType === 'LUNCH_STAR'
                        ? 'bg-amber-500 text-slate-950'
                        : isLunch
                        ? 'bg-orange-500'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {isLunch ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900">
                      {slot.slotLabel}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-bold block">
                      {isLunch ? 'Service Déjeuner (12h - 16h)' : 'Service Soirée (18h - 00h)'}
                    </span>
                  </div>
                </div>

                {/* Enable / Disable Toggle */}
                <button
                  type="button"
                  onClick={() => handleUpdateSlotField(slot.slotId, 'isEnabled', !isEnabled)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black border transition-all ${
                    isEnabled
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {isEnabled ? 'Activé' : 'Désactivé'}
                </button>
              </div>

              {/* Slot Body: Quick Dropdown Selector & Dish Preview */}
              <div className="space-y-3 flex-1 text-xs">
                {/* 1. Quick Dropdown Selector from existing menu dishes */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    ⚡ Choisir parmi vos plats enregistrés :
                  </label>
                  <select
                    value={slot.dishId}
                    onChange={(e) => handleSelectDishForSlot(slot.slotId, e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="">-- Sélectionner un plat --</option>
                    {allDishes.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({formatFCFA(d.price)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Visual Dish Card Preview */}
                <div className="p-3 bg-white border border-slate-200 rounded-2xl flex items-start gap-3 shadow-2xs">
                  <img
                    src={slot.imageUrl || '/placeholder-food.jpg'}
                    alt={slot.dishName}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-50"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-xs font-black text-slate-900 truncate">
                      {slot.dishName}
                    </h4>
                    {slot.wolofDishName && (
                      <span className="text-[10px] text-amber-700 font-bold block truncate">
                        « {slot.wolofDishName} »
                      </span>
                    )}
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {slot.description}
                    </p>
                  </div>
                </div>

                {/* 3. Adjustable Price & Name */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">Prix (FCFA)</label>
                    <input
                      type="number"
                      step={100}
                      value={slot.price}
                      onChange={(e) =>
                        handleUpdateSlotField(slot.slotId, 'price', Number(e.target.value))
                      }
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block text-[11px]">Nom affiché</label>
                    <input
                      type="text"
                      value={slot.dishName}
                      onChange={(e) =>
                        handleUpdateSlotField(slot.slotId, 'dishName', e.target.value)
                      }
                      className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none truncate"
                    />
                  </div>
                </div>
              </div>

              {/* Slot Footer Indicator */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{formatFCFA(slot.price)}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Prêt pour le menu client</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};