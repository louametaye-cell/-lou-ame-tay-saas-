/**
 * Référentiel Cartographique & Géolocalisation Sénégal
 * Lou Ame Tay ? — DAW Digital Arts Work by MG (+221 77 458 74 74)
 */

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface RegionPreset {
  id: string;
  name: string;
  center: GeoCoordinate;
  zoom: number;
  description: string;
}

// Points de repères et centres régionaux au Sénégal
export const SENEGAL_REGIONS: RegionPreset[] = [
  {
    id: 'ALL',
    name: '🇸🇳 Tout le Sénégal',
    center: { lat: 14.7167, lng: -16.0 },
    zoom: 7,
    description: 'Vue nationale consolidée du réseau de restaurants'
  },
  {
    id: 'DAKAR',
    name: '🏙️ Dakar & Presqu\'île',
    center: { lat: 14.7167, lng: -17.4450 },
    zoom: 12,
    description: 'Plateau, Almadies, Ngor, Yoff, Ouakam, Guédiawaye'
  },
  {
    id: 'THIES',
    name: '🏛️ Thiès & Environs',
    center: { lat: 14.7886, lng: -16.9260 },
    zoom: 13,
    description: 'Avenue Lamine Guèye, HLM Route de Mbour, Lat-Dior'
  },
  {
    id: 'PETITE_COTE',
    name: '🏖️ Saly & Petite Côte',
    center: { lat: 14.4435, lng: -17.0253 },
    zoom: 12,
    description: 'Mbour, Saly Portudal, Somone, Ngaparou, Popenguine'
  },
  {
    id: 'SAINT_LOUIS',
    name: '🌊 Saint-Louis & Nord',
    center: { lat: 16.0244, lng: -16.5022 },
    zoom: 13,
    description: 'Île de Saint-Louis, Langue de Barbarie, Richard-Toll'
  },
  {
    id: 'CASAMANCE',
    name: '🌴 Casamance & Sud',
    center: { lat: 12.5684, lng: -16.2733 },
    zoom: 10,
    description: 'Ziguinchor, Cap Skirring, Oussouye, Kafountine'
  }
];

// Coordonnées de base pour les 4 comptes réels de production
const KNOWN_RESTAURANT_COORDINATES: Record<string, GeoCoordinate> = {
  'sams-prestige': { lat: 14.7915, lng: -16.9255 }, // Thiès - Avenue Lamine Guèye
  'madiba-restaurant': { lat: 14.7738, lng: -16.9380 }, // Thiès - HLM Route de Mbour
  'hotel-lat-dior': { lat: 14.7982, lng: -16.9170 }, // Thiès - Quartier Lat-Dior
  'anima-pizzeria': { lat: 14.7612, lng: -17.4735 }, // Dakar - Plage BCEAO / Yoff
  'mg-cafe-resto': { lat: 14.7738, lng: -16.9380 },
  'chez-colle': { lat: 14.7915, lng: -16.9255 },
  'hotel-cayor': { lat: 14.7982, lng: -16.9170 }
};

/**
 * Résout les coordonnées GPS précises d'un restaurant au Sénégal
 */
export function resolveRestaurantCoordinates(restaurant: {
  subdomain?: string;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  branding?: any;
}): GeoCoordinate {
  // 1. Coordonnées directes stockées
  if (typeof restaurant.latitude === 'number' && typeof restaurant.longitude === 'number') {
    return { lat: restaurant.latitude, lng: restaurant.longitude };
  }

  // 2. Coordonnées dans branding
  const b = restaurant.branding || {};
  if (typeof b.latitude === 'number' && typeof b.longitude === 'number') {
    return { lat: b.latitude, lng: b.longitude };
  }

  // 3. Correspondance par sous-domaine connu
  const sub = (restaurant.subdomain || '').toLowerCase().trim();
  if (sub && KNOWN_RESTAURANT_COORDINATES[sub]) {
    return KNOWN_RESTAURANT_COORDINATES[sub];
  }

  // 4. Correspondance par ville ou adresse
  const text = `${restaurant.city || ''} ${restaurant.address || ''}`.toLowerCase();

  // Décalage déterministe basé sur le hash du sous-domaine pour éviter le chevauchement parfait de 2 restos dans la même ville
  const hash = (restaurant.subdomain || 'resto')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const jitterLat = ((hash % 17) - 8) * 0.0018;
  const jitterLng = (((hash * 3) % 19) - 9) * 0.0018;

  if (text.includes('dakar') || text.includes('yoff') || text.includes('almadies') || text.includes('plateau') || text.includes('ngor') || text.includes('mermoz')) {
    return { lat: 14.7167 + jitterLat, lng: -17.4450 + jitterLng };
  }

  if (text.includes('saly') || text.includes('mbour') || text.includes('somone') || text.includes('ngaparou')) {
    return { lat: 14.4435 + jitterLat, lng: -17.0253 + jitterLng };
  }

  if (text.includes('saint-louis') || text.includes('ndar') || text.includes('barbarie')) {
    return { lat: 16.0244 + jitterLat, lng: -16.5022 + jitterLng };
  }

  if (text.includes('ziguinchor') || text.includes('cap skirring') || text.includes('casamance')) {
    return { lat: 12.5684 + jitterLat, lng: -16.2733 + jitterLng };
  }

  if (text.includes('touba') || text.includes('mbacke')) {
    return { lat: 14.8647 + jitterLat, lng: -15.8757 + jitterLng };
  }

  // Par défaut : Thiès (berceau DAW)
  return { lat: 14.7886 + jitterLat, lng: -16.9260 + jitterLng };
}
