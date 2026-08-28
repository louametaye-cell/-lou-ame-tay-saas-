import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { orderStorage } from '@/lib/order-storage';
import { autoTranslateDish } from '@/lib/translation-engine';
import { Language } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lang = (searchParams.get('lang') || 'FR').toUpperCase() as Language;
    const subdomain = searchParams.get('subdomain') || searchParams.get('tenantId') || 'chezfatou';

    // Clone restaurant data
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

    return NextResponse.json({ 
      restaurant,
      language: ['FR', 'EN', 'ES', 'IT'].includes(lang) ? lang : 'FR',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération menu' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, isAvailable, translations } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId obligatoire' }, { status: 400 });
    }

    if (typeof isAvailable === 'boolean') {
      orderStorage.toggleItemAvailability(itemId, isAvailable);
    }

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
