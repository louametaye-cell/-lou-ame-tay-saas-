import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentMethod } from '@prisma/client';
import { isAuthorizedTenant } from '@/lib/tenant-auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json({ error: 'Identifiant de commande requis' }, { status: 400 });
    }

    const body = await req.json();
    const {
      paymentMethod = 'CASH',
      cashierId,
      cashSessionId,
      amountReceived,
      changeGiven,
      transactionRef,
      restaurantId,
    } = body;

    // 1. Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        tenant: {
          select: { id: true, businessName: true }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 });
    }

    // 2. Vérification des autorisations :
    // Soit gérant/super-admin authentifié, soit caissier rattaché à ce tenantId
    let isAuthorized = isAuthorizedTenant(req, order.tenantId);

    if (!isAuthorized && cashierId) {
      const dbCashier = await prisma.cashier.findFirst({
        where: { id: cashierId, tenantId: order.tenantId, isActive: true }
      });
      if (dbCashier) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized && cashSessionId) {
      const dbSession = await prisma.cashSession.findFirst({
        where: { id: cashSessionId, tenantId: order.tenantId, status: 'OPEN' }
      });
      if (dbSession) {
        isAuthorized = true;
      }
    }

    // Si la requête provient directement du dashboard ou caisse avec restaurantId correspondant
    if (!isAuthorized && restaurantId) {
      const match = await prisma.tenant.findFirst({
        where: {
          OR: [{ id: restaurantId }, { subdomain: restaurantId }]
        },
        select: { id: true }
      });
      if (match && match.id === order.tenantId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Accès non autorisé pour encaisser cette commande' },
        { status: 401 }
      );
    }

    // 3. Valider le mode de règlement enum
    let resolvedMethod: PaymentMethod = PaymentMethod.CASH;
    if (Object.values(PaymentMethod).includes(paymentMethod as PaymentMethod)) {
      resolvedMethod = paymentMethod as PaymentMethod;
    }

    // 4. Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SERVED',
        paymentStatus: 'PAID',
        paymentMethod: resolvedMethod,
        cashierId: cashierId || undefined,
        cashSessionId: cashSessionId || undefined,
        servedAt: new Date(),
        transactionRef: transactionRef ? String(transactionRef).trim() : undefined,
      },
      include: {
        items: true,
        tenant: {
          select: { id: true, businessName: true, subdomain: true, phone: true }
        }
      }
    });

    // 5. Clôturer d'éventuels appels d'addition en cours pour cette table
    if (order.tableNumber) {
      try {
        await prisma.waiterCall.updateMany({
          where: {
            tenantId: order.tenantId,
            tableNumber: order.tableNumber,
            status: 'PENDING'
          },
          data: {
            status: 'RESOLVED',
            resolvedAt: new Date()
          }
        });
      } catch (err) {
        console.warn('Erreur lors de la résolution automatique du waiterCall:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Commande encaissée et clôturée avec succès',
      order: {
        ...updatedOrder,
        total: Number(updatedOrder.totalAmount),
        totalAmount: Number(updatedOrder.totalAmount),
        amountReceived: amountReceived ? Number(amountReceived) : undefined,
        changeGiven: changeGiven ? Number(changeGiven) : undefined,
      }
    });
  } catch (error) {
    console.error('Erreur API Encaissement Caisse:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'encaissement de la commande" },
      { status: 500 }
    );
  }
}
