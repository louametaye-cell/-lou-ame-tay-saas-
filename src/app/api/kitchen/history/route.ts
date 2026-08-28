import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';

// GET /api/kitchen/history
// Récupère l'historique des commandes servies aujourd'hui
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');
    const format = searchParams.get('format');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Récupérer depuis le store en mémoire
    const allOrders = restaurantId
      ? orderStorage.getOrdersByRestaurantId(restaurantId)
      : orderStorage.getOrders();

    let memoryServedToday = allOrders.filter((o) => {
      if (o.status !== 'SERVED') return false;
      const servedTime = o.servedAt ? new Date(o.servedAt).getTime() : new Date(o.createdAt).getTime();
      return servedTime >= today.getTime() && servedTime < tomorrow.getTime();
    });

    // 2. Tenter de fusionner avec Prisma DB si disponible
    try {
      const dbServed = await (prisma as any).order?.findMany({
        where: {
          ...(restaurantId ? { restaurantId } : {}),
          status: 'SERVED',
          servedAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
        },
        orderBy: {
          servedAt: 'desc',
        },
      });

      if (dbServed && dbServed.length > 0) {
        const dbFormatted = dbServed.map((o: any) => ({
          id: o.id,
          tableNumber: o.tableNumber,
          customerNote: o.customerNote || o.note,
          note: o.note || o.customerNote,
          restaurantId: o.restaurantId,
          status: o.status as any,
          total: o.total,
          servedAt: o.servedAt ? o.servedAt.toISOString() : null,
          createdAt: o.createdAt.toISOString(),
          items: o.items.map((i: any) => ({
            id: i.id,
            menuItemId: i.menuItemId,
            menuItem: i.menuItem as any,
            quantity: i.quantity,
            price: i.price,
            notes: i.notes,
          })),
        }));

        // Merge without duplicates
        const existingIds = new Set(memoryServedToday.map((m) => m.id));
        for (const item of dbFormatted) {
          if (!existingIds.has(item.id)) {
            memoryServedToday.push(item);
          }
        }
      }
    } catch (e) {
      // Use memory fallback
    }

    // Sort by servedAt descending
    memoryServedToday.sort((a, b) => {
      const tA = a.servedAt ? new Date(a.servedAt).getTime() : new Date(a.createdAt).getTime();
      const tB = b.servedAt ? new Date(b.servedAt).getTime() : new Date(b.createdAt).getTime();
      return tB - tA;
    });

    const total = memoryServedToday.reduce((sum, order) => sum + order.total, 0);

    // CSV Export
    if (format === 'csv') {
      const headers = ['ID Commande', 'Table', 'Heure Commande', 'Heure Servie', 'Plats', 'Remarque', 'Total (FCFA)', 'Statut'];
      const rows = memoryServedToday.map((o) => {
        const itemsSummary = o.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(' | ');
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
