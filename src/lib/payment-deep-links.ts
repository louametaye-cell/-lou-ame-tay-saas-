// ==============================================================================
// GESTION DES LIENS DIRECTS DE PAIEMENT WAVE & ORANGE MONEY (DEEP LINKING UEMOA)
// Lou Ame Tay ? - Ouverture directe de l'application Wave / Orange Money
// ==============================================================================

export interface PaymentLinkDetails {
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  periodMonths: number;
  waveDeepLink: string;
  waveWebLink: string;
  waveQrCodeUrl: string;
  orangeMoneyLink: string;
  orangeMoneyUssd: string;
  whatsappMessage: string;
  publicPaymentUrl: string;
}

const SUPPORT_PHONE = '+221774587474';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

/**
 * Génère les liens directs de paiement et Deep Links pour Wave et Orange Money.
 */
export function generateDirectPaymentLinks(params: {
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  amount: number;
  periodMonths?: number;
  phone?: string;
}): PaymentLinkDetails {
  const { tenantId, tenantName, planId, planName, amount, periodMonths = 1 } = params;
  const totalAmount = amount * periodMonths;
  const reference = `LAT_${tenantId.toUpperCase()}_${Date.now()}`;

  // 1. WAVE : Deep Link Mobile (Ouvre l'application Wave installée sur le smartphone)
  // Format universel Wave Checkout & Direct Pay
  const waveDeepLink = `https://pay.wave.com/c/co-louametay?amount=${totalAmount}&currency=XOF&client_reference=${reference}&name=${encodeURIComponent(tenantName)}`;
  const waveWebLink = `https://wave.me/${SUPPORT_PHONE}?amount=${totalAmount}&memo=${encodeURIComponent(`Abonnement ${planName} - ${tenantName}`)}`;
  const waveQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(waveDeepLink)}`;

  // 2. ORANGE MONEY : Web Payment & Deep Link USSD
  const orangeMoneyLink = `https://orangemoney.sn/pay?merchantCode=789456123&amount=${totalAmount}&ref=${reference}`;
  const orangeMoneyUssd = `tel:%23144%23391*789456123*${totalAmount}%23`; // #144#391*CodeMarchand*Montant#

  // 3. Lien Public Partageable
  const publicPaymentUrl = `${APP_URL}/pay/${tenantId}?plan=${planId}&months=${periodMonths}`;

  // 4. Message WhatsApp Pré-formaté pour relance ou envoi au restaurateur
  const formattedAmount = totalAmount.toLocaleString('fr-FR') + ' FCFA';
  const whatsappMessage = `🍽️ *Lou Ame Tay ? - Renouvellement d'abonnement*\n\n` +
    `Bonjour *${tenantName}*,\n` +
    `Votre abonnement au *Pack ${planName}* (${periodMonths} mois) est prêt pour règlement.\n\n` +
    `💰 *Montant :* ${formattedAmount}\n` +
    `📱 *Règlement direct en 1 clic :*\n` +
    `👉 ${publicPaymentUrl}\n\n` +
    `_Lien sécurisé Wave & Orange Money officiel MDA Arts Work (+221 77 458 74 74)._`;

  return {
    tenantId,
    tenantName,
    planId,
    planName,
    amount: totalAmount,
    currency: 'FCFA',
    periodMonths,
    waveDeepLink,
    waveWebLink,
    waveQrCodeUrl,
    orangeMoneyLink,
    orangeMoneyUssd,
    whatsappMessage,
    publicPaymentUrl,
  };
}
