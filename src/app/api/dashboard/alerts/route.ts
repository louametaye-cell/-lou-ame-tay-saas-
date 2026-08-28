import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';
import { SAMPLE_RESTAURANT } from '@/lib/sample-data';

// GET /api/dashboard/alerts
// Récupère les alertes de stock critique et ruptures
export async function GET() {
  try {
    const restaurant = orderStorage.getRestaurantById('resto_thies_01') || SAMPLE_RESTAURANT;
    const categories = restaurant.categories || SAMPLE_RESTAURANT.categories;

    const alerts: Array<{
      id: string;
      itemName: string;
      stock: number;
      unit: string;
      isOutOfStock: boolean;
      category: string;
    }> = [];

    categories.forEach((cat) => {
      cat.items?.forEach((i) => {
        const isAvailable = orderStorage.getItemAvailability(i.id);
        if (isAvailable === false) {
          alerts.push({
            id: i.id,
            itemName: i.name,
            stock: 0,
            unit: 'portions (Épuisé)',
            isOutOfStock: true,
            category: cat.name,
          });
        }
      });
    });

    // Add mock critical stock items if empty for demonstration
    if (alerts.length === 0) {
      alerts.push({
        id: 'dish_dibi_agneau',
        itemName: "Dibi d'Agneau façon Thiès",
        stock: 3,
        unit: 'portions restantes',
        isOutOfStock: false,
        category: 'Grillades',
      });
      alerts.push({
        id: 'dish_capitaine_braise',
        itemName: 'Capitaine Entier Braisé',
        stock: 2,
        unit: 'pièces restantes',
        isOutOfStock: false,
        category: 'Poissons & Fruits de Mer',
      });
    }

    return NextResponse.json({ alerts });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération alertes' }, { status: 500 });
  }
}

// POST /api/dashboard/alerts
// Réapprovisionner / remettre en stock un plat
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { itemId, isAvailable } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId obligatoire' }, { status: 400 });
    }

    const newStatus = isAvailable !== undefined ? isAvailable : true;
    orderStorage.toggleItemAvailability(itemId, newStatus);

    return NextResponse.json({
      success: true,
      itemId,
      isAvailable: newStatus,
      message: 'Plat réapprovisionné et remis en stock avec succès !',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur réapprovisionnement' }, { status: 500 });
  }
}
