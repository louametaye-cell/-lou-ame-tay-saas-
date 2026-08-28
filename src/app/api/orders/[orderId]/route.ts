import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';
import { OrderStatus } from '@/types';

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Statut manquant' }, { status: 400 });
    }

    const servedAtDate = status === 'SERVED' ? new Date() : null;

    // 1. Update in-memory storage
    const updatedOrder = orderStorage.updateOrderStatus(orderId, status as OrderStatus);

    // 2. Try DB update
    try {
      await (prisma as any).order?.update({
        where: { id: orderId },
        data: {
          status: status as any,
          servedAt: servedAtDate,
        },
      });
    } catch (e) {
      // Fallback
    }

    if (!updatedOrder) {
      return NextResponse.json(
        { message: 'Statut mis à jour', status, servedAt: servedAtDate?.toISOString() },
        { status: 200 }
      );
    }

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}
