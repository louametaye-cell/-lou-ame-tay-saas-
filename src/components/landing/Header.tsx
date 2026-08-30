import React, { useState, useEffect } from 'react';
import { Utensils, MessageCircle, Menu as MenuIcon, X, Sparkles, QrCode } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';

interface HeaderProps {
  onOpenTrial: () => void;
  onOpenQrModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTrial, onOpenQrModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '#hero' },
    { name: 'Pourquoi nous ?', href: '#pourquoi' },
    { name: 'Fonctionnalités', href: '#comment-ca-marche' },
    { name: 'Démo en direct', href: '#demo-live' },
    { name: 'Calculateur ROI', href: '#calculateur' },
    { name: 'Parcours Client', href: '#parcours-client' },
    { name: 'Tarifs', href: '#tarifs' },
    { name: 'Témoignages', href: '#temoignages' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 h-20 flex items-center'
          : 'bg-white border-b border-gray-100 h-20 flex items-center'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <a
            id="brand-logo-link"
            href="#hero"
            className="flex items-center group focus:outline-none"
          >
            <OfficialLogo size="md" showSubtitle={true} />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6" aria-label="Navigation principale">
            {navLinks.slice(0, 7).map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-semibold text-gray-600 hover:text-[#00A86B] transition-colors py-1 relative group"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#00A86B] transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              id="header-qr-preview-btn"
              onClick={onOpenQrModal}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-[#F8F9FA] hover:bg-gray-100 border border-gray-200/80 px-3 py-2 rounded-xl transition-all cursor-pointer"
              title="Tester les QR codes pour table"
            >
              <QrCode className="w-4 h-4 text-[#00A86B]" />
              <span>QR Table</span>
            </button>

            <a
              id="header-whatsapp-btn"
              href="https://wa.me/221776543210?text=Bonjour%20Lou%20Ame%20Tay,%20je%20suis%20restaurateur%20et%20je%20souhaite%20des%20renseignements%20sur%20votre%20menu%20digital."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00A86B] hover:text-[#008957] bg-green-50 hover:bg-green-100 px-3 py-2 rounded-xl transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden lg:inline">WhatsApp</span>
            </a>

            <button
              id="header-cta-trial-btn"
              onClick={onOpenTrial}
              className="bg-[#00A86B] hover:bg-[#00925d] active:scale-95 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-[#00A86B]/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-100" />
              <span>Essai Gratuit</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              id="header-mobile-trial-btn"
              onClick={onOpenTrial}
              className="text-xs font-bold text-white bg-[#00A86B] px-3 py-1.5 rounded-full shadow-md shadow-[#00A86B]/20 cursor-pointer"
            >
              Essai
            </button>
            <button
              id="header-mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-[#00A86B] hover:bg-gray-100 rounded-xl cursor-pointer"
              aria-label="Ouvrir le menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-3">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-gray-800 hover:text-[#00A86B] hover:bg-[#00A86B]/5 p-2 rounded-lg"
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQrModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold bg-gray-100 text-gray-800 rounded-xl"
            >
              <QrCode className="w-4 h-4 text-[#00A86B]" />
              Générateur de QR code de table
            </button>
            <a
              href="https://wa.me/221776543210?text=Bonjour%20Lou%20Ame%20Tay,%20je%20souhaite%20une%20d%C3%A9mo%20pour%20mon%20restaurant."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold bg-[#25D366] text-white rounded-xl shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Échanger sur WhatsApp (+221 77 654 32 10)
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrial();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold bg-[#00A86B] text-white rounded-xl shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Démarrer mon essai gratuit (14 jours)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

