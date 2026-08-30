import { 
  SaaSFeature, 
  SaaSPlan, 
  SaaSTenant, 
  PaymentTransaction 
} from '@/types/saas';

// Initial Features Catalog
export const DEFAULT_FEATURES: SaaSFeature[] = [
  {
    id: 'feat_photos',
    keyName: 'MAX_PHOTOS',
    label: 'Photos Plats HD',
    description: 'Nombre de photos de plats affichables sur le menu digital',
    category: 'CORE',
    valueType: 'NUMERIC',
  },
  {
    id: 'feat_tables',
    keyName: 'MAX_TABLES',
    label: 'Tables & QR Codes',
    description: 'Nombre de tables physiques équipées de QR codes',
    category: 'CORE',
    valueType: 'NUMERIC',
  },
  {
    id: 'feat_kds',
    keyName: 'KITCHEN_DISPLAY_KDS',
    label: 'Écran Cuisine KDS & Alerte Sonore',
    description: 'Envoi direct des commandes en cuisine avec alerte sonore immédiate',
    category: 'OPERATION',
    valueType: 'BOOLEAN',
  },
  {
    id: 'feat_wave_om',
    keyName: 'WAVE_ORANGE_MONEY',
    label: 'Paiements Mobiles Wave & Orange Money',
    description: 'Encaissement direct des commandes via Wave et Orange Money UEMOA',
    category: 'BILLING',
    valueType: 'BOOLEAN',
  },
  {
    id: 'feat_basic_stats',
    keyName: 'BASIC_STATS',
    label: 'Statistiques de Caisse Standard',
    description: 'Suivi du chiffre d\'affaires journalier et volume de commandes',
    category: 'CORE',
    valueType: 'BOOLEAN',
  },
  {
    id: 'feat_multizone',
    keyName: 'MULTI_ZONE',
    label: 'Multi-Zones (Salle, Terrasse, Piscine)',
    description: 'Segmentation des tables par zones distinctes avec tarification dédiée',
    category: 'OPERATION',
    valueType: 'BOOLEAN',
  },
  {
    id: 'feat_bilingual',
    keyName: 'BILINGUAL_MENU',
    label: 'Menu Bilingue & Multi-Langues',
    description: 'Traduction automatique Français, Wolof et Anglais',
    category: 'MARKETING',
    valueType: 'BOOLEAN',
  },
  {
    id: 'feat_multilang',
    keyName: 'MULTI_LANGUAGE_MENU',
    label: 'Menu Multilingue 4 Langues (FR, EN, ES, IT)',
    description: 'Traduction automatique intégrale pour les hôtels et touristes internationaux',
    category: 'MARKETING',
    valueType: 'BOOLEAN',
  },
  {
    id: 'feat_advanced_stats',
    keyName: 'ADVANCED_STATS',
    label: 'Statistiques Avancées & Exports Excel',
    description: 'Analyses de rentabilité, heures de pointe et exports comptables',
    category: 'BILLING',
    valueType: 'BOOLEAN',
  },
  {
    id: 'feat_vip_support',
    keyName: 'VIP_SUPPORT',
    label: 'Accompagnement VIP & Support Dédié 24/7',
    description: 'Gestionnaire de compte dédié et assistance prioritaire en 15 minutes',
    category: 'CORE',
    valueType: 'BOOLEAN',
  },
];

// Initial Plans Seed (Starter, Pro, Premium)
export const DEFAULT_PLANS: SaaSPlan[] = [
  {
    id: 'plan_starter',
    name: 'Starter',
    slug: 'starter',
    price: 15000,
    currency: 'FCFA',
    description: 'Idéal pour démarrer la visibilité digitale à moindre coût (Menu consultation).',
    colorTheme: '#64748b',
    isRecommended: false,
    isActive: true,
    features: [
      { id: 'pf_s_1', planId: 'plan_starter', featureId: 'feat_photos', featureKey: 'MAX_PHOTOS', isActive: true, limitValue: 20 },
      { id: 'pf_s_2', planId: 'plan_starter', featureId: 'feat_tables', featureKey: 'MAX_TABLES', isActive: true, limitValue: 1 },
      { id: 'pf_s_3', planId: 'plan_starter', featureId: 'feat_kds', featureKey: 'KITCHEN_DISPLAY_KDS', isActive: false, limitValue: null },
      { id: 'pf_s_4', planId: 'plan_starter', featureId: 'feat_wave_om', featureKey: 'WAVE_ORANGE_MONEY', isActive: false, limitValue: null },
      { id: 'pf_s_5', planId: 'plan_starter', featureId: 'feat_basic_stats', featureKey: 'BASIC_STATS', isActive: false, limitValue: null },
      { id: 'pf_s_6', planId: 'plan_starter', featureId: 'feat_multizone', featureKey: 'MULTI_ZONE', isActive: false, limitValue: null },
      { id: 'pf_s_7', planId: 'plan_starter', featureId: 'feat_bilingual', featureKey: 'BILINGUAL_MENU', isActive: false, limitValue: null },
      { id: 'pf_s_10', planId: 'plan_starter', featureId: 'feat_multilang', featureKey: 'MULTI_LANGUAGE_MENU', isActive: false, limitValue: null },
      { id: 'pf_s_8', planId: 'plan_starter', featureId: 'feat_advanced_stats', featureKey: 'ADVANCED_STATS', isActive: false, limitValue: null },
      { id: 'pf_s_9', planId: 'plan_starter', featureId: 'feat_vip_support', featureKey: 'VIP_SUPPORT', isActive: false, limitValue: null },
    ],
  },
  {
    id: 'plan_pro',
    name: 'Pro',
    slug: 'pro',
    price: 25000,
    currency: 'FCFA',
    description: 'Le choix le plus populaire : cuisine en direct, alertes sonores et paiements Wave/OM.',
    colorTheme: '#FF6B00',
    isRecommended: true,
    isActive: true,
    features: [
      { id: 'pf_p_1', planId: 'plan_pro', featureId: 'feat_photos', featureKey: 'MAX_PHOTOS', isActive: true, limitValue: null }, // Illimité
      { id: 'pf_p_2', planId: 'plan_pro', featureId: 'feat_tables', featureKey: 'MAX_TABLES', isActive: true, limitValue: null }, // Illimité
      { id: 'pf_p_3', planId: 'plan_pro', featureId: 'feat_kds', featureKey: 'KITCHEN_DISPLAY_KDS', isActive: true, limitValue: null },
      { id: 'pf_p_4', planId: 'plan_pro', featureId: 'feat_wave_om', featureKey: 'WAVE_ORANGE_MONEY', isActive: true, limitValue: null },
      { id: 'pf_p_5', planId: 'plan_pro', featureId: 'feat_basic_stats', featureKey: 'BASIC_STATS', isActive: true, limitValue: null },
      { id: 'pf_p_6', planId: 'plan_pro', featureId: 'feat_multizone', featureKey: 'MULTI_ZONE', isActive: false, limitValue: null },
      { id: 'pf_p_7', planId: 'plan_pro', featureId: 'feat_bilingual', featureKey: 'BILINGUAL_MENU', isActive: false, limitValue: null },
      { id: 'pf_p_10', planId: 'plan_pro', featureId: 'feat_multilang', featureKey: 'MULTI_LANGUAGE_MENU', isActive: false, limitValue: null },
      { id: 'pf_p_8', planId: 'plan_pro', featureId: 'feat_advanced_stats', featureKey: 'ADVANCED_STATS', isActive: false, limitValue: null },
      { id: 'pf_p_9', planId: 'plan_pro', featureId: 'feat_vip_support', featureKey: 'VIP_SUPPORT', isActive: false, limitValue: null },
    ],
  },
  {
    id: 'plan_premium',
    name: 'Premium VIP',
    slug: 'premium',
    price: 45000,
    currency: 'FCFA',
    description: 'Pour les grands restaurants et complexes : Multi-zones, Bilingue, Analyses complètes et VIP 24/7.',
    colorTheme: '#00A86B',
    isRecommended: false,
    isActive: true,
    features: [
      { id: 'pf_pr_1', planId: 'plan_premium', featureId: 'feat_photos', featureKey: 'MAX_PHOTOS', isActive: true, limitValue: null },
      { id: 'pf_pr_2', planId: 'plan_premium', featureId: 'feat_tables', featureKey: 'MAX_TABLES', isActive: true, limitValue: null },
      { id: 'pf_pr_3', planId: 'plan_premium', featureId: 'feat_kds', featureKey: 'KITCHEN_DISPLAY_KDS', isActive: true, limitValue: null },
      { id: 'pf_pr_4', planId: 'plan_premium', featureId: 'feat_wave_om', featureKey: 'WAVE_ORANGE_MONEY', isActive: true, limitValue: null },
      { id: 'pf_pr_5', planId: 'plan_premium', featureId: 'feat_basic_stats', featureKey: 'BASIC_STATS', isActive: true, limitValue: null },
      { id: 'pf_pr_6', planId: 'plan_premium', featureId: 'feat_multizone', featureKey: 'MULTI_ZONE', isActive: true, limitValue: null },
      { id: 'pf_pr_7', planId: 'plan_premium', featureId: 'feat_bilingual', featureKey: 'BILINGUAL_MENU', isActive: true, limitValue: null },
      { id: 'pf_pr_10', planId: 'plan_premium', featureId: 'feat_multilang', featureKey: 'MULTI_LANGUAGE_MENU', isActive: true, limitValue: null },
      { id: 'pf_pr_8', planId: 'plan_premium', featureId: 'feat_advanced_stats', featureKey: 'ADVANCED_STATS', isActive: true, limitValue: null },
      { id: 'pf_pr_9', planId: 'plan_premium', featureId: 'feat_vip_support', featureKey: 'VIP_SUPPORT', isActive: true, limitValue: null },
    ],
  },
];

// Initial Seed Tenants (3 Restaurants Fictifs Démo Commerciale)
export const DEFAULT_TENANTS: SaaSTenant[] = [
  // 1. MG CAFÉ RESTO (Dakar - Pack STARTER) -> demo.starter@louametay.sn
  {
    id: 'tenant_mg_cafe_resto',
    businessName: 'MG Café Resto',
    subdomain: 'mg-cafe-resto',
    ownerName: 'Moussa Guèye',
    phone: '+221 77 458 74 74',
    address: 'Plateau',
    city: 'Dakar',
    currentPlanId: 'plan_starter',
    subscriptionStatus: 'ACTIVE',
    subscriptionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    qrScansToday: 28,
    ordersToday: 12,
    storageUsedMb: 15,
    photosCount: 10,
    tablesCount: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 2. CHEZ COLLÉ RESTAURANT (Thiès - Pack PRO) -> demo.pro@louametay.sn
  {
    id: 'tenant_chez_colle',
    businessName: 'Chez Collé Restaurant',
    subdomain: 'chez-colle',
    ownerName: 'Collé Cissé',
    phone: '+221 77 458 74 74',
    address: 'Avenue Lamine Guèye',
    city: 'Thiès',
    currentPlanId: 'plan_pro',
    subscriptionStatus: 'ACTIVE',
    subscriptionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    lastSeenAt: new Date(Date.now() - 1000 * 45).toISOString(),
    qrScansToday: 110,
    ordersToday: 55,
    storageUsedMb: 40,
    photosCount: 22,
    tablesCount: 14,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // 3. HÔTEL RESTAURANT CAYOR (Saly / Mbour - Pack PREMIUM Multi-Zones) -> demo.premium@louametay.sn
  {
    id: 'tenant_hotel_cayor',
    businessName: 'Hôtel Restaurant Cayor',
    subdomain: 'hotel-cayor',
    ownerName: 'Direction Hôtel Cayor',
    phone: '+221 77 458 74 74',
    address: 'Zone Balnéaire, Saly Portudal',
    city: 'Saly Portudal',
    currentPlanId: 'plan_premium',
    subscriptionStatus: 'ACTIVE',
    subscriptionExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString(),
    lastSeenAt: new Date(Date.now() - 1000 * 15).toISOString(),
    qrScansToday: 240,
    ordersToday: 118,
    storageUsedMb: 68,
    photosCount: 25,
    tablesCount: 24,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Global attached storage
declare global {
  var globalSaaSFeatures: SaaSFeature[] | undefined;
  var globalSaaSPlans: SaaSPlan[] | undefined;
  var globalSaaSTenants: SaaSTenant[] | undefined;
  var globalSaaSTransactions: PaymentTransaction[] | undefined;
}

class SaasStorageService {
  private get features(): SaaSFeature[] {
    if (!globalThis.globalSaaSFeatures) {
      globalThis.globalSaaSFeatures = JSON.parse(JSON.stringify(DEFAULT_FEATURES));
    }
    return globalThis.globalSaaSFeatures!;
  }

  private get plans(): SaaSPlan[] {
    if (!globalThis.globalSaaSPlans) {
      globalThis.globalSaaSPlans = JSON.parse(JSON.stringify(DEFAULT_PLANS));
    }
    return globalThis.globalSaaSPlans!;
  }

  private get tenants(): SaaSTenant[] {
    if (!globalThis.globalSaaSTenants) {
      globalThis.globalSaaSTenants = JSON.parse(JSON.stringify(DEFAULT_TENANTS));
    }
    return globalThis.globalSaaSTenants!;
  }

  private get transactions(): PaymentTransaction[] {
    if (!globalThis.globalSaaSTransactions) {
      globalThis.globalSaaSTransactions = [];
    }
    return globalThis.globalSaaSTransactions!;
  }

  // --- FEATURES ---
  getAllFeatures(): SaaSFeature[] {
    return this.features;
  }

  // --- PLANS ---
  getAllPlans(): SaaSPlan[] {
    return this.plans;
  }

  getPlanById(id: string): SaaSPlan | undefined {
    return this.plans.find((p) => p.id === id || p.slug === id);
  }

  createPlan(newPlan: SaaSPlan): SaaSPlan {
    this.plans.push(newPlan);
    return newPlan;
  }

  updatePlan(id: string, updates: Partial<SaaSPlan>): SaaSPlan | null {
    const idx = this.plans.findIndex((p) => p.id === id || p.slug === id);
    if (idx === -1) return null;

    this.plans[idx] = {
      ...this.plans[idx],
      ...updates,
      features: updates.features || this.plans[idx].features,
    };
    return this.plans[idx];
  }

  // --- TENANTS ---
  getAllTenants(sortByLastSeen: boolean = false): SaaSTenant[] {
    const list = [...this.tenants];
    if (sortByLastSeen) {
      list.sort((a, b) => {
        const timeA = a.lastSeenAt ? new Date(a.lastSeenAt).getTime() : 0;
        const timeB = b.lastSeenAt ? new Date(b.lastSeenAt).getTime() : 0;
        return timeB - timeA;
      });
    }
    return list;
  }

  getTenantById(id: string): SaaSTenant | undefined {
    if (!id) return undefined;
    const clean = id.toLowerCase().trim();
    return this.tenants.find((t) => 
      t.id.toLowerCase() === clean || 
      t.subdomain.toLowerCase() === clean ||
      (clean === 'resto_thies_01' && t.subdomain === 'chezfatou') ||
      (clean === 'tenant_starter_01' && (t.id === 'tenant_mg_cafe_resto' || t.subdomain === 'mg-cafe-resto')) ||
      (clean === 'tenant_pro_01' && (t.id === 'tenant_chez_colle' || t.subdomain === 'chez-colle')) ||
      (clean === 'tenant_premium_01' && (t.id === 'tenant_hotel_cayor' || t.subdomain === 'hotel-cayor'))
    );
  }

  pingTenant(tenantId: string) {
    const t = this.getTenantById(tenantId);
    if (t) {
      t.lastSeenAt = new Date().toISOString();
    }
  }

  upgradeTenantPlan(tenantId: string, newPlanId: string, periodMonths: number = 1): SaaSTenant | null {
    const tenant = this.getTenantById(tenantId);
    const plan = this.getPlanById(newPlanId);
    if (!tenant || !plan) return null;

    const expires = new Date();
    expires.setDate(expires.getDate() + periodMonths * 30);

    tenant.currentPlanId = plan.id;
    tenant.subscriptionStatus = 'ACTIVE';
    tenant.subscriptionExpiresAt = expires.toISOString();
    tenant.updatedAt = new Date().toISOString();

    return tenant;
  }

  // --- TRANSACTIONS / PAYMENTS ---
  recordTransaction(tx: PaymentTransaction): PaymentTransaction {
    this.transactions.push(tx);
    return tx;
  }

  getAllTransactions(): PaymentTransaction[] {
    return this.transactions;
  }

  // --- MONITORING STATS FOR 1000 RESTAURANTS ---
  getDashboardStats() {
    const all = this.tenants;
    const active = all.filter((t) => t.subscriptionStatus === 'ACTIVE').length;
    const pastDue = all.filter((t) => t.subscriptionStatus === 'PAST_DUE').length;
    const suspended = all.filter((t) => t.subscriptionStatus === 'SUSPENDED').length;
    const trial = all.filter((t) => t.subscriptionStatus === 'TRIAL').length;

    const totalScansToday = all.reduce((sum, t) => sum + (t.qrScansToday || 0), 0);
    const totalOrdersToday = all.reduce((sum, t) => sum + (t.ordersToday || 0), 0);

    const monthlyRevenue = all.reduce((sum, t) => {
      if (t.subscriptionStatus === 'ACTIVE') {
        const plan = this.getPlanById(t.currentPlanId);
        return sum + (plan?.price || 25000);
      }
      return sum;
    }, 0);

    return {
      totalRestaurants: all.length,
      activeRestaurants: active,
      pastDueRestaurants: pastDue,
      suspendedRestaurants: suspended,
      trialRestaurants: trial,
      totalScansToday,
      totalOrdersToday,
      monthlyRevenue,
    };
  }

  // --- CRON JOBS PROCESSING ---
  runNightlySubscriptionCheck() {
    const now = Date.now();
    let suspendedCount = 0;
    let pastDueAlertsCount = 0;

    this.tenants.forEach((t) => {
      if (t.subscriptionExpiresAt) {
        const expiry = new Date(t.subscriptionExpiresAt).getTime();
        const diffDays = (now - expiry) / (1000 * 60 * 60 * 24);

        // Si expiré depuis plus de 5 jours -> SUSPENDED
        if (diffDays >= 5 && t.subscriptionStatus !== 'SUSPENDED') {
          t.subscriptionStatus = 'SUSPENDED';
          suspendedCount++;
          console.log(`[CRON 03:00 AM] 🔴 Abonnement ${t.businessName} expiré depuis ${Math.round(diffDays)} jours -> Statut passé à SUSPENDED.`);
        }
        // Si expiré depuis 0 à 4 jours -> PAST_DUE avec relance
        else if (diffDays > 0 && diffDays < 5 && t.subscriptionStatus !== 'PAST_DUE') {
          t.subscriptionStatus = 'PAST_DUE';
          pastDueAlertsCount++;
          console.log(`[CRON 03:00 AM] ⚠️ [Alerte Relance WhatsApp] Relance envoyée à ${t.businessName} (${t.phone}) pour régularisation Wave/OM.`);
        }
      }
    });

    return {
      executedAt: new Date().toISOString(),
      suspendedCount,
      pastDueAlertsCount,
    };
  }
}

export const saasStorage = new SaasStorageService();
