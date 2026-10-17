import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CashierShift } from '@prisma/client';
import { isAuthorizedTenantAdmin } from '@/lib/tenant-auth';
import bcrypt from 'bcryptjs';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const body = await req.json();
    const { name, phone, pinCode, shift, schedule, isActive, tenantId, restaurantId } = body;

    const current = await prisma.cashier.findUnique({
      where: { id },
      include: { tenant: { select: { subdomain: true } } }
    });

    if (!current) {
      return NextResponse.json({ error: 'Caissier introuvable' }, { status: 404 });
    }

    // 🔒 RÈGLE D'OR MULTI-TENANT : Seul le gérant de cet établissement peut modifier ce caissier
    const explicitTenant = tenantId || restaurantId || null;
    if (!isAuthorizedTenantAdmin(req, current.tenantId, current.tenant?.subdomain, explicitTenant)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Isolation multi-tenant stricte' },
        { status: 403 }
      );
    }

    // Vérifier si le caissier a une session ouverte (status: 'OPEN')
    const openSession = await prisma.cashSession.findFirst({
      where: {
        cashierId: current.id,
        tenantId: current.tenantId,
        status: 'OPEN'
      }
    });

    if (pinCode !== undefined && openSession) {
      return NextResponse.json(
        { error: 'Impossible de modifier le PIN : session de caisse en cours. Effectuez d\'abord la clôture Z.' },
        { status: 400 }
      );
    }

    if (isActive === false && openSession) {
      return NextResponse.json(
        { error: 'Impossible de désactiver ce compte : session de caisse en cours. Effectuez d\'abord la clôture Z.' },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name.trim();
    if (phone !== undefined) dataToUpdate.phone = phone ? phone.trim() : null;
    if (schedule !== undefined) dataToUpdate.schedule = schedule ? schedule.trim() : null;
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    if (shift !== undefined && Object.values(CashierShift).includes(shift)) {
      dataToUpdate.shift = shift;
    }

    if (pinCode !== undefined) {
      const cleanPin = String(pinCode).trim();
      if (!/^\d{4}$/.test(cleanPin)) {
        return NextResponse.json({ error: 'Le code PIN doit comporter 4 chiffres' }, { status: 400 });
      }

      // Check PIN conflict across other cashiers of this tenant
      const otherCashiers = await prisma.cashier.findMany({
        where: {
          tenantId: current.tenantId,
          NOT: { id: current.id }
        },
        select: { id: true, name: true, pinCode: true }
      });

      for (const c of otherCashiers) {
        const stored = (c.pinCode || '').trim();
        const isConflict = stored.startsWith('$2')
          ? await bcrypt.compare(cleanPin, stored)
          : stored === cleanPin;
        if (isConflict) {
          return NextResponse.json({ error: `Le code PIN est déjà utilisé par ${c.name}` }, { status: 409 });
        }
      }

      dataToUpdate.pinCode = await bcrypt.hash(cleanPin, 10);
      dataToUpdate.failedPinAttempts = 0;
      dataToUpdate.lockedUntil = null;
    }

    const updated = await prisma.cashier.update({
      where: { id: current.id },
      data: dataToUpdate
    });

    const { pinCode: _, ...safeUpdated } = updated as any;
    return NextResponse.json({
      success: true,
      cashier: { ...safeUpdated, pinCode: '••••', hasPin: true }
    });
  } catch (error) {
    console.error('Erreur mise à jour caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    const { searchParams } = new URL(req.url);
    const explicitTenant = searchParams.get('restaurantId') || searchParams.get('tenantId') || null;

    const current = await prisma.cashier.findUnique({
      where: { id },
      select: { id: true, tenantId: true, tenant: { select: { subdomain: true } } }
    });

    if (!current) {
      return NextResponse.json({ error: 'Caissier introuvable' }, { status: 404 });
    }

    // 🔒 RÈGLE D'OR MULTI-TENANT : Seul le gérant de cet établissement peut désactiver/supprimer ce caissier
    if (!isAuthorizedTenantAdmin(req, current.tenantId, current.tenant?.subdomain, explicitTenant)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Isolation multi-tenant stricte' },
        { status: 403 }
      );
    }

    // Check if cashier has open session
    const openSession = await prisma.cashSession.findFirst({
      where: { cashierId: id, tenantId: current.tenantId, status: 'OPEN' }
    });

    if (openSession) {
      return NextResponse.json(
        { error: 'Impossible de désactiver ce compte : session de caisse en cours. Effectuez d\'abord la clôture Z.' },
        { status: 400 }
      );
    }

    // Soft delete systématique (Désactiver le compte) pour préserver l'intégrité comptable
    const updated = await prisma.cashier.update({
      where: { id },
      data: { isActive: false }
    });

    const { pinCode: _, ...safeUpdated } = updated as any;

    return NextResponse.json({ 
      success: true, 
      action: 'ARCHIVED',
      message: 'Compte caissier désactivé avec succès.', 
      cashier: { ...safeUpdated, pinCode: '••••', hasPin: true } 
    });
  } catch (error) {
    console.error('Erreur désactivation caissier:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de l\'opération' }, { status: 500 });
  }
}
