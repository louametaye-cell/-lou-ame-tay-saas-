// ==============================================================================
// GESTION DES HORAIRES D'OUVERTURE & STATUT SERVICE DU RESTAURANT
// Lou Ame Tay ? - Détection automatique de l'ouverture du service pour les commandes
// ==============================================================================

export interface OpeningShift {
  openTime: string;  // "11:30"
  closeTime: string; // "15:00"
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, etc.
  isOpen: boolean;
  shifts: OpeningShift[];
}

export const DEFAULT_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 1, isOpen: true, shifts: [{ openTime: '11:30', closeTime: '15:30' }, { openTime: '18:30', closeTime: '23:30' }] },
  { dayOfWeek: 2, isOpen: true, shifts: [{ openTime: '11:30', closeTime: '15:30' }, { openTime: '18:30', closeTime: '23:30' }] },
  { dayOfWeek: 3, isOpen: true, shifts: [{ openTime: '11:30', closeTime: '15:30' }, { openTime: '18:30', closeTime: '23:30' }] },
  { dayOfWeek: 4, isOpen: true, shifts: [{ openTime: '11:30', closeTime: '15:30' }, { openTime: '18:30', closeTime: '23:30' }] },
  { dayOfWeek: 5, isOpen: true, shifts: [{ openTime: '11:30', closeTime: '15:30' }, { openTime: '18:30', closeTime: '01:00' }] },
  { dayOfWeek: 6, isOpen: true, shifts: [{ openTime: '11:30', closeTime: '15:30' }, { openTime: '18:30', closeTime: '01:00' }] },
  { dayOfWeek: 0, isOpen: true, shifts: [{ openTime: '12:00', closeTime: '23:00' }] },
];

/**
 * Détermine si le restaurant est actuellement ouvert aux commandes.
 */
export function isRestaurantCurrentlyOpen(schedule: DaySchedule[] = DEFAULT_SCHEDULE): {
  isOpen: boolean;
  statusText: string;
  nextOpeningTime?: string;
} {
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayConfig = schedule.find((s) => s.dayOfWeek === currentDay);

  if (!todayConfig || !todayConfig.isOpen) {
    return {
      isOpen: false,
      statusText: 'Fermé aujourd\'hui',
    };
  }

  for (const shift of todayConfig.shifts) {
    const [openH, openM] = shift.openTime.split(':').map(Number);
    const [closeH, closeM] = shift.closeTime.split(':').map(Number);

    const openMin = openH * 60 + openM;
    let closeMin = closeH * 60 + closeM;
    if (closeMin < openMin) closeMin += 24 * 60; // Dépasse minuit

    let checkMin = currentMinutes;
    if (currentMinutes < openMin && closeMin > 24 * 60) checkMin += 24 * 60;

    if (checkMin >= openMin && checkMin <= closeMin) {
      return {
        isOpen: true,
        statusText: `Ouvert • Service en cours (fermeture ${shift.closeTime})`,
      };
    }
  }

  return {
    isOpen: false,
    statusText: 'Fermé actuellement • Réouverture au prochain service',
  };
}
