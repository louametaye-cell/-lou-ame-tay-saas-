import { describe, it, expect } from 'vitest';
import { isWithinBlindClosingWindow, formatBlindClosingSchedule } from '../src/lib/cashier-blind-closing';
import { isWithinCashierShift } from '../src/lib/cashier-shift-guard';

describe('🛡️ SUITE DE SÉCURITÉ COMPTABLE & RH — LOU AME TAY ?', () => {
  describe('1. Moteur de Clôture à l\'aveugle (isWithinBlindClosingWindow)', () => {
    it('Ne doit PAS masquer le CA en pleine journée bien avant la clôture', () => {
      // 15:00 UTC/Dakar pour une clôture à 23:30 (début de masquage à 21:00)
      const testDate = new Date('2026-10-21T15:00:00.000Z');
      const isHidden = isWithinBlindClosingWindow(testDate, '23:30', 150, true);
      expect(isHidden).toBe(false);
    });

    it('DOIT masquer le CA dans la fenêtre des 2h30 précédant la clôture', () => {
      // 21:30 UTC/Dakar pour une clôture à 23:30
      const testDate = new Date('2026-10-21T21:30:00.000Z');
      const isHidden = isWithinBlindClosingWindow(testDate, '23:30', 150, true);
      expect(isHidden).toBe(true);
    });

    it('DOIT gérer sans faille les horaires de clôture nocturnes après minuit (ex: 01:30)', () => {
      // Clôture 01:30 -> Début de masquage à 23:00 la veille
      const testNight = new Date('2026-10-21T23:30:00.000Z');
      const isHiddenNight = isWithinBlindClosingWindow(testNight, '01:30', 150, true);
      expect(isHiddenNight).toBe(true);

      const testDay = new Date('2026-10-21T12:00:00.000Z');
      const isHiddenDay = isWithinBlindClosingWindow(testDay, '01:30', 150, true);
      expect(isHiddenDay).toBe(false);
    });

    it('Ne doit JAMAIS masquer si autoHideEnabled est désactivé', () => {
      const testDate = new Date('2026-10-21T22:00:00.000Z');
      const isHidden = isWithinBlindClosingWindow(testDate, '23:30', 150, false);
      expect(isHidden).toBe(false);
    });

    it('Calcule correctement l\'heure de début de masquage', () => {
      const schedule = formatBlindClosingSchedule('23:30', 150);
      expect(schedule.startTimeStr).toBe('21:00');
      expect(schedule.closingTimeStr).toBe('23:30');
    });
  });

  describe('2. Verrouillage Horaire de Connexion Caissier (isWithinCashierShift)', () => {
    it('DOIT autoriser la connexion pendant les horaires de shift (08:00 - 18:00)', () => {
      const testDate = new Date('2026-10-21T10:00:00.000Z');
      const check = isWithinCashierShift(testDate, '08:00', '18:00');
      expect(check.allowed).toBe(true);
    });

    it('DOIT REFUSER la connexion en dehors du shift (ex: 05:00 du matin)', () => {
      const testDate = new Date('2026-10-21T05:00:00.000Z');
      const check = isWithinCashierShift(testDate, '08:00', '18:00');
      expect(check.allowed).toBe(false);
      expect(check.reason).toContain('Accès refusé');
    });

    it('DOIT autoriser les shifts nocturnes (ex: 18:00 à 02:00)', () => {
      const testDateEvening = new Date('2026-10-21T21:00:00.000Z');
      const checkEvening = isWithinCashierShift(testDateEvening, '18:00', '02:00');
      expect(checkEvening.allowed).toBe(true);

      const testDateMorning = new Date('2026-10-21T10:00:00.000Z');
      const checkMorning = isWithinCashierShift(testDateMorning, '18:00', '02:00');
      expect(checkMorning.allowed).toBe(false);
    });

    it('DOIT autoriser les caissiers sans horaires fixes (horaires libres)', () => {
      const testDate = new Date('2026-10-21T03:00:00.000Z');
      const check = isWithinCashierShift(testDate, null, null);
      expect(check.allowed).toBe(true);
    });
  });
});
