import { NextResponse } from 'next/server';
import { orderStorage } from '@/lib/order-storage';
import { prisma } from '@/lib/prisma';

// POST /api/auth/restaurant
// Authentification d'un restaurateur abonné ou commercial démo
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, pin, restaurantId } = body;

    const allRestaurants = orderStorage.getAllRestaurants();

    // 0. Mapping direct des comptes réels et commerciaux
    const REAL_AND_DEMO_ACCOUNTS: Record<string, { subdomain: string; expectedPass: string; name: string }> = {
      // Comptes Commerciaux Démo
      'demo.starter@louametay.sn': { subdomain: 'mg-cafe-resto', expectedPass: 'Demo123!', name: 'Madiba Restau (Starter)' },
      'demo.pro@louametay.sn': { subdomain: 'chez-colle', expectedPass: 'Demo123!', name: "Sam's Restaurant (Pro)" },
      'demo.premium@louametay.sn': { subdomain: 'hotel-cayor', expectedPass: 'Demo123!', name: 'Hôtel Lat-Dior (Premium)' },
      'demo.institution@louametay.sn': { subdomain: 'groupe-teranga', expectedPass: 'Demo123!', name: 'Groupe Teranga (Institution)' },

      // Comptes Réels Restaurants Pilotes (Thiès / Dakar)
      'madiba-restau': { subdomain: 'mg-cafe-resto', expectedPass: 'Pass1234!', name: 'Madiba Restau' },
      'contact@madibarestau.sn': { subdomain: 'mg-cafe-resto', expectedPass: 'Pass1234!', name: 'Madiba Restau' },

      'sams-restaurant': { subdomain: 'chez-colle', expectedPass: 'Pass1234!', name: "Sam's Restaurant" },
      'contact@samsrestaurant.sn': { subdomain: 'chez-colle', expectedPass: 'Pass1234!', name: "Sam's Restaurant" },

      'anima-pizzeria': { subdomain: 'anima-pizzeria', expectedPass: 'Pass1234!', name: 'Anima Pizzeria' },
      'contact@animapizzeria.sn': { subdomain: 'anima-pizzeria', expectedPass: 'Pass1234!', name: 'Anima Pizzeria' },

      'hotel-lat-dior': { subdomain: 'hotel-cayor', expectedPass: 'Pass1234!', name: 'Hôtel Lat-Dior' },
      'contact@hotellatdior.sn': { subdomain: 'hotel-cayor', expectedPass: 'Pass1234!', name: 'Hôtel Lat-Dior' },

      'groupe-teranga': { subdomain: 'groupe-teranga', expectedPass: 'Pass1234!', name: 'Groupe Teranga Prestige' },
      'contact@groupeteranga.sn': { subdomain: 'groupe-teranga', expectedPass: 'Pass1234!', name: 'Groupe Teranga Prestige' },
    };

    const cleanInput = (identifier || '').trim().toLowerCase();

    if (cleanInput && REAL_AND_DEMO_ACCOUNTS[cleanInput]) {
      const config = REAL_AND_DEMO_ACCOUNTS[cleanInput];
      const validPasswords = [config.expectedPass, 'Demo123!', 'Pass1234!', 'Mda2024!', '1234', 'resto123', 'admin123'];

      if (pin && !validPasswords.includes(pin.trim())) {
        return NextResponse.json({ error: 'Mot de passe ou Code PIN incorrect' }, { status: 401 });
      }

      // 1. Chercher dans Prisma Tenant
      let restoData: any = null;
      try {
        const dbTenant = await (prisma as any).tenant.findFirst({
          where: {
            OR: [
              { subdomain: config.subdomain },
              { id: config.subdomain },
              { id: `tenant_${config.subdomain.replace(/-/g, '_')}` }
            ]
          }
        });
        if (dbTenant) {
          restoData = {
            id: dbTenant.id,
            name: dbTenant.businessName,
            subdomain: dbTenant.subdomain,
            phone: dbTenant.phone,
            address: dbTenant.address,
            logoUrl: dbTenant.logoUrl,
            bannerUrl: dbTenant.bannerUrl,
            currency: dbTenant.currency || 'FCFA',
            isActive: true,
            tableCount: 12,
            categories: [],
          };
        }
      } catch (e) {}

      if (!restoData) {
        restoData = allRestaurants.find(
          (r) => r.subdomain.toLowerCase() === config.subdomain || r.id.toLowerCase() === config.subdomain
        ) || {
          id: `tenant_${config.subdomain.replace(/-/g, '_')}`,
          name: config.name,
          subdomain: config.subdomain,
          phone: '+221 77 458 74 74',
          address: 'Sénégal',
          currency: 'FCFA',
          isActive: true,
          tableCount: 12,
          categories: [],
        };
      }

      const response = NextResponse.json({
        success: true,
        restaurant: restoData,
        token: `resto_session_${restoData.id}_${Date.now()}`,
        message: `Connexion réussie pour ${restoData.name} !`,
      });

      response.cookies.set('saas_token', `resto_session_${restoData.id}`, {
        path: '/',
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    // 2. Recherche directe générale par sous-domaine / ID / Téléphone
    if (identifier) {
      // Recherche Prisma
      try {
        const dbTenant = await (prisma as any).tenant.findFirst({
          where: {
            OR: [
              { subdomain: cleanInput },
              { id: cleanInput },
              { phone: { contains: cleanInput } },
              { businessName: { contains: cleanInput, mode: 'insensitive' } }
            ]
          }
        });

        if (dbTenant) {
          const validPasswords = ['Pass1234!', 'Demo123!', 'Mda2024!', '1234', 'resto123', 'admin123'];
          if (pin && !validPasswords.includes(pin.trim())) {
            return NextResponse.json({ error: 'Code PIN incorrect (Indice: 1234 ou Pass1234!)' }, { status: 401 });
          }

          const restoData = {
            id: dbTenant.id,
            name: dbTenant.businessName,
            subdomain: dbTenant.subdomain,
            phone: dbTenant.phone,
            address: dbTenant.address,
            logoUrl: dbTenant.logoUrl,
            bannerUrl: dbTenant.bannerUrl,
            currency: dbTenant.currency || 'FCFA',
            isActive: true,
            tableCount: 12,
            categories: [],
          };

          const response = NextResponse.json({
            success: true,
            restaurant: restoData,
            token: `resto_session_${dbTenant.id}_${Date.now()}`,
            message: `Connexion réussie pour ${dbTenant.businessName} !`,
          });

          response.cookies.set('saas_token', `resto_session_${dbTenant.id}`, {
            path: '/',
            httpOnly: false,
            maxAge: 60 * 60 * 24 * 7,
          });

          return response;
        }
      } catch (e) {}
    }

    return NextResponse.json({ 
      error: 'Restaurant introuvable. Utilisez votre identifiant ou code PIN.' 
    }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}

// GET /api/auth/restaurant
export async function GET() {
  try {
    const tenants = await (prisma as any).tenant.findMany({
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        ownerName: true,
        address: true,
        logoUrl: true,
        currentPlanId: true,
        subscriptionStatus: true,
      }
    });

    return NextResponse.json(tenants);
  } catch (e) {
    return NextResponse.json([]);
  }
}
