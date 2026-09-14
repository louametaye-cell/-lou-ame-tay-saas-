import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { PaymentMethod } from '@prisma/client';

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
      cashierId,
      cashSessionId,
      paymentMethod,
      paymentStatus,
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

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

    const updateData: any = {
      status: status as any,
    };

    if (status === 'PREPARING') {
      updateData.preparedAt = new Date();
    } else if (status === 'READY') {
      // Commande prête en cuisine, transmise au guichet / retrait
      updateData.preparedAt = new Date();
    } else if (status === 'SERVED') {
      updateData.servedAt = new Date();
    }
    // 🔒 SÉCURITÉ ABSOLUE : Une mise à jour de statut cuisine NE PEUT EN AUCUN CAS modifier paymentStatus ou paymentMethod.
    // Seul l'encaissement manuel caisse (/api/cashier/orders/[id]/pay) est habilité à valider le paiement.

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Erreur PATCH /api/kitchen/orders/[id]/status:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export const POST = PATCH;
