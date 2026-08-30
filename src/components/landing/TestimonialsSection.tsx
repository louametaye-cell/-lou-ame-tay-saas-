import React from 'react';
import { Star, Quote, MapPin, CheckCircle2, TrendingUp } from 'lucide-react';
import { TESTIMONIALS } from '@/components/landing/data/mockData';

export const TestimonialsSection: React.FC = () => {
  return (
    <section id="temoignages" className="py-20 bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-[#00A86B] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-green-200/60">
            <span>Ils nous font confiance</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Ce que disent les <span className="text-[#00A86B]">restaurateurs</span> du Sénégal
          </h2>

          <p className="text-base sm:text-lg text-gray-500 font-normal leading-relaxed">
            Découvrez comment des établissements à Thiès, Dakar, Mbour et Saly ont modernisé leur service avec Lou Ame Tay.
          </p>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <div
              key={item.id}
              className={`rounded-2xl p-8 border flex flex-col justify-between relative transition-all duration-200 ${
                idx === 1 
                  ? 'bg-orange-50/60 border-orange-200 shadow-sm' 
                  : 'bg-[#F8F9FA] border-gray-200 hover:bg-white hover:border-gray-300'
              }`}
            >
              <div>
                {/* Rating stars & Quote icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-gray-300" />
                </div>

                {/* Quote text */}
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic mb-6">
                  « {item.quote} »
                </p>
              </div>

              <div>
                {/* Metric Badge */}
                <div className="mb-4 inline-flex items-center gap-1.5 bg-green-50 text-[#00A86B] px-3 py-1 rounded-md text-xs font-bold border border-green-200/60">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{item.metrics}</span>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-3.5 pt-4 border-t border-gray-200/80">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                  />
                  <div>
                    <h4 className="font-heading font-bold text-sm text-gray-900 leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs text-gray-500 font-medium">{item.role}</p>
                    <p className="text-[11px] font-bold text-[#FF6B00] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{item.restaurant} ({item.city})</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Partners badge strip */}
        <div className="mt-16 text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-gray-400 block mb-6">
            Présents dans les plus grands pôles gastronomiques du Sénégal
          </span>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs font-semibold text-gray-600">
            <span className="bg-[#F8F9FA] border border-gray-200 px-4 py-2 rounded-xl">📍 Dakar (Almadies, Point E, Plateau)</span>
            <span className="bg-[#F8F9FA] border border-gray-200 px-4 py-2 rounded-xl">📍 Thiès (Dixième, Randoulène)</span>
            <span className="bg-[#F8F9FA] border border-gray-200 px-4 py-2 rounded-xl">📍 Mbour & Saly Portudal</span>
            <span className="bg-[#F8F9FA] border border-gray-200 px-4 py-2 rounded-xl">📍 Saint-Louis du Sénégal</span>
          </div>
        </div>

      </div>
    </section>
  );
};
