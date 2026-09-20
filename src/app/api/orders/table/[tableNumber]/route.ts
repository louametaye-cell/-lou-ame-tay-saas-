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
    // Si la table a été remise en service (clearedAt), les commandes antérieures ne sont pas retournées.
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const tableRecord = await (prisma as any).table.findFirst({
      where: { tenantId: validTenantId, tableNumber: tableNum },
      select: { clearedAt: true }
    });

    let minCreatedAt = twoHoursAgo;
    if (tableRecord?.clearedAt && new Date(tableRecord.clearedAt) > twoHoursAgo) {
      minCreatedAt = new Date(tableRecord.clearedAt);
    }

    const dbOrders = await (prisma as any).order.findMany({
      where: {
        tenantId: validTenantId,
        tableNumber: tableNum,
        createdAt: { gte: minCreatedAt },
        status: { not: 'CANCELLED' },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const mappedOrders = (dbOrders || []).map((o: any) => ({
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