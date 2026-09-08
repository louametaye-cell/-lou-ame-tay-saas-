import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';

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

    if (!pinCode || !/^\d{4}$/.test(String(pinCode).trim())) {
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

    // Find cashier
    const cashier = await prisma.cashier.findFirst({
      where: {
        tenantId: tenant.id,
        pinCode: String(pinCode).trim(),
        isActive: true
      }
    });

    if (!cashier) {
      return NextResponse.json({ error: 'Code PIN incorrect ou caissier inactif' }, { status: 401 });
    }

    // Check for open session for this cashier or tenant
    const activeSession = await prisma.cashSession.findFirst({
      where: {
        tenantId: tenant.id,
        cashierId: cashier.id,
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

    return NextResponse.json({
      success: true,
      restaurant: tenant,
      cashier: {
        id: cashier.id,
        name: cashier.name,
        phone: cashier.phone,
        shift: cashier.shift,
        schedule: cashier.schedule
      },
      activeSession
    });
  } catch (error) {
    console.error('Erreur authentification caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la connexion du caissier' }, { status: 500 });
  }
}
