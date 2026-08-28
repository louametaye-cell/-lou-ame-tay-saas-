import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';
import { OrderType } from '@/types';

export async function GET() {
  try {
    // Try querying Prisma DB if accessible
    const dbOrders = await (prisma as any).order?.findMany({
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (dbOrders && dbOrders.length > 0) {
      return NextResponse.json({ orders: dbOrders, source: 'database' });
    }
  } catch (error) {
    // Database may not be configured yet, fallback to in-memory store
  }

  const memoryOrders = orderStorage.getOrders();
  return NextResponse.json({ orders: memoryOrders, source: 'memory' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tableNumber, customerNote, restaurantId, items } = body;

    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Données de commande invalides (table ou articles manquants)' },
        { status: 400 }
      );
    }

    const total = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newOrder: OrderType = {
      id: orderId,
      tableNumber: Number(tableNumber),
      customerNote: customerNote || '',
      restaurantId: restaurantId || 'resto_thies_01',
      restaurantName: 'Chez Fatou & Frères',
      status: 'PENDING',
      total,
      createdAt: new Date().toISOString(),
      items: items.map((i: any) => ({
        id: `item_${Math.random().toString(36).substring(2, 7)}`,
        menuItemId: i.menuItemId || i.menuItem?.id,
        menuItem: i.menuItem,
        quantity: i.quantity,
        price: i.price || i.menuItem?.price,
        notes: i.notes || i.customNotes,
      })),
    };

    // Store in memory first
    orderStorage.addOrder(newOrder);

    // Also attempt to save in Prisma DB if available
    try {
      await (prisma as any).order?.create({
        data: {
          id: newOrder.id,
          tableNumber: newOrder.tableNumber,
          customerNote: newOrder.customerNote,
          restaurantId: newOrder.restaurantId,
          total: newOrder.total,
          status: 'PENDING',
          items: {
            create: newOrder.items.map((it) => ({
              id: it.id,
              menuItemId: it.menuItemId,
              quantity: it.quantity,
              price: it.price,
              notes: it.notes,
            })),
          },
        },
      });
    } catch (dbErr) {
      // Non-blocking database write error (e.g. dev mode without active postgres)
      console.warn('Prisma DB write bypassed:', dbErr);
    }

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}
