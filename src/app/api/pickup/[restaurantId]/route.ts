import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ restaurantId: string }> | { restaurantId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const identifier = resolvedParams.restaurantId;

    if (!identifier) {
      return NextResponse.json({ error: 'Identifiant du restaurant requis' }, { status: 400 });
    }

    // Resolve tenant by ID or subdomain
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: identifier }, { subdomain: identifier }]
      },
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        logoUrl: true,
        bannerUrl: true,
        branding: true,
        currency: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Start of current day (Senegal / GMT)
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // Fetch active and recently served orders
    const orders = await prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        createdAt: { gte: startOfDay },
        status: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] }
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        tableNumber: true,
        customerName: true,
        status: true,
        paymentMethod: true,
        createdAt: true,
        preparedAt: true,
        servedAt: true,
        items: {
          select: {
            id: true,
            name: true,
            quantity: true
          }
        }
      }
    });

    const nowMs = now.getTime();
    const fortyFiveSecondsMs = 45 * 1000;

    const preparingOrders: any[] = [];
    const readyOrders: any[] = [];
    const recentlyServedOrders: any[] = [];

    // Helper to abbreviate dish names to 2-3 words max
    const shortenDishName = (name: string, maxWords = 3): string => {
      const words = (name || '').trim().split(/\s+/);
      return words.slice(0, maxWords).join(' ');
    };

    orders.forEach((o) => {
      const isExpress = o.tableNumber === 0 || o.tableNumber === null;
      const totalItemCount = o.items.reduce((acc, it) => acc + (it.quantity || 1), 0);
      
      const itemSummaries = o.items.map((it) => {
        const shortName = shortenDishName(it.name, 3);
        return (it.quantity || 1) > 1 ? `${it.quantity}x ${shortName}` : shortName;
      });
      const shortItemsSummary = itemSummaries.slice(0, 3).join(', ') + (itemSummaries.length > 3 ? ` +${itemSummaries.length - 3}` : '');

      const formatted = {
        id: o.id,
        shortId: `#${o.id.slice(-4).toUpperCase()}`,
        tableNumber: o.tableNumber ?? 0,
        isExpress,
        status: o.status,
        itemCount: totalItemCount,
        shortSummary: shortItemsSummary || `${totalItemCount} article${totalItemCount > 1 ? 's' : ''}`,
        createdAt: o.createdAt,
        preparedAt: o.preparedAt,
        servedAt: o.servedAt
      };

      if (o.status === 'PENDING' || o.status === 'PREPARING') {
        preparingOrders.push(formatted);
      } else if (o.status === 'READY') {
        readyOrders.push(formatted);
      } else if (o.status === 'SERVED' && o.servedAt) {
        const servedTimeMs = new Date(o.servedAt).getTime();
        if (nowMs - servedTimeMs <= fortyFiveSecondsMs) {
          recentlyServedOrders.push(formatted);
        }
      }
    });

    const brandingObj = typeof tenant.branding === 'object' && tenant.branding !== null ? tenant.branding : {};

    return NextResponse.json({
      success: true,
      restaurant: {
        id: tenant.id,
        name: tenant.businessName,
        subdomain: tenant.subdomain,
        logoUrl: tenant.logoUrl || (brandingObj as any).logoUrl || '/logo.png',
        tagline: (brandingObj as any).tagline || 'Vos commandes en direct au comptoir',
        currency: tenant.currency || 'FCFA'
      },
      preparing: preparingOrders,
      ready: readyOrders,
      recentlyServed: recentlyServedOrders,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Erreur API pickup board:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des commandes' }, { status: 500 });
  }
}
