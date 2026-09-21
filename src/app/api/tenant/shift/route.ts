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

/**
 * GET /api/tenant/shift?restaurantId=...
 * Récupère le shift actif et l'attribution des tables depuis la base de données centrale
 * Permet au gérant de voir en temps réel n'importe où dans le monde la brigade en salle.
 */
export async function GET(req: Request) {
  try {
    const rawTenantId = extractTenantId(req);
    if (!rawTenantId) {
      return NextResponse.json({ error: 'restaurantId ou tenantId requis' }, { status: 400 });
    }

    const tenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [{ id: rawTenantId }, { subdomain: rawTenantId }],
      },
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        branding: true,
        waiters: {
          where: { isActive: true },
          select: { id: true, name: true, phone: true, qrCodeSlug: true },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    const brandingData = (tenant.branding as any) || {};
    const serverShift = brandingData.serverShift || {};

    let members = serverShift.members || [];
    let tableServerMap = serverShift.tableServerMap || {};

    // Si aucun shift n'a été configuré mais que des serveurs existent en BDD,
    // on initialise les membres à partir des serveurs réels enregistrés
    if (members.length === 0 && tenant.waiters && tenant.waiters.length > 0) {
      members = tenant.waiters.map((w: any) => ({
        id: w.id,
        name: w.name,
        phone: w.phone || undefined,
        shiftHours: '11h00 - 23h30 (Journée Complète)',
        periodType: 'FULL_DAY',
        status: 'ACTIVE',
        assignedTables: [],
      }));
    }

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      members,
      tableServerMap,
      updatedAt: serverShift.updatedAt || null,
    });
  } catch (error) {
    console.error('Erreur récupération shift serveur Cloud:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération du shift' }, { status: 500 });
  }
}

/**
 * POST /api/tenant/shift
 * Enregistre le shift actif (membres, horaires, statut, tables assignées)
 * directement dans la base de données PostgreSQL Cloud
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { restaurantId, tenantId, members, tableServerMap } = body;

    const rawTenantId = extractTenantId(req, tenantId || restaurantId);
    if (!rawTenantId) {
      return NextResponse.json({ error: 'restaurantId ou tenantId requis' }, { status: 400 });
    }

    const tenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [{ id: rawTenantId }, { subdomain: rawTenantId }],
      },
      select: { id: true, businessName: true, subdomain: true, branding: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenant(req, tenant.id, tenant.subdomain)) {
      return NextResponse.json({ error: 'Accès non autorisé pour cet établissement' }, { status: 401 });
    }

    const currentBranding = (tenant.branding as any) || {};
    const updatedBranding = {
      ...currentBranding,
      serverShift: {
        members: Array.isArray(members) ? members : [],
        tableServerMap: typeof tableServerMap === 'object' && tableServerMap !== null ? tableServerMap : {},
        updatedAt: new Date().toISOString(),
      },
    };

    await (prisma as any).tenant.update({
      where: { id: tenant.id },
      data: { branding: updatedBranding },
    });

    return NextResponse.json({
      success: true,
      tenantId: tenant.id,
      members: updatedBranding.serverShift.members,
      tableServerMap: updatedBranding.serverShift.tableServerMap,
      updatedAt: updatedBranding.serverShift.updatedAt,
    });
  } catch (error) {
    console.error('Erreur sauvegarde shift Cloud:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la sauvegarde du shift' }, { status: 500 });
  }
}
