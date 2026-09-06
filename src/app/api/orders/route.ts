import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAssignedServerIdForTable } from '@/lib/server-shift';
import { checkRateLimit } from '@/lib/rate-limit';
import { invalidateLiveOrdersCache, invalidateDashboardStatsCache } from '@/lib/cache';
import { startTimer, logPerformance } from '@/lib/logger';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    const whereClause = tenantId ? { tenantId } : {};

    const dbOrders = await (prisma as any).order.findMany({
      where: whereClause,
      include: {
        items: true,
        waiter: true,
        zone: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ orders: dbOrders, source: 'database' });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
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
    const { tableNumber, orderType, customerName, customerNote, restaurantId, items, paymentMethod, transactionRef, waiterId, zoneId, locationDetail } = body;

    const tenantId = restaurantId; // Assure it exists in Prisma
    const isExpress = orderType === 'EXPRESS' || Number(tableNumber) === 0;

    if (!tenantId || ((!isExpress && tableNumber === undefined && !locationDetail)) || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Données de commande invalides (restaurant, table ou articles manquants)' },
        { status: 400 }
      );
    }

    const total = items.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    const newOrder = await (prisma as any).order.create({
      data: {
        tenantId,
        tableNumber: isExpress ? 0 : Number(tableNumber) || 0,
        customerName: customerName || null,
        customerNote: customerNote || '',
        paymentMethod: paymentMethod || 'CASH',
        transactionRef: transactionRef || undefined,
        waiterId: waiterId || (isExpress ? undefined : getAssignedServerIdForTable(tableNumber)),
        zoneId: zoneId || undefined,
        locationDetail: locationDetail || undefined,
        status: 'PENDING',
        totalAmount: total,
        items: {
          create: items.map((i: any) => ({
            menuItemId: i.menuItemId || i.menuItem?.id || undefined,
            name: i.name || i.menuItem?.name || 'Plat du jour',
            quantity: Number(i.quantity) || 1,
            price: Number(i.price || i.menuItem?.price) || 0,
            customNotes: i.notes || i.customNotes || null,
            selectedExtras: i.options || undefined,
          })),
        },
      },
      include: {
        items: true,
      }
    });

    // Invalidate Redis caches for live orders and dashboard stats
    await invalidateLiveOrdersCache(tenantId);
    await invalidateDashboardStatsCache(tenantId);

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