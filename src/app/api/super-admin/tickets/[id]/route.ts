import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';
import { TicketStatus } from '@/types';

// PATCH /api/super-admin/tickets/[id]
// Mettre à jour un ticket (statut, résolution)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, replyMessage } = body;

    if (!status) {
      return NextResponse.json({ error: 'Statut requis' }, { status: 400 });
    }

    const updated = orderStorage.updateSupportTicketStatus(params.id, status as TicketStatus);
    if (!updated) {
      return NextResponse.json({ error: 'Ticket introuvable' }, { status: 404 });
    }

    if (replyMessage) {
      orderStorage.addTicketMessage(params.id, 'SUPPORT', replyMessage, 'Super Admin Lou Ame Tay');
    }

    return NextResponse.json({
      success: true,
      ticket: updated,
      message: `Statut du ticket mis à jour : ${status}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur mise à jour ticket' }, { status: 500 });
  }
}
