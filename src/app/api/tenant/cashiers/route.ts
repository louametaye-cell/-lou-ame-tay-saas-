import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CashierShift } from '@prisma/client';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || searchParams.get('restaurantId');
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId ou restaurantId est requis' }, { status: 400 });
    }

    // Resolve tenant by id or subdomain
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantId }, { subdomain: tenantId }]
      },
      select: { id: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // 🔒 CONTRÔLE D'ACCÈS STRICT : Seul le gérant authentifié ou Super-Admin peut voir l'équipe
    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Session gérant requise pour consulter les caissiers' },
        { status: 401 }
      );
    }

    // 🔒 SÉCURITÉ ABSOLUE : Exclusion du champ pinCode pour empêcher toute fuite de secret
    const cashiers = await prisma.cashier.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        tenantId: true,
        name: true,
        phone: true,
        shift: true,
        schedule: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { sessions: true, orders: true }
        },
        sessions: {
          take: 1,
          orderBy: { openedAt: 'desc' },
          select: {
            id: true,
            status: true,
            openedAt: true,
            closedAt: true,
            openingFloat: true,
            totalRevenue: true
          }
        }
      }
    });

    const safeCashiers = cashiers.map((c) => ({
      ...c,
      hasPin: true, // Indicateur que le PIN est configuré sans jamais le divulguer en clair
    }));

    return NextResponse.json({ success: true, cashiers: safeCashiers });
  } catch (error) {
    console.error('Erreur récupération caissiers:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des caissiers' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, restaurantId, name, phone, pinCode, shift, schedule } = body;

    const rawTenantId = tenantId || restaurantId;
    if (!rawTenantId) {
      return NextResponse.json({ error: 'Identifiant du restaurant requis' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du caissier est requis' }, { status: 400 });
    }

    if (!pinCode || !/^\d{4}$/.test(pinCode.trim())) {
      return NextResponse.json({ error: 'Le code PIN doit comporter exactement 4 chiffres' }, { status: 400 });
    }

    // Resolve tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: rawTenantId }, { subdomain: rawTenantId }]
      },
      select: { id: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // 🔒 CONTRÔLE D'ACCÈS : Seul le gérant ou Super-Admin peut créer un caissier
    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Session gérant requise pour créer un caissier' },
        { status: 401 }
      );
    }

    // Check PIN uniqueness for this tenant
    const existing = await prisma.cashier.findUnique({
      where: {
        uq_tenant_cashier_pin: {
          tenantId: tenant.id,
          pinCode: pinCode.trim()
        }
      }
    });

    if (existing) {
      return NextResponse.json({ error: `Le code PIN ${pinCode.trim()} est déjà attribué à ${existing.name}` }, { status: 409 });
    }

    // Shift validation
    const validShift = Object.values(CashierShift).includes(shift) ? shift : CashierShift.MORNING;

    const cashier = await prisma.cashier.create({
      data: {
        tenantId: tenant.id,
        name: name.trim(),
        phone: phone?.trim() || null,
        pinCode: pinCode.trim(),
        shift: validShift,
        schedule: schedule?.trim() || null,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, cashier }, { status: 201 });
  } catch (error) {
    console.error('Erreur création caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la création du caissier' }, { status: 500 });
  }
}
