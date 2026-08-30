import React from 'react';
import { Sparkles, PhoneCall, ArrowRight, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface CtaBannerProps {
  onOpenTrial: () => void;
}

export const CtaBanner: React.FC<CtaBannerProps> = ({ onOpenTrial }) => {
  return (
    <section className="py-20 bg-[#1A1A1A] text-white relative overflow-hidden border-b border-gray-800">
      
      {/* Subtle glowing accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#00A86B]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 text-center relative z-10 space-y-8">
        
        {/* Top Mini Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-white/10 text-white text-xs sm:text-sm font-bold border border-white/20">
          <Sparkles className="w-4 h-4 text-[#FF6B00]" />
          <span>Offre de lancement au Sénégal : 14 jours d'essai offerts</span>
        </div>

        {/* Headline */}
        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-4xl mx-auto">
          Prêt à digitaliser votre restaurant et en finir avec les erreurs de commande ?
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Rejoignez les restaurateurs de Dakar, Thiès et Saly qui augmentent leur chiffre d'affaires 
          grâce au menu QR code « Lou Ame Tay ? ».
        </p>

        {/* Giant CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            id="giant-cta-trial-btn"
            onClick={onOpenTrial}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 text-base sm:text-lg font-black text-white bg-[#00A86B] hover:bg-[#00925d] active:scale-95 px-8 py-4 rounded-xl shadow-xl shadow-[#00A86B]/25 transition-all cursor-pointer"
          >
            <span>🚀 Démarrer mon essai gratuit</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>

          <a
            id="giant-cta-whatsapp-btn"
            href="https://wa.me/221776543210?text=Bonjour%20Lou%20Ame%20Tay,%20je%20souhaite%20d%C3%A9marrer%20mon%20essai%20gratuit%20de%2014%20jours%20pour%20mon%20restaurant."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 active:scale-95 px-7 py-4 rounded-xl transition-all text-center"
          >
            <PhoneCall className="w-5 h-5 text-[#25D366]" />
            <span>📞 Échanger sur WhatsApp</span>
          </a>
        </div>

        {/* Subtext guarantees */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-gray-400 pt-2 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#00A86B]" />
            Sans engagement
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00A86B]" />
            Sans carte bancaire requise
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#00A86B]" />
            Configuré en 2 minutes chrono
          </span>
        </div>

      </div>
    </section>
  );
};
