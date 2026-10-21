import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CashierShift } from '@prisma/client';
import { isAuthorizedTenantAdmin } from '@/lib/tenant-auth';
import { validateCashierPin } from '@/lib/password-policy';
import bcrypt from 'bcryptjs';

function extractTenantFromCookie(req: Request): string | null {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookiesList = cookieHeader.split(';').map((c) => c.trim());
    for (const c of cookiesList) {
      if (c.startsWith('saas_token=')) {
        const val = decodeURIComponent(c.replace('saas_token=', ''));
        if (val.startsWith('resto_session_')) return val.replace('resto_session_', '');
        return val;
      }
    }
  } catch {}
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const explicitTenant = searchParams.get('tenantId') || searchParams.get('restaurantId') || null;
    const tenantId = explicitTenant || extractTenantFromCookie(req);

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId ou restaurantId est requis' }, { status: 400 });
    }

    // Resolve tenant by id or subdomain
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: tenantId }, { subdomain: tenantId }]
      },
      select: { 
        id: true,
        subdomain: true,
        businessName: true,
        plan: { select: { slug: true, name: true } }
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // 🔒 RÈGLE D'OR MULTI-TENANT : Seul le gérant authentifié de cet établissement ou Super-Admin peut voir l'équipe
    if (!isAuthorizedTenantAdmin(req, tenant.id, tenant.subdomain, explicitTenant)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Isolation multi-tenant stricte (Session gérant requise)' },
        { status: 403 }
      );
    }

    // 🔒 Contrôle Paywall : L'équipe caisse nécessite NIO FAR ou supérieur
    const { hasAccessToFeature, getFeaturePaywallInfo } = await import('@/lib/plan-permissions');
    const currentPlan = tenant.plan?.slug?.toLowerCase() || 'tambali';
    if (!hasAccessToFeature(currentPlan, 'STAFF_CASHIERS')) {
      const paywall = getFeaturePaywallInfo('STAFF_CASHIERS');
      return NextResponse.json(
        { 
          error: `La gestion des caissiers nécessite la formule ${paywall.requiredPlanName} ou supérieure.`,
          paywall,
          requiredPlan: paywall.requiredPlanName,
          currentPlan: tenant.plan?.name || 'TÀMBALI'
        },
        { status: 403 }
      );
    }

    // Récupération des caissiers strictement filtrés par tenantId
    const cashiers = await prisma.cashier.findMany({
      where: { tenantId: tenant.id },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        tenantId: true,
        name: true,
        phone: true,
        pinCode: true,
        shift: true,
        schedule: true,
        shiftStart: true,
        shiftEnd: true,
        totalMissingAmount: true,
        missingCount: true,
        lastMissingAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { sessions: true, orders: true }
        },
        sessions: {
          where: { status: 'OPEN' },
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

    // Jamais d'exposition du hash bcrypt côté client : toujours '••••'
    const safeCashiers = cashiers.map((c) => ({
      ...c,
      pinCode: '••••',
      hasPin: Boolean(c.pinCode),
      hasOpenSession: c.sessions.some((s) => s.status === 'OPEN'),
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
    const { tenantId, restaurantId, name, phone, pinCode, shift, schedule, shiftStart, shiftEnd } = body;

    const rawTenantId = tenantId || restaurantId || extractTenantFromCookie(req);
    if (!rawTenantId) {
      return NextResponse.json({ error: 'Identifiant du restaurant requis' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Le nom du caissier est requis' }, { status: 400 });
    }

    const cleanPin = String(pinCode || '').trim();
    const pinValidation = validateCashierPin(cleanPin);
    if (!pinValidation.isValid) {
      return NextResponse.json({ error: pinValidation.error }, { status: 400 });
    }

    const cleanPhone = phone && typeof phone === 'string' && phone.trim() ? phone.trim() : null;

    // Resolve tenant with plan
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: rawTenantId }, { subdomain: rawTenantId }]
      },
      select: { 
        id: true,
        subdomain: true,
        businessName: true,
        plan: { select: { slug: true, name: true } }
      }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // 🔒 RÈGLE D'OR MULTI-TENANT : Seul le gérant de cet établissement ou Super-Admin peut créer un caissier
    const explicitTenant = tenantId || restaurantId || null;
    if (!isAuthorizedTenantAdmin(req, tenant.id, tenant.subdomain, explicitTenant)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Isolation multi-tenant stricte (Session gérant requise)' },
        { status: 403 }
      );
    }

    // 🔒 Contrôle Paywall : La caisse nécessite au minimum NIO FAR
    const { hasAccessToFeature, getFeaturePaywallInfo } = await import('@/lib/plan-permissions');
    const currentPlan = tenant.plan?.slug?.toLowerCase() || 'tambali';
    if (!hasAccessToFeature(currentPlan, 'STAFF_CASHIERS')) {
      const paywall = getFeaturePaywallInfo('STAFF_CASHIERS');
      return NextResponse.json(
        { 
          error: `La création de caissiers nécessite la formule ${paywall.requiredPlanName} ou supérieure.`,
          paywall,
          requiredPlan: paywall.requiredPlanName,
          currentPlan: tenant.plan?.name || 'TÀMBALI'
        },
        { status: 403 }
      );
    }

    // Vérification de l'unicité [tenantId, pinCode] (compatible PIN en clair et PIN hashé bcrypt)
    const existingCashiers = await prisma.cashier.findMany({
      where: { tenantId: tenant.id },
      select: { id: true, name: true, pinCode: true }
    });

    for (const c of existingCashiers) {
      const stored = (c.pinCode || '').trim();
      const isDuplicate = stored.startsWith('$2')
        ? await bcrypt.compare(cleanPin, stored)
        : stored === cleanPin;

      if (isDuplicate) {
        return NextResponse.json(
          { error: `Le code PIN ${cleanPin} est déjà attribué à ${c.name}` },
          { status: 409 }
        );
      }
    }

    // Hachage sécurisé du code PIN avec bcrypt avant insertion
    const hashedPin = await bcrypt.hash(cleanPin, 10);

    // Shift validation
    const validShift = Object.values(CashierShift).includes(shift) ? shift : CashierShift.MORNING;

    const cashier = await prisma.cashier.create({
      data: {
        tenantId: tenant.id,
        name: name.trim(),
        phone: cleanPhone,
        pinCode: hashedPin,
        shift: validShift,
        schedule: schedule?.trim() || null,
        shiftStart: shiftStart ? String(shiftStart).trim() : null,
        shiftEnd: shiftEnd ? String(shiftEnd).trim() : null,
        isActive: true
      }
    });

    return NextResponse.json(
      {
        success: true,
        cashier: {
          ...cashier,
          pinCode: '••••',
          hasPin: true,
          hasOpenSession: false
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur création caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la création du caissier' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, restaurantId, tenantId, name, phone, shift, schedule, shiftStart, shiftEnd, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID caissier manquant' }, { status: 400 });
    }

    const rawTenantId = tenantId || restaurantId || extractTenantFromCookie(req);
    const cashier = await prisma.cashier.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!cashier) {
      return NextResponse.json({ error: 'Caissier introuvable' }, { status: 404 });
    }

    if (!isAuthorizedTenantAdmin(req, cashier.tenantId, cashier.tenant.subdomain, rawTenantId)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    const updateData: any = {};
    if (typeof name === 'string' && name.trim()) updateData.name = name.trim();
    if (typeof phone === 'string') updateData.phone = phone.trim() || null;
    if (shift && Object.values(CashierShift).includes(shift)) updateData.shift = shift;
    if (schedule !== undefined) updateData.schedule = schedule?.trim() || null;
    if (shiftStart !== undefined) updateData.shiftStart = shiftStart ? String(shiftStart).trim() : null;
    if (shiftEnd !== undefined) updateData.shiftEnd = shiftEnd ? String(shiftEnd).trim() : null;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updated = await prisma.cashier.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      cashier: {
        ...updated,
        pinCode: '••••',
      },
    });
  } catch (error) {
    console.error('Erreur mise à jour caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour du caissier' }, { status: 500 });
  }
}
