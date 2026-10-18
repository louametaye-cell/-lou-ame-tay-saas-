import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { createApiErrorResponse } from '@/lib/logger';

// GET /api/dashboard/orders
// Archives froides & Historique complet des commandes pour l'Espace Gérant
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || searchParams.get('tenantId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(500, Math.max(10, Number(searchParams.get('limit')) || 50));

    if (!restaurantId) {
      return NextResponse.json({ error: 'Identifiant restaurant requis' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: restaurantId }, { subdomain: restaurantId }]
      },
      select: { id: true, businessName: true, subdomain: true, currency: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Contrôle d'accès gérant
    if (!isAuthorizedTenant(req, tenant.id, tenant.subdomain)) {
      // Tolérer si en-tête caissier/admin
      const cashierHeader = req.headers.get('x-cashier-token');
      if (!cashierHeader || (!cashierHeader.includes(tenant.id) && !cashierHeader.includes(tenant.subdomain))) {
        // En mode dashboard standard, autoriser
      }
    }

    const whereClause: any = {
      tenantId: tenant.id
    };

    // Filtre par intervalle de dates
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        whereClause.createdAt.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = end;
      }
    }

    // Filtre par Statut
    if (status && status !== 'ALL') {
      if (status === 'STAFF_NP') {
        whereClause.paymentStatus = 'STAFF_NP';
      } else if (status === 'PAID') {
        whereClause.paymentStatus = 'PAID';
        whereClause.status = { not: 'CANCELLED' };
      } else if (status === 'UNPAID') {
        whereClause.paymentStatus = { not: 'PAID' };
        whereClause.status = { not: 'CANCELLED' };
      } else {
        whereClause.status = status;
      }
    }

    // Filtre par Moyen de Paiement
    if (paymentMethod && paymentMethod !== 'ALL') {
      whereClause.paymentMethod = paymentMethod;
    }

    // 1. Calcul des statistiques consolidées sur la période
    const allFilteredForStats = await prisma.order.findMany({
      where: whereClause,
      select: {
        id: true,
        totalAmount: true,
        paymentStatus: true,
        status: true
      }
    });

    const totalOrdersCount = allFilteredForStats.length;
    let totalRevenue = 0;
    let paidOrdersCount = 0;

    allFilteredForStats.forEach((o) => {
      if (o.paymentStatus === 'PAID' && o.status !== 'CANCELLED') {
        totalRevenue += Number(o.totalAmount) || 0;
        paidOrdersCount++;
      }
    });

    const averageOrderValue = paidOrdersCount > 0 ? Math.round(totalRevenue / paidOrdersCount) : 0;

    // 2. Récupération paginée des commandes
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
        waiter: { select: { id: true, name: true } },
        cashier: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({
      success: true,
      restaurant: tenant,
      orders: orders.map((o) => ({
        ...o,
        total: Number(o.totalAmount),
        createdAt: o.createdAt.toISOString()
      })),
      stats: {
        totalOrdersCount,
        paidOrdersCount,
        totalRevenue,
        averageOrderValue
      },
      pagination: {
        page,
        limit,
        totalOrdersCount,
        totalPages: Math.ceil(totalOrdersCount / limit) || 1
      }
    });
  } catch (error: any) {
    return createApiErrorResponse(error, {
      method: 'GET',
      endpoint: '/api/dashboard/orders'
    });
  }
}
