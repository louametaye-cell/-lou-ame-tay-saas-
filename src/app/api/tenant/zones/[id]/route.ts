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

    const zone = await prisma.zone.findUnique({
      where: { id },
      select: { tenantId: true },
    });

    if (!zone) {
      return NextResponse.json({ error: 'Zone introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, zone.tenantId)) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

    await prisma.zone.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
