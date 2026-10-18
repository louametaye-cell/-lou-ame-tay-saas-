import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const invoices = await prisma.hardwareInvoice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
            subdomain: true,
            ownerName: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    console.error('Error fetching hardware invoices:', error);
    return NextResponse.json({ error: 'Erreur récupération factures matériel' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, paymentMethod } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID facture requis' }, { status: 400 });
    }

    const updated = await prisma.hardwareInvoice.update({
      where: { id },
      data: {
        status: status || 'SUCCESS',
        paymentMethod: paymentMethod || 'CASH',
        paidAt: status === 'SUCCESS' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, invoice: updated });
  } catch (error: any) {
    console.error('Error updating hardware invoice:', error);
    return NextResponse.json({ error: 'Erreur mise à jour facture' }, { status: 500 });
  }
}
