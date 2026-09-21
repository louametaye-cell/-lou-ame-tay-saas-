import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/table/[tableNumber]/status?restaurantId=...
 * Smart Contextual Release: Détecte l'état d'occupation réel de la table côté serveur
 * 1. EMPTY : aucune commande active ou dernière commande soldée depuis > 45 minutes (libération automatique)
 * 2. ACTIVE : commande en cours (PENDING, PREPARING, READY ou impayée) -> rejoindre le repas
 * 3. PAID_RECENT : dernière commande soldée entre 15 et 45 minutes (Zone Jaune) -> modale de choix
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ tableNumber: string }> | { tableNumber: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const tableNum = parseInt(resolvedParams.tableNumber, 10);

    if (isNaN(tableNum) || tableNum < 0) {
      return NextResponse.json({ error: 'Numéro de table invalide' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const rawRestoId = searchParams.get('restaurantId') || searchParams.get('tenantId');

    if (!rawRestoId) {
      return NextResponse.json({ error: 'restaurantId ou tenantId est requis' }, { status: 400 });
    }

    // 1. Résolution de l'établissement
    const tenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [{ id: rawRestoId }, { subdomain: rawRestoId }],
      },
      select: { id: true, businessName: true, subdomain: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // 2. Récupérer l'enregistrement physique de la table
    const tableRecord = await (prisma as any).table.findFirst({
      where: { tenantId: tenant.id, tableNumber: tableNum },
      select: { id: true, status: true, clearedAt: true },
    });

    const clearedTime = tableRecord?.clearedAt ? new Date(tableRecord.clearedAt) : null;
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    // 3. Récupérer l'historique récent de la table (hors commandes annulées)
    const recentOrders = await (prisma as any).order.findMany({
      where: {
        tenantId: tenant.id,
        tableNumber: tableNum,
        status: { not: 'CANCELLED' },
        createdAt: { gte: fourHoursAgo },
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // 4. Filtrer les commandes postérieures au dernier clearedAt
    const validOrders = recentOrders.filter((o: any) => {
      if (clearedTime && new Date(o.createdAt) < clearedTime) {
        return false;
      }
      return true;
    });

    // 5. Vérifier s'il y a des commandes actives (en cours d'opération ou impayées)
    const activeOrders = validOrders.filter((o: any) => {
      const isOperational = ['PENDING', 'PREPARING', 'READY'].includes(o.status);
      const isUnpaid = o.paymentStatus !== 'PAID';
      return isOperational || isUnpaid;
    });

    const now = Date.now();
    const sessionId = nanoid(10);

    // CAS 2 : Commande active en cours
    if (activeOrders.length > 0) {
      const totalAmount = activeOrders.reduce(
        (sum: number, o: any) => sum + (Number(o.totalAmount ?? o.total ?? 0)),
        0
      );
      const totalItems = activeOrders.reduce(
        (sum: number, o: any) => sum + (o.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) || 0),
        0
      );

      // Si la table était FREE en base, la marquer OCCUPIED
      if (tableRecord && tableRecord.status === 'FREE') {
        try {
          await (prisma as any).table.update({
            where: { id: tableRecord.id },
            data: { status: 'OCCUPIED' },
          });
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        status: 'ACTIVE',
        tableNumber: tableNum,
        ordersCount: activeOrders.length,
        totalItems,
        totalAmount,
        sessionId,
        orders: activeOrders.map((o: any) => ({
          ...o,
          total: Number(o.totalAmount ?? o.total ?? 0),
          totalAmount: Number(o.totalAmount ?? o.total ?? 0),
        })),
      });
    }

    // Chercher la dernière commande soldée (PAID)
    const lastPaidOrder = validOrders.find((o: any) => o.paymentStatus === 'PAID');

    if (!lastPaidOrder) {
      // CAS 1 : Aucune commande sur cette table
      return NextResponse.json({
        success: true,
        status: 'EMPTY',
        tableNumber: tableNum,
        sessionId,
        message: 'Table neuve et libre',
      });
    }

    const lastPaidTime = new Date(lastPaidOrder.createdAt).getTime();
    const elapsedMinutes = Math.max(0, (now - lastPaidTime) / (1000 * 60));

    // CAS 1 (suite) : Dernière commande soldée depuis plus de 45 minutes
    if (elapsedMinutes > 45) {
      // Libération automatique silencieuse
      if (tableRecord && tableRecord.status !== 'FREE') {
        try {
          await (prisma as any).table.update({
            where: { id: tableRecord.id },
            data: { status: 'FREE', clearedAt: new Date() },
          });
        } catch (e) {}
      }

      return NextResponse.json({
        success: true,
        status: 'EMPTY',
        tableNumber: tableNum,
        elapsedMinutes: Math.round(elapsedMinutes),
        sessionId,
        message: 'Table libérée automatiquement (> 45 min)',
      });
    }

    // CAS 3 : Dernière commande soldée entre 15 et 45 minutes (Zone Jaune - Cas ambigu)
    // (ou moins de 45 minutes avec paiement validé)
    const lastPaidTotal = Number(lastPaidOrder.totalAmount ?? lastPaidOrder.total ?? 0);
    const lastPaidItemsCount = lastPaidOrder.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) || 0;

    return NextResponse.json({
      success: true,
      status: 'PAID_RECENT',
      tableNumber: tableNum,
      elapsedMinutes: Math.round(elapsedMinutes),
      lastOrderTotal: lastPaidTotal,
      lastOrderItemsCount: lastPaidItemsCount,
      lastOrderCreatedAt: lastPaidOrder.createdAt,
      sessionId,
      lastOrder: {
        id: lastPaidOrder.id,
        status: lastPaidOrder.status,
        paymentStatus: lastPaidOrder.paymentStatus,
        total: lastPaidTotal,
        itemsCount: lastPaidItemsCount,
      },
    });
  } catch (error: any) {
    console.error('Erreur status table:', error);
    return NextResponse.json({ error: 'Erreur serveur calcul statut table' }, { status: 500 });
  }
}
