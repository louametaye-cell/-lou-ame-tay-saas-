import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
// Récupère les commandes actives de la journée pour l'écran Cuisine KDS
// - Ne retourne QUE les commandes contenant des items KITCHEN
// - Ne montre à la Cuisine QUE les items de nourriture
// - Affiche un avertissement "⚠️ Contient des boissons (Voir Bar)" si la commande contient aussi des boissons
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('restaurantId') || searchParams.get('tenantId') || searchParams.get('subdomain');
    const stationParam = (searchParams.get('station') || 'KITCHEN').toUpperCase();

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

    // Recherche des commandes actives (non annulées, non totalement servies)
    const dbOrders = await (prisma as any).order.findMany({
      where: {
        tenantId: resolvedTenantId,
        createdAt: { gte: startOfTodayDakar },
        status: {
          in: ['PENDING', 'PREPARING'],
        },
      },
      include: {
        items: true,
        waiter: { select: { id: true, name: true } },
        zone: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' }, // FIFO brigade
      take: 60,
    });

    const targetStation = stationParam === 'BAR' ? 'BAR' : 'KITCHEN';

    const mappedOrders: any[] = [];

    for (const o of dbOrders) {
      const allItems = o.items || [];
      // Filtrer les items destinés à la station concernée
      const stationItems = allItems.filter((i: any) => {
        const itemStation = (i.station || 'KITCHEN').toUpperCase();
        return itemStation === targetStation && i.status !== 'SERVED';
      });

      // Si la commande n'a aucun item actif pour cette station, on l'ignore pour cet écran
      if (stationItems.length === 0) continue;

      // Détecter la présence d'items de l'autre station
      const hasOtherStationItems = allItems.some((i: any) => {
        const itemStation = (i.station || 'KITCHEN').toUpperCase();
        return itemStation !== targetStation;
      });

      const isExpress = o.orderType === 'EXPRESS' || o.orderType === 'TAKEAWAY' || o.tableNumber === 0;
      const isRoom = o.spaceType === 'ROOM' || (o.locationDetail && o.locationDetail.toLowerCase().includes('chambre'));
      
      let originLabel = `Table ${o.tableNumber < 10 ? `0${o.tableNumber}` : o.tableNumber}`;
      if (isRoom) {
        originLabel = o.locationDetail || `Chambre ${o.tableNumber} - Room Service`;
      } else if (isExpress) {
        originLabel = 'À Emporter / Comptoir';
      }

      mappedOrders.push({
        id: o.id,
        tenantId: o.tenantId,
        tableNumber: o.tableNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        paymentMethod: o.paymentMethod,
        customerName: o.customerName,
        customerNote: o.customerNote,
        total: Number(o.totalAmount ?? o.total ?? 0),
        totalAmount: Number(o.totalAmount ?? o.total ?? 0),
        orderType: o.orderType || (isExpress ? 'TAKEAWAY' : 'TABLE'),
        orderOrigin: isRoom ? 'ROOM' : isExpress ? 'COUNTER' : 'TABLE',
        originLabel,
        locationDetail: o.locationDetail || originLabel,
        createdAt: o.createdAt.toISOString(),
        station: targetStation,
        hasBarItems: targetStation === 'KITCHEN' && hasOtherStationItems,
        hasKitchenItems: targetStation === 'BAR' && hasOtherStationItems,
        crossStationWarning: hasOtherStationItems 
          ? (targetStation === 'KITCHEN' ? '⚠️ Contient des boissons (Voir Bar)' : '⚠️ Contient de la nourriture (Voir Cuisine)')
          : null,
        // La Cuisine ou le Bar ne voit QUE ses propres articles pour ne pas encombrer l'écran
        items: stationItems.map((i: any) => ({
          id: i.id,
          menuItemId: i.menuItemId,
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price),
          notes: i.customNotes,
          options: i.selectedExtras,
          station: i.station || targetStation,
          status: i.status || 'PENDING',
        })),
        allItemsCount: allItems.length,
        stationItemsCount: stationItems.length,
      });
    }

    return NextResponse.json({
      success: true,
      orders: mappedOrders,
      station: targetStation,
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
