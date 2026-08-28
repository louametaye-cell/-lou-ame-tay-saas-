'use client';

import React, { useState } from 'react';
import { X, Bell, Receipt, Droplets, HelpCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface CallWaiterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableNumber: number;
}

export const CallWaiterModal: React.FC<CallWaiterModalProps> = ({
  isOpen,
  onClose,
  tableNumber,
}) => {
  const [called, setCalled] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCall = (reason: string) => {
    setCalled(reason);
    toast.success(`Serveur notifié pour la Table ${tableNumber < 10 ? `0${tableNumber}` : tableNumber} !`, {
      description: `Motif : ${reason}`,
    });

    setTimeout(() => {
      setCalled(null);
      onClose();
    }, 1800);
  };

  const reasons = [
    { label: 'Demander l\'addition (Note)', icon: Receipt, key: 'bill', color: 'bg-amber-500' },
    { label: 'Une carafe d\'eau / Glaçons', icon: Droplets, key: 'water', color: 'bg-blue-500' },
    { label: 'Besoin d\'aide / Conseil menu', icon: HelpCircle, key: 'help', color: 'bg-green-600' },
    { label: 'Autre demande particulière', icon: Bell, key: 'other', color: 'bg-purple-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 relative animate-in slide-in-from-bottom duration-300 shadow-2xl border-t-4 border-green-600">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[48px] min-w-[48px] p-2.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Fermer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-50 text-green-700 rounded-2xl">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-lg sm:text-xl text-gray-950">
              Appeler le Serveur
            </h3>
            <p className="text-sm font-extrabold text-green-700">
              🎯 Table {tableNumber < 10 ? `0${tableNumber}` : tableNumber}
            </p>
          </div>
        </div>

        {called ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto animate-bounce" />
            <h4 className="text-lg font-black text-gray-900">
              Appel transmis au comptoir !
            </h4>
            <p className="text-sm text-gray-600">
              Un serveur arrive à votre table d&apos;ici quelques instants.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reasons.map((r) => {
              const Icon = r.icon;
              return (
                <button
                  key={r.key}
                  onClick={() => handleCall(r.label)}
                  className="w-full min-h-[52px] p-4 bg-gray-50 hover:bg-green-50 border-2 border-gray-200 hover:border-green-600 rounded-2xl text-left flex items-center gap-3.5 active:scale-95 transition-all shadow-sm group"
                >
                  <div className={`p-2.5 rounded-xl text-white ${r.color} shadow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-base text-gray-900 group-hover:text-green-700 flex-1">
                    {r.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
