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
    const tenantId = restaurantId;

    if (!tenantId || (!tableNumber && tableNumber !== 0)) {
      return NextResponse.json({ error: 'Restaurant et Numéro de table requis' }, { status: 400 });
    }

    const newCall = await (prisma as any).waiterCall.create({
      data: {
        tenantId,
        tableNumber: Number(tableNumber),
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      call: newCall,
      message: `🛎️ Serveur appelé pour la Table ${tableNumber} ! Un membre de l'équipe arrive tout de suite.`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'appel serveur" }, { status: 500 });
  }
}