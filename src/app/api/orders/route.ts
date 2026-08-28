import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { orderStorage } from '@/lib/order-storage';
import { OrderType } from '@/types';
import { checkRateLimit } from '@/lib/rate-limit';
import { invalidateLiveOrdersCache, invalidateDashboardStatsCache } from '@/lib/cache';
import { startTimer, logPerformance } from '@/lib/logger';

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
  const timer = startTimer();
  try {
    // 1. Rate Limiting Check (25 orders/min per IP to prevent spam attacks)
    const rate = await checkRateLimit(req, 'orders');
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de commandes envoyées rapidement. Veuillez patienter un instant.' },
        { 
          status: 429, 
          headers: { 
            'Retry-After': String(rate.reset),
            'X-RateLimit-Remaining': '0',
          } 
        }
      );
    }

    const body = await req.json();
    const { tableNumber, orderType, customerName, customerNote, restaurantId = 'resto_thies_01', items, paymentMethod, transactionRef } = body;

    const isExpress = orderType === 'EXPRESS' || Number(tableNumber) === 0;

    if ((!isExpress && !tableNumber) || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Données de commande invalides (table ou articles manquants)' },
        { status: 400 }
      );
    }

    const total = items.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newOrder: OrderType = {
      id: orderId,
      tableNumber: isExpress ? 0 : Number(tableNumber),
      orderType: isExpress ? 'EXPRESS' : 'TABLE',
      customerName: customerName || null,
      customerNote: customerNote || '',
      restaurantId: restaurantId || 'resto_thies_01',
      restaurantName: 'Chez Fatou & Frères',
      paymentMethod: paymentMethod || 'CASH',
      transactionRef: transactionRef || undefined,
      status: 'PENDING',
      total,
      createdAt: new Date().toISOString(),
      items: items.map((i: any) => {
        const dishName = i.name || i.menuItem?.name || 'Plat du jour';
        const dishPrice = Number(i.price || i.menuItem?.price) || 0;
        const dishQty = Number(i.quantity) || 1;

        return {
          id: i.id || `item_${Math.random().toString(36).substring(2, 7)}`,
          menuItemId: i.menuItemId || i.menuItem?.id || i.id,
          name: dishName,
          menuItem: i.menuItem || undefined,
          quantity: dishQty,
          price: dishPrice,
          notes: i.notes || i.customNotes || null,
          options: i.options,
        };
      }),
    };

    // Store in memory first
    orderStorage.addOrder(newOrder);

    // Also attempt to save in Prisma DB if available
    try {
      await (prisma as any).order?.create({
        data: {
          id: newOrder.id,
          tableNumber: newOrder.tableNumber,
          customerName: newOrder.customerName,
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
      // Non-blocking database write error
      console.warn('Prisma DB write bypassed:', dbErr);
    }

    // Invalidate Redis caches for live orders and dashboard stats
    await invalidateLiveOrdersCache(newOrder.restaurantId);
    await invalidateDashboardStatsCache(newOrder.restaurantId);

    logPerformance(`POST /api/orders (${newOrder.id})`, timer.elapsedMs(), `Table ${newOrder.tableNumber}`);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande' },
      { status: 500 }
    );
  }
}