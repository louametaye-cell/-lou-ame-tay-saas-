import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';
import { prisma } from '@/lib/prisma';

// GET /api/super-admin/restaurants/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const restaurant = orderStorage.getRestaurantById(params.id);
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

    // Support action: 'extend-subscription'
    if (body.action === 'extend-subscription' && body.additionalMonths) {
      const currentResto = orderStorage.getRestaurantById(params.id);
      if (currentResto) {
        const currentEnd = currentResto.subscription?.endDate
          ? new Date(currentResto.subscription.endDate)
          : new Date();
        const baseDate = currentEnd.getTime() > Date.now() ? currentEnd : new Date();
        baseDate.setMonth(baseDate.getMonth() + Number(body.additionalMonths));
        body.endDate = baseDate.toISOString();
        body.status = 'ACTIVE';
      }
    }

    const updated = orderStorage.updateRestaurant(params.id, body);

    if (!updated) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    // Try DB update
    try {
      await (prisma as any).restaurant?.update({
        where: { id: params.id },
        data: {
          name: body.name,
          ownerName: body.ownerName,
          phone: body.phone,
          address: body.address,
          tableCount: body.tableCount ? Number(body.tableCount) : undefined,
          isActive: body.isActive,
          subscription: body.plan || body.price || body.status || body.endDate ? {
            update: {
              plan: body.plan,
              price: body.price ? Number(body.price) : undefined,
              status: body.status,
              endDate: body.endDate ? new Date(body.endDate) : undefined,
            },
          } : undefined,
        },
      });
    } catch (e) {
      // Fallback
    }

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
    const success = orderStorage.deleteRestaurant(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 });
    }

    try {
      await (prisma as any).restaurant?.delete({
        where: { id: params.id },
      });
    } catch (e) {
      // Fallback
    }

    return NextResponse.json({ success: true, message: 'Restaurant supprimé définitivement' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
