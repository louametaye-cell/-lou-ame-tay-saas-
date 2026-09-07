import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { orderId } = resolvedParams;

    const dbOrder = await (prisma as any).order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (dbOrder) {
      return NextResponse.json({
        order: {
          ...dbOrder,
          total: Number(dbOrder.totalAmount ?? dbOrder.total ?? 0),
          totalAmount: Number(dbOrder.totalAmount ?? dbOrder.total ?? 0),
          orderType: (dbOrder.tableNumber === 0 || dbOrder.tableNumber === null || !dbOrder.tableNumber) ? 'EXPRESS' : 'TABLE',
        }
      });
    }

    return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commande' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const { orderId } = resolvedParams;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Statut manquant' }, { status: 400 });
    }

    const updatePayload: any = { status: status as any };
    if (status === 'SERVED') {
      updatePayload.servedAt = new Date();
    } else if (status === 'PREPARING') {
      updatePayload.preparedAt = new Date();
    }

    const updatedOrder = await (prisma as any).order.update({
      where: { id: orderId },
      data: updatePayload,
      include: {
        items: true,
      }
    });

    return NextResponse.json({
      order: {
        ...updatedOrder,
        total: Number(updatedOrder.totalAmount ?? updatedOrder.total ?? 0),
        totalAmount: Number(updatedOrder.totalAmount ?? updatedOrder.total ?? 0),
        orderType: (updatedOrder.tableNumber === 0 || updatedOrder.tableNumber === null || !updatedOrder.tableNumber) ? 'EXPRESS' : 'TABLE',
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}

export const POST = PATCH;
