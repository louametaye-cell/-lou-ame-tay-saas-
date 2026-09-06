import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { autoTranslateDish } from '@/lib/translation-engine';
import { Language } from '@/types';
import { getCachedMenu, setCachedMenu, invalidateMenuCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rate-limit';
import { startTimer, logPerformance } from '@/lib/logger';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
  const timer = startTimer();
  try {
    const rate = await checkRateLimit(req, 'public');
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez patienter.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'FR').toUpperCase() as Language;
    
    // Infer tenant from subdomain in query or session cookie
    let subdomain = searchParams.get('subdomain') || searchParams.get('tenantId');
    if (!subdomain) {
       const cookieStore = cookies();
       const token = cookieStore.get('saas_token')?.value;
       if (token && token.startsWith('resto_session_')) {
          subdomain = token.replace('resto_session_', '');
       } else {
          subdomain = 'chezfatou';
       }
    }

    const cachedData = await getCachedMenu(subdomain, lang);
    if (cachedData) {
      logPerformance(`GET /api/menu (${subdomain}, ${lang})`, timer.elapsedMs(), 'CACHE_HIT');
      return NextResponse.json(cachedData);
    }

    const dbTenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
          { subdomain: subdomain },
          { id: subdomain }
        ]
      },
      include: {
        categories: {
          include: { items: true }
        }
      }
    });

    const restaurant = dbTenant ? {
      id: dbTenant.id,
      name: dbTenant.businessName,
      subdomain: dbTenant.subdomain,
      categories: dbTenant.categories,
      tableCount: 12,
    } : JSON.parse(JSON.stringify(SAMPLE_RESTAURANT));

    for (const cat of restaurant.categories) {
      for (const item of cat.items) {
        if (!item.translations || Array.isArray(item.translations)) {
          // Placeholder translation logic
          item.translations = { FR: { name: item.name, description: item.description } };
        }

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

    await setCachedMenu(subdomain, lang, responsePayload);

    return NextResponse.json(responsePayload);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération menu' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, isAvailable, translations, restaurantId } = body;

    if (!itemId) return NextResponse.json({ error: 'itemId obligatoire' }, { status: 400 });

    if (typeof isAvailable === 'boolean') {
      await (prisma as any).menuItem.update({
        where: { id: itemId },
        data: { isAvailable }
      });
    }

    if (restaurantId) await invalidateMenuCache(restaurantId);

    return NextResponse.json({ success: true, itemId, isAvailable });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
