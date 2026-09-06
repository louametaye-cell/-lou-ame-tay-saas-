import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    const dbOrder = await (prisma as any).order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (dbOrder) {
      return NextResponse.json({ order: dbOrder });
    }

    return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commande' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Statut manquant' }, { status: 400 });
    }

    const servedAtDate = status === 'SERVED' ? new Date() : null;

    const updatedOrder = await (prisma as any).order.update({
      where: { id: orderId },
      data: {
        status: status as any,
        servedAt: servedAtDate,
      },
      include: {
        items: true,
      }
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du statut' },
      { status: 500 }
    );
  }
}
