import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';
import { prisma } from '@/lib/prisma';

// GET /api/orders/table/[tableNumber]?restaurantId=...
// Récupère en temps réel toutes les commandes actives de la table
export async function GET(
  req: Request,
  { params }: { params: { tableNumber: string } }
) {
  try {
    const tableNum = Number(params.tableNumber);
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || 'resto_thies_01';

    // 1. Get from in-memory orderStorage
    const allRestoOrders = orderStorage.getOrdersByRestaurantId(restaurantId);
    const tableOrders = allRestoOrders.filter((o) => Number(o.tableNumber) === tableNum);

    // If not found in memory, try DB
    if (tableOrders.length === 0) {
      try {
        const dbOrders = await (prisma as any).order?.findMany({
          where: {
            tableNumber: tableNum,
          },
          include: {
            items: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        });

        if (dbOrders && dbOrders.length > 0) {
          return NextResponse.json({ orders: dbOrders });
        }
      } catch (e) {}
    }

    return NextResponse.json({ orders: tableOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commandes table' }, { status: 500 });
  }
}