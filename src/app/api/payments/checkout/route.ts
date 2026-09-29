import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentTransaction } from '@/types/saas';

// POST /api/payments/checkout
// Initialisation & validation de paiement Wave / Orange Money UEMOA
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, planId, provider, phone, periodMonths } = body;

    if (!tenantId || !planId || !provider) {
      return NextResponse.json({ error: 'tenantId, planId et provider sont obligatoires' }, { status: 400 });
    }

    const tenant = await (prisma as any).tenant.findUnique({ where: { id: tenantId } });
    const plan = await (prisma as any).plan.findUnique({ where: { id: planId } });

    if (!plan || !tenant) {
      return NextResponse.json({ error: 'Restaurant ou pack introuvable' }, { status: 404 });
    }

    const months = periodMonths || 1;
    const totalAmount = plan.price * months;

    // Simulation de validation de passerelle Wave / Orange Money
    const txId = `tx_${provider.toLowerCase()}_${Date.now()}`;
    const transaction: PaymentTransaction = {
      id: txId,
      tenantId: tenant.id,
      planId: plan.id,
      amount: totalAmount,
      provider,
      providerTxId: `OM_WAVE_REF_${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'SUCCESS',
      periodMonths: months,
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // 2. Activer / Surclasser le pack du restaurant dans Prisma
    const expirationDate = new Date();
    expirationDate.setMonth(expirationDate.getMonth() + months);
    
    await (prisma as any).tenant.update({
      where: { id: tenant.id },
      data: {
        currentPlanId: plan.id,
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: expirationDate,
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      message: `Paiement ${provider} de ${totalAmount.toLocaleString('fr-FR')} FCFA validé ! Le pack ${plan.name} est activé pour ${months} mois.`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors du traitement du paiement' }, { status: 500 });
  }
}
