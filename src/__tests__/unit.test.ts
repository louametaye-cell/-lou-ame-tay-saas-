import { describe, it, expect } from 'vitest';
import { formatFCFA, convertFCFATo, formatConvertedPrice, formatDualPrice, cn } from '../lib/utils';

describe('Lou Ame Tay ? - Unité & Utilitaires Métier', () => {
  it('cn() doit combiner et fusionner correctement les classes Tailwind', () => {
    const result = cn('bg-red-500 text-white', 'bg-blue-500', { 'font-bold': true });
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('font-bold');
    expect(result).not.toContain('bg-red-500');
  });

  it('formatFCFA() doit formater correctement les montants en Francs CFA', () => {
    expect(formatFCFA(15000)).toMatch(/15\s?000\s?FCFA/);
    expect(formatFCFA(2500)).toMatch(/2\s?500\s?FCFA/);
    expect(formatFCFA(0)).toBe('0 FCFA');
  });

  it('convertFCFATo() doit convertir selon les taux fixes BCEAO et USD', () => {
    const eurAmount = convertFCFATo(655957, 'EUR');
    expect(Math.round(eurAmount)).toBe(1000);

    const fcfaSame = convertFCFATo(15000, 'FCFA');
    expect(fcfaSame).toBe(15000);
  });

  it('formatConvertedPrice() doit retourner les équivalents de prix multi-devises', () => {
    const eurFormatted = formatConvertedPrice(655957, 'EUR', 'FR');
    expect(eurFormatted).toContain('€');

    const fcfaFormatted = formatConvertedPrice(15000, 'FCFA', 'FR');
    expect(fcfaFormatted).toBeNull();
  });

  it('formatDualPrice() doit générer un prix primaire FCFA et un équivalent secondaire', () => {
    const dualPrice = formatDualPrice(15000, 'EUR', 'FR');
    expect(dualPrice.primary).toMatch(/15\s?000\s?FCFA/);
    expect(dualPrice.secondary).not.toBeNull();
  });
});
