import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// POST /api/dashboard/menu-request
// Soumettre une demande d'ajout de plat
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      restaurantId, 
      restaurantName, 
      name, 
      wolofName, 
      description, 
      price, 
      category, 
      imageUrl, 
      allergens 
    } = body;

    if (!name || !price || !category) {
      return NextResponse.json({ error: 'Nom, prix et catégorie obligatoires' }, { status: 400 });
    }

    const menuRequest = orderStorage.createMenuRequest({
      restaurantId: restaurantId || 'resto_thies_01',
      restaurantName: restaurantName || 'Chez Fatou & Frères',
      name,
      wolofName,
      description: description || '',
      price: Number(price),
      category,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      allergens: allergens || [],
    });

    return NextResponse.json({
      success: true,
      menuRequest,
      message: 'Demande d\'ajout de plat transmise à l\'agence ! Intégration sous 24h.',
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur soumission plat' }, { status: 500 });
  }
}

// GET /api/dashboard/menu-request
// Récupérer les demandes de plats
export async function GET() {
  try {
    const requests = orderStorage.getMenuRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur récupération demandes' }, { status: 500 });
  }
}
