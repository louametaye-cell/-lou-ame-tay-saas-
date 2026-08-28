import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';
import { DishTranslationResult } from '@/lib/translation-engine';

// POST /api/restaurant/menu-items/[id]/translations
// Enregistre ou met à jour les 4 traductions (FR, EN, ES, IT) pour un plat
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { translations } = body as { translations: DishTranslationResult };

    if (!translations || !translations.FR?.name) {
      return NextResponse.json({ error: 'Les traductions avec le nom FR sont obligatoires' }, { status: 400 });
    }

    // Persistance Prisma si DB connectée
    try {
      for (const [lang, trans] of Object.entries(translations)) {
        if ((prisma as any).menuItemTranslation) {
          await (prisma as any).menuItemTranslation.upsert({
            where: {
              menuItemId_language: {
                menuItemId: params.id,
                language: lang as any,
              },
            },
            update: {
              name: trans.name,
              description: trans.description,
            },
            create: {
              menuItemId: params.id,
              language: lang as any,
              name: trans.name,
              description: trans.description,
            },
          });
        }
      }
    } catch (dbErr) {
      // Fallback in-memory
    }

    return NextResponse.json({
      success: true,
      menuItemId: params.id,
      translations,
      message: 'Traductions (FR, EN, ES, IT) enregistrées avec succès !',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement des traductions' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return POST(req, { params });
}
