import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAssignedServerIdForTable } from '@/lib/server-shift';
import { checkRateLimit } from '@/lib/rate-limit';
import { invalidateLiveOrdersCache, invalidateDashboardStatsCache } from '@/lib/cache';
import { startTimer, logPerformance } from '@/lib/logger';
import { cookies } from 'next/headers';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawInput = searchParams.get('tenantId') || searchParams.get('restaurantId') || searchParams.get('subdomain');
    let candidate = rawInput;

    if (!candidate) {
      try {
        const cookieStore = cookies();
        const token = cookieStore.get('saas_token')?.value;
        if (token && token.startsWith('resto_session_')) {
          candidate = token.replace('resto_session_', '');
        }
      } catch (e) {}
    }

    let resolvedTenantId: string | null = null;
    if (candidate) {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: {
          OR: [
            { id: candidate },
            { subdomain: candidate },
          ],
        },
        select: { id: true },
      });
      if (dbTenant) {
        resolvedTenantId = dbTenant.id;
      }
    }

    if (!resolvedTenantId && !isAuthorizedSuperAdmin(req)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Restaurant non identifié (identifiant ou session requis)' },
        { status: 401 }
      );
    }

    const whereClause = resolvedTenantId ? { tenantId: resolvedTenantId } : {};

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

    const isExpress = orderType === 'EXPRESS' || Number(tableNumber) === 0;

    if ((!restaurantId && !body.tenantId) || ((!isExpress && tableNumber === undefined && !locationDetail)) || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Données de commande invalides (restaurant, table ou articles manquants)' },
        { status: 400 }
      );
    }

    const tenantIdInput = restaurantId || body.tenantId;

    // Look up tenant in database by id OR subdomain to get valid tenant ID for foreign key
    let validTenantId: string | null = null;
    try {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: {
          OR: [
            { id: tenantIdInput },
            { subdomain: tenantIdInput },
          ],
        },
        select: { id: true },
      });
      if (dbTenant) {
        validTenantId = dbTenant.id;
      }
    } catch (err) {
      console.warn('Error checking tenant:', err);
    }

    if (!validTenantId) {
      return NextResponse.json(
        { error: 'Restaurant non identifié : impossible d\'enregistrer la commande pour un établissement inexistant' },
        { status: 404 }
      );
    }

    // Validate waiterId foreign key if passed or generated
    let validWaiterId: string | null = null;
    const rawWaiterId = waiterId || (isExpress ? undefined : getAssignedServerIdForTable(Number(tableNumber)));
    if (rawWaiterId) {
      try {
        const dbWaiter = await (prisma as any).waiter.findUnique({
          where: { id: rawWaiterId },
          select: { id: true },
        });
        if (dbWaiter) {
          validWaiterId = dbWaiter.id;
        }
      } catch (err) {
        validWaiterId = null;
      }
    }

    // Validate zoneId foreign key if passed
    let validZoneId: string | null = null;
    if (zoneId) {
      try {
        const dbZone = await (prisma as any).zone.findUnique({
          where: { id: zoneId },
          select: { id: true },
        });
        if (dbZone) {
          validZoneId = dbZone.id;
        }
      } catch (e) {}
    }

    // Validate items menuItemId foreign key
    const rawMenuItemIds = items
      .map((i: any) => i.menuItemId || i.menuItem?.id)
      .filter((id: any) => typeof id === 'string' && id.length > 0);

    let existingMenuItemIdsSet = new Set<string>();
    if (rawMenuItemIds.length > 0) {
      try {
        const foundItems = await (prisma as any).menuItem.findMany({
          where: { id: { in: rawMenuItemIds } },
          select: { id: true },
        });
        foundItems.forEach((m: any) => existingMenuItemIdsSet.add(m.id));
      } catch (e) {}
    }

    const total = items.reduce(
      (sum: number, item: any) => sum + (Number(item.price || item.menuItem?.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    const allowedPaymentMethods = ['CASH', 'WAVE', 'ORANGE_MONEY', 'CARD', 'CASH_TPE'];
    const cleanPaymentMethod = allowedPaymentMethods.includes(paymentMethod) ? paymentMethod : 'CASH';

    const cleanTableNum = isExpress ? 0 : parseInt(String(tableNumber).replace(/[^0-9]/g, ''), 10) || 0;

    const newOrder = await (prisma as any).order.create({
      data: {
        tenantId: validTenantId,
        tableNumber: cleanTableNum,
        customerName: customerName ? String(customerName).trim() : null,
        customerNote: customerNote ? String(customerNote).trim() : '',
        paymentMethod: cleanPaymentMethod,
        transactionRef: transactionRef ? String(transactionRef).trim() : undefined,
        waiterId: validWaiterId || undefined,
        zoneId: validZoneId || undefined,
        locationDetail: locationDetail || undefined,
        status: 'PENDING',
        totalAmount: total > 0 ? total : 0,
        items: {
          create: items.map((i: any) => {
            const rawId = i.menuItemId || i.menuItem?.id;
            const safeOptions = i.options ? JSON.parse(JSON.stringify(i.options)) : undefined;
            return {
              menuItemId: existingMenuItemIdsSet.has(rawId) ? rawId : undefined,
              name: i.name || i.menuItem?.name || 'Plat du jour',
              quantity: Number(i.quantity) || 1,
              price: Number(i.price || i.menuItem?.price) || 0,
              customNotes: i.notes || i.customNotes || null,
              selectedExtras: safeOptions,
            };
          }),
        },
      },
      include: {
        items: true,
      }
    });

    // Update salesCount for ordered items and tenant daily order counters non-blockingly
    try {
      for (const item of items) {
        const rawId = item.menuItemId || item.menuItem?.id;
        const qty = Number(item.quantity) || 1;
        if (rawId && existingMenuItemIdsSet.has(rawId)) {
          await (prisma as any).menuItem.update({
            where: { id: rawId },
            data: {
              salesCount: { increment: qty },
            },
          });
        }
      }
      await (prisma as any).tenant.update({
        where: { id: validTenantId },
        data: {
          ordersToday: { increment: 1 },
        },
      });
    } catch (metricErr) {
      console.warn('Non-blocking metric update error in POST /api/orders:', metricErr);
    }

    // Invalidate Redis caches non-blockingly
    try {
      await invalidateLiveOrdersCache(validTenantId);
      await invalidateDashboardStatsCache(validTenantId);
    } catch (cacheErr) {
      console.warn('Cache invalidation non-blocking error:', cacheErr);
    }

    logPerformance(`POST /api/orders (${newOrder.id})`, timer.elapsedMs(), `Table ${newOrder.tableNumber}`);

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order in API route:', error?.message || error, error?.stack);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la commande: ' + (error?.message || 'Erreur serveur') },
      { status: 500 }
    );
  }
}