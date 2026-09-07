import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/kitchen/history
// Récupère l'historique des commandes servies aujourd'hui
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('restaurantId') || searchParams.get('tenantId');
    const format = searchParams.get('format');

    let resolvedTenantId: string | null = null;
    if (tenantIdParam) {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: {
          OR: [
            { id: tenantIdParam },
            { subdomain: tenantIdParam },
          ],
        },
        select: { id: true },
      });
      if (dbTenant) {
        resolvedTenantId = dbTenant.id;
      } else {
        resolvedTenantId = tenantIdParam;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dbServed = await (prisma as any).order.findMany({
      where: {
        ...(resolvedTenantId ? { tenantId: resolvedTenantId } : {}),
        status: 'SERVED',
        OR: [
          {
            servedAt: {
              gte: today,
              lt: tomorrow,
            },
          },
          {
            updatedAt: {
              gte: today,
              lt: tomorrow,
            },
          },
        ],
      },
      include: {
        items: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const memoryServedToday = dbServed.map((o: any) => ({
      id: o.id,
      tableNumber: o.tableNumber,
      customerNote: o.customerNote,
      note: o.customerNote,
      restaurantId: o.tenantId,
      status: o.status,
      total: o.totalAmount,
      servedAt: o.servedAt ? o.servedAt.toISOString() : null,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i: any) => ({
        id: i.id,
        menuItemId: i.menuItemId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        notes: i.customNotes,
      })),
    }));

    const total = memoryServedToday.reduce((sum: number, order: any) => sum + (Number(order.total) || 0), 0);

    // CSV Export
    if (format === 'csv') {
      const headers = ['ID Commande', 'Table', 'Heure Commande', 'Heure Servie', 'Plats', 'Remarque', 'Total (FCFA)', 'Statut'];
      const rows = memoryServedToday.map((o: any) => {
        const itemsSummary = o.items.map((i: any) => `${i.quantity}x ${i.name || 'Plat'}`).join(' | ');
        const orderTime = new Date(o.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const servedTime = o.servedAt ? new Date(o.servedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        return [
          `"${o.id}"`,
          `"Table ${o.tableNumber}"`,
          `"${orderTime}"`,
          `"${servedTime}"`,
          `"${itemsSummary.replace(/"/g, '""')}"`,
          `"${(o.customerNote || o.note || '').replace(/"/g, '""')}"`,
          o.total,
          `"${o.status}"`,
        ].join(';');
      });

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="commandes_servies_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ orders: memoryServedToday, total });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique" },
      { status: 500 }
    );
  }
}
