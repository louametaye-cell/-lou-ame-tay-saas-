import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { tableNumber: string } }
) {
  try {
    const tableNum = Number(params.tableNumber);
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('restaurantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'restaurantId is required' }, { status: 400 });
    }

    const dbOrders = await (prisma as any).order.findMany({
      where: {
        tenantId,
        tableNumber: tableNum,
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ orders: dbOrders || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commandes table' }, { status: 500 });
  }
}