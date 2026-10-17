import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const restaurantId = resolvedParams.id;

    if (!isAuthorizedSuperAdmin(req)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: restaurantId }, { subdomain: restaurantId }]
      },
      select: { id: true, businessName: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    const sessions = await prisma.cashSession.findMany({
      where: { tenantId: tenant.id },
      orderBy: { openedAt: 'desc' },
      take: 20,
      include: {
        cashier: {
          select: { id: true, name: true, phone: true, shift: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      sessions
    });
  } catch (error) {
    console.error('Erreur récupération sessions super-admin:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
