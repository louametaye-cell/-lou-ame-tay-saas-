/**
 * Contrôle des shifts horaires pour le personnel de Caisse (Sécurité RH & Anti-fraude)
 * Interdit la connexion PIN d'un caissier en dehors de ses heures de travail.
 * Fuseau horaire : Africa/Dakar (GMT).
 */

export interface ShiftCheckResult {
  allowed: boolean;
  currentHourStr: string;
  shiftStart?: string;
  shiftEnd?: string;
  reason?: string;
}

export function isWithinCashierShift(
  now: Date,
  shiftStart?: string | null,
  shiftEnd?: string | null
): ShiftCheckResult {
  // Calcul de l'heure courante à Dakar
  let curH = 0;
  let curM = 0;
  try {
    const dakarFormatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Africa/Dakar',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = dakarFormatter.formatToParts(now);
    curH = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    curM = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  } catch {
    curH = now.getUTCHours();
    curM = now.getUTCMinutes();
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const currentHourStr = `${pad(curH)}:${pad(curM)}`;

  // Si aucun horaire n'est défini : accès libre / journée complète
  if (!shiftStart || !shiftEnd) {
    return {
      allowed: true,
      currentHourStr,
    };
  }

  const startParts = shiftStart.trim().split(':');
  const endParts = shiftEnd.trim().split(':');

  const startH = parseInt(startParts[0] || '0', 10);
  const startM = parseInt(startParts[1] || '0', 10);
  const endH = parseInt(endParts[0] || '0', 10);
  const endM = parseInt(endParts[1] || '0', 10);

  const curMinutes = curH * 60 + curM;
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Marge de tolérance de 15 minutes avant le début de shift pour préparer le fond de caisse
  const toleranceMinutes = 15;
  const effectiveStartMinutes = Math.max(0, startMinutes - toleranceMinutes);

  // Marge de tolérance de 30 minutes après la fin de shift pour terminer la clôture Z
  const postShiftMargin = 30;

  // Cas 1 : Shift de jour dans la même journée (ex: 08:00 à 18:00)
  if (startMinutes <= endMinutes) {
    const isAllowed =
      curMinutes >= effectiveStartMinutes && curMinutes <= (endMinutes + postShiftMargin);
    return {
      allowed: isAllowed,
      currentHourStr,
      shiftStart,
      shiftEnd,
      reason: isAllowed
        ? undefined
        : `Accès refusé. Vos horaires de travail sont de ${shiftStart} à ${shiftEnd}. Il est actuellement ${currentHourStr}.`,
    };
  }

  // Cas 2 : Shift de nuit chevauchant minuit (ex: 18:00 à 02:00)
  const isAllowedNight =
    curMinutes >= effectiveStartMinutes || curMinutes <= (endMinutes + postShiftMargin);

  return {
    allowed: isAllowedNight,
    currentHourStr,
    shiftStart,
    shiftEnd,
    reason: isAllowedNight
      ? undefined
      : `Accès refusé. Vos horaires de travail sont de ${shiftStart} à ${shiftEnd}. Il est actuellement ${currentHourStr}.`,
  };
}
