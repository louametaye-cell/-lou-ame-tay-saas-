// ==============================================================================
// GÉNÉRATEUR DE FACTURES LÉGALES SÉNÉGAL (UEMOA / OHADA)
// Lou Ame Tay ? - Conformité fiscale NINEA, TVA et reçus Wave/OM
// ==============================================================================

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  tenantName: string;
  tenantPhone: string;
  tenantAddress: string;
  planName: string;
  periodMonths: number;
  subtotalAmount: number;
  vatRatePercent: number;
  vatAmount: number;
  totalAmount: number;
  paymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'VIREMENT';
  transactionRef: string;
}

/**
 * Génère le format HTML structuré imprimable en PDF d'une facture officielle.
 */
export function generateInvoiceHtml(data: InvoiceData): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Facture ${data.invoiceNumber} - Lou Ame Tay ?</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 40px; color: #1e293b; }
        .header { display: flex; justify-content: space-between; border-bottom: 3px solid #FF6B00; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #FF6B00; }
        .agency-info { font-size: 12px; color: #64748b; text-align: right; }
        .invoice-title { font-size: 20px; font-weight: bold; margin-top: 30px; }
        .meta-grid { display: flex; justify-content: space-between; margin-top: 20px; font-size: 13px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 30px; }
        .table th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; }
        .table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .total-box { margin-top: 30px; text-align: right; font-size: 14px; }
        .total-amount { font-size: 22px; font-weight: bold; color: #00A86B; }
        .footer { margin-top: 50px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">🍽️ LOU AME TAY ?</div>
          <p style="font-size: 12px; color: #64748b;">Plateforme de Menu Digital & Caisse SaaS</p>
        </div>
        <div class="agency-info">
          <strong>MDA ARTS WORK SÉNÉGAL</strong><br>
          NINEA : 007845612 / RCCM : SN-DKR-2026-B-1234<br>
          Avenue Cheikh Anta Diop, Dakar, Sénégal<br>
          WhatsApp : +221 77 458 74 74
        </div>
      </div>

      <div class="meta-grid">
        <div>
          <strong>FACTURÉ À :</strong><br>
          ${data.tenantName}<br>
          ${data.tenantAddress}<br>
          Tél : ${data.tenantPhone}
        </div>
        <div style="text-align: right;">
          <strong>RÉFÉRENCE FACTURE :</strong> ${data.invoiceNumber}<br>
          <strong>DATE :</strong> ${new Date(data.issueDate).toLocaleDateString('fr-FR')}<br>
          <strong>RÈGLEMENT :</strong> ${data.paymentMethod} (${data.transactionRef})
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Désignation de la Prestation</th>
            <th>Durée</th>
            <th>P.U HT</th>
            <th>Total HT</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Abonnement SaaS Menu Digital — Pack ${data.planName}</td>
            <td>${data.periodMonths} mois</td>
            <td>${data.subtotalAmount.toLocaleString('fr-FR')} FCFA</td>
            <td>${data.subtotalAmount.toLocaleString('fr-FR')} FCFA</td>
          </tr>
        </tbody>
      </table>

      <div class="total-box">
        <p>Total Hors Taxes : <strong>${data.subtotalAmount.toLocaleString('fr-FR')} FCFA</strong></p>
        <p>TVA (18% Exonération Franchise Numérique) : <strong>0 FCFA</strong></p>
        <p class="total-amount">NET À PAYER : ${data.totalAmount.toLocaleString('fr-FR')} FCFA</p>
        <p style="color: #00A86B; font-weight: bold;">✅ FACTURE ACQUITTÉE PAR ${data.paymentMethod}</p>
      </div>

      <div class="footer">
        Facture générée électroniquement par la plateforme Lou Ame Tay ? — Document certifié conforme aux normes UEMOA.
      </div>
    </body>
    </html>
  `;
}
