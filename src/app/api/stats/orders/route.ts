import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, subdomain, total, tableNumber } = body;

    const targetId = restaurantId || subdomain;
    const orderTotal = Number(total) || 0;

    // Async update in DB
    try {
      const dbResto = await (prisma as any).restaurant?.findFirst({
        where: { OR: [{ id: targetId }, { subdomain: targetId }] },
      });

      if (dbResto) {
        await (prisma as any).restaurant?.update({
          where: { id: dbResto.id },
          data: {
            totalOrders: { increment: 1 },
            totalRevenue: { increment: orderTotal },
            lastOrderAt: new Date(),
          },
        });
      }
    } catch (e) {
      // Non-blocking
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur enregistrement stats commande' }, { status: 500 });
  }
}
