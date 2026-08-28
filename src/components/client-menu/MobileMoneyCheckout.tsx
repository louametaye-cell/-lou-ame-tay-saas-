'use client';

import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  QrCode, 
  ExternalLink, 
  Copy, 
  Check, 
  Banknote, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatFCFA } from '@/lib/utils';
import { Language } from '@/types';
import { toast } from 'sonner';

interface MobileMoneyCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  method: 'WAVE' | 'ORANGE_MONEY' | 'CASH';
  totalAmount: number;
  tableNumber: number;
  restaurantName: string;
  waveMerchantId?: string;
  omMerchantNumber?: string;
  onPaymentCompleted: (transactionRef?: string) => void;
  lang?: Language;
}

export const MobileMoneyCheckout: React.FC<MobileMoneyCheckoutProps> = ({
  isOpen,
  onClose,
  method,
  totalAmount,
  tableNumber,
  restaurantName,
  waveMerchantId = 'louametay-demo',
  omMerchantNumber = '77 458 74 74',
  onPaymentCompleted,
  lang = 'FR',
}) => {
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const formattedTable = tableNumber < 10 ? `0${tableNumber}` : tableNumber;

  if (!isOpen) return null;

  // Wave Payment Deep Link & QR Data
  const wavePayUrl = `https://wave.com/pay/${waveMerchantId}?amount=${totalAmount}&memo=${encodeURIComponent(
    `Table ${formattedTable} - ${restaurantName}`
  )}`;

  const handleCopyOM = () => {
    navigator.clipboard.writeText(omMerchantNumber);
    setCopied(true);
    toast.success('Numéro marchand Orange Money copié !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onPaymentCompleted(`TX-${Date.now()}`);
      toast.success('✅ Paiement confirmé avec succès !');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-orange-200 text-slate-900 space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-orange-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-2xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {method === 'WAVE' ? 'Paiement Wave 🔵' : 'Paiement Orange Money 🟠'}
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                Table {formattedTable} • {formatFCFA(totalAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method 1: Wave Direct Checkout */}
        {method === 'WAVE' && (
          <div className="space-y-4 text-center">
            <div className="bg-blue-50 p-4 rounded-3xl border border-blue-200 space-y-3">
              <span className="text-xs font-black text-blue-900 uppercase tracking-wider block">
                Scannez avec votre application Wave
              </span>

              <div className="p-3 bg-white rounded-2xl shadow-sm inline-block border border-blue-200">
                <QRCodeSVG value={wavePayUrl} size={150} level="H" marginSize={1} />
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-blue-950 font-bold block">
                  Montant pré-rempli : {formatFCFA(totalAmount)}
                </span>
                <span className="text-[11px] text-blue-700 block">
                  Bénéficiaire : {restaurantName}
                </span>
              </div>
            </div>

            <a
              href={wavePayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] bg-[#1DA1F2] hover:bg-[#1991db] active:scale-98 text-white font-black text-sm rounded-2xl shadow-md shadow-blue-400/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Ouvrir l'application Wave</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* Method 2: Orange Money USSD / Code Marchand */}
        {method === 'ORANGE_MONEY' && (
          <div className="space-y-4">
            <div className="bg-orange-50 p-4 rounded-3xl border border-orange-200 space-y-3">
              <span className="text-xs font-black text-orange-950 uppercase tracking-wider block text-center">
                Code Marchand Orange Money
              </span>

              <div className="bg-white p-3 rounded-2xl border border-orange-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    Numéro Marchand / Code :
                  </span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    {omMerchantNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyOM}
                  className="p-2.5 rounded-xl bg-orange-100 text-orange-800 hover:bg-orange-200 font-bold text-xs flex items-center gap-1 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copié' : 'Copier'}</span>
                </button>
              </div>

              <div className="p-3 bg-white/70 rounded-2xl text-[11px] text-orange-950 space-y-1">
                <p className="font-bold">📱 Instructions USSD :</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
                  <li>Composez <strong>#144#391#</strong></li>
                  <li>Entrez le code marchand <strong>{omMerchantNumber}</strong></li>
                  <li>Montant : <strong>{formatFCFA(totalAmount)}</strong></li>
                  <li>Validez avec votre code secret</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Button */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            disabled={isVerifying}
            onClick={handleSimulatePayment}
            className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isVerifying ? 'Vérification...' : 'J\'ai effectué le paiement'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};