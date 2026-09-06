'use client';

import React, { useState } from 'react';
import { ClientMenuView } from '@/components/ClientMenuView';
import { RestaurantType } from '@/types';
import { MapPin, ArrowRight } from 'lucide-react';

interface WaiterScanClientProps {
  waiter: { id: string; name: string };
  restaurant: RestaurantType;
  zones: any[];
  tables: any[];
}

export const WaiterScanClient: React.FC<WaiterScanClientProps> = ({
  waiter,
  restaurant,
  zones,
  tables,
}) => {
  const [step, setStep] = useState<'welcome' | 'location' | 'menu'>('welcome');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [locationDetail, setLocationDetail] = useState<string>('');

  const hasZones = zones && zones.length > 0;
  const selectedZone = zones.find(z => z.id === selectedZoneId);
  const isTableZone = !hasZones || (selectedZone && selectedZone.type === 'TABLES');
  const branding = restaurant.branding || {};
  const primaryColor = branding.primaryColor || '#FF6B00';

  // Si on a les informations complètes, on passe au menu
  const handleStartMenu = () => {
    setStep('menu');
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center font-sans">
        <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6 text-4xl shadow-sm mx-auto">
          🤵
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-2">Bienvenue !</h1>
        <p className="text-lg text-slate-600 mb-8 max-w-sm">
          Vous êtes servi aujourd'hui par <strong className="text-slate-900">{waiter.name}</strong>.
        </p>

        <button
          onClick={() => setStep('location')}
          className="w-full max-w-sm py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
          style={{ backgroundColor: primaryColor }}
        >
          Continuer <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (step === 'location') {
    const availableTables = hasZones && selectedZoneId ? tables.filter(t => t.zoneId === selectedZoneId) : tables;

    return (
      <div className="min-h-screen flex flex-col p-6 bg-slate-50 font-sans">
        <div className="max-w-md w-full mx-auto mt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">Où êtes-vous ?</h2>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
            {hasZones && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Choisissez votre zone :</label>
                <div className="grid grid-cols-2 gap-3">
                  {zones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => {
                        setSelectedZoneId(zone.id);
                        setSelectedTableId('');
                        setLocationDetail('');
                      }}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-colors ${
                        selectedZoneId === zone.id 
                          ? 'border-orange-500 bg-orange-50 text-orange-700' 
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {zone.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isTableZone ? (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Numéro de table :</label>
                {availableTables.length > 0 ? (
                  <select 
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Sélectionnez votre table</option>
                    {availableTables.map(t => (
                      <option key={t.id} value={t.id}>Table {t.tableNumber} {t.label ? `(${t.label})` : ''}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    placeholder="Ex: 5"
                    value={locationDetail}
                    onChange={(e) => setLocationDetail(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Précisez votre emplacement :</label>
                <p className="text-xs text-slate-500 mb-3">Ex: Transat 12, Chambre 402, Près du bar...</p>
                <input
                  type="text"
                  placeholder="Votre position exacte"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            )}

            <button
              onClick={handleStartMenu}
              disabled={isTableZone ? (!selectedTableId && !locationDetail) : !locationDetail}
              className="w-full py-4 mt-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              style={{ backgroundColor: primaryColor }}
            >
              Voir le Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Étape Menu
  // On passe le contexte de la commande au menu
  const selectedTableNumber = selectedTableId ? tables.find(t => t.id === selectedTableId)?.tableNumber : (parseInt(locationDetail) || 0);

  return (
    <ClientMenuView
      initialRestaurant={restaurant}
      tableNumber={selectedTableNumber || 0}
      orderContext={{
        waiterId: waiter.id,
        waiterName: waiter.name,
        zoneId: selectedZoneId || undefined,
        locationDetail: isTableZone ? undefined : locationDetail,
      }}
    />
  );
};
