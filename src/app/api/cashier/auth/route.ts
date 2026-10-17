import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const tenants = await prisma.tenant.findMany({
      orderBy: { businessName: 'asc' },
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        logoUrl: true,
        city: true,
      },
    });
    return NextResponse.json({ success: true, restaurants: tenants });
  } catch (error) {
    console.error('Erreur liste restaurants caisse:', error);
    return NextResponse.json({ restaurants: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // 🔒 ANTI-BRUTE FORCE : Limite à 5 essais de PIN par minute par adresse IP
    const rate = await checkRateLimit(req, 'auth');
    if (!rate.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives de code PIN. Veuillez patienter 1 minute avant de réessayer.' },
        { status: 429, headers: { 'Retry-After': String(rate.reset) } }
      );
    }

    const body = await req.json();
    const { restaurantId, pinCode } = body;

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant non spécifié' }, { status: 400 });
    }

    const cleanPin = String(pinCode || '').trim();
    if (!cleanPin || !/^\d{4}$/.test(cleanPin)) {
      return NextResponse.json({ error: 'Code PIN à 4 chiffres requis' }, { status: 400 });
    }

    // Resolve tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: restaurantId }, { subdomain: restaurantId }]
      },
      select: {
        id: true,
        businessName: true,
        subdomain: true,
        currency: true
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Récupérer tous les caissiers actifs de cet établissement
    const activeCashiers = await prisma.cashier.findMany({
      where: {
        tenantId: tenant.id,
        isActive: true
      }
    });

    if (activeCashiers.length === 0) {
      return NextResponse.json({ error: 'Aucun caissier actif configuré pour cet établissement' }, { status: 401 });
    }

    const now = new Date();
    let matchedCashier: (typeof activeCashiers)[0] | null = null;

    for (const c of activeCashiers) {
      const storedPin = (c.pinCode || '').trim();
      let isMatch = false;

      if (storedPin.startsWith('$2a$') || storedPin.startsWith('$2b$') || storedPin.startsWith('$2y$')) {
        isMatch = await bcrypt.compare(cleanPin, storedPin);
      } else {
        isMatch = storedPin === cleanPin;
      }

      if (isMatch) {
        matchedCashier = c;
        break;
      }
    }

    // Si aucun caissier ne correspond au PIN saisi
    if (!matchedCashier) {
      return NextResponse.json({ error: 'Code PIN incorrect ou caissier inactif' }, { status: 401 });
    }

    // 🔒 VÉRIFICATION DU VERROUILLAGE TEMPORAIRE (lockedUntil)
    if (matchedCashier.lockedUntil && new Date(matchedCashier.lockedUntil) > now) {
      const remainingMinutes = Math.max(
        1,
        Math.ceil((new Date(matchedCashier.lockedUntil).getTime() - now.getTime()) / 60000)
      );
      return NextResponse.json(
        {
          error: `Ce profil caissier est temporairement verrouillé suite à plusieurs tentatives échouées. Réessayez dans ${remainingMinutes} min.`
        },
        { status: 423 }
      );
    }

    // Réinitialiser le compteur d'échecs et lockedUntil après connexion valide
    if (matchedCashier.failedPinAttempts > 0 || matchedCashier.lockedUntil) {
      await prisma.cashier.update({
        where: { id: matchedCashier.id },
        data: {
          failedPinAttempts: 0,
          lockedUntil: null
        }
      });
    }

    // Check for open session for this cashier or tenant
    const activeSession = await prisma.cashSession.findFirst({
      where: {
        tenantId: tenant.id,
        cashierId: matchedCashier.id,
        status: 'OPEN'
      },
      orderBy: { openedAt: 'desc' },
      include: {
        cashier: {
          select: {
            id: true,
            name: true,
            shift: true
          }
        }
      }
    });

    const res = NextResponse.json({
      success: true,
      restaurant: tenant,
      cashier: {
        id: matchedCashier.id,
        name: matchedCashier.name,
        phone: matchedCashier.phone,
        shift: matchedCashier.shift,
        schedule: matchedCashier.schedule
      },
      token: `cashier_session_${tenant.id}`,
      activeSession
    });

    res.cookies.set('cashier_token', `cashier_session_${tenant.id}`, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 14 // 14 heures de shift
    });

    return res;
  } catch (error) {
    console.error('Erreur authentification caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la connexion du caissier' }, { status: 500 });
  }
}
