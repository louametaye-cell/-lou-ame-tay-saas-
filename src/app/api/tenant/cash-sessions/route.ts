import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || searchParams.get('restaurantId');
    const status = searchParams.get('status');
    const cashierId = searchParams.get('cashierId');

    if (!tenantId) {
      return NextResponse.json({ error: 'Identifiant du restaurant requis' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantId }, { subdomain: tenantId }]
      },
      select: { id: true, businessName: true, currency: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // 🔒 CONTRÔLE D'ACCÈS : Seul le gérant de cet établissement ou Super-Admin peut voir les données financières de caisse
    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Session gérant requise pour consulter les clôtures de caisse' },
        { status: 401 }
      );
    }

    const whereClause: any = {
      tenantId: tenant.id
    };

    if (status && ['OPEN', 'CLOSED'].includes(status)) {
      whereClause.status = status;
    }

    if (cashierId) {
      whereClause.cashierId = cashierId;
    }

    const sessions = await prisma.cashSession.findMany({
      where: whereClause,
      orderBy: { openedAt: 'desc' },
      take: 50,
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
            phone: true,
            shift: true
          }
        },
        _count: {
          select: { orders: true }
        }
      }
    });

    // Summary statistics across these sessions
    const totalRevenueSum = sessions.reduce((acc, s) => acc + (Number(s.totalRevenue) || 0), 0);
    const totalOrdersSum = sessions.reduce((acc, s) => acc + (s.orderCount || 0), 0);
    const totalDiscrepancies = sessions.filter((s) => s.cashDiscrepancy !== null && Number(s.cashDiscrepancy) !== 0).length;

    return NextResponse.json({
      success: true,
      sessions,
      summary: {
        totalRevenue: totalRevenueSum,
        totalOrders: totalOrdersSum,
        sessionsCount: sessions.length,
        discrepanciesCount: totalDiscrepancies
      }
    });
  } catch (error) {
    console.error('Erreur historique des sessions de caisse:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération de l\'historique des caisses' }, { status: 500 });
  }
}
