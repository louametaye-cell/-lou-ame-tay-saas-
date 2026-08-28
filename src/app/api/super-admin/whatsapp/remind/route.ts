import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// POST /api/super-admin/whatsapp/remind
// Génère le message et le lien WhatsApp direct pour la relance paiement
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, daysOffset } = body;

    if (!restaurantId) {
      return NextResponse.json({ error: 'restaurantId manquant' }, { status: 400 });
    }

    const reminder = orderStorage.generateWhatsAppReminder(restaurantId, daysOffset);

    if (!reminder) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      reminder,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur génération relance WhatsApp' }, { status: 500 });
  }
}
