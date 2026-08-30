import React, { useState } from 'react';
import { Utensils, MessageCircle, Phone, Mail, MapPin, Heart, QrCode, Shield, FileText, ChevronRight } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';

interface FooterProps {
  onOpenQrModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQrModal }) => {
  const [legalModalContent, setLegalModalContent] = useState<string | null>(null);

  return (
    <footer className="bg-[#111827] text-white pt-16 pb-12 border-t border-gray-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <OfficialLogo size="lg" textClassName="text-white" showSubtitle={true} />
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
              La solution SaaS sénégalaise clé en main éditée par <strong>Médias Graphisme Sénégal</strong> pour les restaurateurs de Thiès, Dakar, Mbour et Saly. 
              Modernisez vos tables, gagnez du temps et augmentez votre chiffre d'affaires.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/221776543210?text=Bonjour%20Lou%20Ame%20Tay"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <button
                onClick={onOpenQrModal}
                className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-[#00A86B] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Générateur QR de table"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Col 3: Navigation rapide */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <a href="#hero" className="hover:text-[#00A86B] transition-colors">Accueil</a>
              </li>
              <li>
                <a href="#pourquoi" className="hover:text-[#00A86B] transition-colors">Pourquoi le digital ?</a>
              </li>
              <li>
                <a href="#pourquoi-nous" className="hover:text-[#00A86B] transition-colors">Notre Proximité & Comparatif</a>
              </li>
              <li>
                <a href="#parcours-client" className="hover:text-[#00A86B] transition-colors">Parcours Client J0 → J45</a>
              </li>
              <li>
                <a href="#demo-live" className="hover:text-[#00A86B] transition-colors">Démo en direct</a>
              </li>
              <li>
                <a href="#calculateur" className="hover:text-[#00A86B] transition-colors">Calculateur ROI</a>
              </li>
              <li>
                <a href="#tarifs" className="hover:text-[#00A86B] transition-colors">Tarifs & Pack Lancement</a>
              </li>
            </ul>
          </div>

          {/* Col 4: Zones couvertes */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Villes Desservies 🇸🇳
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li className="flex items-center gap-1.5">
                <span className="text-[#00A86B] font-bold">📍</span> Thiès (Siège & Agence)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#00A86B] font-bold">📍</span> Dakar (Almadies, Plateau, Point E)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#00A86B] font-bold">📍</span> Mbour & Saly Portudal
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#00A86B] font-bold">📍</span> Somone, Toubab Dialaw
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#00A86B] font-bold">📍</span> Saint-Louis & Partout au Sénégal
              </li>
            </ul>
          </div>

          {/* Col 5: Coordonnées & Support */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Contact Agence
            </h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#00A86B] shrink-0 mt-0.5" />
                <span>Thiès, Sénégal (Quartier Dixième)</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF6B00] shrink-0" />
                <span>+221 77 654 32 10</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#00A86B] shrink-0" />
                <span>contact@louametay.sn</span>
              </p>
              <div className="pt-2">
                <button
                  onClick={onOpenQrModal}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Imprimer un modèle QR Table</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright and legal notices */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <span>© 2026 <strong>Lou Ame Tay ?</strong> — Solution éditée par l'Agence Digitale Lou Ame Tay.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <button
              onClick={() => setLegalModalContent('mentions')}
              className="hover:text-gray-300 transition-colors"
            >
              Mentions Légales
            </button>
            <span>•</span>
            <button
              onClick={() => setLegalModalContent('cgv')}
              className="hover:text-gray-300 transition-colors"
            >
              CGV Restauration
            </button>
            <span>•</span>
            <button
              onClick={() => setLegalModalContent('confidentialite')}
              className="hover:text-gray-300 transition-colors"
            >
              Politique de Confidentialité
            </button>
          </div>
        </div>

      </div>

      {/* Legal Modal popup */}
      {legalModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white text-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-gray-900">
                {legalModalContent === 'mentions' && 'Mentions Légales'}
                {legalModalContent === 'cgv' && 'Conditions Générales de Vente (CGV)'}
                {legalModalContent === 'confidentialite' && 'Politique de Confidentialité'}
              </h3>
              <button
                onClick={() => setLegalModalContent(null)}
                className="text-gray-400 hover:text-gray-900 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-gray-600 space-y-2.5 max-h-80 overflow-y-auto leading-relaxed">
              {legalModalContent === 'mentions' && (
                <>
                  <p><strong>Éditeur du service :</strong> Agence Digitale Lou Ame Tay, Thiès, Sénégal.</p>
                  <p><strong>Directeur de publication :</strong> Équipe Lou Ame Tay Sénégal.</p>
                  <p><strong>Hébergement :</strong> Serveurs Cloud haute disponibilité certifiés SSL/HTTPS avec redondance.</p>
                  <p><strong>Contact :</strong> contact@louametay.sn | +221 77 654 32 10.</p>
                </>
              )}
              {legalModalContent === 'cgv' && (
                <>
                  <p><strong>1. Objet :</strong> Fourniture de la plateforme SaaS de menu digital, QR codes et écran cuisine pour les restaurateurs sénégalais.</p>
                  <p><strong>2. Tarifs & Paiements :</strong> Facturation mensuelle ou annuelle en FCFA. Paiements acceptés : Wave, Orange Money, Virement et Espèces sur facture.</p>
                  <p><strong>3. Résiliation :</strong> Sans engagement de durée. Résiliation possible à tout moment sans pénalités.</p>
                  <p><strong>4. Essai gratuit :</strong> 14 jours d'essai sans carte bancaire ni frais initiaux.</p>
                </>
              )}
              {legalModalContent === 'confidentialite' && (
                <>
                  <p><strong>Protection des données :</strong> Les données relatives aux commandes et aux cartes de menus sont strictement confidentielles et restent la propriété exclusive du restaurant partenaire.</p>
                  <p><strong>Conformité CDP Sénégal :</strong> Aucune donnée personnelle n'est revendue à des tiers.</p>
                </>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setLegalModalContent(null)}
                className="bg-[#00A86B] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
