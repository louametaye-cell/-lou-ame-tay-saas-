import { NextResponse } from 'next/server';
import { executeReleaseTable } from '@/lib/table-release';

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
    console.error('Erreur lors de la remise en service de la table (/api/tenant/tables/release):', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la libération de la table' },
      { status: 500 }
    );
  }
}
