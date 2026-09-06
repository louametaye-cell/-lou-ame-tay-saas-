import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderType } from '@/types';

// GET /api/dashboard/orders/current
// Récupère les commandes en cours avec détection des retards (>20 min)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('restaurantId');
    if (!tenantId) return NextResponse.json({ error: 'restaurantId missing' }, { status: 400 });

    const now = Date.now();

    const orders = await (prisma as any).order.findMany({
      where: {
        tenantId,
        status: { in: ['PENDING', 'PREPARING', 'READY'] }
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map((o: any) => {
      const orderDate = new Date(o.createdAt);
      const diffMinutes = Math.floor((now - orderDate.getTime()) / (1000 * 60));
      
      let computedStatus: 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'LATE' = o.status as any;
      if (o.status !== 'SERVED' && diffMinutes >= 20) {
        computedStatus = 'LATE';
      }

      const itemsSummary = (o.items || []).map((i: any) => {
        const dishName = i.name || 'Plat du jour';
        return `${i.quantity}x ${dishName}`;
      });

      return {
        id: o.id,
        tableNumber: o.tableNumber,
        orderType: o.tableNumber === 0 ? 'EXPRESS' : 'TABLE',
        customerName: o.customerName || 'Client',
        paymentMethod: o.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        time: orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        items: itemsSummary,
        rawItems: o.items || [],
        total: o.totalAmount,
        status: computedStatus,
        customerNote: o.customerNote,
        createdAt: o.createdAt,
        servedAt: o.servedAt,
      };
    });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commandes' }, { status: 500 });
  }
}