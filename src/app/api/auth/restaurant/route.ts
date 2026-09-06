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
    const { identifier, pin } = body;

    const cleanInput = (identifier || '').trim().toLowerCase();

    if (!cleanInput || !pin) {
      return NextResponse.json({ error: 'Identifiant et mot de passe requis' }, { status: 400 });
    }

    // 1. Recherche du Tenant (Restaurant) en base de données
    const dbTenant = await (prisma as any).tenant.findFirst({
      where: {
        OR: [
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

    // 2. Vérification du mot de passe
    // S'il n'a pas de mot de passe haché (vieux compte), on le laisse passer si c'est "Pass1234!" par défaut.
    let isValid = false;
    
    if (dbTenant.passwordHash) {
      isValid = await bcrypt.compare(pin.trim(), dbTenant.passwordHash);
    } else {
      // Fallback temporaire pour les anciens comptes non migrés
      const validPasswords = ['Pass1234!', 'Demo123!', 'Mgd2024!', 'Mda2024!', '1234', 'resto123', 'admin123'];
      isValid = validPasswords.includes(pin.trim());
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Mot de passe ou Code PIN incorrect' }, { status: 401 });
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
  try {
    const tenants = await (prisma as any).tenant.findMany({
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        logoUrl: true,
      },
      take: 10,
    });

    return NextResponse.json({ restaurants: tenants });
  } catch (e) {
    return NextResponse.json({ restaurants: [] });
  }
}
