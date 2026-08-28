import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';
import { OrderStatus } from '@/types';

// PATCH /api/kitchen/orders/[id]/status
// Met à jour le statut d'une commande
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Statut manquant' }, { status: 400 });
    }

    const servedAtDate = status === 'SERVED' ? new Date() : null;

    // 1. Update in-memory storage
    const updatedOrder = orderStorage.updateOrderStatus(params.id, status as OrderStatus);

    // 2. Try DB update
    try {
      await (prisma as any).order?.update({
        where: { id: params.id },
        data: {
          status: status as any,
          servedAt: status === 'SERVED' ? new Date() : undefined,
        },
      });
    } catch (e) {
      // Fallback
    }

    return NextResponse.json(
      updatedOrder || { id: params.id, status, servedAt: servedAtDate }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}
