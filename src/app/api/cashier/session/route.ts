import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const restaurantId = searchParams.get('restaurantId') || searchParams.get('tenantId');
    const cashierId = searchParams.get('cashierId');

    let session: any = null;

    if (sessionId) {
      session = await prisma.cashSession.findUnique({
        where: { id: sessionId },
        include: {
          cashier: true,
          tenant: {
            select: {
              id: true,
              businessName: true,
              phone: true,
              currency: true
            }
          }
        }
      });
    } else if (restaurantId) {
      const tenant = await prisma.tenant.findFirst({
        where: {
          OR: [{ id: restaurantId }, { subdomain: restaurantId }]
        },
        select: { id: true }
      });

      if (!tenant) {
        return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 });
      }

      session = await prisma.cashSession.findFirst({
        where: {
          tenantId: tenant.id,
          ...(cashierId ? { cashierId } : {}),
          status: 'OPEN'
        },
        orderBy: { openedAt: 'desc' },
        include: {
          cashier: true,
          tenant: {
            select: {
              id: true,
              businessName: true,
              phone: true,
              currency: true
            }
          }
        }
      });
    }

    if (!session) {
      return NextResponse.json({ success: true, session: null });
    }

    // Compute live sales since session opened
    const orders = await prisma.order.findMany({
      where: {
        tenantId: session.tenantId,
        createdAt: { gte: session.openedAt },
        ...(session.closedAt ? { createdAt: { lte: session.closedAt } } : {}),
        status: 'SERVED'
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
    const openingFloat = Number(session.openingFloat) || 0;
    const expectedCash = openingFloat + liveCash;

    return NextResponse.json({
      success: true,
      session: {
        ...session,
        openingFloat,
        liveTotals: {
          cash: liveCash,
          wave: liveWave,
          orangeMoney: liveOM,
          yasMoney: liveYas,
          card: liveCard,
          totalRevenue: liveRevenue,
          expectedCash,
          orderCount: orders.length
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération session de caisse:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération de la session' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { restaurantId, tenantId, cashierId, openingFloat } = body;

    const rawId = restaurantId || tenantId;
    if (!rawId) {
      return NextResponse.json({ error: 'Identifiant restaurant requis' }, { status: 400 });
    }

    if (!cashierId) {
      return NextResponse.json({ error: 'Identifiant du caissier requis' }, { status: 400 });
    }

    const floatVal = Number(openingFloat);
    if (isNaN(floatVal) || floatVal < 0) {
      return NextResponse.json({ error: 'Le fond de démarrage doit être un montant valide (≥ 0 FCFA)' }, { status: 400 });
    }

    // Resolve tenant
    const tenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ id: rawId }, { subdomain: rawId }]
      },
      select: { id: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Établissement introuvable' }, { status: 404 });
    }

    // Check if cashier exists and is active
    const cashier = await prisma.cashier.findFirst({
      where: { id: cashierId, tenantId: tenant.id, isActive: true }
    });

    if (!cashier) {
      return NextResponse.json({ error: 'Caissier introuvable ou inactif' }, { status: 404 });
    }

    // Check if an OPEN session already exists for this restaurant
    const alreadyOpen = await prisma.cashSession.findFirst({
      where: {
        tenantId: tenant.id,
        status: 'OPEN'
      },
      include: { cashier: true }
    });

    if (alreadyOpen) {
      return NextResponse.json({
        error: `Une session de caisse est déjà ouverte par ${alreadyOpen.cashier.name}. Veuillez d'abord la clôturer.`,
        openSession: alreadyOpen
      }, { status: 409 });
    }

    // Create session
    const session = await prisma.cashSession.create({
      data: {
        tenantId: tenant.id,
        cashierId: cashier.id,
        openingFloat: floatVal,
        status: 'OPEN',
        openedAt: new Date()
      },
      include: {
        cashier: true,
        tenant: {
          select: {
            id: true,
            businessName: true,
            phone: true,
            currency: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error('Erreur ouverture de caisse:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de l\'ouverture de caisse' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, countedCash, notes } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Identifiant de session requis' }, { status: 400 });
    }

    const countedVal = Number(countedCash);
    if (isNaN(countedVal) || countedVal < 0) {
      return NextResponse.json({ error: 'Le montant d\'espèces compté doit être un nombre valide' }, { status: 400 });
    }

    const session = await prisma.cashSession.findUnique({
      where: { id: sessionId },
      include: {
        cashier: true,
        tenant: {
          select: {
            id: true,
            businessName: true,
            phone: true,
            currency: true
          }
        }
      }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session introuvable' }, { status: 404 });
    }

    if (session.status === 'CLOSED') {
      return NextResponse.json({ error: 'Cette session est déjà clôturée' }, { status: 400 });
    }

    const closedAt = new Date();

    // Query all served orders during this session
    const orders = await prisma.order.findMany({
      where: {
        tenantId: session.tenantId,
        createdAt: {
          gte: session.openedAt,
          lte: closedAt
        },
        status: 'SERVED'
      },
      select: {
        id: true,
        paymentMethod: true,
        totalAmount: true
      }
    });

    let totalCash = 0;
    let totalWave = 0;
    let totalOM = 0;
    let totalYas = 0;
    let totalCard = 0;

    orders.forEach((o) => {
      const amount = Number(o.totalAmount) || 0;
      switch (o.paymentMethod) {
        case PaymentMethod.WAVE:
          totalWave += amount;
          break;
        case PaymentMethod.ORANGE_MONEY:
          totalOM += amount;
          break;
        case PaymentMethod.YAS_MONEY:
          totalYas += amount;
          break;
        case PaymentMethod.CARD:
          totalCard += amount;
          break;
        case PaymentMethod.CASH:
        case PaymentMethod.CASH_TPE:
        default:
          totalCash += amount;
          break;
      }
    });

    const totalRevenue = totalCash + totalWave + totalOM + totalYas + totalCard;
    const openingFloat = Number(session.openingFloat) || 0;
    const expectedCash = openingFloat + totalCash;
    const cashDiscrepancy = countedVal - expectedCash;

    // Update and finalize session
    const updated = await prisma.cashSession.update({
      where: { id: sessionId },
      data: {
        status: 'CLOSED',
        closedAt,
        countedCash: countedVal,
        expectedCash,
        cashDiscrepancy,
        totalCash,
        totalWave,
        totalOM,
        totalYas,
        totalCard,
        totalRevenue,
        orderCount: orders.length,
        notes: notes?.trim() || null
      },
      include: {
        cashier: true,
        tenant: {
          select: {
            id: true,
            businessName: true,
            phone: true,
            currency: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      session: updated,
      message: 'Clôture de caisse validée et enregistrée'
    });
  } catch (error) {
    console.error('Erreur clôture de caisse:', error);
    return NextResponse.json({ error: 'Erreur serveur lors de la clôture de caisse' }, { status: 500 });
  }
}
