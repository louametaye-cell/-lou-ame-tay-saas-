import { NextResponse } from 'next/server';
import { canUseFeature } from '@/lib/checkPlanAccess';

// POST /api/admin/tenants/[id]/check-access
// Tester une restriction de fonctionnalité ou quota en temps réel
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { featureKey, requestedCount, action } = body;

    if (!featureKey) {
      return NextResponse.json({ error: 'featureKey obligatoire' }, { status: 400 });
    }

    const check = canUseFeature(params.id, featureKey, requestedCount);

    if (!check.allowed) {
      return NextResponse.json({
        allowed: false,
        error: check.reason,
        code: check.code,
        currentPlan: check.currentPlanName,
        requiredPlan: check.requiredPlanName,
        limitValue: check.limitValue,
      }, { status: 403 });
    }

    const statusCode = action === 'CREATE_TABLE' || action === 'CREATE_ZONE' ? 201 : 200;

    return NextResponse.json({
      allowed: true,
      currentPlan: check.currentPlanName,
      limitValue: check.limitValue,
      message: `Accès autorisé pour la fonctionnalité "${featureKey}".`,
    }, { status: statusCode });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du test de permission' }, { status: 500 });
  }
}
