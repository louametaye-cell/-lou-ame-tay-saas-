import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subdomain, restaurantId, tableNumber } = body;

    const targetId = subdomain || restaurantId;
    if (!targetId) {
      return NextResponse.json({ error: 'Identifiant restaurant manquant' }, { status: 400 });
    }

    const tableNum = Number(tableNumber) || 1;

    // Record in memory storage
    orderStorage.recordScan(targetId, tableNum);

    // Record in DB if available
    try {
      const dbResto = await (prisma as any).restaurant?.findFirst({
        where: { OR: [{ id: targetId }, { subdomain: targetId }] },
      });

      if (dbResto) {
        await (prisma as any).scan?.create({
          data: {
            restaurantId: dbResto.id,
            tableNumber: tableNum,
          },
        });

        await (prisma as any).restaurant?.update({
          where: { id: dbResto.id },
          data: {
            totalScans: { increment: 1 },
            lastScanAt: new Date(),
          },
        });
      }
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({ success: true, recorded: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur enregistrement scan' }, { status: 500 });
  }
}
