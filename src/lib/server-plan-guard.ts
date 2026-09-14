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

/**
 * 🔒 VÉRIFICATION SÉCURISÉE CÔTÉ SERVEUR (API & Server Actions)
 * Vérifie si le tenant a le niveau d'abonnement requis pour exécuter une action ou lire des données.
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

  const tenant = await prisma.tenant.findFirst({
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
          name: true
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
  const allowed = hasAccessToFeature(currentPlanSlug, featureKey);

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
