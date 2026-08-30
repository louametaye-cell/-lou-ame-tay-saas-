import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  MessageSquare, 
  HelpCircle, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Layers, 
  Copy, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Printer,
  Clock,
  Target,
  Lightbulb
} from 'lucide-react';
import { 
  SALES_PITCH_STEPS, 
  OBJECTION_HANDLERS, 
  OFFICIAL_OFFERS, 
  OFFICIAL_INSTALLATION_PACK, 
  CONTRACT_ORDER_FORM_FIELDS 
} from '@/components/landing/data/salesGuideData';
import { OfficialLogo } from './OfficialLogo';

interface SalesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesGuideModal: React.FC<SalesGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pitch' | 'objections' | 'tarifs' | 'contrat'>('pitch');
  const [languageMode, setLanguageMode] = useState<'fr' | 'wo'>('fr');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handlePrintContract = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] text-gray-900">
        
        {/* Modal Top Header */}
        <div className="bg-[#111827] text-white p-5 sm:p-6 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3.5">
            <div className="p-1.5 bg-white/10 rounded-2xl border border-white/10 shrink-0">
              <OfficialLogo variant="icon-only" size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-black text-lg sm:text-xl text-white">
                  Guide Commercial & Argumentaire de Vente Terrain
                </h3>
                <span className="bg-[#FF6B00] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  Édition Officielle 2026
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Éditeur : <strong>MÉDIAS GRAPHISME SÉNÉGAL</strong> • Direction : Mbaye Babacar GUEYE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            title="Fermer le guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('pitch')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pitch' ? 'bg-[#00A86B] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Pitch Terrain (3 Étapes)</span>
            </button>

            <button
              onClick={() => setActiveTab('objections')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'objections' ? 'bg-[#00A86B] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Traitement des 4 Objections</span>
            </button>

            <button
              onClick={() => setActiveTab('tarifs')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'tarifs' ? 'bg-[#00A86B] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Offres & Pack 50 000 F</span>
            </button>

            <button
              onClick={() => setActiveTab('contrat')}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'contrat' ? 'bg-[#00A86B] text-white shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Bon de Commande & Checklist</span>
            </button>
          </div>

          {/* Language Switcher for pitch/objections */}
          {(activeTab === 'pitch' || activeTab === 'objections') && (
            <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-2xs">
              <span className="text-[11px] font-bold text-gray-400 px-2">Langue :</span>
              <button
                onClick={() => setLanguageMode('fr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  languageMode === 'fr' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🇫🇷 Français
              </button>
              <button
                onClick={() => setLanguageMode('wo')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  languageMode === 'wo' ? 'bg-[#00A86B] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🇸🇳 Wolof
              </button>
            </div>
          )}

        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-[#FAFAFA] space-y-6">

          {/* TAB 1: PITCH TERRAIN (3 ÉTAPES) */}
          {activeTab === 'pitch' && (
            <div className="space-y-6">
              
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-[#00A86B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-heading font-black text-sm text-emerald-950">
                    Le Script de Prospection Terrain (Le Pitch Gagnant en moins de 4 minutes)
                  </h4>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Ce script chronométré est conçu pour capter immédiatement l'attention du restaurateur, lui faire prendre conscience de ses pertes sur le menu papier et lui faire vivre l'effet Waouh sur son smartphone.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {SALES_PITCH_STEPS.map((step) => {
                  const currentScript = languageMode === 'wo' && step.wolofScript ? step.wolofScript : step.frenchScript;

                  return (
                    <div key={step.id} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:border-gray-300 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-xl bg-[#00A86B] text-white flex items-center justify-center font-black text-sm">
                            {step.stepNumber}
                          </span>
                          <div>
                            <h4 className="font-heading font-black text-base text-gray-900">
                              {step.title}
                            </h4>
                            <span className="text-[11px] text-gray-500 font-medium">
                              Objectif : {step.objective}
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-black bg-amber-50 text-amber-800 border border-amber-200/80 px-3 py-1 rounded-full self-start sm:self-auto flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {step.duration}
                        </span>
                      </div>

                      {/* Action Required */}
                      <div className="mt-4 text-xs text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-start gap-2">
                        <Target className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                        <div>
                          <strong>Action du commercial :</strong> {step.action}
                        </div>
                      </div>

                      {/* Verbatim Script Box */}
                      <div className="mt-4 p-4 rounded-xl bg-gray-900 text-gray-100 text-xs font-mono leading-relaxed relative group">
                        <div className="flex items-center justify-between mb-2 text-[10px] text-gray-400 uppercase tracking-wider font-sans border-b border-gray-800 pb-1.5">
                          <span className="flex items-center gap-1.5 font-bold text-[#00A86B]">
                            {languageMode === 'wo' ? '🇸🇳 Script en Wolof' : '🇫🇷 Script en Français'}
                          </span>
                          <button
                            onClick={() => handleCopyText(currentScript, step.id)}
                            className="text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                            title="Copier le script"
                          >
                            {copiedId === step.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#00A86B]" />
                                <span className="text-[#00A86B]">Copié !</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="whitespace-pre-line text-sm text-gray-200">
                          {currentScript}
                        </p>
                      </div>

                      {/* Professional Field Tips */}
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-600">
                        {step.tips.map((tip, idx) => (
                          <span key={idx} className="bg-emerald-50/70 text-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{tip}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 2: TRAITEMENT DES 4 OBJECTIONS */}
          {activeTab === 'objections' && (
            <div className="space-y-6">
              
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
                <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-heading font-black text-sm text-blue-950">
                    Guide Stratégique du Traitement des Objections Clients
                  </h4>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    Face aux hésitations du restaurateur sénégalais (papier, internet, coût, changement de menu), utilisez ces réponses éprouvées et percutantes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {OBJECTION_HANDLERS.map((obj, index) => {
                  const currentResponse = languageMode === 'wo' && obj.responseWolof ? obj.responseWolof : obj.responseFr;

                  return (
                    <div key={obj.id} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs hover:border-gray-300 transition-all">
                      
                      <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100">
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            #{index + 1}
                          </span>
                          <div>
                            <h4 className="font-heading font-black text-base text-gray-900">
                              {obj.objection}
                            </h4>
                            <span className="text-[11px] text-gray-500 italic block mt-0.5">
                              Contexte : {obj.context}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopyText(currentResponse, obj.id)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
                          title="Copier la réponse"
                        >
                          {copiedId === obj.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#00A86B]" />
                              <span className="text-[#00A86B]">Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-gray-500" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Response Box */}
                      <div className="mt-4 p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-gray-900 text-xs sm:text-sm leading-relaxed">
                        <span className="font-bold text-[#00A86B] block text-[11px] uppercase tracking-wider mb-2">
                          Réponse du Commercial ({languageMode === 'wo' ? 'Wolof' : 'Français'}) :
                        </span>
                        <p className="whitespace-pre-line text-gray-800 font-normal">
                          {currentResponse}
                        </p>
                      </div>

                      {/* Key Arguments */}
                      <div className="mt-3.5 pt-3 border-t border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                          Arguments Clés à Relever :
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {obj.keyArguments.map((arg, aIdx) => (
                            <span key={aIdx} className="text-[11px] bg-gray-100 text-gray-800 font-medium px-2.5 py-1 rounded-lg">
                              ✓ {arg}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: GRILLE TARIFAIRE OFFICIELLE & PACK 50 000 FCFA */}
          {activeTab === 'tarifs' && (
            <div className="space-y-6">
              
              {/* Pack 50 000 F CFA Focus Card */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-2 border-[#00A86B] rounded-3xl p-6 sm:p-7 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#00A86B]/20">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#00A86B] text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-[#00A86B]/30">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-[#00A86B] text-white px-2.5 py-0.5 rounded-full">
                        Prestation Initiale Obligatoire
                      </span>
                      <h4 className="font-heading font-black text-xl text-gray-900 mt-1">
                        {OFFICIAL_INSTALLATION_PACK.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Payable immédiatement à la signature du bon de commande.
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right bg-white p-3.5 rounded-2xl border border-emerald-200">
                    <span className="text-[11px] text-gray-500 font-bold block uppercase">Tarif Unique</span>
                    <span className="font-heading font-black text-3xl text-[#00A86B]">50 000</span>
                    <span className="text-xs font-bold text-gray-900 ml-1">FCFA Net</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5 text-xs text-gray-700">
                  <span className="font-bold text-gray-900 block text-xs uppercase tracking-wider">
                    Inclusions du Pack d'Installation :
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {OFFICIAL_INSTALLATION_PACK.inclusions.map((inc, iIdx) => (
                      <div key={iIdx} className="bg-white/80 p-3 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00A86B] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 Official Subscription Plans */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-heading font-black text-lg text-gray-900">
                      Formules d'Abonnement Récurrent (Mensuel ou Annuel)
                    </h4>
                    <p className="text-xs text-gray-500">
                      Sans engagement de durée • Paiement annuel avec 2 mois offerts.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {OFFICIAL_OFFERS.map((offer) => (
                    <div
                      key={offer.id}
                      className={`bg-white rounded-2xl p-6 border flex flex-col justify-between transition-all ${
                        offer.recommended
                          ? 'border-2 border-[#00A86B] shadow-xl ring-4 ring-[#00A86B]/10'
                          : 'border-gray-200 shadow-xs hover:border-gray-300'
                      }`}
                    >
                      <div>
                        {offer.recommended && (
                          <span className="text-[10px] font-black uppercase bg-[#00A86B] text-white px-2.5 py-0.5 rounded-full inline-block mb-2">
                            Formule Recommandée
                          </span>
                        )}
                        <h5 className="font-heading font-black text-lg text-gray-900">
                          {offer.name}
                        </h5>
                        <p className="text-xs text-gray-500 mt-1 min-h-[34px]">
                          Cible : {offer.targetAudience}
                        </p>

                        {/* Prices */}
                        <div className="my-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-baseline gap-1">
                            <span className="font-heading font-black text-2xl text-gray-900">
                              {offer.monthlyPrice.toLocaleString('fr-FR')}
                            </span>
                            <span className="text-xs font-bold text-[#00A86B]">FCFA</span>
                            <span className="text-xs text-gray-500">/ mois</span>
                          </div>
                          <div className="text-[11px] text-gray-600 mt-1">
                            ou <strong>{offer.annualPrice.toLocaleString('fr-FR')} FCFA / an</strong> (2 mois offerts)
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2 text-xs text-gray-700">
                          {offer.keyFeatures.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#00A86B] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: BON DE COMMANDE & CHECKLIST TERRAIN */}
          {activeTab === 'contrat' && (
            <div className="space-y-6">
              
              {/* Actions Header for Contract */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                  <h4 className="font-heading font-black text-base text-gray-900">
                    Modèle Officiel du Bon de Commande Restaurant (LAT-2026)
                  </h4>
                  <p className="text-xs text-gray-500">
                    Document à faire remplir et signer en double exemplaire lors de la visite terrain.
                  </p>
                </div>

                <button
                  onClick={handlePrintContract}
                  className="bg-gray-900 hover:bg-black text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md transition-all self-start sm:self-auto"
                >
                  <Printer className="w-4 h-4 text-[#00A86B]" />
                  <span>Imprimer la Fiche Contrat</span>
                </button>
              </div>

              {/* Printable Contract Preview Sheet */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-gray-300 shadow-md font-sans text-xs text-gray-900 space-y-6 print:m-0 print:border-none print:shadow-none">
                
                {/* Header of the document */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-gray-900 pb-5">
                  <div className="flex items-start gap-4">
                    <OfficialLogo variant="icon-only" size="md" />
                    <div>
                      <span className="font-heading font-black text-xl tracking-tight text-gray-900 block">
                        LOU AME TAY <span className="text-[#00A86B]">?</span>
                      </span>
                      <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest block">
                        SOLUTION SAAS DE MENU DIGITAL & COMMANDE SUR TABLE
                      </span>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Éditeur : <strong>{CONTRACT_ORDER_FORM_FIELDS.editor}</strong> • {CONTRACT_ORDER_FORM_FIELDS.headquarters}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Tél : {CONTRACT_ORDER_FORM_FIELDS.contactPhones} • Email : {CONTRACT_ORDER_FORM_FIELDS.contactEmail}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-gray-50 p-3 rounded-xl border border-gray-200 shrink-0">
                    <span className="font-mono font-bold text-xs text-gray-800 block">
                      RÉFÉRENCE : LAT-2026-________
                    </span>
                    <span className="text-xs text-gray-600 block mt-1">
                      Date : ____ / ____ / 2026
                    </span>
                  </div>
                </div>

                <div className="text-center py-1 bg-gray-900 text-white rounded-lg font-heading font-black text-sm uppercase tracking-wider">
                  {CONTRACT_ORDER_FORM_FIELDS.documentTitle}
                </div>

                {/* Section 1: Infos Restaurant */}
                <div className="space-y-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider bg-gray-100 p-2 rounded-md text-gray-800">
                    1. INFORMATIONS SUR L'ÉTABLISSEMENT :
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="border-b border-gray-300 pb-1.5">
                      <span className="text-gray-500 text-[11px] block">Nom du Restaurant / Enseigne :</span>
                      <span className="font-bold text-gray-900">__________________________________________</span>
                    </div>
                    <div className="border-b border-gray-300 pb-1.5">
                      <span className="text-gray-500 text-[11px] block">Forme Juridique & NINEA :</span>
                      <span className="font-bold text-gray-900">__________________________________________</span>
                    </div>
                    <div className="border-b border-gray-300 pb-1.5">
                      <span className="text-gray-500 text-[11px] block">Adresse / Emplacement exact :</span>
                      <span className="font-bold text-gray-900">__________________________________________</span>
                    </div>
                    <div className="border-b border-gray-300 pb-1.5">
                      <span className="text-gray-500 text-[11px] block">Ville / Quartier :</span>
                      <span className="font-bold text-gray-900">__________________________________________</span>
                    </div>
                    <div className="border-b border-gray-300 pb-1.5">
                      <span className="text-gray-500 text-[11px] block">Nom & Prénom du Gérant / Propriétaire :</span>
                      <span className="font-bold text-gray-900">__________________________________________</span>
                    </div>
                    <div className="border-b border-gray-300 pb-1.5">
                      <span className="text-gray-500 text-[11px] block">Téléphone principal / WhatsApp :</span>
                      <span className="font-bold text-gray-900">__________________________________________</span>
                    </div>
                    <div className="border-b border-gray-300 pb-1.5">
                      <span className="text-gray-500 text-[11px] block">Numéro Mobile Money (Wave / OM) :</span>
                      <span className="font-bold text-gray-900">__________________________________________</span>
                    </div>
                    <div className="border-b border-gray-300 pb-1.5">
                      <span className="text-gray-500 text-[11px] block">Courriel :</span>
                      <span className="font-bold text-gray-900">__________________________________________</span>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-gray-800">
                    <strong>Nombre total de tables :</strong> [ &nbsp;&nbsp;&nbsp;&nbsp; ] Tables &nbsp;|&nbsp; 
                    <strong>Espaces :</strong> [ &nbsp; ] Salle principale &nbsp; [ &nbsp; ] Terrasse &nbsp; [ &nbsp; ] Bar / Lounge &nbsp; [ &nbsp; ] Piscine / Plage
                  </div>
                </div>

                {/* Section 2: Formule Retenue */}
                <div className="space-y-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider bg-gray-100 p-2 rounded-md text-gray-800">
                    2. FORMULE RETENUE & MODALITÉS :
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 border border-gray-300 rounded-xl">
                      <div className="font-bold">[ &nbsp; ] FORMULE STARTER</div>
                      <div className="text-[11px] text-gray-600">15 000 F CFA / mois</div>
                      <div className="text-[10px] text-gray-500 mt-1">Menu consultation simple</div>
                    </div>
                    <div className="p-3 border-2 border-[#00A86B] bg-emerald-50/40 rounded-xl">
                      <div className="font-bold text-[#00A86B]">[ &nbsp; ] FORMULE PRO (Recommandée)</div>
                      <div className="text-[11px] text-gray-900 font-bold">25 000 F CFA / mois</div>
                      <div className="text-[10px] text-gray-600 mt-1">Commande table + Écran Cuisine</div>
                    </div>
                    <div className="p-3 border border-gray-300 rounded-xl">
                      <div className="font-bold">[ &nbsp; ] FORMULE PREMIUM</div>
                      <div className="text-[11px] text-gray-600">45 000 F CFA / mois</div>
                      <div className="text-[10px] text-gray-500 mt-1">Multi-zones & Hôtels</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 pt-1 text-xs">
                    <strong>Périodicité de règlement :</strong>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span>[ &nbsp; ] Mensuel</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <span>[ &nbsp; ] Annuel (2 mois offerts)</span>
                    </label>
                  </div>
                </div>

                {/* Section 3: Engagement Financier Initial */}
                <div className="space-y-2">
                  <h5 className="font-bold text-xs uppercase tracking-wider bg-gray-100 p-2 rounded-md text-gray-800">
                    3. ENGAGEMENT FINANCIER INITIAL :
                  </h5>
                  <div className="p-3.5 bg-gray-50 border border-gray-300 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span>Frais de Mise en service & QR codes rigides (Pack Initial) :</span>
                      <strong className="text-sm text-gray-900">50 000 F CFA</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                      <span>Acompte versé à la commande :</span>
                      <span className="font-bold">_________________________ F CFA</span>
                    </div>
                    <div className="flex items-center gap-4 pt-1 text-[11px]">
                      <span>Moyen de règlement :</span>
                      <span>[ &nbsp; ] Wave</span>
                      <span>[ &nbsp; ] Orange Money</span>
                      <span>[ &nbsp; ] Virement BNDE</span>
                      <span>[ &nbsp; ] Espèces</span>
                    </div>
                    <div className="pt-1">
                      <span>Date d'installation et de formation souhaitée : ________________________</span>
                    </div>
                  </div>
                </div>

                {/* Section 4: Signatures */}
                <div className="space-y-3 pt-2">
                  <h5 className="font-bold text-xs uppercase tracking-wider bg-gray-100 p-2 rounded-md text-gray-800">
                    4. SIGNATURES & VALIDATION :
                  </h5>
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="border border-gray-300 rounded-xl p-4 h-32 flex flex-col justify-between">
                      <div>
                        <span className="font-bold block text-xs">Pour le Restaurant :</span>
                        <span className="text-[10px] text-gray-500">« Bon pour Accord et Inscription »</span>
                      </div>
                      <span className="text-[10px] text-gray-400 italic">Cachet & Signature du Gérant</span>
                    </div>

                    <div className="border border-gray-300 rounded-xl p-4 h-32 flex flex-col justify-between">
                      <div>
                        <span className="font-bold block text-xs">Pour Médias Graphisme Sénégal :</span>
                        <span className="text-[10px] text-gray-500">Nom du Commercial : ________________</span>
                      </div>
                      <span className="text-[10px] text-gray-400 italic">Signature & Date</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Checklist Commercial Post-Signature */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-amber-700" />
                  <h4 className="font-heading font-black text-sm text-amber-950">
                    Checklist du Commercial après Signature (Transmission en 48h)
                  </h4>
                </div>
                <p className="text-xs text-amber-900">
                  Pour que le dossier soit mis en production et livré en 48h par l'équipe technique de Médias Graphisme Sénégal :
                </p>

                <div className="space-y-2 text-xs text-gray-800">
                  {CONTRACT_ORDER_FORM_FIELDS.checklistItems.map((item, cIdx) => (
                    <div key={cIdx} className="bg-white p-2.5 rounded-xl border border-amber-200/60 flex items-start gap-2">
                      <span className="font-bold text-[#FF6B00] shrink-0">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Contacts */}
        <div className="bg-white border-t border-gray-200 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-gray-900">
              <MapPin className="w-3.5 h-3.5 text-[#00A86B]" />
              {CONTRACT_ORDER_FORM_FIELDS.headquarters}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              {CONTRACT_ORDER_FORM_FIELDS.contactPhones}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              {CONTRACT_ORDER_FORM_FIELDS.contactEmail}
            </span>
          </div>

          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-black text-white font-bold px-5 py-2 rounded-xl transition-all cursor-pointer text-xs"
          >
            Fermer le Guide
          </button>
        </div>

      </div>
    </div>
  );
};
