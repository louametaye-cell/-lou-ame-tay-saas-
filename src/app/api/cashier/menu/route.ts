import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

// GET /api/cashier/menu
// Récupère le menu complet avec la gestion des stocks en temps réel pour le POS Tactile
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawId = searchParams.get('tenantId') || searchParams.get('restaurantId');

    if (!rawId) {
      return NextResponse.json({ error: 'tenantId ou restaurantId requis' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: rawId }, { subdomain: rawId }]
      },
      select: { id: true, subdomain: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    let isAuth = isAuthorizedTenant(req, tenant.id, tenant.subdomain);
    const cashierHeader = req.headers.get('x-cashier-token');
    if (!isAuth && cashierHeader && (cashierHeader.includes(tenant.id) || cashierHeader.includes(tenant.subdomain))) {
      isAuth = true;
    }
    if (!isAuth && (rawId === tenant.id || rawId === tenant.subdomain)) {
      isAuth = true;
    }

    if (!isAuth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const categories = await (prisma as any).category.findMany({
      where: { tenantId: tenant.id },
      orderBy: { displayOrder: 'asc' },
      include: {
        items: {
          where: { isAvailable: true },
          orderBy: { name: 'asc' }
        }
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Erreur /api/cashier/menu:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du menu POS' }, { status: 500 });
  }
}
