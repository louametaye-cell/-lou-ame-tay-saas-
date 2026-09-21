import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tableNumber: string }> | { tableNumber: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const rawTable = (resolvedParams?.tableNumber || '0').replace(/[^0-9]/g, '');
    const tableNum = parseInt(rawTable, 10) || 0;

    const { searchParams } = new URL(req.url);
    const restaurantIdInput = searchParams.get('restaurantId') || searchParams.get('tenantId');

    let validTenantId: string | null = null;
    if (restaurantIdInput) {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: {
          OR: [
            { id: restaurantIdInput },
            { subdomain: restaurantIdInput },
          ],
        },
        select: { id: true },
      });
      if (dbTenant) {
        validTenantId = dbTenant.id;
      }
    }

    if (!validTenantId) {
      return NextResponse.json(
        { error: 'Identifiant du restaurant requis pour consulter les commandes de cette table' },
        { status: 400 }
      );
    }

    // Seules les commandes du repas actif pour ce restaurant précis sont retournées.
    // Si la table a été remise en service (clearedAt) ou est marquée FREE/AVAILABLE,
    // aucune commande antérieure n'est retournée au nouveau client.
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const tableRecord = await (prisma as any).table.findFirst({
      where: { tenantId: validTenantId, tableNumber: tableNum },
      select: { id: true, clearedAt: true, status: true }
    });

    const clearedTime = tableRecord?.clearedAt ? new Date(tableRecord.clearedAt) : null;

    // Récupérer les commandes de cette table sur les 2 dernières heures (hors annulées)
    const dbOrders = await (prisma as any).order.findMany({
      where: {
        tenantId: validTenantId,
        tableNumber: tableNum,
        createdAt: { gte: twoHoursAgo },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Filtrer les commandes pour ne retourner QUE celles du repas actif :
    // 1. Commande opérationnelle (PENDING, PREPARING, READY) ou impayée (paymentStatus !== 'PAID') : TOUJOURS active.
    // 2. Commande soldée (SERVED & PAID) : visible pendant 30 minutes après règlement pour consultation du reçu,
    //    sauf si la table a été explicitement remise en service (clearedAt postérieur à la commande).
    const activeSessionOrders = (dbOrders || []).filter((o: any) => {
      const isStillOperational = ['PENDING', 'PREPARING', 'READY'].includes(o.status);
      const isUnpaid = o.paymentStatus !== 'PAID';

      if (isStillOperational || isUnpaid) {
        if (clearedTime && new Date(o.createdAt) < clearedTime) {
          return false;
        }
        return true;
      }

      // Commande payée et servie
      if (clearedTime && new Date(o.createdAt) < clearedTime) {
        return false;
      }
      const orderAgeMinutes = (Date.now() - new Date(o.createdAt).getTime()) / (1000 * 60);
      return orderAgeMinutes <= 30;
    });

    // Synchronisation automatique de l'état de la table si des commandes sont actives
    if (tableRecord && activeSessionOrders.length > 0 && tableRecord.status === 'FREE') {
      try {
        await (prisma as any).table.update({
          where: { id: tableRecord.id },
          data: { status: 'OCCUPIED' }
        });
      } catch (e) {}
    }

    const mappedOrders = activeSessionOrders.map((o: any) => ({
      ...o,
      total: Number(o.totalAmount ?? o.total ?? 0),
      totalAmount: Number(o.totalAmount ?? o.total ?? 0),
      orderType: (o.tableNumber === 0 || o.tableNumber === null || !o.tableNumber) ? 'EXPRESS' : 'TABLE',
    }));

    return NextResponse.json({ orders: mappedOrders });
  } catch (error) {
    console.error('Erreur récupération commandes table:', error);
    return NextResponse.json({ error: 'Erreur récupération commandes table' }, { status: 500 });
  }
}