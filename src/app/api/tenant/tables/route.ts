import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

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

// GET /api/tenant/tables?restaurantId=...
export async function GET(req: Request) {
  try {
    const rawTenantId = extractTenantId(req);
    if (!rawTenantId) {
      return NextResponse.json({ error: 'tenantId ou restaurantId est obligatoire' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: rawTenantId }, { subdomain: rawTenantId }]
      },
      select: { id: true, businessName: true, subdomain: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

    const [tables, zones] = await Promise.all([
      prisma.table.findMany({
        where: { tenantId: tenant.id, isActive: true },
        include: {
          zone: {
            select: { id: true, name: true }
          }
        },
        orderBy: { tableNumber: 'asc' }
      }),
      prisma.zone.findMany({
        where: { tenantId: tenant.id },
        select: { id: true, name: true },
        orderBy: { createdAt: 'asc' }
      })
    ]);

    return NextResponse.json({
      success: true,
      tenant,
      tables,
      zones,
      count: tables.length
    });
  } catch (error) {
    console.error('Erreur récupération tables:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des tables' }, { status: 500 });
  }
}

// POST /api/tenant/tables
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, tenantId, tableNumber, label, zoneId } = body;

    const rawTenantId = extractTenantId(req, tenantId || restaurantId);
    if (!rawTenantId) {
      return NextResponse.json({ error: 'tenantId est obligatoire' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: rawTenantId }, { subdomain: rawTenantId }]
      },
      select: { id: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

    const num = Number(tableNumber);
    if (!num || isNaN(num) || num <= 0) {
      return NextResponse.json({ error: 'Numéro de table invalide' }, { status: 400 });
    }

    // Vérifier si la table existe déjà pour ce tenant et zone
    const existing = await prisma.table.findFirst({
      where: {
        tenantId: tenant.id,
        tableNumber: num,
        zoneId: zoneId || null,
      }
    });

    if (existing) {
      if (!existing.isActive) {
        // Réactiver
        const updated = await prisma.table.update({
          where: { id: existing.id },
          data: { isActive: true, label: label || existing.label }
        });
        return NextResponse.json({ success: true, table: updated, message: 'Table réactivée' });
      }
      return NextResponse.json({ error: `La table ${num} existe déjà dans cette zone` }, { status: 409 });
    }

    const newTable = await prisma.table.create({
      data: {
        tenantId: tenant.id,
        tableNumber: num,
        label: label?.trim() || `Table ${num}`,
        zoneId: zoneId || undefined,
        isActive: true,
      },
      include: {
        zone: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ success: true, table: newTable }, { status: 201 });
  } catch (error) {
    console.error('Erreur création table:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la création de la table' }, { status: 500 });
  }
}
