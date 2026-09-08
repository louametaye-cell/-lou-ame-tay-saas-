import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/rate-limit';

// POST /api/auth/restaurant
// Authentification d'un restaurateur 
export async function POST(req: Request) {
  try {
    // 1. Protection Anti-Brute-Force (Max 5 tentatives / min par IP)
    const rate = await checkRateLimit(req, 'auth');
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives de connexion échouées. Par mesure de sécurité, veuillez patienter 1 minute.' },
        {
          status: 429,
          headers: { 'Retry-After': String(rate.reset) },
        }
      );
    }

    const body = await req.json();
    const { identifier, password, pin, restaurantId } = body;

    const cleanInput = (identifier || restaurantId || '').trim().toLowerCase();
    const providedSecret = (password || pin || '').trim();

    if (!cleanInput) {
      return NextResponse.json({ error: 'Identifiant ou sous-domaine requis' }, { status: 400 });
    }

    if (!providedSecret) {
      return NextResponse.json({ 
        error: 'Mot de passe requis. Veuillez saisir le mot de passe attribué par l\'administrateur.' 
      }, { status: 400 });
    }

    // 1. Recherche du Tenant (Restaurant) en base de données
    const dbTenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
          { id: cleanInput },
          { email: cleanInput },
          { subdomain: cleanInput },
          { phone: { contains: cleanInput } },
        ]
      }
    });

    if (!dbTenant) {
      return NextResponse.json({ 
        error: 'Restaurant introuvable avec cet identifiant.' 
      }, { status: 404 });
    }

    // 2. Vérification stricte du mot de passe
    let isValid = false;
    const isProd = process.env.NODE_ENV === 'production';

    if (dbTenant.passwordHash) {
      isValid = await bcrypt.compare(providedSecret, dbTenant.passwordHash);
    } else if (!isProd) {
      // Fallback de développement uniquement pour les environnements de test locaux
      const devPasswords = ['Pass1234!', 'Demo123!', 'Mgd2024!', 'Mda2024!', '1234', 'resto123', 'admin123'];
      isValid = devPasswords.includes(providedSecret);
    } else {
      // En production, un compte sans hash sécurisé ne peut pas être accédé via fallback
      console.error(`[SECURITY ALERT] Restaurant ${dbTenant.id} attempted login without passwordHash in production.`);
      isValid = false;
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect' }, { status: 401 });
    }

    // 3. Préparation des données de session
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
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Erreur lors de la connexion' }, { status: 500 });
  }
}

// GET /api/auth/restaurant (Retourne uniquement la liste publique pour démo sans fuite de PII)
export async function GET() {
  // Désactivation de la liste automatique publique pour respecter la confidentialité des restaurants abonnés
  return NextResponse.json({ restaurants: [] });
}
