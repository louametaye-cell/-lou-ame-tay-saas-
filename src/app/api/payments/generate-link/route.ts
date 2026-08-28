import { NextResponse } from 'next/server';
import { generateDirectPaymentLinks } from '@/lib/payment-deep-links';
import { saasStorage } from '@/lib/saas-storage';

// POST /api/payments/generate-link
// Génère un lien direct de paiement Wave / Orange Money et un message WhatsApp
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenantId, planId, periodMonths } = body;

    if (!tenantId || !planId) {
      return NextResponse.json({ error: 'tenantId et planId sont obligatoires' }, { status: 400 });
    }

    const tenant = saasStorage.getTenantById(tenantId);
    const plan = saasStorage.getPlanById(planId);

    if (!tenant || !plan) {
      return NextResponse.json({ error: 'Restaurant ou pack introuvable' }, { status: 404 });
    }

    const months = Number(periodMonths) || 1;
    const links = generateDirectPaymentLinks({
      tenantId: tenant.id,
      tenantName: tenant.businessName || (tenant as any).name || 'Restaurant',
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      periodMonths: months,
      phone: tenant.phone,
    });

    return NextResponse.json({
      success: true,
      links,
      message: `Liens de paiement générés avec succès pour ${tenant.businessName || (tenant as any).name} (${links.amount.toLocaleString('fr-FR')} FCFA).`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la génération du lien de paiement' }, { status: 500 });
  }
}
