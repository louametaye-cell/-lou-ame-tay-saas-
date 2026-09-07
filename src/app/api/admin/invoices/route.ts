import { NextResponse } from 'next/server';
import { generateInvoiceHtml, InvoiceData } from '@/lib/invoice-generator';
import { saasStorage } from '@/lib/saas-storage';

// GET /api/admin/invoices
// Récupère ou génère une facture au format HTML / PDF
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId');
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requis' }, { status: 400 });
    }
    const tenant = saasStorage.getTenantById(tenantId);
    const plan = tenant ? saasStorage.getPlanById(tenant.currentPlanId) : null;

    const invoiceData: InvoiceData = {
      invoiceNumber: `FACT-SN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: new Date().toISOString(),
      tenantName: tenant?.businessName || 'Restaurant Partenaire',
      tenantPhone: tenant?.phone || '',
      tenantAddress: tenant?.address ? `${tenant.address}, ${tenant.city || ''}` : 'Sénégal',
      planName: plan?.name || 'Standard',
      periodMonths: 1,
      subtotalAmount: plan?.price || 0,
      vatRatePercent: 0,
      vatAmount: 0,
      totalAmount: plan?.price || 0,
      paymentMethod: 'WAVE',
      transactionRef: `WAVE_TX_${Date.now()}`,
    };

    const html = generateInvoiceHtml(invoiceData);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur génération facture' }, { status: 500 });
  }
}
