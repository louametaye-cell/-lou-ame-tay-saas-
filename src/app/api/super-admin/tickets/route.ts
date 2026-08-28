import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// GET /api/super-admin/tickets
// Récupérer tous les tickets SAV (pour Super Admin)
export async function GET() {
  try {
    const tickets = orderStorage.getSupportTickets();
    return NextResponse.json({ tickets });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération tickets' }, { status: 500 });
  }
}
