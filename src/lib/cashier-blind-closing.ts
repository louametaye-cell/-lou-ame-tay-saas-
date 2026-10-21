/**
 * Moteur de calcul temporel pour la Sécurité Comptable : Clôture à l'aveugle (Blind Closing)
 * Masque le montant du CA du jour aux caissiers dans la fenêtre précédant la clôture Z.
 * Fuseau horaire officiel : Africa/Dakar (GMT).
 */

export interface BlindClosingConfig {
  closingTime?: string; // Format "HH:mm" (ex: "23:30")
  blindClosingDelayMinutes?: number; // Minutes avant la clôture (défaut : 150 = 2h30)
  autoHideEnabled?: boolean; // Actif par défaut
}

/**
 * Détermine si l'instant courant est situé dans la fenêtre de clôture à l'aveugle.
 * Gère sans faille les horaires de jour et les shifts nocturnes qui chevauchent minuit.
 */
export function isWithinBlindClosingWindow(
  now: Date,
  closingTimeStr: string = '23:30',
  hideMinutesBefore: number = 150,
  autoHideEnabled: boolean = true
): boolean {
  if (!autoHideEnabled) return false;
  if (!closingTimeStr) return false;

  const parts = closingTimeStr.trim().split(':');
  if (parts.length < 2) return false;

  const closeH = parseInt(parts[0], 10);
  const closeM = parseInt(parts[1], 10);
  if (isNaN(closeH) || isNaN(closeM)) return false;

  // Calcul des minutes de l'heure actuelle selon le fuseau officiel de Dakar
  let curH = 0;
  let curM = 0;
  try {
    const dakarFormatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Africa/Dakar',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const dakarParts = dakarFormatter.formatToParts(now);
    curH = parseInt(dakarParts.find((p) => p.type === 'hour')?.value || '0', 10);
    curM = parseInt(dakarParts.find((p) => p.type === 'minute')?.value || '0', 10);
  } catch {
    curH = now.getUTCHours();
    curM = now.getUTCMinutes();
  }

  const currentMinutes = curH * 60 + curM;
  const closeMinutes = closeH * 60 + closeM;
  let startMinutes = closeMinutes - hideMinutesBefore;

  // Cas 1 : Fenêtre dans la même journée (ex: Clôture 23:30, Début 21:00)
  if (startMinutes >= 0 && closeMinutes > startMinutes) {
    // Masqué si on est après l'heure de début, et jusqu'à 2h après l'heure théorique (tant que pas clôturé)
    const endMarginMinutes = Math.min(1439, closeMinutes + 120);
    return currentMinutes >= startMinutes && currentMinutes <= endMarginMinutes;
  }

  // Cas 2 : Clôture après minuit (ex: Clôture 01:30, Début 23:00 la veille)
  if (startMinutes < 0) {
    startMinutes += 1440; // Ex: -90 + 1440 = 1350 (22h30)
    // Masqué si on est en fin de soirée (>= startMinutes) OU en début de nuit (<= closeMinutes + 120)
    return currentMinutes >= startMinutes || currentMinutes <= (closeMinutes + 120);
  }

  return false;
}

/**
 * Formate l'affichage des plages horaires pour l'espace Gérant
 */
export function formatBlindClosingSchedule(
  closingTimeStr: string = '23:30',
  hideMinutesBefore: number = 150
): { startTimeStr: string; closingTimeStr: string } {
  const parts = closingTimeStr.trim().split(':');
  const closeH = parseInt(parts[0] || '23', 10);
  const closeM = parseInt(parts[1] || '30', 10);

  const closeTotalMinutes = closeH * 60 + closeM;
  let startTotalMinutes = (closeTotalMinutes - hideMinutesBefore) % 1440;
  if (startTotalMinutes < 0) startTotalMinutes += 1440;

  const startH = Math.floor(startTotalMinutes / 60);
  const startM = startTotalMinutes % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    startTimeStr: `${pad(startH)}:${pad(startM)}`,
    closingTimeStr: `${pad(closeH)}:${pad(closeM)}`,
  };
}
