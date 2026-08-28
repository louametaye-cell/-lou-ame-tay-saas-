import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';

// POST /api/admin/tenants/[id]/upgrade
// Changer ou surclasser le pack d'un restaurant (ex: Starter -> Pro -> Premium)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { newPlanId, periodMonths } = body;

    if (!newPlanId) {
      return NextResponse.json({ error: 'newPlanId est obligatoire' }, { status: 400 });
    }

    const upgraded = saasStorage.upgradeTenantPlan(params.id, newPlanId, periodMonths || 1);
    if (!upgraded) {
      return NextResponse.json({ error: 'Restaurant ou pack introuvable' }, { status: 404 });
    }

    const plan = saasStorage.getPlanById(newPlanId);

    return NextResponse.json({
      success: true,
      tenant: upgraded,
      plan,
      message: `Le restaurant "${upgraded.businessName}" est désormais sur le pack ${plan?.name || newPlanId} !`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du changement de pack' }, { status: 500 });
  }
}
