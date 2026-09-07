import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const rate = await checkRateLimit(req, 'public');
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Appel déjà envoyé. Un serveur arrive.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { tableNumber, restaurantId, customerName, reason } = body;
    const tenantIdInput = restaurantId || body.tenantId;

    if (!tenantIdInput || (!tableNumber && tableNumber !== 0)) {
      return NextResponse.json({ error: 'Restaurant et Numéro de table requis' }, { status: 400 });
    }

    let validTenantId: string | null = null;
    try {
      const dbTenant = await (prisma as any).tenant.findFirst({
        where: {
          OR: [
            { id: tenantIdInput },
            { subdomain: tenantIdInput },
          ],
        },
        select: { id: true },
      });
      if (dbTenant) {
        validTenantId = dbTenant.id;
      }
    } catch (e) {}

    if (!validTenantId) {
      return NextResponse.json({ error: 'Restaurant introuvable ou non identifié' }, { status: 404 });
    }

    const newCall = await (prisma as any).waiterCall.create({
      data: {
        tenantId: validTenantId,
        tableNumber: Number(tableNumber),
        status: 'PENDING',
      },
    });

    const isBill = reason === 'BILL' || reason === 'ADDITION';
    const message = isBill
      ? `🧾 Demande d'addition transmise pour la Table ${tableNumber} ! Votre serveur et la caisse préparent votre note.`
      : `🛎️ Serveur appelé pour la Table ${tableNumber} ! Un membre de l'équipe arrive tout de suite.`;

    return NextResponse.json({
      success: true,
      call: newCall,
      message,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'appel serveur" }, { status: 500 });
  }
}