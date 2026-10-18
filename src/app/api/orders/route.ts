import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getAssignedServerIdForTable } from '@/lib/server-shift';
import { checkRateLimit } from '@/lib/rate-limit';
import { invalidateLiveOrdersCache, invalidateDashboardStatsCache } from '@/lib/cache';
import { startTimer, logPerformance, logApiCall, createApiErrorResponse } from '@/lib/logger';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { isDrinkOrBarItem } from '@/lib/order-routing';

// Calcul du début de journée dans le fuseau horaire sénégalais (Africa/Dakar - UTC+0)
function getDakarStartOfToday(): Date {
  const now = new Date();
  const dakarDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Dakar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return new Date(`${dakarDateStr}T00:00:00.000Z`);
}

export async function GET(req: Request) {
  const timer = startTimer();

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
        select: { id: true, subdomain: true },
      });
      if (dbTenant) {
        resolvedTenantId = dbTenant.id;
        const isKds = searchParams.has('service') || searchParams.has('station') || req.headers.has('x-kds-token');
        if (!isKds && !isAuthorizedTenant(req, dbTenant.id, dbTenant.subdomain)) {
          return NextResponse.json(
            { error: 'Accès non autorisé : Session d\'exploitation requise (Gérant, Caisse ou Cuisine)' },
            { status: 401 }
          );
        }
      }
    }

    if (!resolvedTenantId) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Session d\'exploitation requise (Gérant, Caisse ou Cuisine)' },
        { status: 401 }
      );
    }

    const serviceFilter = searchParams.get('station') || searchParams.get('service') || searchParams.get('destinationService');
    const startOfTodayDakar = getDakarStartOfToday();

    const whereClause: any = {
      tenantId: resolvedTenantId,
      createdAt: { gte: startOfTodayDakar },
      status: { not: 'CANCELLED' },
    };

    if (serviceFilter && serviceFilter.toUpperCase() !== 'ALL') {
      whereClause.destinationService = serviceFilter.toUpperCase();
    }

    const dbOrders = await (prisma as any).order.findMany({
      where: whereClause,
      include: {
        items: true,
        waiter: true,
        zone: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });

    const mappedOrders = dbOrders.map((o: any) => {
      const isExpress = o.orderType === 'EXPRESS' || o.orderType === 'TAKEAWAY' || o.tableNumber === 0;
      const isRoom = o.spaceType === 'ROOM' || (o.locationDetail && o.locationDetail.toLowerCase().includes('chambre'));
      
      let originLabel = `Table ${o.tableNumber < 10 ? `0${o.tableNumber}` : o.tableNumber}`;
      if (isRoom) {
        originLabel = o.locationDetail || `Chambre ${o.tableNumber} - Room Service`;
      } else if (isExpress) {
        originLabel = 'À Emporter / Comptoir';
      }

      return {
        ...o,
        total: Number(o.totalAmount ?? o.total ?? 0),
        totalAmount: Number(o.totalAmount ?? o.total ?? 0),
        orderType: o.orderType || (isExpress ? 'TAKEAWAY' : 'TABLE'),
        orderOrigin: isRoom ? 'ROOM' : isExpress ? 'COUNTER' : 'TABLE',
        orderDestination: o.destinationService || 'KITCHEN',
        originLabel,
        locationDetail: o.locationDetail || originLabel,
      };
    });

    logApiCall({
      method: 'GET',
      endpoint: '/api/orders',
      tenantId: resolvedTenantId,
      durationMs: timer.elapsedMs(),
      statusCode: 200,
    }).catch(() => {});

    return NextResponse.json({ orders: mappedOrders, source: 'database' });
  } catch (error) {
    return createApiErrorResponse(error, {
      method: 'GET',
      endpoint: '/api/orders',
      durationMs: timer.elapsedMs(),
    });
  }

}

export async function POST(req: Request) {
  const timer = startTimer();
  let trackedTenantId: string | null = null;
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
    const { 
      tableNumber, 
      orderType, 
      customerName, 
      customerNote, 
      restaurantId, 
      items, 
      paymentMethod, 
      transactionRef, 
      waiterId, 
      zoneId, 
      locationDetail: initialLocationDetail,
      spaceType,
      destinationService 
    } = body;
    let locationDetail = initialLocationDetail;
    trackedTenantId = restaurantId || body.tenantId || null;


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
    let tenantPlanSlug: string | null = null;
    try {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: {
          OR: [
            { id: tenantIdInput },
            { subdomain: tenantIdInput },
          ],
        },
        select: {
          id: true,
          plan: {
            select: { slug: true, name: true }
          }
        },
      });
      if (dbTenant) {
        validTenantId = dbTenant.id;
        tenantPlanSlug = dbTenant.plan?.slug?.toLowerCase() || null;
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

    // 🔒 Règle SaaS stricte : Le pack TÀMBALI est un pack vitrine pure, sans commande numérique
    if (tenantPlanSlug === 'tambali') {
      return NextResponse.json(
        { 
          error: 'La prise de commande numérique n\'est pas activée pour cet établissement sous formule vitrine TÀMBALI. La commande se fait oralement auprès du personnel.',
          plan: 'TÀMBALI'
        },
        { status: 403 }
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

    // Validate items menuItemId foreign key and fetch station metadata
    const rawMenuItemIds = items
      .map((i: any) => i.menuItemId || i.menuItem?.id)
      .filter((id: any) => typeof id === 'string' && id.length > 0);

    let existingMenuItemIdsSet = new Set<string>();
    const dbItemMap = new Map<string, any>();
    if (rawMenuItemIds.length > 0) {
      try {
        const foundItems = await (prisma as any).menuItem.findMany({
          where: { id: { in: rawMenuItemIds } },
          select: {
            id: true,
            name: true,
            station: true,
            category: { select: { station: true } },
          },
        });
        foundItems.forEach((m: any) => {
          existingMenuItemIdsSet.add(m.id);
          dbItemMap.set(m.id, m);
        });
      } catch (e) {}
    }

    const total = items.reduce(
      (sum: number, item: any) => sum + (Number(item.price || item.menuItem?.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    const allowedPaymentMethods = ['CASH', 'WAVE', 'ORANGE_MONEY', 'YAS_MONEY', 'CARD', 'CASH_TPE'];
    const cleanPaymentMethod = allowedPaymentMethods.includes(paymentMethod) ? paymentMethod : 'CASH';

    const cleanTableNum = isExpress ? 0 : parseInt(String(tableNumber).replace(/[^0-9]/g, ''), 10) || 0;

    // Protection Anti-Doublon / Idempotence (Double clic ou réseau instable dans les 6 secondes)
    try {
      const sixSecondsAgo = new Date(Date.now() - 6000);
      const recentDuplicate = await (prisma as any).order.findFirst({
        where: {
          tenantId: validTenantId,
          tableNumber: cleanTableNum,
          totalAmount: total > 0 ? total : 0,
          createdAt: { gte: sixSecondsAgo },
          status: 'PENDING',
        },
        include: {
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (recentDuplicate) {
        return NextResponse.json(
          {
            order: {
              ...recentDuplicate,
              total: Number(recentDuplicate.totalAmount),
              totalAmount: Number(recentDuplicate.totalAmount),
              orderType: isExpress ? 'EXPRESS' : 'TABLE',
            },
            isDuplicateProtected: true,
          },
          { status: 200 }
        );
      }
    } catch (e) {
      console.warn('Erreur vérification anti-doublon:', e);
    }

    // Résolution intelligente du type d'espace (orderOrigin) et du service destinataire (orderDestination)
    let effectiveSpaceType = spaceType || null;
    let effectiveDestination = destinationService || null;
    let matchedTableId: string | null = null;

    if (validTenantId && cleanTableNum > 0) {
      try {
        const dbTable = await (prisma as any).table.findFirst({
          where: {
            tenantId: validTenantId,
            tableNumber: cleanTableNum,
            isActive: true,
          },
        });
        if (dbTable) {
          matchedTableId = dbTable.id;
          if (!effectiveSpaceType) effectiveSpaceType = dbTable.spaceType;
          if (!effectiveDestination) effectiveDestination = dbTable.destinationService;
          if (!locationDetail && dbTable.label) {
            locationDetail = dbTable.label;
          }
        }
      } catch (err) {}
    }

    // 1. Détection de l'origine (TABLE, ROOM, COUNTER)
    const isCounter = isExpress || cleanTableNum === 0 || orderType === 'EXPRESS' || orderType === 'TAKEAWAY' || effectiveSpaceType === 'COUNTER';
    const isRoomDetected = effectiveSpaceType === 'ROOM' || 
                           cleanTableNum >= 100 || 
                           (locationDetail && (locationDetail.toLowerCase().includes('chambre') || locationDetail.toLowerCase().includes('room')));

    if (isRoomDetected) {
      effectiveSpaceType = 'ROOM';
      if (!locationDetail) {
        locationDetail = `Chambre ${cleanTableNum} - Room Service`;
      }
    } else if (isCounter) {
      effectiveSpaceType = 'COUNTER';
      if (!locationDetail) {
        locationDetail = 'À Emporter / Comptoir';
      }
    } else {
      effectiveSpaceType = 'TABLE';
      if (!locationDetail && cleanTableNum > 0) {
        locationDetail = `Table ${cleanTableNum < 10 ? `0${cleanTableNum}` : cleanTableNum}`;
      }
    }

    // 2. Routage discipliné vers le poste KDS :
    // Si TOUS les articles relèvent du bar/boissons -> Destination BAR
    // S'il y a des plats cuisinés / nourriture -> Destination KITCHEN (même en chambre ou au comptoir !)
    if (!effectiveDestination) {
      const hasOnlyDrinks = items.every(isDrinkOrBarItem);
      if (hasOnlyDrinks) {
        effectiveDestination = 'BAR';
      } else {
        effectiveDestination = 'KITCHEN';
      }
    }

    const newOrder = await (prisma as any).order.create({
      data: {
        tenantId: validTenantId,
        tableId: matchedTableId || undefined,
        tableNumber: cleanTableNum,
        orderType: isCounter ? 'TAKEAWAY' : 'TABLE',
        spaceType: effectiveSpaceType || undefined,
        destinationService: effectiveDestination || undefined,
        customerName: customerName ? String(customerName).trim() : null,
        customerNote: customerNote ? String(customerNote).trim() : '',
        paymentMethod: cleanPaymentMethod,
        transactionRef: transactionRef ? String(transactionRef).trim() : undefined,
        waiterId: validWaiterId || undefined,
        cashierId: body.cashierId || undefined,
        cashSessionId: body.cashSessionId || undefined,
        zoneId: validZoneId || undefined,
        locationDetail: locationDetail || undefined,
        status: 'PENDING',
        totalAmount: total > 0 ? total : 0,
        items: {
          create: items.map((i: any) => {
            const rawId = i.menuItemId || i.menuItem?.id;
            const safeOptions = i.options ? JSON.parse(JSON.stringify(i.options)) : undefined;
            const dbItem = rawId ? dbItemMap.get(rawId) : null;
            const itemName = i.name || i.menuItem?.name || dbItem?.name || 'Plat du jour';
            
            // Résolution précise de la station de préparation (KITCHEN ou BAR)
            let itemStation: 'KITCHEN' | 'BAR' = 'KITCHEN';
            if (dbItem?.station) {
              itemStation = dbItem.station;
            } else if (dbItem?.category?.station) {
              itemStation = dbItem.category.station;
            } else if (isDrinkOrBarItem(itemName)) {
              itemStation = 'BAR';
            }

            return {
              menuItemId: existingMenuItemIdsSet.has(rawId) ? rawId : undefined,
              name: itemName,
              quantity: Number(i.quantity) || 1,
              price: Number(i.price || i.menuItem?.price) || 0,
              customNotes: i.notes || i.customNotes || null,
              selectedExtras: safeOptions,
              station: itemStation,
              status: 'PENDING' as const,
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

    // 🔒 CYCLE DE VIE DE TABLE : Passer la table à 'OCCUPIED' et réinitialiser clearedAt dès la première commande
    if (!isExpress && cleanTableNum > 0) {
      try {
        await (prisma as any).table.updateMany({
          where: { tenantId: validTenantId, tableNumber: cleanTableNum },
          data: { status: 'OCCUPIED', clearedAt: null }
        });
      } catch (tableErr) {
        console.warn('Erreur non-bloquante mise à jour statut table OCCUPIED:', tableErr);
      }
    }

    logPerformance(`POST /api/orders (${newOrder.id})`, timer.elapsedMs(), `Table ${newOrder.tableNumber}`);

    const mappedNewOrder = {
      ...newOrder,
      total: Number(newOrder.totalAmount ?? 0),
      totalAmount: Number(newOrder.totalAmount ?? 0),
      orderType: (newOrder.tableNumber === 0 || !newOrder.tableNumber) ? 'EXPRESS' : 'TABLE',
    };

    logApiCall({
      method: 'POST',
      endpoint: '/api/orders',
      tenantId: validTenantId,
      durationMs: timer.elapsedMs(),
      statusCode: 201,
    }).catch(() => {});

    return NextResponse.json({ success: true, order: mappedNewOrder }, { status: 201 });
  } catch (error: any) {
    return createApiErrorResponse(error, {
      method: 'POST',
      endpoint: '/api/orders',
      tenantId: trackedTenantId,
      durationMs: timer.elapsedMs(),
    });
  }


}