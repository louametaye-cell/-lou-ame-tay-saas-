import React, { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { FAQS } from '@/components/landing/data/mockData';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-slate-50/50 border-b border-slate-200/80 relative">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-3 mb-14 max-w-3xl mx-auto"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-[#00A86B] block">
            Questions Fréquentes
          </span>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tout ce que vous devez savoir sur <span className="text-[#00A86B]">Lou Ame Tay ?</span>
          </h2>

          <p className="text-base text-slate-600 font-normal leading-relaxed">
            Réponses claires et directes sur la mise en service, les équipements et le fonctionnement au Sénégal.
          </p>
        </motion.div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className={`rounded-xl border bg-white overflow-hidden transition-all duration-200 ${
                  isOpen
                    ? 'border-slate-300 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-base text-slate-900 transition-colors focus:outline-none cursor-pointer"
                >
                  <span className="text-sm sm:text-base text-slate-900 font-bold">{faq.question}</span>
                  <ChevronDown
                    strokeWidth={1.75}
                    className={`w-5 h-5 text-slate-400 shrink-0 transform transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#00A86B]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.answer}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-14 text-center bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 max-w-3xl mx-auto shadow-xs"
        >
          <div className="text-left space-y-1">
            <h4 className="font-heading font-bold text-slate-900 text-base">Une question spécifique pour votre établissement ?</h4>
            <p className="text-xs sm:text-sm text-slate-500">Notre équipe basée à Thiès et Dakar vous répond directement sur WhatsApp.</p>
          </div>

          <a
            href="https://wa.me/221762312003?text=Bonjour%20Lou%20Ame%20Tay,%20j'ai%20une%20question%20sp%C3%A9cifique%20sur%20votre%20menu%20digital."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#00A86B] hover:bg-[#008957] active:scale-98 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
            <span>Poser une question sur WhatsApp</span>
          </a>
        </motion.div>

      </div>
    </section>
  );
};
