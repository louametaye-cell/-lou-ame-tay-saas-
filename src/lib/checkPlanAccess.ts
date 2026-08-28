import { NextResponse } from 'next/server';
import { saasStorage } from '@/lib/saas-storage';

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
export function canUseFeature(
  tenantId: string,
  featureKey: string,
  requestedCount?: number
): PlanAccessResult {
  const tenant = saasStorage.getTenantById(tenantId);
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

  const plan = saasStorage.getPlanById(tenant.currentPlanId);
  if (!plan) {
    return {
      allowed: false,
      reason: `Pack tarifaire introuvable pour ce restaurant.`,
      code: 'FEATURE_NOT_INCLUDED',
    };
  }

  const planFeature = plan.features.find((f) => f.featureKey === featureKey);

  // 1. Vérifier si la fonctionnalité est active dans le pack
  if (!planFeature || !planFeature.isActive) {
    return {
      allowed: false,
      reason: `La fonctionnalité "${featureKey}" n'est pas incluse dans votre pack ${plan.name}. Upgradez votre pack pour y accéder.`,
      code: 'FEATURE_NOT_INCLUDED',
      currentPlanName: plan.name,
      requiredPlanName: featureKey === 'MULTI_ZONE' || featureKey === 'BILINGUAL_MENU' ? 'Premium' : 'Pro',
    };
  }

  // 2. Vérifier les limites numériques (ex: 20 photos, 1 table)
  if (planFeature.limitValue !== null && planFeature.limitValue !== undefined && requestedCount !== undefined) {
    if (requestedCount > planFeature.limitValue) {
      return {
        allowed: false,
        reason: `Limite de quota atteinte : Votre pack ${plan.name} est plafonné à ${planFeature.limitValue} (${featureKey}).`,
        code: 'LIMIT_EXCEEDED',
        currentPlanName: plan.name,
        limitValue: planFeature.limitValue,
      };
    }
  }

  return {
    allowed: true,
    currentPlanName: plan.name,
    limitValue: planFeature.limitValue,
  };
}

// Helpers spécifiques pour chaque cas d'usage métier
export const canUseKDS = (tenantId: string) => canUseFeature(tenantId, 'KITCHEN_DISPLAY_KDS');
export const canUseWaveOM = (tenantId: string) => canUseFeature(tenantId, 'WAVE_ORANGE_MONEY');
export const canUseMultiZone = (tenantId: string) => canUseFeature(tenantId, 'MULTI_ZONE');
export const canUseBilingual = (tenantId: string) => canUseFeature(tenantId, 'BILINGUAL_MENU');
export const canUseMultiLanguage = (tenantId: string) => canUseFeature(tenantId, 'MULTI_LANGUAGE_MENU');
export const canUseAdvancedStats = (tenantId: string) => canUseFeature(tenantId, 'ADVANCED_STATS');

/**
 * Middleware d'autorisation pour Next.js API Routes.
 * Renvoie une réponse 403 Forbidden standardisée en cas de restriction de pack.
 */
export function checkPlanAccessMiddleware(
  req: Request,
  featureKey: string,
  requestedCount?: number
): NextResponse | null {
  const url = new URL(req.url);
  const tenantId = req.headers.get('x-tenant-id') || 
                   url.searchParams.get('tenantId') || 
                   url.searchParams.get('restaurantId') || 
                   'tenant_pro_01';

  const check = canUseFeature(tenantId, featureKey, requestedCount);
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

  return null; // OK, continue execution
}
