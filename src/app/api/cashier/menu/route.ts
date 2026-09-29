import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

// GET /api/cashier/menu
// Récupère le menu complet avec la gestion des stocks en temps réel pour le POS Tactile
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requis' }, { status: 400 });
    }

    const isAuth = isAuthorizedTenant(req, tenantId);
    if (!isAuth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const categories = await (prisma as any).category.findMany({
      where: { tenantId },
      orderBy: { displayOrder: 'asc' },
      include: {
        items: {
          where: { isAvailable: true },
        }
      }
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Erreur /api/cashier/menu:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération du menu POS' }, { status: 500 });
  }
}
