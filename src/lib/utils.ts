import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { CurrencyCode, ExchangeRates, Language } from '@/types';

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  FCFA: 1,
  EUR: 1 / 655.957, // Parité fixe légale BCEAO
  USD: 1 / 605.0,   // Taux de référence USD
};

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + ' FCFA';
}

export function convertFCFATo(
  amountFCFA: number,
  currency: CurrencyCode,
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): number {
  const rate = rates[currency] || DEFAULT_EXCHANGE_RATES[currency] || 1;
  return amountFCFA * rate;
}

export function formatConvertedPrice(
  amountFCFA: number,
  currency: CurrencyCode,
  langOrRates: Language | ExchangeRates = 'FR',
  ratesArg?: ExchangeRates
): string | null {
  if (currency === 'FCFA') return null;

  let lang: Language = 'FR';
  let rates: ExchangeRates = DEFAULT_EXCHANGE_RATES;

  if (typeof langOrRates === 'string') {
    lang = langOrRates;
    rates = ratesArg || DEFAULT_EXCHANGE_RATES;
  } else if (langOrRates && typeof langOrRates === 'object') {
    rates = langOrRates;
    lang = 'FR';
  }

  const converted = convertFCFATo(amountFCFA, currency, rates);
  const locale =
    lang === 'EN'
      ? 'en-US'
      : lang === 'ES'
      ? 'es-ES'
      : lang === 'IT'
      ? 'it-IT'
      : 'fr-FR';

  if (currency === 'EUR') {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
    return `≈ ${formatted}`;
  }

  if (currency === 'USD') {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
    return `≈ ${formatted}`;
  }

  return null;
}

export function formatDualPrice(
  amountFCFA: number,
  currency: CurrencyCode = 'FCFA',
  lang: Language = 'FR',
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): { primary: string; secondary: string | null } {
  return {
    primary: formatFCFA(amountFCFA),
    secondary: formatConvertedPrice(amountFCFA, currency, lang, rates),
  };
}

export function playOrderSound() {
  if (typeof window === 'undefined') return;
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Create a pleasant double-tone restaurant chime (Bell BIP)
    const now = audioContext.currentTime;
    
    const osc1 = audioContext.createOscillator();
    const gain1 = audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(audioContext.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    const osc2 = audioContext.createOscillator();
    const gain2 = audioContext.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    gain2.gain.setValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(audioContext.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.warn('Audio notification unavailable or requires user gesture:', err);
  }
}

export const playOrderBipSound = playOrderSound;
