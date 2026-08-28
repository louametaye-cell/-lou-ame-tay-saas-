import { useState, useEffect } from 'react';

export type MealPeriod = 'ALL_DAY' | 'LUNCH' | 'DINNER' | 'NIGHT_SNACK';

export interface MenuScheduleInfo {
  currentPeriod: MealPeriod;
  periodLabel: string;
  isLunchTime: boolean;
  isDinnerTime: boolean;
  isNightTime: boolean;
  periodIcon: string;
  recommendedCategoryHint: string;
}

export function useMenuSchedule(): MenuScheduleInfo {
  const [schedule, setSchedule] = useState<MenuScheduleInfo>({
    currentPeriod: 'LUNCH',
    periodLabel: 'Service Midi',
    isLunchTime: true,
    isDinnerTime: false,
    isNightTime: false,
    periodIcon: '☀️',
    recommendedCategoryHint: 'Plats du Jour & Mijotés Traditionnels',
  });

  useEffect(() => {
    const updateSchedule = () => {
      const now = new Date();
      const hours = now.getHours();

      // Midi: 12h00 -> 16h00 (Thiéboudienne, Yassa, Mafé, Formules Déjeuner)
      if (hours >= 12 && hours < 16) {
        setSchedule({
          currentPeriod: 'LUNCH',
          periodLabel: 'Service Midi (12h - 16h)',
          isLunchTime: true,
          isDinnerTime: false,
          isNightTime: false,
          periodIcon: '☀️',
          recommendedCategoryHint: 'Thiéboudienne, Yassa, Mafé & Formules Déjeuner',
        });
      }
      // Soir: 18h00 -> 00h00 (Grillades, Dibi, Burgers, Chawarmas)
      else if (hours >= 18 || hours === 0) {
        setSchedule({
          currentPeriod: 'DINNER',
          periodLabel: 'Service Soir (18h - 00h)',
          isLunchTime: false,
          isDinnerTime: true,
          isNightTime: false,
          periodIcon: '🌙',
          recommendedCategoryHint: 'Grillades au feu de bois, Dibi Agneau & Burgers',
        });
      }
      // Nuit: 00h00 -> 06h00
      else if (hours >= 1 && hours < 6) {
        setSchedule({
          currentPeriod: 'NIGHT_SNACK',
          periodLabel: 'Service Nuit & Fast-Food',
          isLunchTime: false,
          isDinnerTime: false,
          isNightTime: true,
          periodIcon: '✨',
          recommendedCategoryHint: 'Snacks, Boissons fraîches & Tapas',
        });
      }
      // Matin / Continu
      else {
        setSchedule({
          currentPeriod: 'ALL_DAY',
          periodLabel: 'Service Continu',
          isLunchTime: false,
          isDinnerTime: false,
          isNightTime: false,
          periodIcon: '🍽️',
          recommendedCategoryHint: 'Toute la carte disponible',
        });
      }
    };

    updateSchedule();
    const interval = setInterval(updateSchedule, 60000);
    return () => clearInterval(interval);
  }, []);

  return schedule;
}