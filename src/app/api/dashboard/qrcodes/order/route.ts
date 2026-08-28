import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// POST /api/dashboard/qrcodes/order
// Créer une commande de chevalets QR codes physiques
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, restaurantName, packTitle, tableCount, format, price, city, phone } = body;

    if (!packTitle || !tableCount || !price) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const order = orderStorage.createQRCodeOrder({
      restaurantId: restaurantId || 'resto_thies_01',
      restaurantName: restaurantName || 'Chez Fatou & Frères',
      packTitle,
      tableCount: Number(tableCount),
      format: format || 'A5 Plastifié',
      price: Number(price),
      city: city || 'Thiès',
      phone: phone || '+221 77 654 32 10',
    });

    return NextResponse.json({
      success: true,
      order,
      message: 'Commande de chevalets QR codes enregistrée avec succès !',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur création commande QR code' }, { status: 500 });
  }
}

// GET /api/dashboard/qrcodes/order
// Récupère les commandes de QR codes passées
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId');

    const orders = restaurantId
      ? orderStorage.getQRCodeOrdersByRestaurantId(restaurantId)
      : orderStorage.getQRCodeOrders();

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commandes QR' }, { status: 500 });
  }
}
