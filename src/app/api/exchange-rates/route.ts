import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours cache

// Fixed BCEAO treaty rate for EUR/XOF
const FIXED_EUR_RATE = 1 / 655.957; // 0.0015244905 EUR per 1 FCFA
const DEFAULT_USD_RATE = 1 / 605.0;  // 0.0016528925 USD per 1 FCFA

export async function GET() {
  let usdRate = DEFAULT_USD_RATE;
  let source = 'fallback';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.rates?.XOF && data.rates.XOF > 0) {
        const xofPerUsd = data.rates.XOF;
        usdRate = 1 / xofPerUsd;
        source = 'live_forex';
      }
    }
  } catch (error) {
    console.warn('[ExchangeRates] Live fetch failed or timed out, using fallback rate.');
  }

  const rates = {
    FCFA: 1,
    EUR: FIXED_EUR_RATE,
    USD: usdRate,
  };

  const xofPerUnit = {
    FCFA: 1,
    EUR: 655.957,
    USD: Math.round(1 / usdRate),
  };

  return NextResponse.json(
    {
      base: 'XOF',
      rates,
      xofPerUnit,
      source,
      lastUpdated: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    }
  );
}
