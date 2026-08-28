import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { orderStorage } from '@/lib/order-storage';
import { autoTranslateDish } from '@/lib/translation-engine';
import { Language } from '@/types';
import { getCachedMenu, setCachedMenu, invalidateMenuCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rate-limit';
import { startTimer, logPerformance } from '@/lib/logger';

export async function GET(req: Request) {
  const timer = startTimer();
  try {
    // 1. Rate Limiting Check (100 req/min)
    const rate = await checkRateLimit(req, 'public');
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez patienter quelques secondes.' },
        { 
          status: 429, 
          headers: { 
            'Retry-After': String(rate.reset),
            'X-RateLimit-Limit': String(rate.limit),
            'X-RateLimit-Remaining': '0',
          } 
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'FR').toUpperCase() as Language;
    const subdomain = searchParams.get('subdomain') || searchParams.get('tenantId') || 'chezfatou';

    // 2. Check Redis Cache
    const cachedData = await getCachedMenu(subdomain, lang);
    if (cachedData) {
      logPerformance(`GET /api/menu (${subdomain}, ${lang})`, timer.elapsedMs(), 'CACHE_HIT');
      return NextResponse.json(cachedData, {
        headers: {
          'X-Cache': 'HIT',
          'X-RateLimit-Remaining': String(rate.remaining),
        },
      });
    }

    // 3. Cache Miss: Compute Menu
    const restaurant = JSON.parse(JSON.stringify(SAMPLE_RESTAURANT));

    // Update with runtime availability and language translations
    for (const cat of restaurant.categories) {
      for (const item of cat.items) {
        item.isAvailable = orderStorage.getItemAvailability(item.id, item.isAvailable);

        // Pre-fill or retrieve translations
        if (!item.translations || Array.isArray(item.translations)) {
          const autoTrans = await autoTranslateDish(item.name, item.description);
          item.translations = autoTrans;
        }

        // Apply requested language (or fallback to FR)
        const activeTrans = item.translations[lang] || item.translations['FR'];
        if (activeTrans) {
          item.originalName = item.name;
          item.originalDescription = item.description;
          item.name = activeTrans.name;
          item.description = activeTrans.description;
          item.activeLanguage = lang;
        }
      }
    }

    const responsePayload = {
      restaurant,
      language: ['FR', 'EN', 'ES', 'IT'].includes(lang) ? lang : 'FR',
    };

    // 4. Save into Redis Cache (TTL 300s)
    await setCachedMenu(subdomain, lang, responsePayload);

    logPerformance(`GET /api/menu (${subdomain}, ${lang})`, timer.elapsedMs(), 'CACHE_MISS');

    return NextResponse.json(responsePayload, {
      headers: {
        'X-Cache': 'MISS',
        'X-RateLimit-Remaining': String(rate.remaining),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération menu' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, isAvailable, translations, restaurantId = 'chezfatou' } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId obligatoire' }, { status: 400 });
    }

    if (typeof isAvailable === 'boolean') {
      orderStorage.toggleItemAvailability(itemId, isAvailable);
    }

    // Invalidate Redis Cache for this restaurant
    await invalidateMenuCache(restaurantId);

    return NextResponse.json({ 
      success: true, 
      itemId, 
      isAvailable,
      translations 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
