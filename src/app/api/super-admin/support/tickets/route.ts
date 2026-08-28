import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// GET /api/super-admin/support/tickets
export async function GET() {
  try {
    const tickets = orderStorage.getSupportTickets();
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération tickets' }, { status: 500 });
  }
}

// POST /api/super-admin/support/tickets
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, restaurantName, subject, message, priority } = body;

    if (!restaurantId || !subject || !message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const newTicket = orderStorage.createSupportTicket({
      restaurantId,
      restaurantName: restaurantName || 'Restaurant Client',
      subject,
      message,
      priority,
    });

    return NextResponse.json({ ticket: newTicket, message: 'Ticket créé avec succès' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur création ticket' }, { status: 500 });
  }
}

// PATCH /api/super-admin/support/tickets
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ticketId, status } = body;

    if (!ticketId || !status) {
      return NextResponse.json({ error: 'ticketId et status requis' }, { status: 400 });
    }

    const updated = orderStorage.updateSupportTicketStatus(ticketId, status);
    if (!updated) {
      return NextResponse.json({ error: 'Ticket non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ ticket: updated, message: 'Statut du ticket mis à jour' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur mise à jour ticket' }, { status: 500 });
  }
}
