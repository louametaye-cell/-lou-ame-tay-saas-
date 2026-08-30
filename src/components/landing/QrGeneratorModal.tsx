import React, { useState } from 'react';
import { X, QrCode, Download, Printer, Utensils, Sparkles, Check } from 'lucide-react';

interface QrGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QrGeneratorModal: React.FC<QrGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [restaurantName, setRestaurantName] = useState('Le Teranga Grill');
  const [tableNumber, setTableNumber] = useState(4);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://app.louametay.sn/menu?resto=${encodeURIComponent(restaurantName)}&table=${tableNumber}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-xs font-bold mb-2">
            <QrCode className="w-3.5 h-3.5" />
            <span>Modèle de Chevalet & Autocollant de Table</span>
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-gray-900">
            Aperçu de votre QR Code de Table
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Visualisez le sticker étanche et lavable qui sera posé sur chacune de vos tables au Sénégal.
          </p>
        </div>

        {/* Customizer controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nom du Restaurant</label>
            <input
              type="text"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#00A86B] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Numéro de Table</label>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#00A86B] focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((n) => (
                <option key={n} value={n}>Table #{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* The Printable Sticker Visual Card */}
        <div className="flex justify-center my-4">
          <div className="w-full max-w-[280px] bg-white rounded-3xl p-6 border-4 border-[#00A86B] shadow-xl text-center space-y-3 relative overflow-hidden">
            
            {/* Header logo on sticker */}
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-[#00A86B] text-white flex items-center justify-center">
                <Utensils className="w-3.5 h-3.5" />
              </div>
              <span className="font-heading font-extrabold text-sm text-gray-900">
                Lou Ame Tay <span className="text-[#FF6B00]">?</span>
              </span>
            </div>

            <div className="text-xs font-extrabold text-gray-800 uppercase tracking-tight">
              {restaurantName || 'Votre Restaurant'}
            </div>

            {/* Simulated High Quality Vector QR Code Box */}
            <div className="bg-gray-900 p-3.5 rounded-2xl inline-block shadow-inner">
              <div className="w-36 h-36 bg-white rounded-xl p-2.5 flex flex-col items-center justify-center relative">
                {/* SVG QR Code Pattern */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900 fill-current">
                  {/* Corner 1 */}
                  <rect x="5" y="5" width="28" height="28" rx="4" />
                  <rect x="10" y="10" width="18" height="18" fill="white" rx="2" />
                  <rect x="14" y="14" width="10" height="10" rx="1" />
                  
                  {/* Corner 2 */}
                  <rect x="67" y="5" width="28" height="28" rx="4" />
                  <rect x="72" y="10" width="18" height="18" fill="white" rx="2" />
                  <rect x="76" y="14" width="10" height="10" rx="1" />

                  {/* Corner 3 */}
                  <rect x="5" y="67" width="28" height="28" rx="4" />
                  <rect x="10" y="72" width="18" height="18" fill="white" rx="2" />
                  <rect x="14" y="76" width="10" height="10" rx="1" />

                  {/* Inner matrix dots */}
                  <rect x="42" y="10" width="8" height="8" rx="1" />
                  <rect x="52" y="20" width="8" height="8" rx="1" />
                  <rect x="42" y="42" width="16" height="16" rx="2" fill="#00A86B" />
                  <rect x="67" y="45" width="6" height="6" rx="1" />
                  <rect x="80" y="45" width="8" height="8" rx="1" />
                  <rect x="10" y="45" width="8" height="8" rx="1" />
                  <rect x="25" y="45" width="8" height="8" rx="1" />
                  <rect x="45" y="70" width="8" height="8" rx="1" />
                  <rect x="70" y="70" width="10" height="10" rx="1" />
                  <rect x="85" y="70" width="6" height="6" rx="1" />
                  <rect x="60" y="85" width="8" height="8" rx="1" />
                  <rect x="75" y="85" width="15" height="8" rx="1" />
                </svg>

                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-8 h-8 rounded-full bg-white shadow-md border-2 border-[#00A86B] flex items-center justify-center text-[10px]">
                    🍽️
                  </div>
                </div>
              </div>
            </div>

            {/* Table Number Badge */}
            <div className="bg-[#FF6B00] text-white font-black text-sm py-1 px-3 rounded-full inline-block shadow-sm">
              TABLE #{tableNumber}
            </div>

            {/* Call to scan text */}
            <div className="space-y-0.5">
              <p className="text-[11px] font-black text-gray-900">
                1. Scannez avec l'appareil photo
              </p>
              <p className="text-[10px] text-gray-500 font-medium">
                2. Commandez sans attendre 🇸🇳
              </p>
            </div>

          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl text-xs font-bold transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <QrCode className="w-4 h-4 text-[#00A86B]" />}
            <span>{copied ? 'Lien de table copié !' : 'Copier le lien direct du menu'}</span>
          </button>

          <a
            href="https://wa.me/221776543210?text=Bonjour%20Lou%20Ame%20Tay,%20je%20souhaite%20commander%20mes%20chevalets%20et%20stickers%20QR%20code%20pour%20mon%20restaurant."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#00A86B] hover:bg-[#00925d] text-white py-3 rounded-xl text-xs font-bold transition-colors shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Commander mon pack chevalets</span>
          </a>
        </div>

      </div>
    </div>
  );
};
