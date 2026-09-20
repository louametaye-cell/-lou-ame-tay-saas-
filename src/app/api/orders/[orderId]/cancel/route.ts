import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateLiveOrdersCache, invalidateDashboardStatsCache } from '@/lib/cache';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.orderId;

    if (!orderId) {
      return NextResponse.json({ error: 'Identifiant de commande requis' }, { status: 400 });
    }

    // 1. Récupérer la commande en base de données
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    // 2. Si la commande est déjà annulée, retourner le succès idempotent
    if (order.status === 'CANCELLED') {
      return NextResponse.json({
        success: true,
        order,
        message: 'Commande déjà annulée',
      });
    }

    // 3. Condition opérationnelle : Seules les commandes au statut PENDING peuvent être annulées
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: 'Impossible d\'annuler cette commande : la brigade en cuisine a déjà débuté sa préparation.',
          currentStatus: order.status,
        },
        { status: 400 }
      );
    }

    // 4. Condition temporelle : Délai strict de 2 minutes (120 secondes) basé sur createdAt en base
    const now = Date.now();
    const createdTime = new Date(order.createdAt).getTime();
    const elapsedSeconds = Math.floor((now - createdTime) / 1000);

    if (elapsedSeconds > 120) {
      return NextResponse.json(
        {
          error: 'Le délai d\'annulation de 2 minutes est expiré. Les chefs s\'affairent déjà en cuisine.',
          elapsedSeconds,
        },
        { status: 400 }
      );
    }

    // 5. Condition financière : Si un paiement a déjà été validé, blocage de sécurité
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        {
          error: 'Cette commande a déjà fait l\'objet d\'un encaissement validé. Rapprochez-vous de la caisse.',
        },
        { status: 400 }
      );
    }

    // 6. Basculer le statut en CANCELLED en base de données (zéro suppression physique)
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
      },
      include: { items: true },
    });

    // Invalider les caches temps réel
    try {
      if (order.tenantId) {
        await invalidateLiveOrdersCache(order.tenantId);
        await invalidateDashboardStatsCache(order.tenantId);
      }
    } catch (cacheErr) {
      console.warn('[OrderCancel] Cache invalidation notice:', cacheErr);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Commande annulée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de l\'annulation de la commande' },
      { status: 500 }
    );
  }
}
