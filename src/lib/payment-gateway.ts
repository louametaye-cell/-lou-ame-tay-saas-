// ==============================================================================
// PASSERELLES DE PAIEMENT SÉNÉGAL (WAVE & ORANGE MONEY UEMOA)
// Lou Ame Tay ? - Encaissement des abonnements SaaS et commandes en FCFA
// ==============================================================================

export interface PaymentInitParams {
  tenantId: string;
  planId: string;
  amount: number;
  provider: 'WAVE' | 'ORANGE_MONEY';
  clientPhone: string;
  successUrl: string;
  cancelUrl: string;
}

export interface PaymentInitResponse {
  paymentUrl: string;
  transactionRef: string;
  provider: 'WAVE' | 'ORANGE_MONEY';
  amount: number;
}

/**
 * Initialise une session de paiement Wave ou Orange Money.
 */
export async function initiateMobilePayment(params: PaymentInitParams): Promise<PaymentInitResponse> {
  const { tenantId, planId, amount, provider, clientPhone } = params;
  const transactionRef = `TX_${provider}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  if (provider === 'WAVE') {
    // Wave Senegal Checkout API
    const waveApiKey = process.env.WAVE_API_KEY;
    const paymentUrl = `https://pay.wave.com/c/${transactionRef}?amount=${amount}&currency=XOF&phone=${encodeURIComponent(clientPhone)}`;
    
    return {
      paymentUrl,
      transactionRef,
      provider: 'WAVE',
      amount,
    };
  } else {
    // Orange Money Senegal Web Payment API
    const omMerchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY;
    const paymentUrl = `https://api.orange.sn/payment/web/pay/${transactionRef}?amount=${amount}`;

    return {
      paymentUrl,
      transactionRef,
      provider: 'ORANGE_MONEY',
      amount,
    };
  }
}
