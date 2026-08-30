export interface MenuItem {
  id: string;
  name: string;
  category: 'plats' | 'grillades' | 'boissons' | 'desserts' | 'entrees';
  price: number; // in FCFA
  description: string;
  image: string;
  isAvailable: boolean;
  isDailySpecial?: boolean;
  preparationTime: string;
  popular?: boolean;
  options?: {
    name: string;
    choices: string[];
  }[];
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
  selectedOption?: string;
  notes?: string;
}

export interface LiveOrder {
  id: string;
  tableNumber: number;
  customerName?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  totalAmount: number;
  status: 'nouveau' | 'en_preparation' | 'pret' | 'servi';
  timestamp: string;
  paymentMethod: 'Sur place (Espèces/Wave)' | 'Orange Money' | 'Wave Direct';
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  restaurant: string;
  city: string;
  quote: string;
  rating: number;
  image: string;
  metrics: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  priceMonthly: number; // in FCFA
  priceAnnualMonthly: number; // in FCFA
  popular?: boolean;
  description: string;
  features: {
    text: string;
    included: boolean;
    highlight?: boolean;
  }[];
  ctaText: string;
  ctaType: 'trial' | 'subscribe' | 'quote';
}

export interface ProblemSolution {
  id: string;
  title: string;
  problem: string;
  solution: string;
  iconName: string;
  impactMetric: string;
  punchline?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export interface CommercialAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  zone: string;
  avatar: string;
  role: 'commercial' | 'admin';
  targetClients: number;
  commissionRate: number; // e.g. 20%
  accessPin?: string; // 4-digit PIN for quick field login
  slug?: string; // slug for direct link e.g. ?agent=moussa-diop
  directToken?: string; // secure token for auto-login URL
}

export interface ProspectItem {
  id: string;
  restaurantName: string;
  contactName: string;
  phone: string;
  city: string;
  status: 'contacte' | 'en_negociation' | 'a_relancer' | 'gagne';
  tablesCount: number;
  lastContactDate: string;
  nextActionDate: string;
  nextActionNote: string;
  interestPlan: 'essentielle' | 'premium';
  assignedCommercialId?: string;
  assignedCommercialName?: string;
  notes?: string;
  priority?: 'haute' | 'moyenne' | 'normale';
}

export interface CustomerJourneyStep {
  id: string;
  dayLabel: string;
  dayNumber: number;
  title: string;
  objective: string;
  channel: 'Sur place' | 'WhatsApp' | 'Téléphone';
  messageTemplate: string;
}

export interface CompetitorComparison {
  feature: string;
  louAmeTay: string | boolean;
  scaniFood: string | boolean;
  xolalMenu: string | boolean;
  menuPapier: string | boolean;
  isHighlight?: boolean;
}
