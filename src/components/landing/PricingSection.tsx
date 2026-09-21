import React, { useState } from 'react';
import { Check, X, MessageCircle, ArrowRight, ShieldCheck, Plus, Smartphone } from 'lucide-react';
import { PRICING_PLANS, PRICING_OPTIONS } from '@/components/landing/data/mockData';

interface PricingSectionProps {
  onSelectPlan: (planId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="tarifs" className="py-24 bg-white relative border-b border-slate-200/80">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00A86B] block">
            Offre commerciale
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Des formules transparentes, <span className="text-[#00A86B]">sans engagement</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed">
            Formules d'abonnement flexibles sans engagement. Facturation mensuelle ou annuelle, avec règlement par Wave ou Orange Money.
          </p>

          <div className="pt-1 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-800 text-xs px-3 py-1 rounded-full font-semibold shadow-xs">
              🔥 Écran Cuisine (KDS) inclus
            </span>
          </div>

          {/* Pack Installation & Mise en Service Initiale Banner */}
          <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 text-left max-w-3xl mx-auto shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-[#00A86B]" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wide">
                      Mise en service & Configuration initiale
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                      Frais uniques
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                    Création de votre compte, saisie intégrale de vos cartes et visuels, fourniture de <strong>15 à 25 supports QR sur-mesure</strong> (chevalets plexiglas ou vinyles anti-taches) et formation sur place.
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-5 shrink-0">
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Forfait unique</span>
                <span className="font-heading font-bold text-2xl text-slate-900">50 000</span>
                <span className="text-xs font-bold text-slate-700 ml-1">FCFA</span>
              </div>
            </div>
          </div>

          {/* Billing Switch (Monthly / Annual) */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
              Facturation Mensuelle
            </span>

            <button
              id="billing-cycle-toggle-btn"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className="w-12 h-6 rounded-full p-0.5 transition-colors relative cursor-pointer focus:outline-none bg-slate-200"
              style={{ backgroundColor: billingCycle === 'annual' ? '#00A86B' : '#E2E8F0' }}
              aria-label="Changer le cycle de facturation"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>

            <span className={`text-sm font-medium flex items-center gap-1.5 ${billingCycle === 'annual' ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
              <span>Paiement Annuel</span>
              <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                -20% (2 mois offerts)
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid (4 standard formulas) */}
        <div className="mt-12 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
          {PRICING_PLANS.filter(plan => !plan.isEvent).map((plan) => {
            const isPremium = plan.popular;
            const price = typeof plan.priceMonthly === 'number' && billingCycle === 'annual' && plan.priceAnnualMonthly 
              ? plan.priceAnnualMonthly 
              : plan.priceMonthly;

            return (
              <div
                key={plan.id}
                className={`rounded-xl p-7 flex flex-col justify-between transition-all duration-200 relative bg-white border ${
                  isPremium
                    ? 'border-2 border-[#00A86B] shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Badge */}
                {isPremium && (
                  <div className="absolute -top-3 left-6 text-[10px] font-bold px-3 py-0.5 rounded-full bg-[#00A86B] text-white uppercase tracking-wider">
                    Formule recommandée
                  </div>
                )}

                <div className="text-slate-900">
                  {/* Plan Name & Desc */}
                  <div className="mb-6 pt-1">
                    {plan.wolofName && (
                      <h3 className="font-heading font-extrabold text-xl mb-1 text-slate-900">
                        {plan.wolofName}
                      </h3>
                    )}
                    <p className="font-bold text-sm mb-2 text-[#00A86B]">
                      {plan.name}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[48px] font-normal">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price Tag */}
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading font-extrabold text-3xl text-slate-900">
                        {typeof price === 'number' ? price.toLocaleString('fr-FR') : price}
                      </span>
                      {typeof price === 'number' && (
                        <>
                          <span className="text-xs font-bold text-slate-700">FCFA</span>
                          <span className="text-xs text-slate-500 ml-1">/ mois</span>
                        </>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 block mt-1 font-normal">
                      {typeof price === 'number' ? "+ 50 000 FCFA mise en service" : "Étude & configuration sur-mesure"}
                    </span>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-semibold uppercase tracking-wider block text-slate-400">
                      Inclus dans cette formule :
                    </span>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-[#00A86B] shrink-0 mt-0.5" strokeWidth={2} />
                        ) : (
                          <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" strokeWidth={1.5} />
                        )}
                        <span className={feature.included ? 'text-slate-700 font-normal' : 'text-slate-400 line-through font-normal'}>
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
                    className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      isPremium
                        ? 'bg-[#00A86B] hover:bg-[#008957] text-white shadow-xs'
                        : 'bg-slate-900 hover:bg-black text-white'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                  </button>

                  <p className="text-[11px] text-center mt-2 text-slate-400 font-normal">
                    {typeof price === 'number' ? "14 jours d'essai offert • Sans engagement" : "Devis gratuit sans engagement"}
                  </p>
                </div>

              </div>
            );
          })}
        </div>

        {/* Formule NDAJÉ Événementielle */}
        {(() => {
          const eventPlan = PRICING_PLANS.find(p => p.isEvent);
          if (!eventPlan) return null;

          return (
            <div id="formule-ndaje-banner" className="mt-10 max-w-[1400px] mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-800 text-slate-300 text-[10px] font-semibold px-2.5 py-0.5 rounded uppercase">
                    Offre Événements
                  </span>
                  <span className="text-xs text-slate-400">
                    Prestation ponctuelle sans abonnement
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-2xl text-white tracking-tight flex items-center gap-2">
                    <span>{eventPlan.wolofName}</span>
                    <span className="text-base font-normal text-slate-400">— {eventPlan.name}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl font-normal">
                    {eventPlan.description}. Adapté pour les <strong>dîners de gala, mariages, séminaires et soirées corporatives</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {eventPlan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-[#00A86B] shrink-0" strokeWidth={2} />
                      <span className="font-normal">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center lg:items-end gap-3">
                <span className="text-xs text-slate-400 uppercase font-medium">Tarif Prestation</span>
                <span className="font-heading font-bold text-2xl text-white">Sur devis</span>

                <button
                  id={`pricing-btn-${eventPlan.id}`}
                  onClick={() => onSelectPlan(eventPlan.id)}
                  className="py-3 px-6 rounded-xl font-bold text-xs bg-white hover:bg-slate-100 text-slate-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Demander un devis</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          );
        })()}

        {/* 1 Option Component: Extra Tables */}
        <div className="mt-8 max-w-[1400px] mx-auto bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 shrink-0">
              <Plus className="w-4 h-4 text-[#00A86B]" strokeWidth={2} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase">Option supplémentaire</span>
              <h4 className="font-heading font-bold text-sm text-slate-900">{PRICING_OPTIONS.extraTables.title}</h4>
              <p className="text-xs text-slate-500 font-normal">{PRICING_OPTIONS.extraTables.description}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="font-heading font-bold text-lg text-slate-900">
              +{PRICING_OPTIONS.extraTables.price.toLocaleString('fr-FR')} FCFA
            </span>
            <span className="text-xs text-slate-500 font-normal"> / {PRICING_OPTIONS.extraTables.unit}</span>
          </div>
        </div>

        {/* Local Payment Badges */}
        <div className="mt-8 max-w-[1400px] mx-auto bg-white rounded-xl p-5 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-700">Moyens de règlement acceptés :</span>
            <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded font-bold">🌊 Wave</span>
            <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded font-bold">🍊 Orange Money</span>
          </div>

          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#00A86B]" strokeWidth={1.75} />
            <span>Assistance directe basée à <strong>Thiès & Dakar</strong></span>
          </div>
        </div>

      </div>
    </section>
  );
};

