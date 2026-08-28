import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';

// POST /api/auth/restaurant
// Authentification d'un restaurateur abonné
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, pin, restaurantId } = body;

    const allRestaurants = orderStorage.getAllRestaurants();

    // 1. Direct login by restaurantId (Quick Switch / Demo)
    if (restaurantId) {
      const found = allRestaurants.find((r) => r.id === restaurantId);
      if (found) {
        return NextResponse.json({
          success: true,
          restaurant: found,
          token: `resto_session_${found.id}_${Date.now()}`,
          message: `Bienvenue, ${found.ownerName || found.name} !`,
        });
      }
    }

    // 2. Login by identifier (subdomain, name, or phone)
    if (!identifier) {
      return NextResponse.json({ error: 'Identifiant du restaurant obligatoire' }, { status: 400 });
    }

    const cleanId = identifier.trim().toLowerCase();
    const matched = allRestaurants.find((r) => 
      r.subdomain.toLowerCase() === cleanId ||
      r.id.toLowerCase() === cleanId ||
      r.name.toLowerCase().includes(cleanId) ||
      (r.phone && r.phone.replace(/[^0-9]/g, '').includes(cleanId.replace(/[^0-9]/g, '')))
    );

    if (!matched) {
      return NextResponse.json({ 
        error: 'Restaurant introuvable. Vérifiez votre identifiant ou contactez le support.' 
      }, { status: 404 });
    }

    // Check PIN / Password (default allowed PIN: '1234' or 'resto123' or empty for fast onboarding)
    if (pin && pin.trim() !== '1234' && pin.trim() !== 'resto123' && pin.trim() !== 'admin123') {
      return NextResponse.json({ error: 'Code PIN incorrect (Indice par défaut: 1234)' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      restaurant: matched,
      token: `resto_session_${matched.id}_${Date.now()}`,
      message: `Connexion réussie pour ${matched.name} !`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}

// GET /api/auth/restaurant
// Liste des restaurants abonnés pour la sélection rapide
export async function GET() {
  try {
    const allRestaurants = orderStorage.getAllRestaurants();
    const publicList = allRestaurants.map((r) => ({
      id: r.id,
      name: r.name,
      subdomain: r.subdomain,
      ownerName: r.ownerName,
      address: r.address,
      logoUrl: r.logoUrl,
      plan: r.subscription?.plan || 'PRO',
      status: r.subscription?.status || 'ACTIVE',
    }));

    return NextResponse.json({ restaurants: publicList });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
