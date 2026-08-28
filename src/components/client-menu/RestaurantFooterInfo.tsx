'use client';

import React from 'react';
import { 
  Phone, 
  MapPin, 
  Globe, 
  Instagram, 
  Facebook, 
  Navigation,
  MessageCircle,
  Share2,
  Heart
} from 'lucide-react';
import { RestaurantBranding } from '@/types';

interface RestaurantFooterInfoProps {
  restaurantName: string;
  branding?: RestaurantBranding | null;
  phone?: string | null;
  address?: string | null;
}

export const RestaurantFooterInfo: React.FC<RestaurantFooterInfoProps> = ({
  restaurantName,
  branding,
  phone,
  address,
}) => {
  const activePhone = branding?.phone || phone || '+221 77 458 74 74';
  const activeWhatsapp = branding?.whatsapp || activePhone;
  const activeAddress = branding?.address || address || 'Sénégal';
  const mapsUrl = branding?.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurantName} ${activeAddress}`)}`;
  const cleanWhatsappNumber = activeWhatsapp.replace(/[^0-9]/g, '');

  return (
    <footer className="mt-12 pt-8 pb-24 border-t border-slate-200/80 px-4 max-w-4xl mx-auto text-slate-800 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 text-center sm:text-left border-b border-slate-100 pb-5">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {restaurantName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {branding?.tagline || 'Scannez • Commandez • Savourez vos plats préférés !'}
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {activeWhatsapp && (
              <a
                href={`https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(`Bonjour ${restaurantName}, je consulte votre menu digital.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                <span>WhatsApp</span>
              </a>
            )}

            {activePhone && (
              <a
                href={`tel:${activePhone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Appeler</span>
              </a>
            )}
          </div>
        </div>

        {/* Coordonnées Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Adresse & Itinéraire */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <MapPin className="w-3.5 h-3.5 text-orange-500" />
              <span>Adresse & Localisation</span>
            </div>
            <p className="font-bold text-slate-900 text-sm">{activeAddress}</p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-extrabold text-xs pt-1 transition-colors"
            >
              <Navigation className="w-3 h-3" />
              <span>Ouvrir l'itinéraire Google Maps →</span>
            </a>
          </div>

          {/* Réseaux Sociaux & Liens */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <Share2 className="w-3.5 h-3.5 text-orange-500" />
              <span>Réseaux & Liens Officiels</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {branding?.website && (
                <a
                  href={branding.website.startsWith('http') ? branding.website : `https://${branding.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-700 hover:text-orange-600 transition-all text-xs"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Site Web</span>
                </a>
              )}

              {branding?.instagram && (
                <a
                  href={branding.instagram.startsWith('http') ? branding.instagram : `https://instagram.com/${branding.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white hover:bg-pink-50 border border-slate-200 hover:border-pink-300 px-3 py-1.5 rounded-xl font-bold text-slate-700 hover:text-pink-600 transition-all text-xs"
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>Instagram</span>
                </a>
              )}

              {branding?.facebook && (
                <a
                  href={branding.facebook.startsWith('http') ? branding.facebook : `https://facebook.com/${branding.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl font-bold text-slate-700 hover:text-blue-600 transition-all text-xs"
                >
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook</span>
                </a>
              )}

              {branding?.tiktok && (
                <a
                  href={branding.tiktok.startsWith('http') ? branding.tiktok : `https://tiktok.com/@${branding.tiktok.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-700 transition-all text-xs"
                >
                  <span className="text-xs">🎵</span>
                  <span>TikTok</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer Brand Copyright */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} {restaurantName} • Tous droits réservés</p>
          <a
            href="https://louametay.sn"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-orange-600 font-bold transition-colors"
          >
            <span>Propulsé par</span>
            <span className="text-orange-600 font-black">Lou Ame Tay ?</span>
            <span>🇸🇳</span>
          </a>
        </div>
      </div>
    </footer>
  );
};
