'use client';

import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';

interface FooterProps {
  onOpenQrModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenQrModal }) => {
  const [legalModalContent, setLegalModalContent] = useState<string | null>(null);

  return (
    <footer className="bg-slate-900 text-slate-100 py-16 border-t border-slate-800 relative">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
        
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <OfficialLogo size="lg" textClassName="text-white" showSubtitle={true} />
            </div>

            <p className="text-slate-400 text-sm leading-relaxed">
              L'outil de digitalisation tout-en-un pour les restaurants, hôtels et maquis au Sénégal. Conçu par des experts du terrain.
            </p>

            {/* Social & WhatsApp Direct Action Icon */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/221778458747?text=Bonjour%20Lou%20Ame%20Tay"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba5a] p-2.5 rounded-full text-white transition-colors cursor-pointer shadow-xs"
                title="WhatsApp Direct +221 77 845 87 47"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-4">
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">
              NAVIGATION
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#hero" className="text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#pourquoi" className="text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                  Pourquoi le digital ?
                </a>
              </li>
              <li>
                <a href="#parcours-client" className="text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                  Processus d'accompagnement
                </a>
              </li>
              <li>
                <a href="#demo-video" className="text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                  Démo en vidéo
                </a>
              </li>
              <li>
                <a href="#calculateur" className="text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                  Calculateur ROI
                </a>
              </li>
              <li>
                <a href="#tarifs" className="text-slate-400 hover:text-emerald-400 transition-colors duration-200">
                  Tarifs & Offres
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Villes Desservies */}
          <div className="space-y-4">
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">
              VILLES DESSERVIES
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00A86B] shrink-0" strokeWidth={1.75} />
                <span>Thiès (Siège & Agence)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00A86B] shrink-0" strokeWidth={1.75} />
                <span>Dakar (Almadies, Plateau, Point E)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00A86B] shrink-0" strokeWidth={1.75} />
                <span>Mbour & Saly Portudal</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00A86B] shrink-0" strokeWidth={1.75} />
                <span>Somone, Toubab Dialaw</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00A86B] shrink-0" strokeWidth={1.75} />
                <span>Saint-Louis & Partout au Sénégal</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h4 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">
              CONTACT
            </h4>
            <div className="space-y-3 text-sm">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-slate-400">Thiès, Sénégal (Quartier Dixième)</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-400 font-mono">+221 77 458 74 74</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-400">contact@louametay.com</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal Links */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Lou Ame Tay ? — Tous droits réservés.
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setLegalModalContent('mentions')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Mentions Légales
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setLegalModalContent('cgv')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              CGV Restauration
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setLegalModalContent('confidentialite')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Politique de Confidentialité
            </button>
          </div>
        </div>

      </div>

      {/* Legal Modal Popup */}
      {legalModalContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-lg text-slate-900">
                {legalModalContent === 'mentions' && 'Mentions Légales'}
                {legalModalContent === 'cgv' && 'Conditions Générales de Vente (CGV)'}
                {legalModalContent === 'confidentialite' && 'Politique de Confidentialité'}
              </h3>
              <button
                type="button"
                onClick={() => setLegalModalContent(null)}
                className="text-slate-400 hover:text-slate-900 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 max-h-80 overflow-y-auto leading-relaxed">
              {legalModalContent === 'mentions' && (
                <>
                  <p><strong>Éditeur du service :</strong> Agence Digitale Lou Ame Tay, Thiès, Sénégal.</p>
                  <p><strong>Directeur de publication :</strong> Équipe Lou Ame Tay Sénégal.</p>
                  <p><strong>Hébergement :</strong> Serveurs Cloud haute disponibilité certifiés SSL/HTTPS.</p>
                  <p><strong>Contact :</strong> contact@louametay.com | +221 77 458 74 74.</p>
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
                type="button"
                onClick={() => setLegalModalContent(null)}
                className="bg-[#00A86B] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
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
