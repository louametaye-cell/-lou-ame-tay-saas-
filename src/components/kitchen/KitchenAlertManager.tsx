'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, AlertCircle, BellRing, Check } from 'lucide-react';
import { playKitchenChime, unlockAudioContext } from './KitchenSoundAlert';
import { OrderType } from '@/types';

interface KitchenAlertManagerProps {
  pendingOrders: OrderType[];
  onAcknowledgeAll?: () => void;
}

export const KitchenAlertManager: React.FC<KitchenAlertManagerProps> = ({
  pendingOrders,
  onAcknowledgeAll,
}) => {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pendingCount = pendingOrders.length;

  const handleEnableAudio = () => {
    unlockAudioContext();
    playKitchenChime();
    setAudioEnabled(true);
  };

  useEffect(() => {
    if (pendingCount > 0 && audioEnabled) {
      // Play initial chime immediately
      playKitchenChime();

      // Repeat chime every 15 seconds until acknowledged
      intervalRef.current = setInterval(() => {
        playKitchenChime();
      }, 15000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [pendingCount, audioEnabled]);

  if (pendingCount === 0) return null;

  return (
    <div className="bg-gradient-to-r from-rose-900/90 via-orange-950 to-rose-900/90 border-2 border-rose-500 text-white p-3.5 rounded-3xl shadow-xl flex items-center justify-between gap-4 flex-wrap animate-pulse">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-rose-600 rounded-2xl animate-bounce">
          <BellRing className="w-6 h-6 text-white" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
            <span>🚨 {pendingCount} Nouvelle(s) Commande(s) en attente !</span>
          </h4>
          <p className="text-xs text-rose-200">
            Alerte sonore active toutes les 15s • Veuillez acquitter pour lancer la cuisson
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {!audioEnabled ? (
          <button
            type="button"
            onClick={handleEnableAudio}
            className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Volume2 className="w-4 h-4 stroke-[3]" />
            <span>Activer Sonnerie</span>
          </button>
        ) : (
          <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1.5 rounded-xl border border-emerald-500/40 flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>Son Actif</span>
          </span>
        )}

        {onAcknowledgeAll && (
          <button
            type="button"
            onClick={onAcknowledgeAll}
            className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Tout Acquitter</span>
          </button>
        )}
      </div>
    </div>
  );
};