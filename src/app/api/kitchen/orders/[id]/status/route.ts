import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;
    const body = await req.json();
    const {
      status,
      station,
      cashierId,
      cashSessionId,
      restaurantId,
    } = body;

    if (!status || !orderId) {
      return NextResponse.json({ error: 'Statut ou ID manquant' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, tenantId: true, status: true, paymentStatus: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    let isAuthorized = isAuthorizedTenant(req, order.tenantId);

    // Permettre l'accès si un caissier ou une session valide du tenant est fourni
    if (!isAuthorized && cashierId) {
      const dbCashier = await prisma.cashier.findFirst({
        where: { id: cashierId, tenantId: order.tenantId, isActive: true },
        select: { id: true }
      });
      if (dbCashier) isAuthorized = true;
    }

    if (!isAuthorized && cashSessionId) {
      const dbSession = await prisma.cashSession.findFirst({
        where: { id: cashSessionId, tenantId: order.tenantId, status: 'OPEN' },
        select: { id: true }
      });
      if (dbSession) isAuthorized = true;
    }

    if (!isAuthorized && restaurantId) {
      const match = await prisma.tenant.findFirst({
        where: {
          OR: [{ id: restaurantId }, { subdomain: restaurantId }]
        },
        select: { id: true }
      });
      if (match && match.id === order.tenantId) isAuthorized = true;
    }

    const kdsHeader = req.headers.get('x-kds-token') || req.headers.get('x-bar-token');
    if (!isAuthorized && kdsHeader) {
      if (kdsHeader.includes(order.tenantId)) isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

    const targetStation = station ? String(station).toUpperCase() : null;

    // 🔒 RÈGLE MÉTIER CHIRURGICALE :
    // Si la validation provient d'une station (KITCHEN ou BAR), ne valider QUE les items de cette station.
    if (targetStation === 'KITCHEN' || targetStation === 'BAR') {
      await (prisma as any).orderItem.updateMany({
        where: {
          orderId,
          station: targetStation,
        },
        data: {
          status: status as any,
        },
      });

      // Contrôle de l'intégralité des articles de la commande
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

      // 🔒 SÉCURITÉ FINANCIÈRE : Ne jamais modifier paymentStatus ou paymentMethod depuis la cuisine/bar
      const updated = await (prisma as any).order.update({
        where: { id: orderId },
        data: updateData,
        include: { items: true },
      });

      try {
        const { invalidateLiveOrdersCache } = await import('@/lib/cache');
        await invalidateLiveOrdersCache(order.tenantId);
      } catch (e) {}

      return NextResponse.json({
        success: true,
        order: updated,
        stationUpdated: targetStation,
        allStationsCompleted: allItemsServed,
      });
    }

    // Mise à jour globale sans station spécifiée
    const updateData: any = {
      status: status as any,
    };

    if (status === 'PREPARING') {
      updateData.preparedAt = new Date();
    } else if (status === 'READY') {
      updateData.preparedAt = new Date();
    } else if (status === 'SERVED') {
      updateData.servedAt = new Date();
    }

    await (prisma as any).orderItem.updateMany({
      where: { orderId },
      data: { status: status as any },
    });

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: { items: true }
    });

    try {
      const { invalidateLiveOrdersCache } = await import('@/lib/cache');
      await invalidateLiveOrdersCache(order.tenantId);
    } catch (e) {}

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Erreur PATCH /api/kitchen/orders/[id]/status:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export const POST = PATCH;
