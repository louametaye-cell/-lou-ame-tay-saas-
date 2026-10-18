import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { invalidateLiveOrdersCache, invalidateDashboardStatsCache } from '@/lib/cache';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: 'Identifiant de commande requis' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { reason = 'Annulation demandée en caisse' } = body;

    // 1. Récupérer la commande en base de données
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    // 2. Si la commande est déjà annulée, renvoyer un statut idempotent
    if (order.status === 'CANCELLED') {
      return NextResponse.json({
        success: true,
        order,
        message: 'Commande déjà annulée',
      });
    }

    // 🔒 3. RÈGLE MÉTIER STRICTE : Seules les commandes au statut PENDING peuvent être annulées en caisse
    // Si la cuisine a déjà cliqué sur "En préparation" (PREPARING) ou "Prêt" (READY), rejet bloquant HTTP 403
    if (order.status === 'PREPARING' || order.status === 'READY') {
      return NextResponse.json(
        {
          error: 'Impossible d\'annuler : la cuisine a déjà commencé la préparation. Contactez le gérant.',
          currentStatus: order.status,
        },
        { status: 403 }
      );
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: `Impossible d'annuler une commande au statut ${order.status}. Contactez le gérant.`,
          currentStatus: order.status,
        },
        { status: 400 }
      );
    }

    // 🔒 4. INTÉGRITÉ FINANCIÈRE : Interdiction d'annuler une commande déjà payée sans remboursement gérant
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json(
        {
          error: 'Cette commande a déjà fait l\'objet d\'un encaissement validé. Seul le gérant peut intervenir.',
        },
        { status: 400 }
      );
    }

    // 5. Basculer le statut en CANCELLED en base de données
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
      },
      include: { items: true },
    });

    // 6. Invalidation granulaire des caches temps réel (KDS et Dashboard)
    if (order.tenantId) {
      try {
        await invalidateLiveOrdersCache(order.tenantId);
        await invalidateDashboardStatsCache(order.tenantId);
      } catch (cacheErr) {
        console.warn('[CashierCancel] Avertissement invalidation cache:', cacheErr);
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Commande annulée avec succès',
    });
  } catch (error) {
    console.error('Erreur API /api/cashier/orders/[id]/cancel:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de l\'annulation de la commande' },
      { status: 500 }
    );
  }
}
