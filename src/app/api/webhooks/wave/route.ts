import { NextResponse } from 'next/server';
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

    // Validation cryptographique STRICTE
    if (!webhookSecret) {
      console.error('[WAVE WEBHOOK] CRITICAL ERROR: WAVE_WEBHOOK_SECRET is missing. Rejecting webhook for security.');
      return NextResponse.json({ error: 'Webhook secret is not configured in production' }, { status: 500 });
    }

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
      console.warn('Webhook Wave reçu sans tenant_id valide');
      return NextResponse.json({ error: 'tenant_id requis' }, { status: 400 });
    }
    const planId = metadata?.plan_id || 'plan_nio_far';
    const periodMonths = metadata?.period_months || 1;

    // TODO: Enregistrer la transaction dans Prisma si une table de transaction existe.
    // Pour l'instant, logguer simplement l'événement au lieu d'utiliser saasStorage en mémoire.
    console.log(`[WAVE WEBHOOK] Transaction traitée: wave_tx_${waveTransactionId} pour ${tenantId}, Montant: ${amount}`);

    // Synchronisation en base de données Supabase / PostgreSQL
    try {
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + Number(periodMonths));
      
      const updated = await (prisma as any).tenant.updateMany({
        where: { OR: [{ id: tenantId }, { subdomain: tenantId }] },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: expirationDate,
        },
      });

      if (updated.count === 0) {
        console.warn(`[WAVE WEBHOOK] Aucun tenant trouvé avec l'ID ou le sous-domaine: ${tenantId}`);
      } else {
        console.log(`[WAVE WEBHOOK] Paiement Wave validé pour ${tenantId} ! Statut passé à ACTIVE.`);
      }

    } catch (dbErr) {
      console.warn('[WAVE WEBHOOK] Erreur sync BDD:', dbErr);
      return NextResponse.json({ error: 'Erreur BDD interne' }, { status: 500 });
    }

    return NextResponse.json({
      received: true,
      status: 'PROCESSED',
      tenantId,
      transactionId: waveTransactionId,
    });
  } catch (error) {
    console.error('[WAVE WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Erreur traitement webhook Wave' }, { status: 500 });
  }
}
