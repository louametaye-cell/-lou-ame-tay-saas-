import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { invalidateDashboardStatsCache } from '@/lib/cache';

export async function POST(req: Request) {
  try {
    // Rate Limiting
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
    if (!targetId) {
      return NextResponse.json({ error: 'Données de scan incomplètes' }, { status: 400 });
    }

    // Async record in DB
    try {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: { OR: [{ id: targetId }, { subdomain: targetId }] },
      });

      if (dbTenant) {
        await (prisma as any).tenant.update({
          where: { id: dbTenant.id },
          data: {
            qrScansToday: { increment: 1 },
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
