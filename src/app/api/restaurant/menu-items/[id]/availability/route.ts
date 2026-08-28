import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { invalidateMenuCache } from '@/lib/cache';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { isAvailable, isSpecialOfTheDay, restaurantId = 'chezfatou' } = body;

    // 1. Update in-memory SAMPLE_RESTAURANT for instant UI reflection
    SAMPLE_RESTAURANT.categories.forEach((cat) => {
      (cat.items || []).forEach((item) => {
        if (item.id === id) {
          if (typeof isAvailable === 'boolean') {
            item.isAvailable = isAvailable;
          }
          if (typeof isSpecialOfTheDay === 'boolean') {
            item.isSpecialOfTheDay = isSpecialOfTheDay;
            item.isSpecial = isSpecialOfTheDay;
          }
        }
      });
    });

    // Invalidate Redis Menu & Display Cache
    await invalidateMenuCache(restaurantId);

    // 2. Update Database via Prisma if connected
    try {
      if ((prisma as any).menuItem) {
        const updateData: any = {};
        if (typeof isAvailable === 'boolean') updateData.isAvailable = isAvailable;
        if (typeof isSpecialOfTheDay === 'boolean') updateData.isSpecialOfTheDay = isSpecialOfTheDay;

        await (prisma as any).menuItem.update({
          where: { id },
          data: updateData,
        });
      }
    } catch (dbErr) {
      console.warn('[Availability API] Prisma update fallback:', dbErr);
    }

    return NextResponse.json({
      success: true,
      id,
      isAvailable,
      isSpecialOfTheDay,
      message: 'Disponibilite mise a jour avec succes',
    });
  } catch (error: any) {
    console.error('[Availability API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du plat' },
      { status: 500 }
    );
  }
}