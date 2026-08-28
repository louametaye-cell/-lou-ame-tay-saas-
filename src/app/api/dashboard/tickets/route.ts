import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// POST /api/dashboard/tickets
// Ouvrir un ticket SAV restaurateur
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, restaurantName, subject, message, priority } = body;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Sujet et message obligatoires' }, { status: 400 });
    }

    const ticket = orderStorage.createSupportTicket({
      restaurantId: restaurantId || 'resto_thies_01',
      restaurantName: restaurantName || 'Chez Fatou & Frères',
      subject,
      message,
      priority: priority || 'MOYENNE',
    });

    return NextResponse.json({
      success: true,
      ticket,
      message: 'Ticket SAV ouvert avec succès ! Notre équipe et l\'IA sont mobilisés.',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur création ticket SAV' }, { status: 500 });
  }
}

// GET /api/dashboard/tickets
// Récupérer les tickets SAV d'un restaurant
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');

    const tickets = restaurantId
      ? orderStorage.getSupportTicketsByRestaurantId(restaurantId)
      : orderStorage.getSupportTickets();

    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération tickets' }, { status: 500 });
  }
}
