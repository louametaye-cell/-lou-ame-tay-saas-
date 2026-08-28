import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';
import { OrderType } from '@/types';

// GET /api/dashboard/orders/current
// Récupère les commandes en cours avec détection des retards (>20 min)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || 'resto_thies_01';

    let orders = orderStorage.getOrdersByRestaurantId(restaurantId);
    const now = Date.now();

    if (orders.length === 0) {
      // Seed default active live orders for instant demo realism with authentic Senegalese dishes
      const seedOrders: OrderType[] = [
        {
          id: 'ord_demo_table5',
          tableNumber: 5,
          customerName: 'Ablaye Diop',
          customerNote: 'Piment bien fort, sauce à part',
          restaurantId: 'resto_thies_01',
          restaurantName: 'Chez Fatou & Frères',
          status: 'PENDING',
          paymentMethod: 'CASH',
          total: 4000,
          createdAt: new Date(now - 1000 * 60 * 6).toISOString(),
          items: [
            {
              id: 'it_1',
              menuItemId: 'dish_thieb_rouge',
              name: 'Ceebu Jën Pëndaa Mbaye',
              price: 3500,
              quantity: 1,
            },
            {
              id: 'it_2',
              menuItemId: 'dish_bissap',
              name: 'Jus de Bissap Maison Glacé',
              price: 500,
              quantity: 1,
            },
          ],
        },
        {
          id: 'ord_demo_table2',
          tableNumber: 2,
          customerName: 'Coumba Ndiaye',
          customerNote: 'Servi avec frites et alloco',
          restaurantId: 'resto_thies_01',
          restaurantName: 'Chez Fatou & Frères',
          status: 'PREPARING',
          paymentMethod: 'WAVE',
          total: 5200,
          createdAt: new Date(now - 1000 * 60 * 14).toISOString(),
          items: [
            {
              id: 'it_3',
              menuItemId: 'dish_yassa_poulet',
              name: 'Yassa Poulet Fermier Braisé',
              price: 4000,
              quantity: 1,
            },
            {
              id: 'it_4',
              menuItemId: 'dish_bouye',
              name: 'Jus de Bouye Frais',
              price: 1200,
              quantity: 1,
            },
          ],
        },
        {
          id: 'ord_demo_table8',
          tableNumber: 8,
          customerName: 'Moussa Sall',
          customerNote: 'Cuisson bien dorée',
          restaurantId: 'resto_thies_01',
          restaurantName: 'Chez Fatou & Frères',
          status: 'PENDING',
          paymentMethod: 'ORANGE_MONEY',
          total: 6500,
          createdAt: new Date(now - 1000 * 60 * 24).toISOString(),
          items: [
            {
              id: 'it_5',
              menuItemId: 'dish_dibi',
              name: 'Dibi d\'Agneau au Feu de Bois',
              price: 5000,
              quantity: 1,
            },
            {
              id: 'it_6',
              menuItemId: 'dish_pastels',
              name: 'Pastels Poisson (Portion 6)',
              price: 1500,
              quantity: 1,
            },
          ],
        },
      ];
      seedOrders.forEach((so) => orderStorage.addOrder(so));
      orders = orderStorage.getOrdersByRestaurantId(restaurantId);
    }

    const formattedOrders = orders.map((o) => {
      const orderDate = new Date(o.createdAt);
      const diffMinutes = Math.floor((now - orderDate.getTime()) / (1000 * 60));
      
      let computedStatus: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'LATE' = o.status as any;
      if (o.status !== 'SERVED' && diffMinutes >= 20) {
        computedStatus = 'LATE';
      }

      const itemsSummary = (o.items || []).map((i) => {
        const dishName = i.name || i.menuItem?.name || 'Plat du jour';
        return `${i.quantity}x ${dishName}`;
      });

      return {
        id: o.id,
        tableNumber: o.tableNumber,
        orderType: o.orderType || (o.tableNumber === 0 ? 'EXPRESS' : 'TABLE'),
        customerName: o.customerName,
        paymentMethod: o.paymentMethod,
        time: orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items: itemsSummary,
        rawItems: o.items || [],
        total: o.total,
        status: computedStatus,
        customerNote: o.customerNote || (o as any).note,
        createdAt: o.createdAt,
        servedAt: o.servedAt,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commandes' }, { status: 500 });
  }
}