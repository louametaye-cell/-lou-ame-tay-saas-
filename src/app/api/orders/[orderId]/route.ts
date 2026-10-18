import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { orderId } = resolvedParams;

    const dbOrder = await (prisma as any).order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (dbOrder) {
      return NextResponse.json({
        order: {
          ...dbOrder,
          total: Number(dbOrder.totalAmount ?? dbOrder.total ?? 0),
          totalAmount: Number(dbOrder.totalAmount ?? dbOrder.total ?? 0),
          orderType: (dbOrder.tableNumber === 0 || dbOrder.tableNumber === null || !dbOrder.tableNumber) ? 'EXPRESS' : 'TABLE',
        }
      });
    }

    return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commande' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { orderId } = resolvedParams;
    const body = await req.json();
    const { status, station } = body;

    if (!status) {
      return NextResponse.json({ error: 'Statut manquant' }, { status: 400 });
    }

    const targetStation = station ? String(station).toUpperCase() : null;

    // 1. Si une station spécifique valide (KITCHEN ou BAR)
    if (targetStation === 'KITCHEN' || targetStation === 'BAR') {
      // Mettre à jour les items appartenant à cette station
      await (prisma as any).orderItem.updateMany({
        where: {
          orderId,
          station: targetStation,
        },
        data: {
          status: status as any,
        },
      });

      // Vérifier le statut de TOUS les items de la commande
      const allItems = await (prisma as any).orderItem.findMany({
        where: { orderId },
      });

      const allItemsServed = allItems.length > 0 && allItems.every((i: any) => i.status === 'SERVED');
      const allItemsReadyOrServed = allItems.length > 0 && allItems.every((i: any) => i.status === 'READY' || i.status === 'SERVED');

      let newGlobalStatus: string;
      const updateData: any = {};

      if (allItemsServed) {
        newGlobalStatus = 'SERVED';
        updateData.status = 'SERVED';
        updateData.servedAt = new Date();
      } else if (allItemsReadyOrServed) {
        newGlobalStatus = 'READY';
        updateData.status = 'READY';
      } else {
        newGlobalStatus = 'PREPARING';
        updateData.status = 'PREPARING';
        updateData.preparedAt = new Date();
      }

      const updatedOrder = await (prisma as any).order.update({
        where: { id: orderId },
        data: updateData,
        include: { items: true },
      });

      // Invalidation caches
      try {
        const { invalidateLiveOrdersCache } = await import('@/lib/cache');
        await invalidateLiveOrdersCache(updatedOrder.tenantId);
      } catch (e) {}

      return NextResponse.json({
        success: true,
        order: {
          ...updatedOrder,
          total: Number(updatedOrder.totalAmount ?? updatedOrder.total ?? 0),
          totalAmount: Number(updatedOrder.totalAmount ?? updatedOrder.total ?? 0),
          orderType: (updatedOrder.tableNumber === 0 || !updatedOrder.tableNumber) ? 'EXPRESS' : 'TABLE',
        },
        stationUpdated: targetStation,
        allStationsCompleted: allItemsServed,
      });
    }

    // 2. Mise à jour globale (ex: caissier ou annulation)
    const updatePayload: any = { status: status as any };
    if (status === 'SERVED') {
      updatePayload.servedAt = new Date();
    } else if (status === 'PREPARING') {
      updatePayload.preparedAt = new Date();
    }

    // Aligner également le statut de tous les items
    await (prisma as any).orderItem.updateMany({
      where: { orderId },
      data: { status: status as any },
    });

    const updatedOrder = await (prisma as any).order.update({
      where: { id: orderId },
      data: updatePayload,
      include: {
        items: true,
      }
    });

    try {
      const { invalidateLiveOrdersCache } = await import('@/lib/cache');
      await invalidateLiveOrdersCache(updatedOrder.tenantId);
    } catch (e) {}

    return NextResponse.json({
      order: {
        ...updatedOrder,
        total: Number(updatedOrder.totalAmount ?? updatedOrder.total ?? 0),
        totalAmount: Number(updatedOrder.totalAmount ?? updatedOrder.total ?? 0),
        orderType: (updatedOrder.tableNumber === 0 || updatedOrder.tableNumber === null || !updatedOrder.tableNumber) ? 'EXPRESS' : 'TABLE',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}

export const POST = PATCH;
