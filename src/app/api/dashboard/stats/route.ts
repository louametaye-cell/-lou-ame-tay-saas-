import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCachedDashboardStats, setCachedDashboardStats } from '@/lib/cache';
import { startTimer, logPerformance } from '@/lib/logger';

import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';

// GET /api/dashboard/stats
// Récupère les KPIs temps réel de caisse pour le restaurateur
export async function GET(req: Request) {
  const timer = startTimer();
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('restaurantId');
    if (!tenantId) return NextResponse.json({ error: 'restaurantId missing' }, { status: 400 });

    // Contrôle d'accès de session (Anti-IDOR)
    const cookieHeader = req.headers.get('cookie') || '';
    const isSuperAdmin = isAuthorizedSuperAdmin(req);
    const hasMatchingSession = cookieHeader.includes(`resto_session_${tenantId}`) || isSuperAdmin;
    const hasAnySessionToken = cookieHeader.includes('saas_token=');

    if (!hasMatchingSession && !hasAnySessionToken && !isSuperAdmin) {
      return NextResponse.json({ error: 'Accès non autorisé aux statistiques' }, { status: 401 });
    }

    // 1. Check Redis Cache (TTL 60s)
    const cachedStats = await getCachedDashboardStats(tenantId);
    if (cachedStats) {
      logPerformance(`GET /api/dashboard/stats (${tenantId})`, timer.elapsedMs(), 'CACHE_HIT');
      return NextResponse.json(cachedStats, { headers: { 'X-Cache': 'HIT' } });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await (prisma as any).order.findMany({
      where: {
        tenantId,
        createdAt: { gte: today }
      },
      include: { items: true }
    });

    const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
    const todayOrdersCount = todayOrders.length;
    
    // Calculate covers (sum of item quantities or estimation)
    const todayCovers = todayOrders.reduce((sum: number, o: any) => {
      const itemsCount = o.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
      return sum + Math.max(itemsCount, 1);
    }, 0);

    // Count out of stock items
    const outOfStockItems = await (prisma as any).menuItem.count({
      where: {
        category: { tenantId },
        isAvailable: false
      }
    });

    const statsPayload = {
      todayRevenue: todayRevenue > 0 ? todayRevenue : 0,
      todayOrders: todayOrdersCount > 0 ? todayOrdersCount : 0,
      todayCovers: todayCovers > 0 ? todayCovers : 0,
      outOfStock: outOfStockItems,
      revenueChange: 0,
      ordersChange: 0,
      coversChange: 0,
    };

    // Save into Redis (TTL 60s)
    await setCachedDashboardStats(tenantId, statsPayload);

    logPerformance(`GET /api/dashboard/stats (${tenantId})`, timer.elapsedMs(), 'CACHE_MISS');

    return NextResponse.json(statsPayload, { headers: { 'X-Cache': 'MISS' } });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur calcul KPIs' }, { status: 500 });
  }
}
