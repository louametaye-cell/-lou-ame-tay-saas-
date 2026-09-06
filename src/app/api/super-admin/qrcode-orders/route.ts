import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { QRCodeOrderStatus } from '@/types';

// GET /api/super-admin/qrcode-orders
// Récupérer toutes les commandes de chevalets QR codes physiques
export async function GET() {
  try {
    const orders = await (prisma as any).qRCodeOrder.findMany({
      include: {
        tenant: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map to the format expected by the frontend
    const formattedOrders = orders.map((o: any) => ({
      id: o.id,
      restaurantId: o.tenantId,
      restaurantName: o.tenant?.businessName || 'Inconnu',
      quantity: o.quantity,
      status: o.status,
      address: o.address,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));

    return NextResponse.json({ orders: formattedOrders });
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

    const updated = await (prisma as any).qRCodeOrder.update({
      where: { id: orderId },
      data: { status }
    });

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Statut de la commande mis à jour : ${status}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur mise à jour commande' }, { status: 500 });
  }
}
