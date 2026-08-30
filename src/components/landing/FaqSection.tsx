import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { FAQS } from '@/components/landing/data/mockData';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-[#F8F9FA] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Foire Aux Questions</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Tout ce que vous devez savoir sur <span className="text-[#00A86B]">Lou Ame Tay ?</span>
          </h2>

          <p className="text-base text-gray-600 font-normal leading-relaxed">
            Vous avez des questions spécifiques sur le fonctionnement au Sénégal ? Nous vous répondons en toute transparence.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-base text-gray-900 hover:text-[#00A86B] transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-xs font-extrabold text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded">
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 transform transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#00A86B]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 text-center bg-white p-6 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base">Une question sur mesure pour votre établissement ?</h4>
            <p className="text-xs text-gray-500">Notre équipe de Thiès vous répond directement sur WhatsApp.</p>
          </div>

          <a
            href="https://wa.me/221776543210?text=Bonjour%20Lou%20Ame%20Tay,%20j'ai%20une%20question%20sp%C3%A9cifique%20sur%20votre%20menu%20digital."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Poser ma question sur WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
