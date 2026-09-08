import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;
    const { status } = await req.json();

    if (!status || !orderId) {
      return NextResponse.json({ error: 'Statut ou ID manquant' }, { status: 400 });
    }

    const order = await (prisma as any).order.findUnique({
      where: { id: orderId },
      select: { id: true, tenantId: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, order.tenantId)) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

    const updated = await (prisma as any).order.update({
      where: { id: orderId },
      data: {
        status: status as any,
        preparedAt: status === 'PREPARING' ? new Date() : undefined,
        servedAt: status === 'SERVED' ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}

export const POST = PATCH;

