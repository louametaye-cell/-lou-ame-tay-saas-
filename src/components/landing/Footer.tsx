'use client';

import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Music2 } from 'lucide-react';
import { OfficialLogo } from './OfficialLogo';

interface FooterProps {
  onOpenQrModal?: () => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const [legalModalContent, setLegalModalContent] = useState<string | null>(null);

  return (
    <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800 relative font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Colonne 1 : Identité */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <OfficialLogo size="lg" textClassName="text-white" showSubtitle={true} />
          </div>
          <p className="text-sm text-slate-400 mb-4 leading-relaxed">
            La solution SaaS sénégalaise clé en main pour la digitalisation des restaurants, bars et hôtels.
          </p>
          <p className="text-xs text-slate-500">
            Un produit <strong>DAW Digital Arts Work — by MG</strong><br/>
            Startup Sénégalaise
          </p>
        </div>

        {/* Colonne 2 : Contact */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Contact
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Thiès, Sénégal — Quartier Fayou, Face Foot Salé</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <a href="tel:+221774587474" className="hover:text-emerald-400 text-slate-300">
                +221 77 458 74 74
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
              <a href="tel:+221771303678" className="hover:text-emerald-400 text-slate-300">
                +221 77 130 36 78
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
              <a href="mailto:contact@mgartswork.site" className="hover:text-emerald-400 text-slate-300">
                contact@mgartswork.site
              </a>
            </li>
          </ul>
        </div>

        {/* Colonne 3 : Réseaux sociaux */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Suivez-nous
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <a href="https://facebook.com/mgartswork" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-400 text-slate-300 transition-colors">
                <Facebook className="w-4 h-4 text-[#1877F2]" /> @mgartswork
              </a>
            </li>
            <li>
              <a href="https://instagram.com/mgartswork" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-400 text-slate-300 transition-colors">
                <Instagram className="w-4 h-4 text-[#E4405F]" /> @mgartswork
              </a>
            </li>
            <li>
              <a href="https://youtube.com/@mgartswork" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-400 text-slate-300 transition-colors">
                <Youtube className="w-4 h-4 text-[#FF0000]" /> @mgartswork
              </a>
            </li>
            <li>
              <a href="https://tiktok.com/@mgartswork" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-emerald-400 text-slate-300 transition-colors">
                <Music2 className="w-4 h-4 text-slate-200" /> @mgartswork
              </a>
            </li>
          </ul>
        </div>

        {/* Colonne 4 : Liens légaux */}
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
            Informations
          </h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>
              <button type="button" onClick={() => setLegalModalContent('mentions')} className="hover:text-emerald-400 transition-colors text-left">
                Mentions Légales
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setLegalModalContent('cgv')} className="hover:text-emerald-400 transition-colors text-left">
                Conditions Générales (CGV)
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setLegalModalContent('confidentialite')} className="hover:text-emerald-400 transition-colors text-left">
                Confidentialité
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setLegalModalContent('rgpd')} className="hover:text-emerald-400 transition-colors text-left">
                Conformité RGPD / CDP
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© 2026 Lou Ame Tay? — Tous droits réservés.</p>
        <p>
          Conçu et développé par <strong className="text-slate-300">DAW Digital Arts Work — by MG</strong>
        </p>
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
                {legalModalContent === 'rgpd' && 'Conformité RGPD & Protection des Données'}
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
                  <p><strong>Éditeur du service :</strong> DAW Digital Arts Work — by MG (Startup Sénégalaise).</p>
                  <p><strong>Siège Social :</strong> Thiès, Sénégal — Quartier Fayou, Face Foot Salé.</p>
                  <p><strong>Directeur de publication :</strong> CEO & Développeur Lou Ame Tay? (DAW Digital Arts Work — by MG).</p>
                  <p><strong>Hébergement :</strong> Serveurs Cloud Edge haute disponibilité certifiés SSL/HTTPS.</p>
                  <p><strong>Contact :</strong> contact@mgartswork.site | +221 77 458 74 74 / +221 77 130 36 78.</p>
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
                  <p><strong>Conformité CDP Sénégal :</strong> Aucune donnée personnelle n'est commercialisée ni revendue à des tiers.</p>
                </>
              )}
              {legalModalContent === 'rgpd' && (
                <>
                  <p><strong>Conformité Loi 2008-12 :</strong> Respect scrupuleux de la législation sénégalaise sur les données personnelles.</p>
                  <p><strong>Export & Droit à l'oubli :</strong> Possibilité d'export intégral des données en JSON/CSV depuis l'Espace Gérant (/dashboard/settings).</p>
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
