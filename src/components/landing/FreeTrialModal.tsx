import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
}

export const FreeTrialModal: React.FC<FreeTrialModalProps> = ({ isOpen, onClose, selectedPlanId = 'pro' }) => {
  const [formData, setFormData] = useState({
    name: '',
    restaurant: '',
    phone: '',
    city: 'Thiès',
    plan: selectedPlanId,
    tableCount: '10'
  });
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  };

  const handleWhatsAppInstant = () => {
    const msg = encodeURIComponent(
      `Bonjour Lou Ame Tay ! J'ai activé mon essai gratuit pour mon restaurant "${formData.restaurant || 'Mon Resto'}" à ${formData.city} (Formule ${formData.plan.toUpperCase()}, ${formData.tableCount} tables). Mon téléphone est le ${formData.phone}.`
    );
    window.open(`https://wa.me/221776543210?text=${msg}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-[#00A86B] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h3 className="font-heading font-black text-2xl text-gray-900">
              Félicitations ! 🚀
            </h3>
            
            <p className="text-sm text-gray-600 leading-relaxed">
              Votre essai gratuit de 14 jours pour <strong>{formData.restaurant || 'votre établissement'}</strong> est pré-activé. 
              Notre équipe technique de Thiès prépare vos QR codes de test.
            </p>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 text-left space-y-1">
              <p className="font-bold">Prochaine étape :</p>
              <p>Envoyez une photo de votre menu actuel sur WhatsApp pour qu'on le saisisse gratuitement.</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleWhatsAppInstant}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-xl font-bold text-sm shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Envoyer mon menu sur WhatsApp</span>
              </button>
              <button
                onClick={onClose}
                className="text-xs text-gray-500 hover:text-gray-900 py-1"
              >
                Fermer cette fenêtre
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>14 jours 100% gratuits • Sans carte bancaire</span>
              </div>
              <h3 className="font-heading font-black text-2xl text-gray-900">
                Démarrer mon essai <span className="text-[#00A86B]">Lou Ame Tay ?</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Configurez votre restaurant en 2 minutes et testez sur vos propres tables.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Votre Prénom & Nom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aissatou Ndiaye"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A86B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom du Restaurant *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Chez Aïcha"
                    value={formData.restaurant}
                    onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A86B] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Téléphone WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: 77 000 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A86B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Ville</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A86B] focus:outline-none cursor-pointer"
                  >
                    <option value="Thiès">Thiès</option>
                    <option value="Dakar">Dakar</option>
                    <option value="Mbour / Saly">Mbour / Saly</option>
                    <option value="Saint-Louis">Saint-Louis</option>
                    <option value="Autre">Autre région</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Formule à tester</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-[#00A86B] focus:outline-none cursor-pointer font-semibold text-[#00A86B]"
                  >
                    <option value="starter">Starter (15 000 FCFA)</option>
                    <option value="pro">Pro (25 000 FCFA) ★</option>
                    <option value="enterprise">Enterprise (Sur mesure)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#00A86B] hover:bg-[#00925d] active:scale-98 text-white font-bold text-sm shadow-lg shadow-[#00A86B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Activer mon essai de 14 jours</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00A86B]" />
              Sans engagement. Annulation possible en 1 clic.
            </p>

          </form>
        )}

      </div>
    </div>
  );
};
