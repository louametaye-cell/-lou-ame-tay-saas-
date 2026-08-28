import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// GET /api/dashboard/orders/current
// Récupère les commandes en cours avec détection des retards (>20 min)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || 'resto_thies_01';

    const orders = orderStorage.getOrdersByRestaurantId(restaurantId);
    const now = Date.now();

    const formattedOrders = orders.map((o) => {
      const orderDate = new Date(o.createdAt);
      const diffMinutes = Math.floor((now - orderDate.getTime()) / (1000 * 60));
      
      let computedStatus: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'LATE' = o.status as any;
      if (o.status !== 'SERVED' && diffMinutes >= 20) {
        computedStatus = 'LATE';
      }

      const itemsSummary = o.items.map((i) => `${i.quantity}x ${i.menuItem?.name || 'Plat'}`);

      return {
        id: o.id,
        tableNumber: o.tableNumber,
        time: orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items: itemsSummary,
        rawItems: o.items,
        total: o.total,
        status: computedStatus,
        customerNote: o.customerNote || o.note,
        createdAt: o.createdAt,
        servedAt: o.servedAt,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commandes' }, { status: 500 });
  }
}
