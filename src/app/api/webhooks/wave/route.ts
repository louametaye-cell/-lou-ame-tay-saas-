import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';
import { PaymentTransaction } from '@/types/saas';
import { prisma } from '@/lib/prisma';

import crypto from 'crypto';

// POST /api/webhooks/wave
// Webhook officiel Wave pour confirmation de paiement et activation instantanée
export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-wave-signature') || req.headers.get('wave-signature');
    const webhookSecret = process.env.WAVE_WEBHOOK_SECRET;

    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'JSON invalide' }, { status: 400 });
    }

    // Validation cryptographique si la clé secrète WAVE_WEBHOOK_SECRET est configurée
    if (webhookSecret) {
      if (!signature) {
        return NextResponse.json({ error: 'Signature Wave manquante' }, { status: 401 });
      }
      const expectedHmac = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedHmac);
      const isHmacValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);
      const isTokenValid = signature === webhookSecret;

      if (!isHmacValid && !isTokenValid) {
        return NextResponse.json({ error: 'Signature Wave non valide' }, { status: 401 });
      }
    }

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
    const tenantId = metadata?.tenant_id || client_reference;
    if (!tenantId) {
      console.warn('⚠️ Webhook Wave reçu sans tenant_id valide');
      return NextResponse.json({ error: 'tenant_id requis' }, { status: 400 });
    }
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

    // Synchronisation en base de données Supabase / PostgreSQL
    try {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + Number(periodMonths));
      await (prisma as any).tenant.update({
        where: { id: tenantId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: expirationDate,
        },
      });
    } catch (dbErr) {
      // Si tenant introuvable par ID, essayer par sous-domaine
      try {
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + Number(periodMonths));
        await (prisma as any).tenant.updateMany({
          where: { subdomain: tenantId },
          data: {
            subscriptionStatus: 'ACTIVE',
            subscriptionExpiresAt: expirationDate,
          },
        });
      } catch (innerErr) {
        console.warn('[WAVE WEBHOOK] Erreur sync BDD:', innerErr);
      }
    }

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
