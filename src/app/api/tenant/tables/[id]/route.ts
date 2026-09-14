import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const tableId = resolvedParams.id;

    if (!tableId) {
      return NextResponse.json({ error: 'Identifiant de table manquant' }, { status: 400 });
    }

    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { id: true, tenantId: true }
    });

    if (!table) {
      return NextResponse.json({ error: 'Table introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, table.tenantId)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    // Soft delete (désactiver) pour préserver l'historique des commandes
    await prisma.table.update({
      where: { id: tableId },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true, message: 'Table désactivée avec succès' });
  } catch (error) {
    console.error('Erreur suppression table:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de la table' }, { status: 500 });
  }
}
