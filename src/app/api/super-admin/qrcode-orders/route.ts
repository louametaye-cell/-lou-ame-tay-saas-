import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';
import { QRCodeOrderStatus } from '@/types';

// GET /api/super-admin/qrcode-orders
// Récupérer toutes les commandes de chevalets QR codes physiques
export async function GET() {
  try {
    const orders = orderStorage.getQRCodeOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération commandes' }, { status: 500 });
  }
}

// PATCH /api/super-admin/qrcode-orders
// Mettre à jour le statut d'une commande de chevalets (ex: expédier, livrer)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId et status requis' }, { status: 400 });
    }

    const updated = orderStorage.updateQRCodeOrderStatus(orderId, status as QRCodeOrderStatus);
    if (!updated) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Statut de la commande mis à jour : ${status}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur mise à jour commande' }, { status: 500 });
  }
}
