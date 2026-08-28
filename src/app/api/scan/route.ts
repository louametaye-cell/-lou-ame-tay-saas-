import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';
import { checkRateLimit } from '@/lib/rate-limit';
import { invalidateDashboardStatsCache } from '@/lib/cache';

export async function POST(req: Request) {
  try {
    // Rate Limiting (100 req/min)
    const rate = await checkRateLimit(req, 'public');
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de scans.' },
        { status: 429, headers: { 'Retry-After': String(rate.reset) } }
      );
    }

    const body = await req.json();
    const { subdomain, restaurantId, tableNumber } = body;

    const targetId = subdomain || restaurantId;
    if (!targetId || !tableNumber) {
      return NextResponse.json({ error: 'Données de scan incomplètes' }, { status: 400 });
    }

    // In-memory record
    orderStorage.recordScan(targetId, Number(tableNumber));

    // Async record in DB if available
    try {
      const dbResto = await (prisma as any).restaurant?.findFirst({
        where: { OR: [{ id: targetId }, { subdomain: targetId }] },
      });

      if (dbResto) {
        await (prisma as any).scan?.create({
          data: {
            restaurantId: dbResto.id,
            tableNumber: Number(tableNumber),
          },
        });
      }
    } catch (e) {
      // Non-blocking
    }

    // Invalidate dashboard stats cache
    await invalidateDashboardStatsCache(targetId);

    return NextResponse.json({ success: true, recorded: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur enregistrement scan' }, { status: 500 });
  }
}
