import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthorizedSuperAdmin } from '@/lib/admin-auth';
import { PaymentMethod } from '@prisma/client';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const sessionId = resolvedParams.id;

    if (!isAuthorizedSuperAdmin(req)) {
      return NextResponse.json(
        { error: 'Accès non autorisé : Droits Super-Admin requis' },
        { status: 401 }
      );
    }

    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: {
        cashier: true,
        tenant: true
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session de caisse introuvable' }, { status: 404 });
    }

    if (session.status === 'CLOSED') {
      return NextResponse.json({
        success: true,
        message: 'Cette session est déjà clôturée.',
        session
      });
    }

    // Calculer les ventes réelles associées à cette session
    const orders = await prisma.order.findMany({
      where: {
        tenantId: session.tenantId,
        paymentStatus: 'PAID',
        status: { not: 'CANCELLED' },
        OR: [
          { cashSessionId: session.id },
          {
            cashSessionId: null,
            status: 'SERVED',
            servedAt: {
              gte: session.openedAt
            }
          }
        ]
      },
      select: {
        id: true,
        paymentMethod: true,
        totalAmount: true
      }
    });

    let liveCash = 0;
    let liveWave = 0;
    let liveOM = 0;
    let liveYas = 0;
    let liveCard = 0;

    orders.forEach((o) => {
      const amount = Number(o.totalAmount) || 0;
      switch (o.paymentMethod) {
        case PaymentMethod.WAVE:
          liveWave += amount;
          break;
        case PaymentMethod.ORANGE_MONEY:
          liveOM += amount;
          break;
        case PaymentMethod.YAS_MONEY:
          liveYas += amount;
          break;
        case PaymentMethod.CARD:
          liveCard += amount;
          break;
        case PaymentMethod.CASH:
        case PaymentMethod.CASH_TPE:
        default:
          liveCash += amount;
          break;
      }
    });

    const liveRevenue = liveCash + liveWave + liveOM + liveYas + liveCard;
    const expectedCash = Number(session.openingFloat) + liveCash;

    // Clôturer la session avec note d'audit inaltérable
    const closedSession = await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        countedCash: expectedCash, // Par défaut le montant théorique pour débloquer
        expectedCash,
        cashDiscrepancy: 0,
        totalCash: liveCash,
        totalWave: liveWave,
        totalOM: liveOM,
        totalYas: liveYas,
        totalCard: liveCard,
        totalRevenue: liveRevenue,
        orderCount: orders.length,
        notes: (session.notes ? session.notes + ' • ' : '') + `[FORCÉ PAR SUPER-ADMIN le ${new Date().toLocaleString('fr-FR')}]`
      },
      include: {
        cashier: true,
        tenant: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Session de caisse de ${session.cashier?.name || 'Caissier'} clôturée d'urgence avec succès !`,
      session: closedSession
    });
  } catch (error) {
    console.error('Erreur force close session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la clôture forcée de la session' },
      { status: 500 }
    );
  }
}
