// ==============================================================================
// MOTEUR DE ROUTAGE INTELLIGENT CUISINE VS COMPTOIR BAR / CAISSE
// Lou Ame Tay ? - Séparation stricte Cuisine / Bar
// ==============================================================================

import { MenuItemType, OrderItemType } from '@/types';

// Galerie de photos prédéfinies HD de gastronomie sénégalaise
export const SENEGALESE_FOOD_PHOTO_PRESETS = [
  {
    name: 'Ceebu Jën / Thiéboudienne Rouge',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    category: 'Plats Traditionnels',
  },
  {
    name: 'Yassa Poulet Braisé',
    url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    category: 'Plats Traditionnels',
  },
  {
    name: 'Mafé Bœuf Mijoté',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    category: 'Plats Traditionnels',
  },
  {
    name: 'Dibi d\'Agneau au Feu de Bois',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    category: 'Grillades',
  },
  {
    name: 'Thiof Braisé & Alloco',
    url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    category: 'Poissons & Fruits de Mer',
  },
  {
    name: 'Pastels de Poisson & Sauce Kaani',
    url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    category: 'Entrées & Tapas',
  },
  {
    name: 'Jus de Bissap Maison Glacé',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80',
    category: 'Boissons',
  },
  {
    name: 'Jus de Bouye Frais (Baobab)',
    url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80',
    category: 'Boissons',
  },
  {
    name: 'Thiacry au Yaourt Doux & Muscade',
    url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80',
    category: 'Desserts',
  },
  {
    name: 'Eau Minérale / Softs',
    url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=800&q=80',
    category: 'Boissons',
  },
];

// Liste des mots-clés ou identifiants de catégories typiques pour le Comptoir Bar / Boissons
const DRINK_KEYWORDS = [
  'boisson',
  'jus',
  'cocktail',
  'eau',
  'kirene',
  'kirène',
  'bissap',
  'bouye',
  'buy',
  'gazelle',
  'biere',
  'bière',
  'coca',
  'fanta',
  'sprite',
  'canette',
  'café',
  'cafe',
  'thé',
  'the',
  'soft',
  'smoothie',
  'bar',
  'soda',
];

/**
 * Détermine si un article relève du Comptoir Bar / Boissons (et NON de la cuisine chaude)
 */
export function isDrinkOrBarItem(item: OrderItemType | MenuItemType | any): boolean {
  if (!item) return false;

  const cat = (item.categoryId || item.category || '').toLowerCase();
  if (cat.includes('boisson') || cat.includes('drink') || cat.includes('cocktail') || cat.includes('bar') || cat.includes('jus')) {
    return true;
  }

  const name = (item.name || item.menuItem?.name || '').toLowerCase();
  return DRINK_KEYWORDS.some((kw) => name.includes(kw));
}

/**
 * Détermine si un article relève de la Cuisine / Grillades / Fastfood (à préparer par les cuisiniers)
 */
export function isKitchenDish(item: OrderItemType | MenuItemType | any): boolean {
  return !isDrinkOrBarItem(item);
}