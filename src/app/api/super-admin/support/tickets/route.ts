import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/super-admin/support/tickets
export async function GET() {
  try {
    const tickets = await (prisma as any).supportTicket.findMany({
      include: {
        tenant: true,
        messages: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération tickets' }, { status: 500 });
  }
}

// POST /api/super-admin/support/tickets
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, subject, message, priority } = body;
    const tenantId = restaurantId;

    if (!tenantId || !subject || !message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const newTicket = await (prisma as any).supportTicket.create({
      data: {
        tenantId,
        subject,
        priority: priority || 'NORMAL',
        status: 'OPEN',
        messages: {
          create: {
            senderType: 'TENANT',
            content: message,
          }
        }
      },
      include: {
        messages: true
      }
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

    const updated = await (prisma as any).supportTicket.update({
      where: { id: ticketId },
      data: { status }
    });

    return NextResponse.json({ ticket: updated, message: 'Statut du ticket mis à jour' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur mise à jour ticket' }, { status: 500 });
  }
}
