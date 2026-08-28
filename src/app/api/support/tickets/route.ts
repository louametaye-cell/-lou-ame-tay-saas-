import { NextResponse } from 'next/server';

export interface SupportTicket {
  id: string;
  tenantId: string;
  restaurantName: string;
  subject: string;
  category: 'TECHNIQUE' | 'FACTURATION' | 'QR_CODE' | 'MENU';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  message: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

// In-Memory Global Tickets Storage
declare global {
  var globalSupportTickets: SupportTicket[] | undefined;
}

if (!globalThis.globalSupportTickets) {
  globalThis.globalSupportTickets = [
    {
      id: 'tkt_001',
      tenantId: 'tenant_pro_01',
      restaurantName: 'Chez Fatou & Frères',
      subject: 'Réimpression de 10 QR codes plastifiés pour la terrasse',
      category: 'QR_CODE',
      priority: 'HIGH',
      status: 'OPEN',
      message: 'Nous avons ajouté 10 nouvelles tables en terrasse et souhaitons les QR codes officiels avec notre logo.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'tkt_002',
      tenantId: 'tenant_premium_01',
      restaurantName: 'Le Palmier Gourmand & Resort',
      subject: 'Assistance configuration menu bilingue Anglais/Wolof',
      category: 'MENU',
      priority: 'NORMAL',
      status: 'IN_PROGRESS',
      message: 'Besoin d\'aide pour relire les descriptions de nos cocktails en Wolof et Anglais.',
      assignedTo: 'Agent Support Dakar',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// GET /api/support/tickets
export async function GET() {
  return NextResponse.json({ tickets: globalThis.globalSupportTickets || [] });
}

// POST /api/support/tickets
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, restaurantName, subject, category, priority, message } = body;

    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      tenantId: tenantId || 'tenant_starter_01',
      restaurantName: restaurantName || 'Restaurant Client',
      subject: subject || 'Demande d\'assistance',
      category: category || 'TECHNIQUE',
      priority: priority || 'NORMAL',
      status: 'OPEN',
      message: message || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalThis.globalSupportTickets!.unshift(newTicket);

    return NextResponse.json({
      success: true,
      ticket: newTicket,
      message: 'Ticket d\'assistance créé avec succès ! Un agent va vous répondre.',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur création ticket' }, { status: 500 });
  }
}
