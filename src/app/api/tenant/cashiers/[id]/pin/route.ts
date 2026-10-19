import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenantAdmin } from '@/lib/tenant-auth';
import { validateCashierPin } from '@/lib/password-policy';
import bcrypt from 'bcryptjs';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const id = resolvedParams.id;
    
    let body: any = {};
    const rawBody = await req.text();
    if (rawBody && rawBody.trim().length > 0) {
      try {
        body = JSON.parse(rawBody);
      } catch (parseErr) {
        console.error('Erreur parsing JSON body:', parseErr, 'Raw body was:', rawBody);
        return NextResponse.json({ error: 'Format JSON invalide' }, { status: 400 });
      }
    }

    const { newPin, pinCode, tenantId, restaurantId } = body;

    const rawPin = String(newPin ?? pinCode ?? '').trim();
    const pinValidation = validateCashierPin(rawPin);
    if (!pinValidation.isValid) {
      return NextResponse.json(
        { error: pinValidation.error },
        { status: 400 }
      );
    }

    const cashier = await prisma.cashier.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, subdomain: true, businessName: true } }
      }
    });

    if (!cashier) {
      return NextResponse.json({ error: 'Caissier introuvable' }, { status: 404 });
    }

    // 🔒 RÈGLE D'OR MULTI-TENANT : Vérification stricte que l'admin appartient bien au tenantId de ce caissier
    const explicitTenant = tenantId || restaurantId || null;
    if (!isAuthorizedTenantAdmin(req, cashier.tenantId, cashier.tenant?.subdomain, explicitTenant)) {
      return NextResponse.json(
        {
          error: 'Accès interdit : Isolation multi-tenant stricte. Vous ne pouvez pas modifier le PIN d\'un caissier d\'un autre établissement.'
        },
        { status: 403 }
      );
    }

    // 🔒 RÈGLE MÉTIER : Bloquer toute modification de PIN si une session de caisse est ouverte (status: 'OPEN')
    const openSession = await prisma.cashSession.findFirst({
      where: {
        cashierId: cashier.id,
        tenantId: cashier.tenantId,
        status: 'OPEN'
      }
    });

    if (openSession) {
      return NextResponse.json(
        {
          error: 'Impossible de modifier le PIN : session de caisse en cours. Effectuez d\'abord la clôture Z.'
        },
        { status: 400 }
      );
    }

    // Vérifier qu'aucun autre caissier du MÊME établissement n'utilise déjà ce code PIN
    const siblingCashiers = await prisma.cashier.findMany({
      where: {
        tenantId: cashier.tenantId,
        NOT: { id: cashier.id }
      },
      select: { id: true, name: true, pinCode: true }
    });

    for (const sibling of siblingCashiers) {
      const stored = (sibling.pinCode || '').trim();
      const isConflict = stored.startsWith('$2')
        ? await bcrypt.compare(rawPin, stored)
        : stored === rawPin;

      if (isConflict) {
        return NextResponse.json(
          { error: `Ce code PIN est déjà attribué à ${sibling.name} dans votre établissement.` },
          { status: 409 }
        );
      }
    }

    // Hachage sécurisé du nouveau PIN avec bcrypt (cost 10)
    const hashedPin = await bcrypt.hash(rawPin, 10);

    const updated = await prisma.cashier.update({
      where: { id: cashier.id },
      data: {
        pinCode: hashedPin,
        failedPinAttempts: 0,
        lockedUntil: null
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        phone: true,
        shift: true,
        schedule: true,
        isActive: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Code PIN de ${updated.name} mis à jour avec succès.`,
      cashier: {
        ...updated,
        pinCode: '••••',
        hasPin: true
      }
    });
  } catch (error) {
    console.error('Erreur modification PIN caissier:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la modification du code PIN' },
      { status: 500 }
    );
  }
}
