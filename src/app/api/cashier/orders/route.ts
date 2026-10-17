import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { createApiErrorResponse } from '@/lib/logger';


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

    const isStaffMeal = paymentMethod === 'STAFF_MEAL';
    if (isStaffMeal && (!employeeName || !String(employeeName).trim())) {
      return NextResponse.json(
        { error: 'Le nom de l\'employé est obligatoire pour enregistrer un bon de repas personnel (NP).' },
        { status: 400 }
      );
    }

    const isAuth = isAuthorizedTenant(req, tenantId);
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
              tenantId,
              menuItemId: dbItem.id,
              quantity: -item.quantity,
              type: 'SALE',
              cashierId: cashierId || null,
              reason: 'Vente directe au comptoir'
            }
          });
        }
      }

      // 2. Création de la commande directe comptoir
      const newOrder = await tx.order.create({
        data: {
          tenantId,
          orderType: isPaidLater ? 'TABLE' : 'EXPRESS',
          tableNumber: isPaidLater ? (tableNumber || 0) : 0,
          spaceType: isPaidLater ? 'TABLE' : 'COUNTER',
          destinationService: 'KITCHEN',
          locationDetail: isStaffMeal 
            ? ('REPAS PERSONNEL - ' + employeeName.trim())
            : (isPaidLater 
              ? (tableNumber ? 'TABLE ' + tableNumber : 'SUR PLACE') 
              : 'À EMPORTER - Comptoir 1'),
          customerName: isStaffMeal
            ? ('Employé : ' + employeeName.trim())
            : (customerName || (isPaidLater ? `Table ${tableNumber || 0}` : 'Client Comptoir')),
          employeeId: isStaffMeal ? (employeeId || undefined) : undefined,
          employeeName: isStaffMeal ? employeeName.trim() : undefined,
          status: 'PENDING',
          paymentStatus: isStaffMeal ? 'STAFF_NP' : (isPaidLater ? 'UNPAID' : 'PAID'),
          paymentMethod: paymentMethod || 'CASH',
          totalAmount,
          cashierId: cashierId || undefined,
          cashSessionId: cashSessionId || undefined,
          servedAt: isPaidLater ? null : new Date(),
          items: {
            create: items.map((i: any) => ({
              menuItemId: i.menuItemId,
              name: i.name,
              quantity: i.quantity,
              price: i.price,
            }))
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
        invalidateLiveOrdersCache(tenantId),
        invalidateDashboardStatsCache(tenantId),
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

