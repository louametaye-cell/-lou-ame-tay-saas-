import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';
import { checkRateLimit } from '@/lib/rate-limit';

// POST /api/table/call-waiter
// Déclenché par le client depuis sa table pour appeler la serveuse / serveur
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
    const { tableNumber, restaurantId = 'resto_thies_01', customerName, reason } = body;

    if (!tableNumber && tableNumber !== 0) {
      return NextResponse.json({ error: 'Numéro de table requis' }, { status: 400 });
    }

    const newCall = orderStorage.addWaiterCall({
      tableNumber: Number(tableNumber),
      restaurantId,
      customerName,
      reason: reason || "Demande d'assistance en salle",
    });

    return NextResponse.json({
      success: true,
      call: newCall,
      message: `🔔 Serveur appelé pour la Table ${tableNumber} ! Un membre de l'équipe arrive tout de suite.`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'appel serveur" }, { status: 500 });
  }
}