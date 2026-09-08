import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/admin/tenants/[id]/upgrade
// Surclasser le pack d'un restaurant dans la BDD PostgreSQL Supabase avec Prisma
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await req.json();
    const { newPlanId, periodMonths, customMonthlyFee, grandfatheredUntil, reviewNote } = body;

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

    const existingTenant = await (prisma as any).tenant.findUnique({
      where: { id },
      select: { branding: true },
    });
    const currentBranding = (existingTenant?.branding as any) || {};

    const updateData: any = {
      currentPlanId: plan.id,
      subscriptionStatus: 'ACTIVE',
      monthlyFee: customMonthlyFee !== undefined && customMonthlyFee !== null ? Number(customMonthlyFee) : plan.price,
      subscriptionExpiresAt: expiry,
    };

    if (grandfatheredUntil) {
      updateData.branding = {
        ...currentBranding,
        grandfathered: {
          isGrandfathered: true,
          guaranteedMonthlyFee: customMonthlyFee !== undefined ? Number(customMonthlyFee) : Number(plan.price),
          catalogPrice: Number(plan.price),
          grandfatheredUntil: new Date(grandfatheredUntil).toISOString(),
          targetPlanSlug: plan.slug,
          reviewNote: reviewNote || `Tarif préférentiel garanti 12 mois à ${Number(customMonthlyFee || plan.price).toLocaleString('fr-FR')} FCFA. Réexamen le ${new Date(grandfatheredUntil).toLocaleDateString('fr-FR')}.`,
        },
      };
    }

    const updatedTenant = await (prisma as any).tenant.update({
      where: { id },
      data: updateData,
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
