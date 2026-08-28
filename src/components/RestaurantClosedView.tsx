'use client';

import React from 'react';
import Image from 'next/image';
import { Store, Clock, Phone, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { RestaurantType } from '@/types';

interface RestaurantClosedViewProps {
  restaurant: RestaurantType;
  tableNumber: number;
}

export const RestaurantClosedView: React.FC<RestaurantClosedViewProps> = ({
  restaurant,
  tableNumber,
}) => {
  return (
    <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4 text-gray-900 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border-2 border-orange-200/80 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        {/* Restaurant Logo */}
        <div className="relative w-20 h-20 rounded-3xl overflow-hidden shadow-lg border-2 border-orange-200 mx-auto mb-4 bg-orange-50">
          <Image
            src={restaurant.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80'}
            alt={restaurant.name}
            fill
            className="object-cover"
            sizes="80px"
            priority
          />
        </div>

        {/* Table Badge */}
        <div className="inline-flex items-center gap-1.5 bg-orange-100/90 border border-orange-200 text-orange-900 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-4">
          <span>Table {tableNumber < 10 ? `0${tableNumber}` : tableNumber}</span>
        </div>

        {/* Closed Title & Official Message (Requis dans le cahier des charges) */}
        <h1 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight">
          {restaurant.name}
        </h1>

        <div className="my-5 p-4 bg-orange-50/80 rounded-2xl border border-orange-200 text-orange-950 space-y-1.5">
          <div className="w-10 h-10 bg-orange-200/60 rounded-full flex items-center justify-center mx-auto text-orange-700 mb-1">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm sm:text-base font-extrabold text-orange-950">
            Ce restaurant est actuellement fermé.
          </p>
          <p className="text-xs text-orange-800 font-medium">
            Revenez plus tard ! 🍽️
          </p>
        </div>

        {/* Contact info for clients */}
        <div className="space-y-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
          {restaurant.phone && (
            <p className="flex items-center justify-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-orange-600" />
              <span>Contact : {restaurant.phone}</span>
            </p>
          )}

          {restaurant.address && (
            <p className="flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>{restaurant.address}</span>
            </p>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 text-[11px] text-gray-400 border-t border-gray-100">
          Lou Ame Tay ? • Système de Menu Digital
        </div>
      </div>
    </div>
  );
};
