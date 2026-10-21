import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cashierId = params.id;
    if (!cashierId) {
      return NextResponse.json({ error: 'ID caissier manquant' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { restaurantId, reason } = body;

    const cashier = await prisma.cashier.findUnique({
      where: { id: cashierId },
      include: { tenant: true },
    });

    if (!cashier) {
      return NextResponse.json({ error: 'Caissier introuvable' }, { status: 404 });
    }

    const tenantId = restaurantId || cashier.tenantId;
    if (!isAuthorizedTenant(req, tenantId)) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
    }

    const previousAmount = cashier.totalMissingAmount;
    const previousCount = cashier.missingCount;

    // Réinitialiser les compteurs de manquants
    const updated = await prisma.cashier.update({
      where: { id: cashierId },
      data: {
        totalMissingAmount: 0,
        missingCount: 0,
      },
    });

    // Journalisation inaltérable dans AuditLog
    await prisma.auditLog.create({
      data: {
        tenantId: cashier.tenantId,
        action: 'RESET_CASHIER_MISSING',
        actorRole: 'MANAGER',
        actorName: cashier.tenant.businessName,
        targetType: 'CASHIER',
        targetId: cashier.id,
        details: {
          cashierName: cashier.name,
          previousMissingAmount: previousAmount,
          previousMissingCount: previousCount,
          reason: reason?.trim() || 'Régularisation / Pardon accordé par la direction',
          resetAt: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Cumul des manquants réinitialisé pour ${cashier.name}`,
      cashier: updated,
    });
  } catch (error) {
    console.error('Erreur reset manquants caissier:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la réinitialisation' },
      { status: 500 }
    );
  }
}
