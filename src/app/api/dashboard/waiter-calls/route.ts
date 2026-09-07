import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');

    let tenantFilter: any = {};
    if (restaurantId) {
      const tenant = await (prisma as any).tenant.findFirst({
        where: {
          OR: [{ id: restaurantId }, { subdomain: restaurantId }],
        },
        select: { id: true },
      });
      if (tenant) {
        tenantFilter.tenantId = tenant.id;
      }
    }

    const calls = await (prisma as any).waiterCall.findMany({
      where: {
        ...tenantFilter,
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      calls: calls.map((c: any) => ({
        id: c.id,
        tableNumber: c.tableNumber,
        status: c.status,
        createdAt: c.createdAt,
        reason: 'Assistance demandée',
      })),
    });
  } catch (error: any) {
    console.error('Erreur GET /api/dashboard/waiter-calls:', error);
    return NextResponse.json({ success: false, calls: [] }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { callId } = body;

    if (!callId) {
      return NextResponse.json({ error: 'callId manquant' }, { status: 400 });
    }

    await (prisma as any).waiterCall.update({
      where: { id: callId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur PATCH /api/dashboard/waiter-calls:', error);
    return NextResponse.json({ error: 'Erreur lors de la résolution de l\'appel' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return NextResponse.json({ success: true });
}