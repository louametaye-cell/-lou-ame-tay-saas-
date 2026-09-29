import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/webhooks/orange-money
// Webhook IPN Orange Money Sénégal pour confirmation et activation automatique
export async function POST(req: Request) {
  try {
    const omSecret = process.env.ORANGE_MONEY_WEBHOOK_SECRET;
    const authHeader = req.headers.get('authorization') || req.headers.get('x-om-secret');

    const body = await req.json();
    const {
      status,
      notif_token,
      txnid,
      order_id,
      amount,
      subscriber_msisdn,
    } = body;

    // Validation d'authenticité STRICTE
    if (!omSecret) {
      console.error('[ORANGE MONEY WEBHOOK] CRITICAL ERROR: ORANGE_MONEY_WEBHOOK_SECRET is missing. Rejecting webhook for security.');
      return NextResponse.json({ error: 'Webhook secret is not configured in production' }, { status: 500 });
    }

    const isHeaderValid = authHeader && (authHeader === omSecret || authHeader === `Bearer ${omSecret}`);
    const isTokenValid = notif_token && notif_token === omSecret;
    if (!isHeaderValid && !isTokenValid) {
      return NextResponse.json({ error: 'Signature ou jeton Orange Money non valide' }, { status: 401 });
    }

    if (!txnid && !notif_token) {
      return NextResponse.json({ error: 'Payload IPN invalide' }, { status: 400 });
    }

    const tenantId = order_id;
    if (!tenantId) {
      console.warn('Webhook Orange Money reçu sans order_id/tenantId valide');
      return NextResponse.json({ error: 'order_id requis' }, { status: 400 });
    }
    const planId = 'plan_nio_far';

    // Si statut validé -> activation immédiate du pack
    if (status === 'SUCCESS' || status === 'COMPLETED') {
      
      console.log(`[ORANGE MONEY WEBHOOK] Transaction traitée: om_tx_${txnid} pour ${tenantId}, Montant: ${amount}`);

      // Synchronisation en base de données Supabase / PostgreSQL
      try {
        const expirationDate = new Date();
        expirationDate.setMonth(expirationDate.getMonth() + 1);
        
        const updated = await (prisma as any).tenant.updateMany({
          where: { OR: [{ id: tenantId }, { subdomain: tenantId }] },
          data: {
            subscriptionStatus: 'ACTIVE',
            subscriptionExpiresAt: expirationDate,
          },
        });

        if (updated.count === 0) {
          console.warn(`[ORANGE MONEY WEBHOOK] Aucun tenant trouvé avec l'ID ou le sous-domaine: ${tenantId}`);
        } else {
          console.log(`[ORANGE MONEY WEBHOOK] Paiement OM validé pour ${tenantId} ! Statut passé à ACTIVE.`);
        }
      } catch (dbErr) {
        console.warn('[ORANGE MONEY WEBHOOK] Erreur sync BDD:', dbErr);
        return NextResponse.json({ error: 'Erreur BDD interne' }, { status: 500 });
      }
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
