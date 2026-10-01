import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { autoTranslateDish } from '@/lib/translation-engine';
import { Language } from '@/types';
import { getCachedMenu, setCachedMenu, invalidateMenuCache } from '@/lib/cache';
import { checkRateLimit } from '@/lib/rate-limit';
import { startTimer, logPerformance, logApiCall, createApiErrorResponse } from '@/lib/logger';
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
    
    // Infer tenant from subdomain, tenantId, restaurantId in query or session cookie
    let subdomain = searchParams.get('subdomain') || searchParams.get('tenantId') || searchParams.get('restaurantId');
    if (!subdomain) {
       const cookieStore = cookies();
       const token = cookieStore.get('saas_token')?.value;
       if (token && token.startsWith('resto_session_')) {
          subdomain = token.replace('resto_session_', '');
       } else {
          subdomain = 'mg-cafe-resto';
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
          orderBy: { displayOrder: 'asc' },
          include: { items: true }
        }
      }
    });

    if (!dbTenant) {
      return NextResponse.json(
        { error: 'Restaurant introuvable ou sous-domaine invalide' },
        { status: 404 }
      );
    }

    const restaurant = {
      id: dbTenant.id,
      name: dbTenant.businessName,
      subdomain: dbTenant.subdomain,
      categories: dbTenant.categories,
      tableCount: 12,
    };

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

    logApiCall({
      method: 'GET',
      endpoint: '/api/menu',
      tenantId: subdomain,
      durationMs: timer.elapsedMs(),
      statusCode: 200,
    }).catch(() => {});

    return NextResponse.json(responsePayload);
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'GET',
      endpoint: '/api/menu',
      durationMs: timer.elapsedMs(),
    });
  }
}

export async function POST(req: Request) {
  const timer = startTimer();
  try {
    const body = await req.json();
    const { itemId, isAvailable, translations, restaurantId } = body;

    if (!itemId) return NextResponse.json({ error: 'itemId obligatoire' }, { status: 400 });

    let targetCategoryId: string | undefined;
    if (typeof isAvailable === 'boolean') {
      const updatedItem = await (prisma as any).menuItem.update({
        where: { id: itemId },
        data: { isAvailable },
        select: { id: true, categoryId: true, tenantId: true }
      });
      targetCategoryId = updatedItem?.categoryId;
    }

    if (restaurantId) {
      await invalidateMenuCache(restaurantId, targetCategoryId);
    }

    logApiCall({
      method: 'POST',
      endpoint: '/api/menu',
      tenantId: restaurantId,
      durationMs: timer.elapsedMs(),
      statusCode: 200,
    }).catch(() => {});

    return NextResponse.json({ success: true, itemId, isAvailable });
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'POST',
      endpoint: '/api/menu',
      durationMs: timer.elapsedMs(),
    });
  }
}

