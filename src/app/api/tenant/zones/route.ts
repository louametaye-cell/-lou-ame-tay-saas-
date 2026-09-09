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

// GET /api/tenant/zones?tenantId=...
export async function GET(req: Request) {
  try {
    const rawTenantId = extractTenantId(req);
    if (!rawTenantId) {
      return NextResponse.json({ error: 'tenantId est obligatoire' }, { status: 400 });
    }

    // Resolve tenant by id or subdomain
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

    const zones = await prisma.zone.findMany({
      where: { tenantId: tenant.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tables: true, orders: true }
        }
      }
    });

    return NextResponse.json({ zones });
  } catch (error) {
    console.error('Erreur récupération des zones:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST /api/tenant/zones
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, tenantId, restaurantId } = body;

    const rawTenantId = extractTenantId(req, tenantId || restaurantId);
    if (!rawTenantId) {
      return NextResponse.json({ error: 'tenantId est obligatoire' }, { status: 400 });
    }

    // Resolve tenant
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

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Le nom de la zone est requis' }, { status: 400 });
    }

    const zone = await prisma.zone.create({
      data: {
        tenantId: tenant.id,
        name: name.trim(),
        type: type || 'TABLES',
      },
    });

    return NextResponse.json({ success: true, zone }, { status: 201 });
  } catch (error) {
    console.error('Erreur création zone:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
