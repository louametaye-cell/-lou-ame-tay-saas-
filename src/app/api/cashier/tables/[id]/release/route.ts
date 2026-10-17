import { NextResponse } from 'next/server';
import { executeReleaseTable } from '@/lib/table-release';

interface RouteContext {
  params: {
    id: string;
  };
}

function extractTenantId(req: Request, explicitId?: string | null): string | null {
  if (explicitId && explicitId.trim()) return explicitId.trim();
  try {
    const { searchParams } = new URL(req.url);
    const qId = searchParams.get('tenantId') || searchParams.get('restaurantId');
    if (qId && qId.trim()) return qId.trim();
  } catch {}
  return null;
}

async function handleRelease(req: Request, context: RouteContext) {
  try {
    const tableIdOrNumber = context.params.id;
    const body = await req.json().catch(() => ({}));
    const { restaurantId, tenantId, cashierId } = body;

    const rawTenantId = extractTenantId(req, tenantId || restaurantId);
    if (!rawTenantId) {
      return NextResponse.json(
        { error: 'restaurantId ou tenantId est requis pour libérer une table' },
        { status: 400 }
      );
    }

    const isNumeric = /^\d+$/.test(tableIdOrNumber);

    return await executeReleaseTable({
      req,
      tenantIdOrSubdomain: rawTenantId,
      tableId: !isNumeric ? tableIdOrNumber : undefined,
      tableNumber: isNumeric ? parseInt(tableIdOrNumber, 10) : undefined,
      cashierId,
    });
  } catch (error) {
    console.error('Erreur libération table /api/cashier/tables/[id]/release:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la libération de la table' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, context: RouteContext) {
  return handleRelease(req, context);
}

export async function PATCH(req: Request, context: RouteContext) {
  return handleRelease(req, context);
}
