import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateMenuCache } from '@/lib/cache';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await request.json();
    const { isAvailable, isSpecialOfTheDay, restaurantId = 'mg-cafe-resto' } = body;

    // 1. Fetch menuItem to find its tenantId and verify existence
    const existingItem = await (prisma as any).menuItem.findUnique({
      where: { id },
      select: { id: true, tenantId: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: 'Plat introuvable en base de données' }, { status: 404 });
    }

    const effectiveTenantId = restaurantId || existingItem.tenantId;

    // 2. Update Database via Prisma
    const updateData: any = {};
    if (typeof isAvailable === 'boolean') updateData.isAvailable = isAvailable;
    if (typeof isSpecialOfTheDay === 'boolean') updateData.isDailySpecial = isSpecialOfTheDay;

    const updated = await (prisma as any).menuItem.update({
      where: { id },
      data: updateData,
    });

    // 3. Invalidate Redis Menu & Display Cache for this specific restaurant
    if (effectiveTenantId) {
      await invalidateMenuCache(effectiveTenantId);
    }

    return NextResponse.json({
      success: true,
      id: updated.id,
      isAvailable: updated.isAvailable,
      isSpecialOfTheDay: updated.isDailySpecial,
      message: 'Disponibilité mise à jour avec succès',
    });
  } catch (error: any) {
    console.error('[Availability API] Error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification du plat' },
      { status: 500 }
    );
  }
}