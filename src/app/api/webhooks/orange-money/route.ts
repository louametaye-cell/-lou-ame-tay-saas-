import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';
import { PaymentTransaction } from '@/types/saas';

// POST /api/webhooks/orange-money
// Webhook IPN Orange Money Sénégal pour confirmation et activation automatique
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      status,
      notif_token,
      txnid,
      order_id,
      amount,
      subscriber_msisdn,
    } = body;

    const tenantId = order_id || 'tenant_pro_01';
    const planId = 'plan_pro';

    // Enregistrement de la transaction Orange Money
    const transaction: PaymentTransaction = {
      id: `om_tx_${txnid || Date.now()}`,
      tenantId,
      planId,
      amount: Number(amount) || 25000,
      provider: 'ORANGE_MONEY',
      providerTxId: txnid || `OM_REF_${Date.now()}`,
      status: status === 'SUCCESS' || status === 'COMPLETED' ? 'SUCCESS' : 'PENDING',
      webhookVerifiedAt: new Date().toISOString(),
      periodMonths: 1,
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    saasStorage.recordTransaction(transaction);

    // Si statut validé -> activation immédiate du pack
    if (transaction.status === 'SUCCESS') {
      saasStorage.upgradeTenantPlan(tenantId, planId, 1);
      console.log(`[ORANGE MONEY WEBHOOK] 💰 Paiement OM validé pour ${tenantId} ! Statut passé à ACTIVE.`);
    }

    return NextResponse.json({
      status: 'SUCCESS',
      message: 'IPN Orange Money traité avec succès',
      txnid,
    });
  } catch (error) {
    console.error('[ORANGE MONEY WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Erreur traitement webhook Orange Money' }, { status: 500 });
  }
}
