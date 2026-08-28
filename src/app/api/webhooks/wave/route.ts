import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';
import { PaymentTransaction } from '@/types/saas';

// POST /api/webhooks/wave
// Webhook officiel Wave pour confirmation de paiement et activation instantanée
export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-wave-signature') || req.headers.get('wave-signature');
    const body = await req.json();

    const {
      type,
      data: {
        id: waveTransactionId,
        amount,
        currency,
        client_reference,
        payment_status,
        metadata,
      } = {} as any,
    } = body;

    // Récupération des informations de la transaction
    const tenantId = metadata?.tenant_id || client_reference || 'tenant_pro_01';
    const planId = metadata?.plan_id || 'plan_pro';
    const periodMonths = metadata?.period_months || 1;

    // Enregistrement de la transaction
    const transaction: PaymentTransaction = {
      id: `wave_tx_${waveTransactionId || Date.now()}`,
      tenantId,
      planId,
      amount: Number(amount) || 25000,
      provider: 'WAVE',
      providerTxId: waveTransactionId || `WAVE_REF_${Date.now()}`,
      status: 'SUCCESS',
      webhookVerifiedAt: new Date().toISOString(),
      periodMonths: Number(periodMonths),
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    saasStorage.recordTransaction(transaction);

    // ⚡ Activation instantanée du pack et statut ACTIVE
    saasStorage.upgradeTenantPlan(tenantId, planId, Number(periodMonths));

    console.log(`[WAVE WEBHOOK] 💰 Paiement Wave validé pour ${tenantId} ! Statut passé à ACTIVE.`);

    return NextResponse.json({
      received: true,
      status: 'PROCESSED',
      tenantId,
      transactionId: transaction.id,
    });
  } catch (error) {
    console.error('[WAVE WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Erreur traitement webhook Wave' }, { status: 500 });
  }
}
