import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;

    const waiter = await prisma.waiter.findUnique({
      where: { id },
      select: { tenantId: true },
    });

    if (!waiter) {
      return NextResponse.json({ error: 'Serveur introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, waiter.tenantId)) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

    await prisma.waiter.update({
      where: { id },
      data: { isActive: false }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
