import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  FeatureKey, 
  hasAccessToFeature, 
  getFeaturePaywallInfo, 
  FeaturePaywall 
} from '@/lib/plan-permissions';

export interface TenantFeatureAccessResult {
  allowed: boolean;
  tenantId: string | null;
  tenantName: string;
  currentPlanSlug: string;
  currentPlanName: string;
  requiredPlanSlug: string;
  requiredPlanName: string;
  paywall: FeaturePaywall;
}

// Dictionnaire de correspondances entre les clés canoniques et les clés stockées en base
const FEATURE_KEY_ALIASES: Record<string, string[]> = {
  MENU_MANAGEMENT: ['MENU_MANAGEMENT', 'MENU_DIGITAL'],
  STOCK_MANAGEMENT: ['STOCK_MANAGEMENT'],
  STUDIO_BRANDING: ['STUDIO_BRANDING', 'STUDIO_CUSTOMIZATION'],
  CONSULTATION_STATS: ['CONSULTATION_STATS'],
  TABLE_ORDERING: ['TABLE_ORDERING'],
  CASHIER_POS: ['CASHIER_POS', 'EXPRESS_POS', 'EXPRESS_CASHIER_MODE'],
  ORDER_HISTORY: ['ORDER_HISTORY'],
  STAFF_CASHIERS: ['STAFF_CASHIERS'],
  BASIC_SALES_STATS: ['BASIC_SALES_STATS', 'BASIC_STATS'],
  KITCHEN_KDS: ['KITCHEN_KDS', 'KITCHEN_DISPLAY_KDS', 'KDS_LIVE_SYNC'],
  PICKUP_SCREEN: ['PICKUP_SCREEN'],
  TV_DISPLAY_SIMPLE: ['TV_DISPLAY_SIMPLE', 'SINGLE_TV_SCREEN', 'TV_SCREEN_GRID'],
  BLUETOOTH_PRINTING: ['BLUETOOTH_PRINTING'],
  MULTI_LANGUAGE: ['MULTI_LANGUAGE', 'MULTI_LANGUAGE_MENU', 'MULTILINGUAL_WOLOF', 'BILINGUAL_MENU'],
  FULL_SALES_STATS: ['FULL_SALES_STATS', 'ADVANCED_STATS'],
  MULTI_CASHIERS: ['MULTI_CASHIERS', 'MULTI_COUNTERS', 'CASHIER_LIMIT'],
  TV_DISPLAY_MULTI: ['TV_DISPLAY_MULTI', 'MULTI_TV_SCREENS'],
  ADVANCED_EXPORT: ['ADVANCED_EXPORT', 'EXPORT_DATA'],
  ZONE_MANAGEMENT: ['ZONE_MANAGEMENT', 'MULTI_ZONE'],
  STAFF_WAITERS: ['STAFF_WAITERS', 'WAITER_QR'],
  TV_DISPLAY_ZONE: ['TV_DISPLAY_ZONE', 'ZONE_TV_SCREENS'],
  MULTI_SITES: ['MULTI_SITES', 'MULTI_LOCATION'],
  STAFF_ANALYTICS: ['STAFF_ANALYTICS', 'STAFF_PERFORMANCE_ANALYTICS'],
  VIP_SUPPORT: ['VIP_SUPPORT']
};

/**
 * 🔒 VÉRIFICATION SÉCURISÉE CÔTÉ SERVEUR (API & Server Actions)
 * Vérifie si le tenant a le droit d'exécuter une action ou d'accéder à une ressource,
 * en consultant prioritairement les flags réels de la BDD (planFeatures),
 * avec fallback strict sur la hiérarchie officielle Wolof (TÀMBALI à BUUR/NDAJÉ).
 * 
 * @param identifier - id ou subdomain du tenant
 * @param featureKey - la fonctionnalité sollicitée
 */
export async function checkTenantFeatureAccess(
  identifier: string,
  featureKey: FeatureKey
): Promise<TenantFeatureAccessResult> {
  const paywall = getFeaturePaywallInfo(featureKey);

  if (!identifier) {
    return {
      allowed: false,
      tenantId: null,
      tenantName: '',
      currentPlanSlug: 'tambali',
      currentPlanName: 'TÀMBALI',
      requiredPlanSlug: paywall.requiredPlan,
      requiredPlanName: paywall.requiredPlanName,
      paywall
    };
  }

  const tenant = await (prisma as any).tenant.findFirst({
    where: {
      OR: [
        { id: identifier },
        { subdomain: identifier }
      ]
    },
    select: {
      id: true,
      businessName: true,
      subdomain: true,
      plan: {
        select: {
          id: true,
          slug: true,
          name: true,
          planFeatures: {
            select: {
              isActive: true,
              limitValue: true,
              feature: {
                select: {
                  keyName: true
                }
              }
            }
          }
        }
      }
    }
  });

  if (!tenant) {
    return {
      allowed: false,
      tenantId: null,
      tenantName: '',
      currentPlanSlug: 'tambali',
      currentPlanName: 'TÀMBALI',
      requiredPlanSlug: paywall.requiredPlan,
      requiredPlanName: paywall.requiredPlanName,
      paywall
    };
  }

  const currentPlanSlug = tenant.plan?.slug?.toLowerCase() || 'tambali';
  const currentPlanName = tenant.plan?.name || 'TÀMBALI';

  // 1. Vérification en base de données réelle (planFeatures configurées)
  let allowedFromDb: boolean | null = null;
  const planFeatures = tenant.plan?.planFeatures;

  if (Array.isArray(planFeatures) && planFeatures.length > 0) {
    const candidateKeys = FEATURE_KEY_ALIASES[featureKey] || [featureKey];
    const match = planFeatures.find((pf: any) => 
      candidateKeys.includes(pf.feature?.keyName)
    );
    if (match !== undefined) {
      allowedFromDb = Boolean(match.isActive);
    }
  }

  // Si trouvé en BDD, priorité à la décision BDD ; sinon hiérarchie stricte des formules
  const allowed = allowedFromDb !== null 
    ? allowedFromDb 
    : hasAccessToFeature(currentPlanSlug, featureKey);

  return {
    allowed,
    tenantId: tenant.id,
    tenantName: tenant.businessName,
    currentPlanSlug,
    currentPlanName,
    requiredPlanSlug: paywall.requiredPlan,
    requiredPlanName: paywall.requiredPlanName,
    paywall
  };
}

/**
 * Garde bloquant à utiliser directement dans les routes d'API
 * Renvoie { isAuthorized: true } ou { isAuthorized: false, response: NextResponse 403 }
 */
export async function assertPlanAccess(
  identifier: string,
  featureKey: FeatureKey
): Promise<{ isAuthorized: true; result: TenantFeatureAccessResult } | { isAuthorized: false; response: NextResponse }> {
  const result = await checkTenantFeatureAccess(identifier, featureKey);
  
  if (!result.allowed) {
    return {
      isAuthorized: false,
      response: NextResponse.json(
        {
          error: 'FORBIDDEN_PLAN_FEATURE',
          message: `Accès réservé : la fonctionnalité "${result.paywall.name}" requiert la formule ${result.requiredPlanName}.`,
          currentPlan: result.currentPlanName,
          requiredPlan: result.requiredPlanName,
          paywall: result.paywall
        },
        { status: 403 }
      )
    };
  }

  return { isAuthorized: true, result };
}
