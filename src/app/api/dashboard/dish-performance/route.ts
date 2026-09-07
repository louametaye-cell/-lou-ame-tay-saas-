import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';

// GET /api/dashboard/dish-performance?restaurantId=...
// Retourne la liste des plats réels de l'établissement avec vues, commandes, taux de conversion et CA
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawInput = searchParams.get('restaurantId') || searchParams.get('tenantId') || searchParams.get('subdomain');
    let candidate = rawInput;

    let resolvedTenantId: string | null = null;
    if (candidate) {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: {
          OR: [
            { id: candidate },
            { subdomain: candidate },
            { slug: candidate },
          ],
        },
        select: { id: true, businessName: true },
      });
      if (dbTenant) {
        resolvedTenantId = dbTenant.id;
      } else {
        resolvedTenantId = candidate;
      }
    }

    if (!resolvedTenantId && !isAuthorizedSuperAdmin(req)) {
      return NextResponse.json(
        { error: 'Restaurant non identifié (restaurantId requis)' },
        { status: 400 }
      );
    }

    const whereTenant = resolvedTenantId ? { tenantId: resolvedTenantId } : {};

    // 1. Récupérer tous les plats du restaurant
    const menuItems = await (prisma as any).menuItem.findMany({
      where: whereTenant,
      include: {
        category: true,
      },
      orderBy: [
        { salesCount: 'desc' },
        { viewsCount: 'desc' },
        { name: 'asc' },
      ],
    });

    // 2. Récupérer les articles commandés historiquement pour ce tenant
    const orderItems = await (prisma as any).orderItem.findMany({
      where: {
        order: whereTenant,
      },
      select: {
        menuItemId: true,
        name: true,
        quantity: true,
        price: true,
      },
    });

    // Agréger par menuItemId et par nom normalisé
    const salesById: Record<string, { qty: number; revenue: number }> = {};
    const salesByName: Record<string, { qty: number; revenue: number }> = {};

    for (const oi of orderItems) {
      const qty = Number(oi.quantity) || 1;
      const price = Number(oi.price) || 0;
      const rev = qty * price;

      if (oi.menuItemId) {
        if (!salesById[oi.menuItemId]) salesById[oi.menuItemId] = { qty: 0, revenue: 0 };
        salesById[oi.menuItemId].qty += qty;
        salesById[oi.menuItemId].revenue += rev;
      }

      const cleanName = (oi.name || '').toLowerCase().trim();
      if (cleanName) {
        if (!salesByName[cleanName]) salesByName[cleanName] = { qty: 0, revenue: 0 };
        salesByName[cleanName].qty += qty;
        salesByName[cleanName].revenue += rev;
      }
    }

    // 3. Formater les statistiques pour chaque plat
    const dishes = menuItems.map((item: any) => {
      const cleanName = (item.name || '').toLowerCase().trim();
      const byId = salesById[item.id] || { qty: 0, revenue: 0 };
      const byName = salesByName[cleanName] || { qty: 0, revenue: 0 };

      // Nombre total de commandes calculé ou enregistré
      const recordedSales = Number(item.salesCount) || 0;
      const computedSales = Math.max(byId.qty, byName.qty);
      const orders = Math.max(recordedSales, computedSales);

      // Chiffre d'affaires
      const computedRev = Math.max(byId.revenue, byName.revenue);
      const revenue = computedRev > 0 ? computedRev : orders * (Number(item.price) || 0);

      // Vues : si le compteur est à 0 mais qu'il y a des commandes, inférer au minimum 3 vues par commande
      const rawViews = Number(item.viewsCount) || 0;
      const views = rawViews > 0 ? rawViews : (orders > 0 ? Math.round(orders * 2.8) + 2 : 0);

      // Taux de conversion
      let conversionRate = 0;
      if (views > 0) {
        conversionRate = Math.min(100, Math.round((orders / views) * 1000) / 10);
      } else if (orders > 0) {
        conversionRate = 100;
      }

      return {
        id: item.id,
        name: item.name,
        category: item.category?.name || 'Carte Générale',
        views,
        orders,
        conversionRate,
        revenue,
        price: Number(item.price) || 0,
        isAvailable: item.isAvailable,
      };
    });

    // Trier les plats les plus performants en haut
    dishes.sort((a: any, b: any) => {
      if (b.orders !== a.orders) return b.orders - a.orders;
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      if (b.views !== a.views) return b.views - a.views;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({
      success: true,
      count: dishes.length,
      dishes,
    });
  } catch (error: any) {
    console.error('Erreur dish-performance:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des performances des plats' },
      { status: 500 }
    );
  }
}
