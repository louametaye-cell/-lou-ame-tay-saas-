// ==============================================================================
// MOTEUR DE CODES PROMO & PÉRIODES D'ESSAI (TRIALS)
// Lou Ame Tay ? - Accélération de l'acquisition des 1000 restaurants
// ==============================================================================

export interface PromoCode {
  code: string;
  discountPercent?: number;
  discountAmountFCFA?: number;
  trialDays?: number;
  validUntil: string;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  description: string;
}

export const ACTIVE_PROMO_CODES: PromoCode[] = [
  {
    code: 'TERANGA50',
    discountPercent: 50,
    validUntil: '2026-12-31T23:59:59Z',
    usedCount: 14,
    isActive: true,
    description: '-50% de réduction sur le 1er mois pour les nouveaux restaurants.',
  },
  {
    code: 'ESSAI14',
    trialDays: 14,
    validUntil: '2026-12-31T23:59:59Z',
    usedCount: 38,
    isActive: true,
    description: '14 jours d\'essai gratuit sans engagement sur le pack Pro.',
  },
  {
    code: 'DAKARPASS',
    discountPercent: 30,
    validUntil: '2026-12-31T23:59:59Z',
    usedCount: 7,
    isActive: true,
    description: '-30% sur l\'abonnement trimestriel.',
  },
];

/**
 * Valide et applique un code promotionnel.
 */
export function applyPromoCode(code: string, originalAmount: number): {
  valid: boolean;
  discountedAmount: number;
  discountValue: number;
  trialDays?: number;
  message: string;
} {
  const promo = ACTIVE_PROMO_CODES.find((p) => p.code.toUpperCase() === code.toUpperCase().trim() && p.isActive);

  if (!promo) {
    return {
      valid: false,
      discountedAmount: originalAmount,
      discountValue: 0,
      message: 'Code promo invalide ou expiré.',
    };
  }

  if (new Date(promo.validUntil).getTime() < Date.now()) {
    return {
      valid: false,
      discountedAmount: originalAmount,
      discountValue: 0,
      message: 'Ce code promotionnel a expiré.',
    };
  }

  let discountedAmount = originalAmount;
  let discountValue = 0;

  if (promo.discountPercent) {
    discountValue = (originalAmount * promo.discountPercent) / 100;
    discountedAmount = Math.max(0, originalAmount - discountValue);
  } else if (promo.discountAmountFCFA) {
    discountValue = promo.discountAmountFCFA;
    discountedAmount = Math.max(0, originalAmount - discountValue);
  }

  promo.usedCount++;

  return {
    valid: true,
    discountedAmount,
    discountValue,
    trialDays: promo.trialDays,
    message: `Code "${promo.code}" appliqué avec succès : ${promo.description}`,
  };
}
