import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { invalidateLiveOrdersCache } from '@/lib/cache';

function extractTenantId(req: Request, explicitId?: string | null): string | null {
  if (explicitId && explicitId.trim()) return explicitId.trim();
  try {
    const { searchParams } = new URL(req.url);
    const qId = searchParams.get('tenantId') || searchParams.get('restaurantId');
    if (qId && qId.trim()) return qId.trim();
  } catch {}
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookiesList = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookiesList) {
      if (c.startsWith('saas_token=')) {
        const val = decodeURIComponent(c.replace('saas_token=', ''));
        if (val.startsWith('resto_session_')) return val.replace('resto_session_', '');
        return val;
      }
    }
  } catch {}
  return null;
}

/**
 * POST /api/tenant/tables/release
 * Remet une table en service (statut 'FREE' et mise à jour de clearedAt)
 * Efface le nom de l'ancien client de l'affichage en direct sans supprimer
 * aucune commande en base (traçabilité et intégrité financière absolues).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { restaurantId, tenantId, tableNumber, tableId } = body;

    const rawTenantId = extractTenantId(req, tenantId || restaurantId);
    if (!rawTenantId) {
      return NextResponse.json(
        { error: 'restaurantId ou tenantId est requis pour libérer une table' },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: rawTenantId }, { subdomain: rawTenantId }],
      },
      select: { id: true, businessName: true, subdomain: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    const num = parseInt(String(tableNumber), 10);
    if (isNaN(num) && !tableId) {
      return NextResponse.json({ error: 'tableNumber ou tableId valide est requis' }, { status: 400 });
    }

    const isStaff = isAuthorizedTenant(req, tenant.id, tenant.subdomain);

    // 🔒 SMART CONTEXTUAL RELEASE & INTÉGRITÉ FINANCIÈRE :
    // Si l'appel ne provient pas du staff (ex: client sur smartphone choisissant "Nouveau repas"),
    // vérifier impérativement qu'aucune commande active ou impayée n'est en cours sur cette table.
    if (!isStaff) {
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
      const activeUnpaidOrders = await prisma.order.findMany({
        where: {
          tenantId: tenant.id,
          tableNumber: num,
          status: { not: 'CANCELLED' },
          createdAt: { gte: fourHoursAgo },
          OR: [
            { status: { in: ['PENDING', 'PREPARING', 'READY'] } },
            { paymentStatus: { not: 'PAID' } },
          ],
        },
        select: { id: true },
      });

      if (activeUnpaidOrders.length > 0) {
        return NextResponse.json(
          { error: 'Une commande est active ou impayée sur cette table. Seul le personnel peut la libérer.' },
          { status: 403 }
        );
      }
    }

    const now = new Date();

    // Trouver ou créer la table pour garantir la persistance
    let table = null;
    if (tableId) {
      table = await prisma.table.findUnique({ where: { id: tableId } });
    }
    if (!table && !isNaN(num)) {
      table = await prisma.table.findFirst({
        where: { tenantId: tenant.id, tableNumber: num },
      });
      if (!table) {
        table = await prisma.table.create({
          data: {
            tenantId: tenant.id,
            tableNumber: num,
            status: 'FREE',
            clearedAt: now,
          },
        });
      }
    }

    if (!table) {
      return NextResponse.json({ error: 'Table introuvable' }, { status: 404 });
    }

    // Mise à jour de la table vers le statut FREE avec clearedAt = now
    const updatedTable = await prisma.table.update({
      where: { id: table.id },
      data: {
        status: 'FREE',
        clearedAt: now,
      },
    });

    // Invalider le cache des commandes live
    try {
      await invalidateLiveOrdersCache(tenant.id);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Table ${updatedTable.tableNumber} remise en service avec succès`,
      table: {
        id: updatedTable.id,
        tableNumber: updatedTable.tableNumber,
        status: 'FREE',
        clearedAt: updatedTable.clearedAt,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la remise en service de la table:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la libération de la table' },
      { status: 500 }
    );
  }
}
