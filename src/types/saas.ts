// Types for SaaS Multi-Tenant Architecture & Dynamic Plans
export type FeatureCategory = 'CORE' | 'OPERATION' | 'MARKETING' | 'BILLING';
export type ValueType = 'BOOLEAN' | 'NUMERIC' | 'TEXT';

export interface SaaSFeature {
  id: string;
  keyName: string;
  label: string;
  description?: string;
  category: FeatureCategory;
  valueType: ValueType;
}

export interface SaaSPlanFeature {
  id: string;
  planId: string;
  featureId: string;
  featureKey: string;
  isActive: boolean;
  limitValue?: number | null; // null = Unlimited
}

export interface SaaSPlan {
  id: string;
  name: string;
  slug: 'starter' | 'pro' | 'premium' | string;
  price: number; // in FCFA
  currency: string;
  description: string;
  colorTheme: string;
  isRecommended: boolean;
  isActive: boolean;
  features: SaaSPlanFeature[];
}

export type SaaSSubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED';

export interface SaaSTenant {
  id: string;
  businessName: string;
  subdomain: string;
  ownerName?: string;
  phone: string;
  address?: string;
  city?: string;
  logoUrl?: string;
  bannerUrl?: string;
  currentPlanId: string;
  subscriptionStatus: SaaSSubscriptionStatus;
  subscriptionExpiresAt?: string;
  // Scalability & Monitoring fields for 1000 restaurants :
  lastSeenAt?: string;
  qrScansToday?: number;
  ordersToday?: number;
  storageUsedMb?: number;
  photosCount?: number;
  tablesCount?: number;
  branding?: any;
  createdAt: string;
  updatedAt: string;
}

export type PaymentProvider = 'WAVE' | 'ORANGE_MONEY' | 'CASH' | 'MANUAL_AGENCY';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentTransaction {
  id: string;
  tenantId: string;
  planId: string;
  amount: number;
  provider: PaymentProvider;
  providerTxId?: string;
  status: PaymentStatus;
  webhookVerifiedAt?: string;
  periodMonths: number;
  paidAt?: string;
  createdAt: string;
}
