import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get('restaurantId') || searchParams.get('tenantId');

    if (!restaurantId) {
      return NextResponse.json({ alerts: [] });
    }

    // Récupération des plats marqués en rupture (isAvailable = false) pour ce restaurant
    const outOfStockItems = await (prisma as any).menuItem.findMany({
      where: {
        tenantId: restaurantId,
        isAvailable: false,
      },
      include: {
        category: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    const formattedAlerts = outOfStockItems.map((item: any) => ({
      id: item.id,
      itemName: item.name,
      stock: 0,
      unit: 'portion',
      isOutOfStock: true,
      category: item.category?.name || 'Général',
    }));

    return NextResponse.json({ alerts: formattedAlerts });
  } catch (error) {
    console.error('Erreur GET /api/dashboard/alerts:', error);
    return NextResponse.json({ alerts: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, isAvailable } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId manquant' }, { status: 400 });
    }

    const updated = await (prisma as any).menuItem.update({
      where: { id: itemId },
      data: { isAvailable: isAvailable ?? true },
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error('Erreur POST /api/dashboard/alerts:', error);
    return NextResponse.json({ error: 'Impossible de mettre à jour le stock' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  return POST(req);
}