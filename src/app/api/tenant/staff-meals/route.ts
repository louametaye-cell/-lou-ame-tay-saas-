import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

// GET /api/tenant/staff-meals
// Récupère les repas du personnel (bons "NP") pour un établissement et un mois donnés
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get('restaurantId') || searchParams.get('tenantId');
    const monthQuery = searchParams.get('month'); // Format 'YYYY-MM'

    if (!rawId) {
      return NextResponse.json({ error: 'restaurantId ou tenantId requis' }, { status: 400 });
    }

    const tenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [{ id: rawId }, { subdomain: rawId }]
      },
      select: { id: true, businessName: true, subdomain: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    const isAuth = isAuthorizedTenant(req, tenant.id, tenant.subdomain);
    if (!isAuth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Filtre de date pour le mois sélectionné
    let dateFilter: any = {};
    if (monthQuery && /^\d{4}-\d{2}$/.test(monthQuery)) {
      const [year, month] = monthQuery.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      dateFilter = {
        createdAt: {
          gte: startDate,
          lt: endDate,
        }
      };
    }

    // Récupérer toutes les commandes NP du mois
    const orders = await (prisma as any).order.findMany({
      where: {
        tenantId: tenant.id,
        status: { not: 'CANCELLED' },
        OR: [
          { paymentMethod: 'STAFF_MEAL' },
          { paymentStatus: 'STAFF_NP' }
        ],
        ...dateFilter
      },
      include: {
        items: true,
        cashier: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Agrégation par employé
    const employeeMap = new Map<string, {
      employeeName: string;
      orderCount: number;
      totalAmount: number;
      orders: any[];
    }>();

    let grandTotal = 0;

    for (const order of orders) {
      const empName = order.employeeName || (order.customerName ? order.customerName.replace('Employé : ', '') : 'Personnel Non Spécifié');
      const orderAmount = Number(order.totalAmount);
      grandTotal += orderAmount;

      if (!employeeMap.has(empName)) {
        employeeMap.set(empName, {
          employeeName: empName,
          orderCount: 0,
          totalAmount: 0,
          orders: []
        });
      }

      const current = employeeMap.get(empName)!;
      current.orderCount += 1;
      current.totalAmount += orderAmount;
      current.orders.push({
        id: order.id,
        createdAt: order.createdAt,
        totalAmount: orderAmount,
        cashierName: order.cashier?.name || 'Caisse',
        items: order.items.map((i: any) => ({
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price)
        }))
      });
    }

    const summary = Array.from(employeeMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);

    return NextResponse.json({
      success: true,
      restaurant: {
        id: tenant.id,
        name: tenant.businessName,
        subdomain: tenant.subdomain
      },
      period: monthQuery || 'Tous',
      totalMeals: orders.length,
      grandTotal,
      uniqueEmployees: summary.length,
      summary,
      orders
    });
  } catch (error: any) {
    console.error('Erreur GET /api/tenant/staff-meals:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
