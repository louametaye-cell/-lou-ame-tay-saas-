import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { createApiErrorResponse } from '@/lib/logger';


// GET /api/cashier/orders
// Récupération des commandes de la journée en cours (createdAt >= startOfToday) pour la caisse avec filtrage par statut
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || searchParams.get('tenantId');
    const status = searchParams.get('status');

    if (!restaurantId) {
      return NextResponse.json({ error: 'Identifiant restaurant requis' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: restaurantId }, { subdomain: restaurantId }]
      },
      select: { id: true, subdomain: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Début de la journée locale (00:00:00)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const whereClause: any = {
      tenantId: tenant.id,
      createdAt: { gte: startOfToday }
    };

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
        waiter: { select: { id: true, name: true } },
        cashier: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        ...o,
        total: Number(o.totalAmount),
        createdAt: o.createdAt.toISOString()
      }))
    });
  } catch (error: any) {
    return createApiErrorResponse(error, {
      method: 'GET',
      endpoint: '/api/cashier/orders'
    });
  }
}

// POST /api/cashier/orders
// Création d'une commande directe depuis la caisse (déduit le stock de façon atomique)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      tenantId, 
      items, 
      paymentMethod, 
      cashierId, 
      cashSessionId, 
      customerName, 
      isPaidLater, 
      tableNumber,
      employeeId,
      employeeName 
    } = body;

    if (!tenantId || !items || !items.length) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    // 1. Résoudre le restaurant par ID ou sous-domaine
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantId }, { subdomain: tenantId }]
      },
      select: { id: true, subdomain: true, businessName: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }
    const resolvedTenantId = tenant.id;

    const isStaffMeal = paymentMethod === 'STAFF_MEAL';
    if (isStaffMeal && (!employeeName || !String(employeeName).trim())) {
      return NextResponse.json(
        { error: 'Le nom de l\'employé est obligatoire pour enregistrer un bon de repas personnel (NP).' },
        { status: 400 }
      );
    }

    // 2. Contrôle de sécurité et d'isolation multi-tenant stricte :
    // Autoriser soit le gérant (saas_token), soit le caissier actif rattaché à CE restaurant
    let isAuth = isAuthorizedTenant(req, tenant.id, tenant.subdomain);

    if (!isAuth && cashierId) {
      const dbCashier = await prisma.cashier.findFirst({
        where: { id: cashierId, tenantId: resolvedTenantId, isActive: true }
      });
      if (dbCashier) {
        isAuth = true;
      }
    }

    if (!isAuth && cashSessionId) {
      const dbSession = await prisma.cashSession.findFirst({
        where: { id: cashSessionId, tenantId: resolvedTenantId, status: 'OPEN' }
      });
      if (dbSession) {
        isAuth = true;
      }
    }

    const cashierHeader = req.headers.get('x-cashier-token');
    if (!isAuth && cashierHeader) {
      if (cashierHeader.includes(tenant.id) || cashierHeader.includes(tenant.subdomain)) {
        isAuth = true;
      }
    }

    if (!isAuth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Calcul du total
    const totalAmount = items.reduce((sum: number, item: any) => sum + (Number(item.price) * item.quantity), 0);

    // Démarrer une transaction pour déduire les stocks de manière sécurisée
    const order = await (prisma as any).$transaction(async (tx: any) => {
      // 1. Déduction des stocks
      for (const item of items) {
        const dbItem = await tx.menuItem.findUnique({ where: { id: item.menuItemId } });
        if (dbItem && dbItem.trackStock) {
          if (dbItem.currentStock < item.quantity) {
            throw new Error(`Stock insuffisant pour: ${dbItem.name}`);
          }
          await tx.menuItem.update({
            where: { id: dbItem.id },
            data: { currentStock: { decrement: item.quantity } }
          });
          
          // Enregistrer le mouvement
          await tx.stockMovement.create({
            data: {
              tenantId: resolvedTenantId,
              menuItemId: dbItem.id,
              quantity: -item.quantity,
              type: 'SALE',
              cashierId: cashierId || null,
              reason: 'Vente directe au comptoir'
            }
          });
        }
      }

      // 2. Préparation des items avec résolution précise de leur station (KITCHEN ou BAR)
      const isDrinkOrBarItem = (name: string) => {
        const lower = (name || '').toLowerCase();
        return (
          lower.includes('cocktail') ||
          lower.includes('bissap') ||
          lower.includes('bouye') ||
          lower.includes('gingembre') ||
          lower.includes('boisson') ||
          lower.includes('jus') ||
          lower.includes('café') ||
          lower.includes('cafe') ||
          lower.includes('thé') ||
          lower.includes('the') ||
          lower.includes('soda') ||
          lower.includes('coca') ||
          lower.includes('sprite') ||
          lower.includes('fanta') ||
          lower.includes('eau') ||
          lower.includes('bière') ||
          lower.includes('biere') ||
          lower.includes('gazelle') ||
          lower.includes('flag') ||
          lower.includes('vin')
        );
      };

      const resolvedItemsData = [];
      let hasBarItems = false;
      let hasKitchenItems = false;

      for (const item of items) {
        let itemStation: 'KITCHEN' | 'BAR' = 'KITCHEN';
        if (item.menuItemId) {
          const dbItem = await tx.menuItem.findUnique({
            where: { id: item.menuItemId },
            include: { category: true }
          });
          if (dbItem) {
            itemStation = dbItem.station || dbItem.category?.station || (isDrinkOrBarItem(dbItem.name) ? 'BAR' : 'KITCHEN');
          } else {
            itemStation = isDrinkOrBarItem(item.name) ? 'BAR' : 'KITCHEN';
          }
        } else {
          itemStation = isDrinkOrBarItem(item.name) ? 'BAR' : 'KITCHEN';
        }

        if (itemStation === 'BAR') hasBarItems = true;
        else hasKitchenItems = true;

        resolvedItemsData.push({
          menuItemId: item.menuItemId || undefined,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          station: itemStation,
          status: 'PENDING' as const,
        });
      }

      // 3. Création de la commande directe comptoir
      // IMPORTANT : status TOUJOURS 'PENDING' pour que la brigade/barista puisse préparer et valider !
      const isTakeaway = (!tableNumber || Number(tableNumber) === 0) || body.orderType === 'TAKEAWAY' || !isPaidLater;
      const destinationService = (!hasKitchenItems && hasBarItems) ? 'BAR' : 'KITCHEN';

      const newOrder = await tx.order.create({
        data: {
          tenantId: resolvedTenantId,
          orderType: isTakeaway ? 'TAKEAWAY' : 'TABLE',
          tableNumber: isTakeaway ? 0 : Number(tableNumber || 0),
          spaceType: isTakeaway ? 'COUNTER' : 'TABLE',
          destinationService,
          locationDetail: isStaffMeal 
            ? ('REPAS PERSONNEL - ' + employeeName.trim())
            : (isTakeaway 
              ? 'À EMPORTER - Comptoir 1'
              : (tableNumber ? 'TABLE ' + tableNumber : 'SUR PLACE')),
          customerName: isStaffMeal
            ? ('Employé : ' + employeeName.trim())
            : (customerName && String(customerName).trim() ? String(customerName).trim() : (isTakeaway ? 'Client anonyme' : `Table ${tableNumber || 0}`)),
          employeeId: isStaffMeal ? (employeeId || undefined) : undefined,
          employeeName: isStaffMeal ? employeeName.trim() : undefined,
          status: 'PENDING',
          paymentStatus: isStaffMeal ? 'STAFF_NP' : (isPaidLater ? 'UNPAID' : 'PAID'),
          paymentMethod: paymentMethod || 'CASH',
          totalAmount,
          cashierId: cashierId || undefined,
          cashSessionId: cashSessionId || undefined,
          servedAt: null,
          items: {
            create: resolvedItemsData
          }
        },
        include: {
          items: true,
          tenant: { select: { businessName: true } }
        }
      });

      return newOrder;
    });

    // Invalidation des caches
    try {
      const { invalidateLiveOrdersCache, invalidateDashboardStatsCache } = await import('@/lib/cache');
      await Promise.all([
        invalidateLiveOrdersCache(resolvedTenantId),
        invalidateDashboardStatsCache(resolvedTenantId),
      ]);
    } catch (e) {}

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return createApiErrorResponse(error, {
      method: 'POST',
      endpoint: '/api/cashier/orders',
    });
  }
}

