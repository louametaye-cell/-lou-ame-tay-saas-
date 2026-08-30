import React, { useState } from 'react';
import { Check, X, Sparkles, MessageCircle, ArrowRight, ShieldCheck, Plus, Flame, Smartphone } from 'lucide-react';
import { PRICING_PLANS, PRICING_OPTIONS } from '@/components/landing/data/mockData';

interface PricingSectionProps {
  onSelectPlan: (planId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="tarifs" className="py-20 bg-white relative border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-[#00A86B] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-green-200/60">
            <span>Offre Commerciale Simplifiée</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Grille tarifaire claire, <span className="text-[#00A86B]">sans frais cachés</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
            Formules d'abonnement sans engagement, éditées par <strong>Médias Graphisme Sénégal</strong>. Facturation mensuelle souple ou annuelle (2 mois offerts), avec règlement instantané par Wave ou Orange Money.
          </p>

          {/* Pack Installation & Mise en Service Initiale Banner */}
          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border-2 border-[#00A86B]/40 text-left max-w-3xl mx-auto shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#00A86B] text-white flex items-center justify-center shrink-0 font-black shadow-md shadow-[#00A86B]/30">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-black text-sm sm:text-base text-gray-900 uppercase tracking-wide">
                      Pack d'Installation & Mise en Service Initiale
                    </span>
                    <span className="text-[10px] font-black bg-[#00A86B] text-white px-2.5 py-0.5 rounded-full">
                      Payable à la signature
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    Configuration du compte, saisie intégrale de votre menu avec photos, fourniture de <strong>15 à 25 supports personnalisés</strong> (chevalets plexiglas rigides ou stickers vinyle anti-taches) et formation complète sur place (30 min).
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-[#00A86B]/20 sm:pl-5 shrink-0">
                <span className="text-[10px] text-gray-500 block uppercase font-bold">Tarif Unique</span>
                <span className="font-heading font-black text-2xl text-[#00A86B]">50 000</span>
                <span className="text-xs font-bold text-gray-900 ml-1">FCFA</span>
              </div>
            </div>
          </div>

          {/* Billing Switch (Monthly / Annual) */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Facturation Mensuelle
            </span>

            <button
              id="billing-cycle-toggle-btn"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-14 h-8 rounded-full p-1 transition-colors relative cursor-pointer focus:outline-none"
              style={{ backgroundColor: billingCycle === 'annual' ? '#00A86B' : '#E5E7EB' }}
              aria-label="Changer le cycle de facturation"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>

            <span className={`text-sm font-semibold flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
              <span>Paiement Annuel</span>
              <span className="bg-[#FF6B00] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                -20% (2 mois offerts)
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid (3 official formulas: Starter, Pro, Premium) */}
        <div className="mt-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {PRICING_PLANS.map((plan) => {
            const isPremium = plan.popular;
            const price = billingCycle === 'annual' ? plan.priceAnnualMonthly : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-200 relative ${
                  isPremium
                    ? 'bg-white border-2 border-[#00A86B] shadow-xl ring-4 ring-[#00A86B]/10 md:-translate-y-2'
                    : 'bg-[#F8F9FA] border border-gray-200 hover:bg-white hover:border-gray-300'
                }`}
              >
                {/* Badge */}
                <div className={`absolute -top-3.5 left-8 text-white text-[10px] font-extrabold px-3.5 py-1 rounded-full shadow-md uppercase tracking-wider flex items-center gap-1 ${
                  isPremium ? 'bg-[#00A86B]' : 'bg-gray-800'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  <span>{plan.badge || plan.name}</span>
                </div>

                <div>
                  {/* Plan Name & Desc */}
                  <div className="mb-6 pt-2">
                    <h3 className="font-heading font-extrabold text-2xl text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed min-h-[38px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Tag */}
                  <div className="mb-8 pb-6 border-b border-gray-200/80">
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading font-black text-4xl text-gray-900">
                        {price.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-sm font-extrabold text-[#00A86B]">FCFA</span>
                      <span className="text-xs text-gray-500 ml-1">/ mois</span>
                    </div>

                    {billingCycle === 'annual' && (
                      <span className="text-[11px] text-[#00A86B] font-semibold block mt-1">
                        Facturé {(price * 12).toLocaleString('fr-FR')} FCFA / an (2 mois offerts)
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider block">
                      Détails de la formule :
                    </span>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm">
                        {feature.included ? (
                          <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${feature.highlight ? 'bg-[#00A86B] text-white' : 'bg-green-50 text-[#00A86B]'}`}>
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-0.5 rounded-full mt-0.5 shrink-0 bg-red-100 text-red-500">
                            <X className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className={`${feature.included ? 'text-gray-800' : 'text-gray-400 line-through'} ${feature.highlight ? 'font-bold text-gray-950' : 'font-normal'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div>
                  <button
                    id={`pricing-btn-${plan.id}`}
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isPremium
                        ? 'bg-[#00A86B] hover:bg-[#00925d] active:scale-98 text-white shadow-[#00A86B]/25'
                        : 'bg-gray-900 hover:bg-black active:scale-98 text-white'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-gray-500 mt-2.5">
                    14 jours d'essai gratuit • Sans carte bancaire
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* 1 Option Component: Extra Tables */}
        <div className="mt-8 max-w-5xl mx-auto bg-[#F8F9FA] rounded-2xl p-6 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-[#00A86B] flex items-center justify-center shrink-0 border border-green-200">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded uppercase">Option à la carte</span>
                <h4 className="font-heading font-extrabold text-base text-gray-900">{PRICING_OPTIONS.extraTables.title}</h4>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {PRICING_OPTIONS.extraTables.description}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0 flex items-center sm:flex-col sm:items-end gap-3 sm:gap-0">
            <span className="font-heading font-black text-2xl text-gray-900">
              +{PRICING_OPTIONS.extraTables.price.toLocaleString('fr-FR')} FCFA
            </span>
            <span className="text-xs text-gray-500">/ {PRICING_OPTIONS.extraTables.unit}</span>
          </div>
        </div>

        {/* Local Payment Badges & WhatsApp Support Strip */}
        <div className="mt-10 max-w-5xl mx-auto bg-white rounded-2xl p-6 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-700 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#1DC3F4]/10 text-[#0089BA] px-3 py-1.5 rounded-lg font-bold">
              <span>🌊 Wave</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#FF6B00]/10 text-[#FF6B00] px-3 py-1.5 rounded-lg font-bold">
              <span>🍊 Orange Money</span>
            </div>
            <span className="text-gray-500 hidden sm:inline">• 0 frais bancaire, règlement mensuel sur facture</span>
          </div>

          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Assistance directe basée à <strong>Thiès & Dakar</strong></span>
          </div>
        </div>

      </div>
    </section>
  );
};

