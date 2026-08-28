// ==============================================================================
// EMPLOI DU TEMPS HEBDOMADAIRE MULTI-PLATS (LOU AME TAY ? - 2 À 3 PLATS / JOUR)
// Spécialités Déjeuner (Midi) & Dîner (Soirée)
// ==============================================================================

import { MenuItemType } from '@/types';

export type DayOfWeek = 'LUNDI' | 'MARDI' | 'MERCREDI' | 'JEUDI' | 'VENDREDI' | 'SAMEDI' | 'DIMANCHE';

export interface ScheduledDishSlot {
  slotId: string;
  slotType: 'LUNCH_STAR' | 'LUNCH_CLASSIC' | 'DINNER_SPECIAL';
  slotLabel: string;
  period: 'LUNCH' | 'DINNER';
  dishId: string;
  dishName: string;
  wolofDishName?: string;
  price: number;
  imageUrl: string;
  description: string;
  isEnabled: boolean;
}

export interface DayMultiSpecialSchedule {
  day: DayOfWeek;
  dayLabel: string;
  wolofDay: string;
  badgeEmoji: string;
  catchphrase: string;
  dishes: ScheduledDishSlot[];
}

export const DEFAULT_WEEKLY_MULTI_SCHEDULE: DayMultiSpecialSchedule[] = [
  // 1. LUNDI
  {
    day: 'LUNDI',
    dayLabel: 'Lundi',
    wolofDay: 'Altine',
    badgeEmoji: '🟡',
    catchphrase: 'Le grand retour du Thiéboudienne pour bien démarrer la semaine',
    dishes: [
      {
        slotId: 'lun_star',
        slotType: 'LUNCH_STAR',
        slotLabel: '🌟 Plat Star du Midi',
        period: 'LUNCH',
        dishId: 'dish_thieb_rouge',
        dishName: 'Ceebu Jën Pëndaa Mbaye (Riz Rouge)',
        wolofDishName: 'Ceebu Jën bu xonq',
        price: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        description: 'Riz rouge mijoté au mérou blanc frais, carottes, manioc, chou et sauce kaani pimentée.',
        isEnabled: true,
      },
      {
        slotId: 'lun_classic',
        slotType: 'LUNCH_CLASSIC',
        slotLabel: '🍛 Incontournable du Midi',
        period: 'LUNCH',
        dishId: 'dish_yassa_poulet',
        dishName: 'Yassa Poulet Fermier Braisé',
        wolofDishName: 'Yassa Guinar bu ñor',
        price: 4000,
        imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
        description: 'Poulet mariné aux oignons caramélisés et citron vert de Casamance, servi avec riz blanc.',
        isEnabled: true,
      },
      {
        slotId: 'lun_dinner',
        slotType: 'DINNER_SPECIAL',
        slotLabel: '🌙 Spécial Soirée / Dîner',
        period: 'DINNER',
        dishId: 'dish_attieke_poulet',
        dishName: 'Attiéké Poulet Braisé & Sauce Kaani',
        wolofDishName: 'Couscous de manioc & Poulet braisé',
        price: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        description: 'Semoule de manioc fraîche cuite à la vapeur, poulet croustillant et oignons marinés.',
        isEnabled: true,
      },
    ],
  },

  // 2. MARDI
  {
    day: 'MARDI',
    dayLabel: 'Mardi',
    wolofDay: 'Talaata',
    badgeEmoji: '🥜',
    catchphrase: 'Ragoût onctueux à la pâte d\'arachide locale et légumes fondants',
    dishes: [
      {
        slotId: 'mar_star',
        slotType: 'LUNCH_STAR',
        slotLabel: '🌟 Plat Star du Midi',
        period: 'LUNCH',
        dishId: 'dish_mafe_boeuf',
        dishName: 'Mafé Yapp Bœuf Mijoté',
        wolofDishName: 'Mafé Guerté ak Yapp',
        price: 3000,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        description: 'Sauce onctueuse à base d\'arachides grillées de Kaolack, viande de bœuf tendre et patate douce.',
        isEnabled: true,
      },
      {
        slotId: 'mar_classic',
        slotType: 'LUNCH_CLASSIC',
        slotLabel: '🍛 Incontournable du Midi',
        period: 'LUNCH',
        dishId: 'dish_yassa_poisson',
        dishName: 'Yassa Poisson Thiof Braisé',
        wolofDishName: 'Yassa Jën Thiof',
        price: 4500,
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        description: 'Thiof royal mariné et braisé au charbon de bois avec sauce oignons relevée.',
        isEnabled: true,
      },
      {
        slotId: 'mar_dinner',
        slotType: 'DINNER_SPECIAL',
        slotLabel: '🌙 Spécial Soirée / Dîner',
        period: 'DINNER',
        dishId: 'dish_dibi_agneau',
        dishName: 'Dibi d\'Agneau au Feu de Bois',
        wolofDishName: 'Dibi Yapp ag Alloco',
        price: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        description: 'Morceaux d\'agneau marinés à la moutarde et épices locales, grillés minute au feu de bois.',
        isEnabled: true,
      },
    ],
  },

  // 3. MERCREDI
  {
    day: 'MERCREDI',
    dayLabel: 'Mercredi',
    wolofDay: 'Allarba',
    badgeEmoji: '🍲',
    catchphrase: 'Saveurs authentiques du terroir et grand couscous sénégalais',
    dishes: [
      {
        slotId: 'mer_star',
        slotType: 'LUNCH_STAR',
        slotLabel: '🌟 Plat Star du Midi',
        period: 'LUNCH',
        dishId: 'dish_ceeb_yapp',
        dishName: 'Ceebu Yapp Pëndaa (Riz à la Viande)',
        wolofDishName: 'Ceebu Yapp bu xonq',
        price: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        description: 'Riz mijoté à la viande de bœuf fondante, oignons caramélisés et piments frais.',
        isEnabled: true,
      },
      {
        slotId: 'mer_classic',
        slotType: 'LUNCH_CLASSIC',
        slotLabel: '🍛 Incontournable du Midi',
        period: 'LUNCH',
        dishId: 'dish_yassa_poulet',
        dishName: 'Yassa Poulet Fermier Braisé',
        wolofDishName: 'Yassa Guinar',
        price: 4000,
        imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
        description: 'Poulet mariné au citron vert et oignons dorés à point.',
        isEnabled: true,
      },
      {
        slotId: 'mer_dinner',
        slotType: 'DINNER_SPECIAL',
        slotLabel: '🌙 Spécial Soirée / Dîner',
        period: 'DINNER',
        dishId: 'dish_thiere_couscous',
        dishName: 'Thiéré / Grand Couscous de Mil Sénégalais',
        wolofDishName: 'Thiéré Mboum ak Yapp',
        price: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        description: 'Couscous de mil cuit à la vapeur avec sauce riche de viande, haricots et légumes du pays.',
        isEnabled: true,
      },
    ],
  },

  // 4. JEUDI
  {
    day: 'JEUDI',
    dayLabel: 'Jeudi',
    wolofDay: 'Alxamis',
    badgeEmoji: '🐟',
    catchphrase: 'Bouillon clair au poisson blanc et gombo frais',
    dishes: [
      {
        slotId: 'jeu_star',
        slotType: 'LUNCH_STAR',
        slotLabel: '🌟 Plat Star du Midi',
        period: 'LUNCH',
        dishId: 'dish_kaldou_poisson',
        dishName: 'Kaldou au Poisson Blanc & Sauce Bissap',
        wolofDishName: 'Calldou Jën ag Kaani',
        price: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        description: 'Court-bouillon de poisson frais au citron, sauce bissap blanc acide et piment écrasé.',
        isEnabled: true,
      },
      {
        slotId: 'jeu_classic',
        slotType: 'LUNCH_CLASSIC',
        slotLabel: '🍛 Incontournable du Midi',
        period: 'LUNCH',
        dishId: 'dish_soupou_kandia',
        dishName: 'Soupou Kandia (Sauce Gombo & Huile Rouge)',
        wolofDishName: 'Soupou Kandja ag Yapp',
        price: 4000,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        description: 'Sauce gombo traditionnelle à l\'huile de palme rouge, poisson séché, crevettes et bœuf.',
        isEnabled: true,
      },
      {
        slotId: 'jeu_dinner',
        slotType: 'DINNER_SPECIAL',
        slotLabel: '🌙 Spécial Soirée / Dîner',
        period: 'DINNER',
        dishId: 'dish_attieke_poisson',
        dishName: 'Attiéké Poisson Thiof Braisé & Alloco',
        wolofDishName: 'Attiéké Jën braisé',
        price: 4000,
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        description: 'Attiéké frais de Côte d\'Ivoire servi avec mérou braisé et alloco bien mûr.',
        isEnabled: true,
      },
    ],
  },

  // 5. VENDREDI
  {
    day: 'VENDREDI',
    dayLabel: 'Vendredi',
    wolofDay: 'Ajjuma',
    badgeEmoji: '🕌',
    catchphrase: 'Le grand Thiéboudienne Blanc du Vendredi béni au Sénégal',
    dishes: [
      {
        slotId: 'ven_star',
        slotType: 'LUNCH_STAR',
        slotLabel: '🌟 Plat Star du Midi (Vendredi Béni)',
        period: 'LUNCH',
        dishId: 'dish_ceeb_blanc',
        dishName: 'Grand Ceebu Jën Blanc Royal (Beugueudj & Netetou)',
        wolofDishName: 'Ceebu Jën bu weex Pëndaa Mbaye',
        price: 4000,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        description: 'Riz blanc mijoté aux herbes, poisson thiof farci, légumes vapeur, sauce oseille (Beugueudj) et sauce tamarin (Soul).',
        isEnabled: true,
      },
      {
        slotId: 'ven_classic',
        slotType: 'LUNCH_CLASSIC',
        slotLabel: '🍛 Incontournable du Midi',
        period: 'LUNCH',
        dishId: 'dish_yassa_royal',
        dishName: 'Yassa Guinar Royal au Citron Vert',
        wolofDishName: 'Yassa Guinar bu mag',
        price: 4500,
        imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
        description: 'Poulet fermier entier mariné et rôti, oignons de Saint-Louis et piment kaani.',
        isEnabled: true,
      },
      {
        slotId: 'ven_dinner',
        slotType: 'DINNER_SPECIAL',
        slotLabel: '🌙 Spécial Soirée / Dîner',
        period: 'DINNER',
        dishId: 'dish_dibi_agneau',
        dishName: 'Grand Dibi d\'Agneau Dibiterie & Alloco',
        wolofDishName: 'Dibi Yapp ag Alloco',
        price: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        description: 'Viande d\'agneau marinée et braisée au feu de bois avec oignons, moutarde et alloco doré.',
        isEnabled: true,
      },
    ],
  },

  // 6. SAMEDI
  {
    day: 'SAMEDI',
    dayLabel: 'Samedi',
    wolofDay: 'Gaawu',
    badgeEmoji: '🔥',
    catchphrase: 'Grillades au feu de bois, dibiterie et ambiance week-end',
    dishes: [
      {
        slotId: 'sam_star',
        slotType: 'LUNCH_STAR',
        slotLabel: '🌟 Plat Star du Midi',
        period: 'LUNCH',
        dishId: 'dish_dibi_special',
        dishName: 'Dibi d\'Agneau Spécial Dibiterie & Alloco',
        wolofDishName: 'Dibi Yapp bu neex',
        price: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
        description: 'Agneau braisé au feu de bois selon la pure tradition de dibiterie dakaroise.',
        isEnabled: true,
      },
      {
        slotId: 'sam_classic',
        slotType: 'LUNCH_CLASSIC',
        slotLabel: '🍛 Incontournable du Midi',
        period: 'LUNCH',
        dishId: 'dish_ceeb_rouge',
        dishName: 'Ceebu Jën Pëndaa Mbaye (Riz Rouge)',
        wolofDishName: 'Ceebu Jën bu xonq',
        price: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
        description: 'Le classique riz au poisson rouge sénégalais.',
        isEnabled: true,
      },
      {
        slotId: 'sam_dinner',
        slotType: 'DINNER_SPECIAL',
        slotLabel: '🌙 Spécial Soirée / Dîner',
        period: 'DINNER',
        dishId: 'dish_grillades_mixtes',
        dishName: 'Grillades Mixtes & Brochettes de Bœuf',
        wolofDishName: 'Brochettes Yapp & Frites',
        price: 5500,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        description: 'Plateau généreux de brochettes de bœuf tendre, saucisses braisées, frites et bananes plantains.',
        isEnabled: true,
      },
    ],
  },

  // 7. DIMANCHE
  {
    day: 'DIMANCHE',
    dayLabel: 'Dimanche',
    wolofDay: 'Diber',
    badgeEmoji: '🥘',
    catchphrase: 'Le grand rendez-vous familial du dimanche',
    dishes: [
      {
        slotId: 'dim_star',
        slotType: 'LUNCH_STAR',
        slotLabel: '🌟 Plat Star du Midi',
        period: 'LUNCH',
        dishId: 'dish_domoda_boeuf',
        dishName: 'Domoda Bœuf Mijoté à la Tomate',
        wolofDishName: 'Domoda Yapp bu neex',
        price: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        description: 'Sauce tomate veloutée à la farine grillée, morceaux de bœuf tendres et légumes du marché.',
        isEnabled: true,
      },
      {
        slotId: 'dim_classic',
        slotType: 'LUNCH_CLASSIC',
        slotLabel: '🍛 Incontournable du Midi',
        period: 'LUNCH',
        dishId: 'dish_poulet_roti',
        dishName: 'Poulet Rôti Doré & Frites Maison',
        wolofDishName: 'Guinar rôti ag Frites',
        price: 4000,
        imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
        description: 'Demi-poulet rôti aux herbes de Provence, servi avec frites dorées et alloco.',
        isEnabled: true,
      },
      {
        slotId: 'dim_dinner',
        slotType: 'DINNER_SPECIAL',
        slotLabel: '🌙 Spécial Soirée / Dîner',
        period: 'DINNER',
        dishId: 'dish_attieke_thiof',
        dishName: 'Attiéké & Poisson Braisé Familial',
        wolofDishName: 'Attiéké Jën Thiof',
        price: 4500,
        imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
        description: 'Portion généreuse d\'attiéké avec poisson braisé au barbecue et sauces maison.',
        isEnabled: true,
      },
    ],
  },
];

/**
 * Renvoie le jour de la semaine actuel en majuscule
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = [
    'DIMANCHE',
    'LUNDI',
    'MARDI',
    'MERCREDI',
    'JEUDI',
    'VENDREDI',
    'SAMEDI',
  ];
  const dayIndex = new Date().getDay();
  return days[dayIndex];
}

/**
 * Détecte si nous sommes actuellement en période Déjeuner (Midi) ou Dîner (Soir)
 */
export function getCurrentMealPeriod(): 'LUNCH' | 'DINNER' {
  const hour = new Date().getHours();
  // De 18h00 à 05h59 -> Soirée / Dîner
  if (hour >= 18 || hour < 6) {
    return 'DINNER';
  }
  // Sinon Déjeuner / Midi
  return 'LUNCH';
}

/**
 * Récupère le planning enregistré ou celui par défaut
 */
export function getStoredWeeklySchedule(): DayMultiSpecialSchedule[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('louametay_weekly_multi_schedule');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return DEFAULT_WEEKLY_MULTI_SCHEDULE;
}

/**
 * Sauvegarde le planning dans localStorage
 */
export function saveStoredWeeklySchedule(schedule: DayMultiSpecialSchedule[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('louametay_weekly_multi_schedule', JSON.stringify(schedule));
  }
}