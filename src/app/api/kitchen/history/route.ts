import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

// Calcul précis du début de journée dans le fuseau horaire sénégalais (Africa/Dakar - UTC+0)
function getDakarStartOfToday(): Date {
  const now = new Date();
  const dakarDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Dakar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // Produit "YYYY-MM-DD"
  return new Date(`${dakarDateStr}T00:00:00.000Z`);
}

// GET /api/kitchen/history
// Récupère l'historique complet des commandes traitées aujourd'hui (PREPARING, READY, SERVED) pour la brigade KDS
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('restaurantId') || searchParams.get('tenantId') || searchParams.get('subdomain');
    const format = searchParams.get('format');
    const stationParam = searchParams.get('station') || searchParams.get('service') || searchParams.get('destinationService');

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

    // Résolution robuste par ID ou par sous-domaine
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

    // 🔒 Contrôle Paywall : L'historique KDS nécessite XÉWEUL ou supérieur
    const { checkTenantFeatureAccess } = await import('@/lib/server-plan-guard');
    const access = await checkTenantFeatureAccess(resolvedTenantId, 'KITCHEN_KDS');
    if (!access.allowed) {
      return NextResponse.json(
        { 
          error: 'L\'accès à l\'historique cuisine nécessite la formule XÉWEUL ou supérieure.',
          paywall: access.paywall,
          requiredPlan: access.requiredPlanName,
          currentPlan: access.currentPlanName
        },
        { status: 403 }
      );
    }

    // Début de journée Dakar (GMT / UTC+0)
    const startOfTodayDakar = getDakarStartOfToday();

    // Filtre non-bloquant : toutes les commandes traitées du jour (PREPARING, READY, SERVED)
    const whereClause: any = {
      tenantId: resolvedTenantId,
      createdAt: { gte: startOfTodayDakar },
      status: {
        in: ['PREPARING', 'READY', 'SERVED'],
      },
    };

    // Si station spécifique configurée (ex: KITCHEN ou BAR)
    if (stationParam && stationParam.toUpperCase() !== 'ALL') {
      whereClause.destinationService = stationParam.toUpperCase();
    }

    const dbOrders = await (prisma as any).order.findMany({
      where: whereClause,
      include: {
        items: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const memoryServedToday = dbOrders.map((o: any) => {
      // Détermination claire de l'origine
      const isExpress = o.orderType === 'EXPRESS' || o.orderType === 'TAKEAWAY' || o.tableNumber === 0;
      const isRoom = o.spaceType === 'ROOM' || (o.locationDetail && o.locationDetail.toLowerCase().includes('chambre'));
      
      let originLabel = `Table ${o.tableNumber < 10 ? `0${o.tableNumber}` : o.tableNumber}`;
      if (isRoom) {
        originLabel = o.locationDetail || `Chambre ${o.tableNumber} - Room Service`;
      } else if (isExpress) {
        originLabel = 'À Emporter / Comptoir';
      }

      return {
        id: o.id,
        tableNumber: o.tableNumber,
        customerNote: o.customerNote,
        note: o.customerNote,
        customerName: o.customerName,
        employeeName: o.employeeName,
        restaurantId: o.tenantId,
        status: o.status,
        total: Number(o.totalAmount ?? o.total ?? 0),
        orderType: o.orderType,
        spaceType: o.spaceType,
        destinationService: o.destinationService,
        orderOrigin: isRoom ? 'ROOM' : isExpress ? 'COUNTER' : 'TABLE',
        orderDestination: o.destinationService || 'KITCHEN',
        locationDetail: o.locationDetail || originLabel,
        originLabel,
        servedAt: o.servedAt ? o.servedAt.toISOString() : null,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i: any) => ({
          id: i.id,
          menuItemId: i.menuItemId,
          name: i.name,
          quantity: i.quantity,
          price: Number(i.price),
          notes: i.customNotes,
        })),
      };
    });

    const dishesCount = memoryServedToday.reduce(
      (sum: number, order: any) => sum + order.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0),
      0
    );

    // CSV Export (Zéro donnée financière - Registre de production cuisine)
    if (format === 'csv') {
      const headers = ['ID Commande', 'Origine / Espace', 'Heure Commande', 'Heure Servie', 'Plats', 'Remarque', 'Nombre de Plats', 'Statut'];
      const rows = memoryServedToday.map((o: any) => {
        const itemsSummary = o.items.map((i: any) => `${i.quantity}x ${i.name || 'Plat'}`).join(' | ');
        const totalItems = o.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);
        const orderTime = new Date(o.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const servedTime = o.servedAt ? new Date(o.servedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'En cours';
        return [
          `"${o.id}"`,
          `"${o.originLabel}"`,
          `"${orderTime}"`,
          `"${servedTime}"`,
          `"${itemsSummary.replace(/"/g, '""')}"`,
          `"${(o.customerNote || o.note || '').replace(/"/g, '""')}"`,
          totalItems,
          `"${o.status}"`,
        ].join(';');
      });

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="historique_kds_${dbTenant.subdomain}_${startOfTodayDakar.toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      orders: memoryServedToday, 
      dishesCount, 
      ordersCount: memoryServedToday.length 
    });
  } catch (error: any) {
    console.error('Erreur historique KDS:', error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'historique cuisine" },
      { status: 500 }
    );
  }
}
