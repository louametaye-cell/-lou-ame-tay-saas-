'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  MapPin, 
  Maximize2, 
  Store,
  ChevronRight
} from 'lucide-react';
import { RestaurantType } from '@/types';
import { SENEGAL_REGIONS, RegionPreset, resolveRestaurantCoordinates } from '@/lib/senegal-geo';

interface SenegalRestaurantsMapProps {
  restaurants: RestaurantType[];
  onSelectRestaurant?: (restaurant: RestaurantType) => void;
}

type MapTileStyle = 'light' | 'dark' | 'satellite';

export function SenegalRestaurantsMap({
  restaurants,
  onSelectRestaurant,
}: SenegalRestaurantsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  const [isReady, setIsReady] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [tileStyle, setTileStyle] = useState<MapTileStyle>('light');

  // Statistiques rapides
  const stats = useMemo(() => {
    let active = 0;
    let trial = 0;
    let suspended = 0;

    restaurants.forEach((r) => {
      const status = r.subscription?.status || (r.isActive ? 'ACTIVE' : 'SUSPENDED');
      if (status === 'ACTIVE') active++;
      else if (status === 'TRIAL') trial++;
      else suspended++;
    });

    return { total: restaurants.length, active, trial, suspended };
  }, [restaurants]);

  // Chargement asynchrone dynamique de Leaflet côté client
  useEffect(() => {
    let isMounted = true;

    async function loadLeaflet() {
      if (typeof window === 'undefined') return;

      try {
        const L = await import('leaflet');
        if (!isMounted) return;

        LRef.current = L.default || L;

        if (mapContainerRef.current && !mapInstanceRef.current) {
          const map = LRef.current.map(mapContainerRef.current, {
            center: [14.7167, -16.0],
            zoom: 7,
            zoomControl: false,
            attributionControl: false,
          });

          LRef.current.control.zoom({ position: 'topright' }).addTo(map);

          const tileLayer = LRef.current.tileLayer(
            'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            {
              maxZoom: 19,
              subdomains: 'abcd',
            }
          ).addTo(map);

          const markersLayer = LRef.current.featureGroup().addTo(map);

          mapInstanceRef.current = map;
          tileLayerRef.current = tileLayer;
          markersLayerRef.current = markersLayer;

          setIsReady(true);
        }
      } catch (err) {
        console.error('Erreur chargement Leaflet:', err);
      }
    }

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Changement de style de carte (Light, Dark, Satellite)
  useEffect(() => {
    if (!mapInstanceRef.current || !LRef.current) return;
    const L = LRef.current;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    if (tileStyle === 'dark') {
      url = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (tileStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }

    const newLayer = L.tileLayer(url, {
      maxZoom: 19,
      subdomains: tileStyle === 'satellite' ? [] : 'abcd',
    }).addTo(mapInstanceRef.current);

    newLayer.bringToBack();
    tileLayerRef.current = newLayer;
  }, [tileStyle]);

  // Mise à jour des markers dès que Leaflet ou restaurants changent
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !LRef.current) return;
    const L = LRef.current;

    markersLayerRef.current.clearLayers();

    restaurants.forEach((restaurant) => {
      const coords = resolveRestaurantCoordinates(restaurant);
      const status = restaurant.subscription?.status || (restaurant.isActive ? 'ACTIVE' : 'SUSPENDED');
      
      let markerColor = '#10B981'; // Vert pour ACTIVE
      let pulseColor = 'rgba(16, 185, 129, 0.4)';
      let statusLabel = 'Actif';

      if (status === 'SUSPENDED' || (status as string) === 'CANCELLED' || (status as string) === 'CANCELED' || !restaurant.isActive) {
        markerColor = '#EF4444'; // Rouge pour SUSPENDED
        pulseColor = 'rgba(239, 68, 68, 0.4)';
        statusLabel = 'Suspendu';
      } else if (status === 'TRIAL' || status === 'PAST_DUE') {
        markerColor = '#F59E0B'; // Orange pour TRIAL
        pulseColor = 'rgba(245, 158, 11, 0.4)';
        statusLabel = 'Période d\'essai';
      }

      // Pin SVG stylisé avec halo pulsant
      const customIcon = L.divIcon({
        className: 'custom-daw-map-marker',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${pulseColor}; animation: pulse-glow 2s infinite ease-in-out;"></div>
            <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: ${markerColor}; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 21v-8a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v8"/>
                <path d="M4 3h16"/>
                <path d="M4 7h16"/>
                <path d="M6 3v18"/>
                <path d="M18 3v18"/>
              </svg>
            </div>
            <div style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%) translateY(2px); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${markerColor};"></div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 42],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon: customIcon });

      const logoHtml = restaurant.logoUrl 
        ? `<img src="${restaurant.logoUrl}" alt="${restaurant.name}" style="width: 44px; height: 44px; border-radius: 12px; object-fit: cover; border: 1px solid #e2e8f0; box-shadow: 0 2px 6px rgba(0,0,0,0.08);" />`
        : `<div style="width: 44px; height: 44px; border-radius: 12px; background: #0f172a; color: #f59e0b; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px;">${restaurant.name.charAt(0)}</div>`;

      const planName = restaurant.subscription?.plan || restaurant.planName || 'TÀMBALI';
      const city = restaurant.city || 'Thiès';
      const address = restaurant.address || 'Sénégal';
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

      const popupContent = `
        <div style="font-family: var(--font-montserrat), Montserrat, sans-serif; padding: 4px; min-width: 260px;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
            ${logoHtml}
            <div style="flex: 1; overflow: hidden;">
              <h4 style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; line-height: 1.2; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
                ${restaurant.name}
              </h4>
              <p style="margin: 2px 0 0 0; font-size: 11px; color: #64748b; font-weight: 500;">
                /${restaurant.subdomain}
              </p>
            </div>
          </div>

          <div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;">
            <span style="font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; text-transform: uppercase;">
              ${planName}
            </span>
            <span style="font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: ${markerColor}15; color: ${markerColor}; border: 1px solid ${markerColor}30; display: flex; align-items: center; gap: 4px;">
              <span style="width: 6px; height: 6px; border-radius: 50%; background: ${markerColor};"></span>
              ${statusLabel}
            </span>
          </div>

          <div style="font-size: 11px; color: #475569; margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span style="font-weight: 600;">${city}</span> • ${address}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
            <a 
              href="/super-admin/restaurant/${restaurant.id}" 
              style="display: flex; align-items: center; justify-content: center; gap: 4px; padding: 7px 10px; border-radius: 8px; background: #0f172a; color: #ffffff; text-decoration: none; font-size: 11px; font-weight: 700; text-align: center;"
            >
              Fiche Admin
            </a>
            <a 
              href="/r/${restaurant.subdomain}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display: flex; align-items: center; justify-content: center; gap: 4px; padding: 7px 10px; border-radius: 8px; background: #f8fafc; color: #0f172a; border: 1px solid #cbd5e1; text-decoration: none; font-size: 11px; font-weight: 700; text-align: center;"
            >
              Menu Client ↗
            </a>
          </div>

          <a 
            href="${googleMapsUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 6px; border-radius: 6px; background: #f1f5f9; color: #2563eb; text-decoration: none; font-size: 10px; font-weight: 700; text-align: center; box-sizing: border-box;"
          >
            🧭 Itinéraire Google Maps
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'daw-map-popup',
      });

      marker.on('click', () => {
        if (onSelectRestaurant) onSelectRestaurant(restaurant);
      });

      markersLayerRef.current.addLayer(marker);
    });

    // Si on a des restaurants, ajuster la vue
    if (restaurants.length > 0) {
      const bounds = markersLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [restaurants, isReady, onSelectRestaurant]);

  // Centrage par région
  const handleSelectRegion = (region: RegionPreset) => {
    setSelectedRegion(region.id);
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([region.center.lat, region.center.lng], region.zoom, {
      duration: 1.2,
      easeLinearity: 0.25,
    });
  };

  // Recentrer sur l'ensemble des restaurants
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    const bounds = markersLayerRef.current.getBounds();
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else {
      mapInstanceRef.current.flyTo([14.7167, -16.0], 7);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col font-sans">
      {/* En-tête de la carte & Filtres */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center">
              <MapPin className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Cartographie Interactive du Réseau Sénégal
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Temps Réel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Géolocalisation précise, statut opérationnel et accès 1-clic aux établissements partenaires.
          </p>
        </div>

        {/* Badges de Statut Rapide & Sélecteur de Couche */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm text-xs font-bold">
            <span className="px-2.5 py-1 text-slate-600">
              {stats.total} Restos
            </span>
            <span className="h-4 w-px bg-slate-200"></span>
            <span className="px-2 py-1 text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {stats.active} Actifs
            </span>
            {stats.trial > 0 && (
              <>
                <span className="h-4 w-px bg-slate-200"></span>
                <span className="px-2 py-1 text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  {stats.trial} Essai
                </span>
              </>
            )}
            {stats.suspended > 0 && (
              <>
                <span className="h-4 w-px bg-slate-200"></span>
                <span className="px-2 py-1 text-rose-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  {stats.suspended} Fermés
                </span>
              </>
            )}
          </div>

          {/* Sélecteur de style de tuiles */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shadow-sm text-xs font-bold">
            <button
              type="button"
              onClick={() => setTileStyle('light')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                tileStyle === 'light'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Épurée
            </button>
            <button
              type="button"
              onClick={() => setTileStyle('dark')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                tileStyle === 'dark'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sombre
            </button>
            <button
              type="button"
              onClick={() => setTileStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                tileStyle === 'satellite'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Bouton Recentrer */}
          <button
            type="button"
            onClick={handleFitBounds}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-sm transition-colors cursor-pointer"
            title="Recentrer sur tous les restaurants"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Barre des Régions du Sénégal */}
      <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap pl-1">
          Zones :
        </span>
        {SENEGAL_REGIONS.map((region) => (
          <button
            key={region.id}
            type="button"
            onClick={() => handleSelectRegion(region)}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRegion === region.id
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]'
                : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>{region.name}</span>
          </button>
        ))}
      </div>

      {/* Conteneur Cartographique */}
      <div className="relative w-full h-[480px] sm:h-[560px] bg-slate-100">
        {!isReady && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-white backdrop-blur-xs">
            <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-bold tracking-tight">Initialisation de la carte satellite Sénégal...</p>
            <p className="text-xs text-slate-400 mt-1">DAW Digital Arts Work — Géolocalisation Réseau</p>
          </div>
        )}
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* Pied de Carte & Légende Officielle */}
      <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs"></span>
            Actif & Ouvert
          </span>
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs"></span>
            Période d&apos;essai
          </span>
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs"></span>
            Suspendu / Fermé
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Système Cartographique DAW • Coordonnées WGS84 précises • Sénégal
        </div>
      </div>
    </div>
  );
}
