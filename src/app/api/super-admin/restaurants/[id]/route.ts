import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

// GET /api/super-admin/restaurants/[id]
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const restaurant = await (prisma as any).tenant.findUnique({
      where: { id: resolvedParams.id },
      include: {
        plan: true,
      }
    });
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }
    return NextResponse.json({ restaurant });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PUT / PATCH /api/super-admin/restaurants/[id] - Modification complète
async function handleUpdate(
  req: Request,
  paramsInput: Promise<{ id: string }> | { id: string }
) {
  try {
    const resolvedParams = await Promise.resolve(paramsInput);
    const body = await req.json();

    let subscriptionUpdateData: any = {};

    if (body.action === 'extend-subscription' && body.additionalMonths) {
      const currentResto = await (prisma as any).tenant.findUnique({
        where: { id: resolvedParams.id }
      });
      if (currentResto) {
        const currentEnd = currentResto.subscriptionExpiresAt
          ? new Date(currentResto.subscriptionExpiresAt)
          : new Date();
        const baseDate = currentEnd.getTime() > Date.now() ? currentEnd : new Date();
        baseDate.setMonth(baseDate.getMonth() + Number(body.additionalMonths));
        subscriptionUpdateData.subscriptionExpiresAt = baseDate;
        subscriptionUpdateData.subscriptionStatus = 'ACTIVE';
      }
    } else if (body.endDate) {
      subscriptionUpdateData.subscriptionExpiresAt = new Date(body.endDate);
    }

    if (body.plan) {
      const targetPlan = await (prisma as any).plan.findFirst({
        where: {
          OR: [
            { id: body.plan },
            { slug: body.plan.toLowerCase().replace(/_/g, '-') },
            { name: { contains: body.plan, mode: 'insensitive' } }
          ]
        }
      });
      if (targetPlan) {
        subscriptionUpdateData.currentPlanId = targetPlan.id;
      }
    }

    if (body.price !== undefined && body.price !== null) {
      subscriptionUpdateData.monthlyFee = Number(body.price);
    }

    if (body.status) {
      subscriptionUpdateData.subscriptionStatus = body.status;
    }

    if (body.isActive === false) {
      subscriptionUpdateData.subscriptionStatus = 'SUSPENDED';
    }

    let brandingUpdateData: any = {};
    if (body.displaySettings !== undefined) {
      const currentResto = await (prisma as any).tenant.findUnique({
        where: { id: resolvedParams.id },
        select: { branding: true, subdomain: true }
      });
      const currentBranding = (currentResto?.branding as any) || {};
      brandingUpdateData.branding = {
        ...currentBranding,
        displaySettings: body.displaySettings,
      };
    }

    const updated = await (prisma as any).tenant.update({
      where: { id: resolvedParams.id },
      data: {
        businessName: body.name || undefined,
        ownerName: body.ownerName !== undefined ? body.ownerName : undefined,
        phone: body.phone || undefined,
        address: body.address !== undefined ? body.address : undefined,
        ...subscriptionUpdateData,
        ...brandingUpdateData,
      },
      include: {
        plan: true
      }
    });

    if (body.displaySettings !== undefined) {
      try {
        await redis.del(`display:${updated.subdomain.toLowerCase()}`);
        await redis.del(`display:${updated.id.toLowerCase()}`);
      } catch (e) {}
    }

    return NextResponse.json({ restaurant: updated, message: 'Restaurant mis à jour avec succès dans la BDD' });
  } catch (error: any) {
    console.error('Erreur update restaurant:', error);
    return NextResponse.json({ error: error?.message || 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  return handleUpdate(req, params);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  return handleUpdate(req, params);
}

// DELETE /api/super-admin/restaurants/[id] - Suppression
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    await (prisma as any).tenant.delete({
      where: { id: resolvedParams.id },
    });
    return NextResponse.json({ success: true, message: 'Restaurant supprimé définitivement' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
