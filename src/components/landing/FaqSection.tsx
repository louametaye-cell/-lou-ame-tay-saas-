import React, { useState } from 'react';
import { 
  ChevronDown, 
  HelpCircle, 
  MessageCircle, 
  Info, 
  Code, 
  Smartphone, 
  CreditCard, 
  Headphones, 
  ShieldCheck, 
  LucideIcon 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FAQS } from '@/components/landing/data/mockData';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getCategoryBadge = (category: string): { icon: LucideIcon; style: string } => {
    const catLower = category.toLowerCase();
    if (catLower.includes('général') || catLower.includes('general')) {
      return { icon: Info, style: 'bg-emerald-50 text-[#00A86B] border-emerald-200/80' };
    }
    if (catLower.includes('technique')) {
      return { icon: Code, style: 'bg-blue-50 text-blue-600 border-blue-200/80' };
    }
    if (catLower.includes('matériel') || catLower.includes('materiel')) {
      return { icon: Smartphone, style: 'bg-orange-50 text-[#FF6B00] border-orange-200/80' };
    }
    if (catLower.includes('paiement')) {
      return { icon: CreditCard, style: 'bg-amber-50 text-amber-700 border-amber-200/80' };
    }
    if (catLower.includes('accompagnement')) {
      return { icon: Headphones, style: 'bg-purple-50 text-purple-700 border-purple-200/80' };
    }
    if (catLower.includes('abonnement')) {
      return { icon: ShieldCheck, style: 'bg-rose-50 text-rose-700 border-rose-200/80' };
    }
    return { icon: HelpCircle, style: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  return (
    <section className="py-20 bg-[#F8F9FA] relative">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4 mb-12 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-xs font-bold uppercase tracking-wider border border-green-200/60">
            <HelpCircle className="w-4 h-4 text-[#00A86B]" />
            <span>Foire Aux Questions</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Tout ce que vous devez savoir sur <span className="text-[#00A86B]">Lou Ame Tay ?</span>
          </h2>

          <p className="text-base text-gray-600 font-normal leading-relaxed">
            Vous avez des questions spécifiques sur le fonctionnement au Sénégal ? Nous vous répondons en toute transparence.
          </p>
        </motion.div>

        {/* FAQ Accordion List */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            const badge = getCategoryBadge(faq.category);
            const BadgeIcon = badge.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`rounded-2xl border bg-white overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? 'border-[#00A86B]/60 shadow-md ring-2 ring-[#00A86B]/10'
                    : 'border-gray-200/90 shadow-xs hover:border-gray-300 hover:bg-[#FAFBFB]'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-base text-gray-900 transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    <span className={`text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 shrink-0 ${badge.style}`}>
                      <BadgeIcon className="w-3.5 h-3.5" />
                      <span>{faq.category}</span>
                    </span>
                    <span className="text-sm sm:text-base text-gray-900 font-bold">{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transform transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#00A86B]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 max-w-4xl mx-auto"
        >
          <div className="text-left space-y-1">
            <h4 className="font-heading font-extrabold text-gray-900 text-base sm:text-lg">Une question sur mesure pour votre établissement ?</h4>
            <p className="text-xs sm:text-sm text-gray-500">Notre équipe basée à Thiès et Dakar vous répond directement en personne sur WhatsApp.</p>
          </div>

          <a
            href="https://wa.me/221762312003?text=Bonjour%20Lou%20Ame%20Tay,%20j'ai%20une%20question%20sp%C3%A9cifique%20sur%20votre%20menu%20digital."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] active:scale-95 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Poser ma question sur WhatsApp</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
};
