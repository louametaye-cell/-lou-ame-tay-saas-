import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/super-admin/restaurants/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = await (prisma as any).tenant.findUnique({
      where: { id: params.id },
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
  params: { id: string }
) {
  try {
    const body = await req.json();

    let subscriptionUpdateData: any = undefined;

    if (body.action === 'extend-subscription' && body.additionalMonths) {
      const currentResto = await (prisma as any).tenant.findUnique({
        where: { id: params.id }
      });
      if (currentResto) {
        const currentEnd = currentResto.subscriptionExpiresAt
          ? new Date(currentResto.subscriptionExpiresAt)
          : new Date();
        const baseDate = currentEnd.getTime() > Date.now() ? currentEnd : new Date();
        baseDate.setMonth(baseDate.getMonth() + Number(body.additionalMonths));
        subscriptionUpdateData = {
          subscriptionExpiresAt: baseDate,
          subscriptionStatus: 'ACTIVE'
        };
      }
    }

    const updated = await (prisma as any).tenant.update({
      where: { id: params.id },
      data: {
        businessName: body.name,
        ownerName: body.ownerName,
        phone: body.phone,
        address: body.address,
        subscriptionStatus: body.isActive === false ? 'SUSPENDED' : (body.status || undefined),
        ...subscriptionUpdateData,
      },
      include: {
        plan: true
      }
    });

    return NextResponse.json({ restaurant: updated, message: 'Restaurant mis à jour avec succès' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return handleUpdate(req, params);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  return handleUpdate(req, params);
}

// DELETE /api/super-admin/restaurants/[id] - Suppression
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await (prisma as any).tenant.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true, message: 'Restaurant supprimé définitivement' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
