import { 
  SaaSFeature, 
  SaaSPlan, 
  SaaSTenant, 
  PaymentTransaction 
} from '@/types/saas';

// Initial Features Catalog
export const DEFAULT_FEATURES: SaaSFeature[] = [
  { id: 'feat_menu', keyName: 'MENU_DIGITAL', label: 'Menu digital avec photos illimitées', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_stocks', keyName: 'STOCK_MANAGEMENT', label: 'Gestion des stocks en 1 clic', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_studio', keyName: 'STUDIO_CUSTOMIZATION', label: 'Personnalisation logo/couleurs (Studio)', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_stats_view', keyName: 'CONSULTATION_STATS', label: 'Statistiques de consultation', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_table_order', keyName: 'TABLE_ORDERING', label: 'Commande via QR Code Table', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_express_pos', keyName: 'EXPRESS_POS', label: 'Caisse Express (au comptoir/à emporter)', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_basic_stats', keyName: 'BASIC_SALES_STATS', label: 'Statistiques de ventes de base', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_kds', keyName: 'KITCHEN_DISPLAY_KDS', label: 'Écran Cuisine (KDS) complet avec alertes', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_multilang', keyName: 'MULTI_LANGUAGE_MENU', label: 'Traduction multilingue automatique (5 langues)', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_bluetooth', keyName: 'BLUETOOTH_PRINTING', label: 'Impression tickets Bluetooth 80mm', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_tv_single', keyName: 'SINGLE_TV_SCREEN', label: 'Écran Menu (affichage TV) mode simple', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_adv_stats', keyName: 'ADVANCED_STATS', label: 'Statistiques de ventes complètes', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_counters', keyName: 'MULTI_COUNTERS', label: 'Gestion multi-guichets/multi-points de commande', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_tv_multi', keyName: 'MULTI_TV_SCREENS', label: 'Écran Menu multi-écrans', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_export', keyName: 'ADVANCED_EXPORT', label: 'Export de données avancé', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_waiter_qr', keyName: 'WAITER_QR', label: 'QR personnel par serveur avec traçabilité', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_multizone', keyName: 'MULTI_ZONE', label: 'Gestion multi-zones (piscine, plage, room-service)', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_tv_zone', keyName: 'ZONE_TV_SCREENS', label: 'Écran Menu par zone', category: 'MARKETING', valueType: 'BOOLEAN' },
  { id: 'feat_multisites', keyName: 'MULTI_SITES', label: 'Gestion multi-sites (plusieurs points de restauration)', category: 'OPERATION', valueType: 'BOOLEAN' },
  { id: 'feat_staff_analytics', keyName: 'STAFF_PERFORMANCE_ANALYTICS', label: 'Export des performances staff avancé', category: 'BILLING', valueType: 'BOOLEAN' },
  { id: 'feat_vip_support', keyName: 'VIP_SUPPORT', label: 'Support VIP dédié', category: 'CORE', valueType: 'BOOLEAN' },
  { id: 'feat_event_auto', keyName: 'EVENT_AUTO_EXPIRATION', label: 'Désactivation automatique après événement', category: 'OPERATION', valueType: 'BOOLEAN' },
];

// Initial Plans Seed (7 Formules Officielle Lou Ame Tay)
export const DEFAULT_PLANS: SaaSPlan[] = [
  {
    id: 'plan_tambali',
    name: 'TÀMBALI (Commencer)',
    slug: 'tambali',
    price: 15000,
    currency: 'FCFA',
    description: 'Établissement avec caisse existante, veut juste un menu digital',
    colorTheme: '#64748b',
    isRecommended: false,
    isActive: true,
    features: [
      { id: 'pf_t_1', planId: 'plan_tambali', featureId: 'feat_menu', featureKey: 'MENU_DIGITAL', isActive: true, limitValue: null },
      { id: 'pf_t_2', planId: 'plan_tambali', featureId: 'feat_stocks', featureKey: 'STOCK_MANAGEMENT', isActive: true, limitValue: null },
      { id: 'pf_t_3', planId: 'plan_tambali', featureId: 'feat_studio', featureKey: 'STUDIO_CUSTOMIZATION', isActive: true, limitValue: null },
      { id: 'pf_t_4', planId: 'plan_tambali', featureId: 'feat_stats_view', featureKey: 'CONSULTATION_STATS', isActive: true, limitValue: null },
      { id: 'pf_t_5', planId: 'plan_tambali', featureId: 'feat_table_order', featureKey: 'TABLE_ORDERING', isActive: false, limitValue: null },
      { id: 'pf_t_6', planId: 'plan_tambali', featureId: 'feat_kds', featureKey: 'KITCHEN_DISPLAY_KDS', isActive: false, limitValue: null },
    ],
  },
  {
    id: 'plan_nio_far',
    name: 'NIO FAR (On est ensemble)',
    slug: 'nio-far',
    price: 25000,
    currency: 'FCFA',
    description: 'Petit maquis/café sans système de caisse',
    colorTheme: '#0284c7',
    isRecommended: false,
    isActive: true,
    features: [
      { id: 'pf_nf_1', planId: 'plan_nio_far', featureId: 'feat_menu', featureKey: 'MENU_DIGITAL', isActive: true, limitValue: null },
      { id: 'pf_nf_2', planId: 'plan_nio_far', featureId: 'feat_table_order', featureKey: 'TABLE_ORDERING', isActive: true, limitValue: null },
      { id: 'pf_nf_3', planId: 'plan_nio_far', featureId: 'feat_express_pos', featureKey: 'EXPRESS_POS', isActive: true, limitValue: null },
      { id: 'pf_nf_4', planId: 'plan_nio_far', featureId: 'feat_basic_stats', featureKey: 'BASIC_SALES_STATS', isActive: true, limitValue: null },
      { id: 'pf_nf_5', planId: 'plan_nio_far', featureId: 'feat_kds', featureKey: 'KITCHEN_DISPLAY_KDS', isActive: false, limitValue: null },
    ],
  },
  {
    id: 'plan_xeweul',
    name: 'XÉWEUL (Bonne affaire)',
    slug: 'xeweul',
    price: 35000,
    currency: 'FCFA',
    description: 'Restaurant, pizzeria, fastfood (Le meilleur rapport qualité-prix)',
    colorTheme: '#FF6B00',
    isRecommended: true,
    isActive: true,
    features: [
      { id: 'pf_x_1', planId: 'plan_xeweul', featureId: 'feat_menu', featureKey: 'MENU_DIGITAL', isActive: true, limitValue: null },
      { id: 'pf_x_2', planId: 'plan_xeweul', featureId: 'feat_table_order', featureKey: 'TABLE_ORDERING', isActive: true, limitValue: null },
      { id: 'pf_x_3', planId: 'plan_xeweul', featureId: 'feat_express_pos', featureKey: 'EXPRESS_POS', isActive: true, limitValue: null },
      { id: 'pf_x_4', planId: 'plan_xeweul', featureId: 'feat_kds', featureKey: 'KITCHEN_DISPLAY_KDS', isActive: true, limitValue: null },
      { id: 'pf_x_5', planId: 'plan_xeweul', featureId: 'feat_multilang', featureKey: 'MULTI_LANGUAGE_MENU', isActive: true, limitValue: null },
      { id: 'pf_x_6', planId: 'plan_xeweul', featureId: 'feat_bluetooth', featureKey: 'BLUETOOTH_PRINTING', isActive: true, limitValue: null },
      { id: 'pf_x_7', planId: 'plan_xeweul', featureId: 'feat_tv_single', featureKey: 'SINGLE_TV_SCREEN', isActive: true, limitValue: null },
      { id: 'pf_x_8', planId: 'plan_xeweul', featureId: 'feat_adv_stats', featureKey: 'ADVANCED_STATS', isActive: true, limitValue: null },
    ],
  },
  {
    id: 'plan_baobab',
    name: 'BAOBAB (L\'arbre majestueux)',
    slug: 'baobab',
    price: 46800,
    currency: 'FCFA',
    description: 'Fastfood à forte affluence, établissements multi-comptoirs',
    colorTheme: '#059669',
    isRecommended: false,
    isActive: true,
    features: [
      { id: 'pf_b_1', planId: 'plan_baobab', featureId: 'feat_counters', featureKey: 'MULTI_COUNTERS', isActive: true, limitValue: null },
      { id: 'pf_b_2', planId: 'plan_baobab', featureId: 'feat_tv_multi', featureKey: 'MULTI_TV_SCREENS', isActive: true, limitValue: null },
      { id: 'pf_b_3', planId: 'plan_baobab', featureId: 'feat_export', featureKey: 'ADVANCED_EXPORT', isActive: true, limitValue: null },
    ],
  },
  {
    id: 'plan_teranga',
    name: 'TERANGA (Hospitalité)',
    slug: 'teranga',
    price: 65000,
    currency: 'FCFA',
    description: 'Hôtels, lounges et grandes terrasses',
    colorTheme: '#7c3aed',
    isRecommended: false,
    isActive: true,
    features: [
      { id: 'pf_te_1', planId: 'plan_teranga', featureId: 'feat_waiter_qr', featureKey: 'WAITER_QR', isActive: true, limitValue: null },
      { id: 'pf_te_2', planId: 'plan_teranga', featureId: 'feat_multizone', featureKey: 'MULTI_ZONE', isActive: true, limitValue: null },
      { id: 'pf_te_3', planId: 'plan_teranga', featureId: 'feat_tv_zone', featureKey: 'ZONE_TV_SCREENS', isActive: true, limitValue: null },
    ],
  },
  {
    id: 'plan_buur',
    name: 'BUUR (Roi)',
    slug: 'buur',
    price: 80000,
    currency: 'FCFA',
    description: 'Grands hôtels, complexes multi-restaurants',
    colorTheme: '#dc2626',
    isRecommended: false,
    isActive: true,
    features: [
      { id: 'pf_bu_1', planId: 'plan_buur', featureId: 'feat_multisites', featureKey: 'MULTI_SITES', isActive: true, limitValue: null },
      { id: 'pf_bu_2', planId: 'plan_buur', featureId: 'feat_staff_analytics', featureKey: 'STAFF_PERFORMANCE_ANALYTICS', isActive: true, limitValue: null },
      { id: 'pf_bu_3', planId: 'plan_buur', featureId: 'feat_vip_support', featureKey: 'VIP_SUPPORT', isActive: true, limitValue: null },
    ],
  },
  {
    id: 'plan_ndaje',
    name: 'NDAJÉ (Rendez-vous)',
    slug: 'ndaje',
    price: 0,
    currency: 'FCFA',
    description: 'Prestation événementielle ponctuelle, sur devis (pas un abonnement)',
    colorTheme: '#1e293b',
    isRecommended: false,
    isActive: true,
    features: [
      { id: 'pf_nd_1', planId: 'plan_ndaje', featureId: 'feat_event_auto', featureKey: 'EVENT_AUTO_EXPIRATION', isActive: true, limitValue: null },
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
