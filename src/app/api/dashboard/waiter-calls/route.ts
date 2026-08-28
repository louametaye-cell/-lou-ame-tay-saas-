import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// GET /api/dashboard/waiter-calls
// Récupère les appels serveurs actifs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || 'resto_thies_01';

    const calls = orderStorage.getWaiterCalls(restaurantId);
    return NextResponse.json({ calls });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération appels' }, { status: 500 });
  }
}

// PATCH /api/dashboard/waiter-calls
// Acquitte un appel serveur
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { callId } = body;

    if (!callId) {
      return NextResponse.json({ error: 'callId obligatoire' }, { status: 400 });
    }

    const resolved = orderStorage.resolveWaiterCall(callId);
    return NextResponse.json({ success: resolved, message: 'Appel acquitté' });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'acquittement" }, { status: 500 });
  }
}