import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

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

// GET /api/kitchen/orders
// Récupère les commandes actives de la journée pour l'écran KDS (filtrage strict par station)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('restaurantId') || searchParams.get('tenantId') || searchParams.get('subdomain');
    const stationParam = (searchParams.get('station') || searchParams.get('service') || searchParams.get('destinationService') || 'KITCHEN').toUpperCase();

    let candidate = tenantIdParam;
    if (!candidate) {
      const kdsHeader = req.headers.get('x-kds-token');
      if (kdsHeader && kdsHeader.startsWith('kds_session_')) {
        candidate = kdsHeader.replace('kds_session_', '');
      }
    }

    if (!candidate) {
      return NextResponse.json({ error: 'restaurantId ou tenantId requis' }, { status: 400 });
    }

    const dbTenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
          { id: candidate },
          { subdomain: candidate },
        ],
      },
      select: { id: true, subdomain: true, businessName: true },
    });

    if (!dbTenant) {
      return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 });
    }

    const resolvedTenantId = dbTenant.id;

    // 🔒 Contrôle Paywall : XÉWEUL ou supérieur requis pour KDS
    const { checkTenantFeatureAccess } = await import('@/lib/server-plan-guard');
    const access = await checkTenantFeatureAccess(resolvedTenantId, 'KITCHEN_KDS');
    if (!access.allowed) {
      return NextResponse.json(
        { 
          error: 'L\'accès à l\'écran KDS nécessite la formule XÉWEUL ou supérieure.',
          paywall: access.paywall,
          requiredPlan: access.requiredPlanName,
          currentPlan: access.currentPlanName
        },
        { status: 403 }
      );
    }

    const startOfTodayDakar = getDakarStartOfToday();

    // Clause WHERE stricte pour les commandes actives de la brigade
    const whereClause: any = {
      tenantId: resolvedTenantId,
      createdAt: { gte: startOfTodayDakar },
      status: {
        in: ['PENDING', 'PREPARING', 'READY'],
      },
    };

    // Routage discipliné par poste KDS (Cuisine par défaut, Bar si configuré)
    if (stationParam !== 'ALL') {
      whereClause.destinationService = stationParam === 'BAR' ? 'BAR' : 'KITCHEN';
    }

    const dbOrders = await (prisma as any).order.findMany({
      where: whereClause,
      include: {
        items: true,
        waiter: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' }, // Premier entré, premier sorti (FIFO brigade)
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
        orderOrigin: isRoom ? 'ROOM' : isExpress ? 'COUNTER' : 'TABLE',
        orderDestination: o.destinationService || 'KITCHEN',
        originLabel,
        locationDetail: o.locationDetail || originLabel,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i: any) => ({
          id: i.id,
          menuItemId: i.menuItemId,
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price),
          notes: i.customNotes,
          options: i.selectedExtras,
        })),
      };
    });

    return NextResponse.json({
      success: true,
      orders: mappedOrders,
      station: stationParam,
      restaurantName: dbTenant.businessName,
    });
  } catch (error: any) {
    console.error('Erreur API KDS Orders:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des commandes cuisine' },
      { status: 500 }
    );
  }
}
