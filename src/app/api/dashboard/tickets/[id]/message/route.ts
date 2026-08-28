import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// POST /api/dashboard/tickets/[id]/message
// Ajouter un message dans un ticket SAV existant
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { content, sender, senderName } = body;

    if (!content) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    }

    const newMsg = orderStorage.addTicketMessage(
      params.id,
      sender || 'CLIENT',
      content,
      senderName
    );

    if (!newMsg) {
      return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: newMsg,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur ajout message' }, { status: 500 });
  }
}
