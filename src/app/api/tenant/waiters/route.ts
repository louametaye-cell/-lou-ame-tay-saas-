import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantIdParam = searchParams.get('tenantId') || searchParams.get('restaurantId');
    if (!tenantIdParam) {
      return NextResponse.json({ error: 'tenantId est obligatoire' }, { status: 400 });
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantIdParam }, { subdomain: tenantIdParam }]
      },
      select: { id: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // 🔒 Contrôle Paywall : La gestion des serveurs & badges QR nécessite TERANGA+
    const { checkTenantFeatureAccess } = await import('@/lib/server-plan-guard');
    const access = await checkTenantFeatureAccess(tenant.id, 'STAFF_WAITERS');
    if (!access.allowed) {
      return NextResponse.json(
        { 
          error: 'La gestion des serveurs et badges QR personnels nécessite la formule TERANGA ou supérieure.',
          paywall: access.paywall,
          requiredPlan: access.requiredPlanName,
          currentPlan: access.currentPlanName
        },
        { status: 403 }
      );
    }

    if (!isAuthorizedTenant(req, tenant.id)) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

    const tenantId = tenant.id;

    const waiters = await prisma.waiter.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    });

    return NextResponse.json({ waiters });
  } catch (error) {
    console.error('Erreur récupération serveurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, tenantId } = body;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId est obligatoire' }, { status: 400 });
    }

    if (!isAuthorizedTenant(req, tenantId)) {
      return NextResponse.json({ error: 'Accès non autorisé pour ce restaurant' }, { status: 401 });
    }

    // 🔒 Contrôle Paywall : La création de serveurs nécessite TERANGA+
    const { checkTenantFeatureAccess } = await import('@/lib/server-plan-guard');
    const access = await checkTenantFeatureAccess(tenantId, 'STAFF_WAITERS');
    if (!access.allowed) {
      return NextResponse.json(
        { 
          error: 'La création de badges serveurs nécessite la formule TERANGA ou supérieure.',
          paywall: access.paywall,
          requiredPlan: access.requiredPlanName,
          currentPlan: access.currentPlanName
        },
        { status: 403 }
      );
    }

    if (!name) {
      return NextResponse.json({ error: 'Le nom du serveur est requis' }, { status: 400 });
    }

    const hash = crypto.randomBytes(4).toString('hex');
    const safeName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const qrCodeSlug = `w_${safeName}_${hash}`;

    const waiter = await prisma.waiter.create({
      data: {
        tenantId,
        name,
        phone: phone || null,
        qrCodeSlug,
      },
    });

    return NextResponse.json({ waiter }, { status: 201 });
  } catch (error) {
    console.error('Erreur création serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
