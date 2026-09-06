import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ error: 'Statut manquant' }, { status: 400 });
    }

    const updated = await (prisma as any).order.update({
      where: { id: params.id },
      data: {
        status: status as any,
        preparedAt: status === 'PREPARING' ? new Date() : undefined,
        servedAt: status === 'SERVED' ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 });
  }
}
