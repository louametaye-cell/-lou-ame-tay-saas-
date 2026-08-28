export const LEGAL_14_ALLERGENS = [
  'Gluten',
  'Crustacés',
  'Œufs',
  'Poisson',
  'Arachides',
  'Soja',
  'Lait',
  'Fruits à coque',
  'Céleri',
  'Moutarde',
  'Sésame',
  'Sulfites',
  'Lupin',
  'Mollusques',
] as const;

export type Allergen = (typeof LEGAL_14_ALLERGENS)[number];

export const ALLERGEN_ICONS: Record<string, { icon: string; label: string }> = {
  Gluten: { icon: '🔴', label: 'Gluten' },
  GLUTEN: { icon: '🔴', label: 'Gluten' },
  Lait: { icon: '🥛', label: 'Lait' },
  LAIT: { icon: '🥛', label: 'Lait' },
  Lactose: { icon: '🥛', label: 'Lactose' },
  'Œufs': { icon: '🥚', label: 'Œufs' },
  OEUFS: { icon: '🥚', label: 'Œufs' },
  Oeufs: { icon: '🥚', label: 'Œufs' },
  Arachides: { icon: '🥜', label: 'Arachides' },
  ARACHIDES: { icon: '🥜', label: 'Arachides' },
  Poisson: { icon: '🐟', label: 'Poisson' },
  POISSON: { icon: '🐟', label: 'Poisson' },
  Crustacés: { icon: '🦐', label: 'Crustacés' },
  CRUSTACES: { icon: '🦐', label: 'Crustacés' },
  Crustaces: { icon: '🦐', label: 'Crustacés' },
  'Piment fort': { icon: '🌶️', label: 'Piment fort' },
  Piment: { icon: '🌶️', label: 'Piment' },
  'Fruits à coque': { icon: '🌰', label: 'Fruits à coque' },
  FRUITS_A_COQUE: { icon: '🌰', label: 'Fruits à coque' },
  Soja: { icon: '🌱', label: 'Soja' },
  SOJA: { icon: '🌱', label: 'Soja' },
  Sésame: { icon: '🌾', label: 'Sésame' },
  SESAME: { icon: '🌾', label: 'Sésame' },
  Moutarde: { icon: '🟡', label: 'Moutarde' },
  MOUTARDE: { icon: '🟡', label: 'Moutarde' },
  Mollusques: { icon: '🦪', label: 'Mollusques' },
  MOLLUSQUES: { icon: '🦪', label: 'Mollusques' },
  Céleri: { icon: '🌿', label: 'Céleri' },
  CELERI: { icon: '🌿', label: 'Céleri' },
  Sulfites: { icon: '🍷', label: 'Sulfites' },
  SULFITES: { icon: '🍷', label: 'Sulfites' },
  Lupin: { icon: '🌼', label: 'Lupin' },
  LUPIN: { icon: '🌼', label: 'Lupin' },
};

export type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'CANCELLED' | 'PAST_DUE' | 'SUSPENDED';
export type MealPeriod = 'ALL_DAY' | 'LUNCH' | 'DINNER' | 'NIGHT_SNACK';
export type SubscriptionPlan = 'STARTER' | 'PRO' | 'ENTERPRISE';

export interface SubscriptionType {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  price: number; // en FCFA
  startDate: string;
  endDate: string;
}

export type Language = 'FR' | 'WO' | 'EN' | 'ES' | 'IT';
export type CurrencyCode = 'FCFA' | 'EUR' | 'USD';

export interface ExchangeRates {
  FCFA: number;
  EUR: number;
  USD: number;
}

export interface MenuItemTranslationType {
  id?: string;
  language: Language;
  name: string;
  description?: string | null;
}

export interface MenuItemType {
  id: string;
  name: string;
  nameWolof?: string | null;
  wolofName?: string | null;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isSpecialOfTheDay?: boolean;
  isDailySpecial?: boolean;
  isSpecial?: boolean;
  preparationTime?: number | null;
  rating?: number;
  allergens: string[];
  categoryId: string;
  spiceLevel?: 0 | 1 | 2 | 3;
  translations?: Partial<Record<Language, { name: string; description?: string }>> | MenuItemTranslationType[];
}

export interface CategoryType {
  id: string;
  name: string;
  icon?: string | null;
  displayOrder: number;
  items?: MenuItemType[];
}

export interface ScanType {
  id: string;
  restaurantId: string;
  tableNumber: number;
  scannedAt: string;
}

export interface DailyStatsType {
  id: string;
  restaurantId: string;
  date: string;
  scans: number;
  orders: number;
  revenue: number;
}

export interface OrderAnalyticsType {
  id: string;
  restaurantId: string;
  date: string;
  totalOrders: number;
  totalRevenue: number;
  peakHour?: number | null;
}

export interface RestaurantStatsType {
  totalScans: number;
  todayScans: number;
  totalOrders: number;
  totalRevenue: number;
  conversionRate: number;
  averageBasket: number;
  peakHour: number;
  peakHoursDistribution: { hour: string; count: number }[];
  scansHistory30d: { date: string; scans: number }[];
  ordersHistory30d: { date: string; orders: number; revenue: number }[];
  dailyHistory: {
    day: string;
    scans: number;
    orders: number;
    revenue: number;
  }[];
  scansByTable: {
    tableNumber: number;
    scans: number;
  }[];
}

export interface RestaurantType {
  id: string;
  name: string;
  tagline?: string | null;
  subdomain: string;
  ownerName?: string | null;
  phone?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  currency: string;
  isActive: boolean;
  isOnline?: boolean;
  status?: string | null;
  tableCount: number;
  tablesCount?: number;

  totalScans?: number;
  totalOrders?: number;
  totalRevenue?: number;
  lastScanAt?: string | null;
  lastOrderAt?: string | null;
  peakHours?: Record<string, number> | null;

  subscriptionId?: string | null;
  subscription?: SubscriptionType | null;
  categories: CategoryType[];
  ordersCount?: number;
  stats?: RestaurantStatsType;
  createdAt?: string;
}

export interface CartItemExtra {
  id: string;
  name: string;
  price: number;
}

export interface CartItemOption {
  side?: string;
  spiceLevel?: string;
  extras?: CartItemExtra[];
}

export interface CartItem {
  id: string;
  menuItem: MenuItemType;
  quantity: number;
  customNotes?: string;
  options?: CartItemOption;
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export interface OrderItemType {
  id: string;
  menuItemId?: string;
  menuItem?: MenuItemType;
  name?: string;
  quantity: number;
  price: number;
  notes?: string | null;
  options?: CartItemOption;
}

export type OrderServiceType = 'TABLE' | 'EXPRESS';
export type QRCodeType = 'TABLE' | 'EXPRESS';

export interface OrderType {
  id: string;
  tableNumber: number;
  orderType?: OrderServiceType;
  customerName?: string | null;
  customerNote?: string | null;
  paymentMethod?: string | null;
  transactionRef?: string | null;
  note?: string | null;
  restaurantId: string;
  restaurantName?: string | null;
  status: OrderStatus;
  total: number;
  servedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  items: OrderItemType[];
}

export type TicketPriority = 'BASSE' | 'MOYENNE' | 'HAUTE' | 'URGENTE';
export type TicketStatus = 'OUVERT' | 'EN_COURS' | 'RESOLU';

export interface TicketMessage {
  id: string;
  ticketId: string;
  sender: 'CLIENT' | 'SUPPORT' | 'IA';
  senderName?: string;
  content: string;
  createdAt: string;
}

export interface SupportTicketType {
  id: string;
  restaurantId: string;
  restaurantName: string;
  subject: string;
  message: string;
  priority: TicketPriority;
  status: TicketStatus;
  aiSuggestedSolution?: string;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export type QRCodeOrderStatus = 'EN_ATTENTE_PAIEMENT' | 'EN_COURS_IMPRESSION' | 'EXPEDIE' | 'LIVRE';

export interface QRCodePhysicalOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  packTitle: string;
  tableCount: number;
  format: string;
  price: number;
  city?: string;
  phone?: string;
  status: QRCodeOrderStatus;
  createdAt: string;
  updatedAt: string;
}

export type MenuRequestStatus = 'EN_ATTENTE' | 'VALIDE' | 'REJETE';

export interface MenuRequestType {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  wolofName?: string | null;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  allergens: string[];
  status: MenuRequestStatus;
  createdAt: string;
}
