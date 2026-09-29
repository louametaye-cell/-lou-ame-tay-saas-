import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface PlanAccessResult {
  allowed: boolean;
  reason?: string;
  code?: 'FEATURE_NOT_INCLUDED' | 'LIMIT_EXCEEDED' | 'SUBSCRIPTION_EXPIRED' | 'TENANT_NOT_FOUND';
  currentPlanName?: string;
  requiredPlanName?: string;
  limitValue?: number | null;
}

/**
 * Vérifie si un tenant a le droit d'utiliser une fonctionnalité et respecte ses quotas.
 */
export async function canUseFeature(
  tenantId: string,
  featureKey: string,
  requestedCount?: number
): Promise<PlanAccessResult> {
  // 1. Récupérer le tenant et son plan via Prisma
  const tenant = await (prisma as any).tenant.findUnique({
    where: { id: tenantId },
    include: { plan: true },
  });

  if (!tenant) {
    return {
      allowed: false,
      reason: `Restaurant locataire "${tenantId}" introuvable.`,
      code: 'TENANT_NOT_FOUND',
    };
  }

  if (tenant.subscriptionStatus !== 'ACTIVE' && tenant.subscriptionStatus !== 'TRIAL') {
    return {
      allowed: false,
      reason: `Votre abonnement est actuellement ${tenant.subscriptionStatus}. Veuillez renouveler votre pack.`,
      code: 'SUBSCRIPTION_EXPIRED',
    };
  }

  const plan = tenant.plan;
  if (!plan) {
    return {
      allowed: false,
      reason: `Pack tarifaire introuvable pour ce restaurant.`,
      code: 'FEATURE_NOT_INCLUDED',
    };
  }

  // NOTE: On vérifie les limites de plan basiques pour l'instant (car le modèle DB n'a peut être pas `features` JSON)
  // L'idéal est de parser les features depuis un champ JSON ou de faire un mapping statique par plan.slug
  let isActive = true;
  let required = 'Xéweul (35 000 FCFA)';

  // Règle statique basée sur le plan.slug
  if (['MULTI_COUNTERS', 'MULTI_TV_SCREENS', 'ADVANCED_EXPORT'].includes(featureKey) && !['baobab', 'teranga', 'buur', 'ndaje'].includes(plan.slug)) {
    isActive = false;
    required = 'Baobab (46 800 FCFA)';
  } else if (['WAITER_QR', 'MULTI_ZONE', 'ZONE_TV_SCREENS'].includes(featureKey) && !['teranga', 'buur', 'ndaje'].includes(plan.slug)) {
    isActive = false;
    required = 'Teranga (65 000 FCFA)';
  } else if (['MULTI_SITES', 'STAFF_PERFORMANCE_ANALYTICS', 'VIP_SUPPORT'].includes(featureKey) && !['buur', 'ndaje'].includes(plan.slug)) {
    isActive = false;
    required = 'Buur (80 000 FCFA)';
  }

  if (!isActive) {
    return {
      allowed: false,
      reason: `La fonctionnalité "${featureKey}" n'est pas incluse dans votre pack ${plan.name}. Veuillez souscrire à la formule ${required} pour la débloquer.`,
      code: 'FEATURE_NOT_INCLUDED',
      currentPlanName: plan.name,
      requiredPlanName: required,
    };
  }

  return {
    allowed: true,
    currentPlanName: plan.name,
    limitValue: null,
  };
}

export const canUseKDS = (tenantId: string) => canUseFeature(tenantId, 'KITCHEN_DISPLAY_KDS');
export const canUseWaveOM = (tenantId: string) => canUseFeature(tenantId, 'WAVE_ORANGE_MONEY');
export const canUseMultiZone = (tenantId: string) => canUseFeature(tenantId, 'MULTI_ZONE');
export const canUseBilingual = (tenantId: string) => canUseFeature(tenantId, 'BILINGUAL_MENU');
export const canUseMultiLanguage = (tenantId: string) => canUseFeature(tenantId, 'MULTI_LANGUAGE_MENU');
export const canUseAdvancedStats = (tenantId: string) => canUseFeature(tenantId, 'ADVANCED_STATS');

/**
 * Middleware d'autorisation pour Next.js API Routes.
 */
export async function checkPlanAccessMiddleware(
  req: Request,
  featureKey: string,
  requestedCount?: number
): Promise<NextResponse | null> {
  const url = new URL(req.url);
  const tenantId = req.headers.get('x-tenant-id') || 
                   url.searchParams.get('tenantId') || 
                   url.searchParams.get('restaurantId') || 
                   '';

  if (!tenantId) {
    return NextResponse.json(
      { error: 'Identifiant de restaurant (tenantId) manquant pour vérifier les droits d\'accès.' },
      { status: 400 }
    );
  }

  const check = await canUseFeature(tenantId, featureKey, requestedCount);
  if (!check.allowed) {
    return NextResponse.json(
      {
        error: check.reason,
        code: check.code,
        currentPlan: check.currentPlanName,
        requiredPlan: check.requiredPlanName,
        limitValue: check.limitValue,
        upgradeUrl: '/super-admin/plans',
      },
      { status: 403 }
    );
  }

  return null;
}
