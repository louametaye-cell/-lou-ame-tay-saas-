import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/tenants/[id]/upgrade
// Surclasser le pack d'un restaurant dans la BDD PostgreSQL Supabase avec Prisma
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { newPlanId, periodMonths } = body;

    if (!newPlanId) {
      return NextResponse.json({ error: 'newPlanId est obligatoire' }, { status: 400 });
    }

    const plan = await (prisma as any).plan.findFirst({
      where: {
        OR: [{ id: newPlanId }, { slug: newPlanId }],
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Pack introuvable' }, { status: 404 });
    }

    const duration = Number(periodMonths) || 1;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + duration);

    const updatedTenant = await (prisma as any).tenant.update({
      where: { id: params.id },
      data: {
        currentPlanId: plan.id,
        subscriptionStatus: 'ACTIVE',
        monthlyFee: plan.price,
        subscriptionExpiresAt: expiry,
      },
      include: { plan: true },
    });

    return NextResponse.json({
      success: true,
      tenant: updatedTenant,
      plan,
      message: `Le restaurant "${updatedTenant.businessName}" est désormais sur le pack ${plan.name} !`,
    });
  } catch (error: any) {
    console.error('Erreur upgrade tenant:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors du changement de pack' }, { status: 500 });
  }
}
