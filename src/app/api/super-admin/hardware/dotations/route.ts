import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const dotations = await prisma.tenantHardwareDotation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        tenant: {
          select: {
            id: true,
            businessName: true,
            subdomain: true,
            ownerName: true,
            parrainageCredits: true,
          },
        },
        support: true,
      },
    });

    return NextResponse.json({ success: true, dotations });
  } catch (error: any) {
    console.error('Error fetching hardware dotations:', error);
    return NextResponse.json({ error: 'Erreur récupération dotations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      tenantId,
      supportId,
      quantity = 1,
      invoiceType = 'SETUP', // 'SETUP' | 'SAV' | 'PARRAINAGE'
      isSetupInvoiced = true,
      notes,
    } = body;

    if (!tenantId || !supportId || quantity < 1) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
    }

    // 1. Fetch support & tenant
    const support = await prisma.qRSupportCatalog.findUnique({
      where: { id: supportId },
    });
    if (!support) {
      return NextResponse.json({ error: 'Support physique introuvable' }, { status: 404 });
    }

    if (support.stockQuantity < quantity) {
      return NextResponse.json(
        { error: `Stock insuffisant (${support.stockQuantity} disponibles pour ${quantity} demandés)` },
        { status: 400 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // 2. Parrainage / Facturation logic
    const isSponsored = invoiceType === 'PARRAINAGE';
    const unitPrice = isSponsored ? 0 : Number(support.sellingPrice);
    const totalPrice = unitPrice * Number(quantity);

    // 3. Database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create dotation
      const dotation = await tx.tenantHardwareDotation.create({
        data: {
          tenantId,
          supportId,
          quantity: Number(quantity),
          unitPrice,
          totalPrice,
          isSetupInvoiced: Boolean(isSetupInvoiced && !isSponsored),
          invoiceType,
          isSponsored,
          notes: notes || null,
        },
      });

      // Decrement stock
      await tx.qRSupportCatalog.update({
        where: { id: supportId },
        data: {
          stockQuantity: { decrement: Number(quantity) },
        },
      });

      // If sponsored via referral credits, adjust tenant
      if (isSponsored && tenant.parrainageCredits >= quantity) {
        await tx.tenant.update({
          where: { id: tenantId },
          data: {
            parrainageCredits: { decrement: Number(quantity) },
          },
        });
      }

      // Generate invoice if requested and non-sponsored
      let invoice = null;
      if (isSetupInvoiced && !isSponsored && totalPrice > 0) {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `FAC-MAT-${year}-${rand}`;

        invoice = await tx.hardwareInvoice.create({
          data: {
            tenantId,
            invoiceNumber,
            invoiceType: invoiceType as any,
            amount: totalPrice,
            status: 'PENDING',
            paymentMethod: 'CASH',
            notes: `Dotation de ${quantity}x ${support.name} (${invoiceType})`,
            items: [
              {
                supportId: support.id,
                name: support.name,
                material: support.material,
                finishType: support.finishType,
                quantity: Number(quantity),
                unitPrice,
                totalPrice,
                packagingIncluded: support.packagingIncluded,
                antiTheftEngraving: support.antiTheftEngraving,
              },
            ],
          },
        });
      }

      return { dotation, invoice };
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating hardware dotation:', error);
    return NextResponse.json({ error: 'Erreur création dotation matériel' }, { status: 500 });
  }
}
