import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';
import { executeReleaseTable } from '@/lib/table-release';

function extractTenantId(req: Request, explicitId?: string | null): string | null {
  if (explicitId && explicitId.trim()) return explicitId.trim();
  try {
    const { searchParams } = new URL(req.url);
    const qId = searchParams.get('tenantId') || searchParams.get('restaurantId');
    if (qId && qId.trim()) return qId.trim();
  } catch {}
  return null;
}

/**
 * GET /api/cashier/tables?restaurantId=...&cashierId=...
 * Récupère le plan de salle complet (tables et zones) pour l'espace caisse.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const explicitId = searchParams.get('restaurantId') || searchParams.get('tenantId');
    const cashierId = searchParams.get('cashierId');

    const rawTenantId = extractTenantId(req, explicitId);
    if (!rawTenantId) {
      return NextResponse.json({ error: 'restaurantId ou tenantId est requis' }, { status: 400 });
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

    const isSuperAdmin = isAuthorizedSuperAdmin(req);
    const isTenant = isAuthorizedTenant(req, tenant.id, tenant.subdomain);
    let isCashier = false;

    if (cashierId) {
      const dbCashier = await prisma.cashier.findFirst({
        where: { id: cashierId, tenantId: tenant.id, isActive: true },
      });
      if (dbCashier) isCashier = true;
    }

    // Autoriser la consultation du plan de salle pour les opérateurs de caisse
    if (!isSuperAdmin && !isTenant && !isCashier) {
      // Vérifier le header x-cashier-token si présent
      const headerToken = req.headers.get('x-cashier-token');
      if (headerToken && headerToken.includes(tenant.id)) {
        isCashier = true;
      }
    }

    const [tables, zones] = await Promise.all([
      prisma.table.findMany({
        where: { tenantId: tenant.id, isActive: true },
        include: {
          zone: {
            select: { id: true, name: true },
          },
        },
        orderBy: { tableNumber: 'asc' },
      }),
      prisma.zone.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, name: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      tenant,
      tables,
      zones,
      count: tables.length,
    });
  } catch (error) {
    console.error('Erreur GET /api/cashier/tables:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des tables' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cashier/tables
 * Libération d'une table avec payload JSON { restaurantId, tableNumber, tableId, cashierId }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { restaurantId, tenantId, tableNumber, tableId, cashierId } = body;

    const rawTenantId = extractTenantId(req, tenantId || restaurantId);
    if (!rawTenantId) {
      return NextResponse.json(
        { error: 'restaurantId ou tenantId est requis pour libérer une table' },
        { status: 400 }
      );
    }

    return await executeReleaseTable({
      req,
      tenantIdOrSubdomain: rawTenantId,
      tableId,
      tableNumber,
      cashierId,
    });
  } catch (error) {
    console.error('Erreur POST /api/cashier/tables:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la libération de la table' },
      { status: 500 }
    );
  }
}
