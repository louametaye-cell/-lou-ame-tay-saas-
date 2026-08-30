import React, { useState } from 'react';
import { 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ContactSectionProps {
  initialPlan?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ initialPlan }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    restaurantName: '',
    city: 'Thiès',
    plan: initialPlan || 'pro',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate lead capture process
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    }, 900);
  };

  const handleWhatsAppRedirect = () => {
    const text = encodeURIComponent(
      `Bonjour Lou Ame Tay ! Je m'appelle ${formData.fullName || 'Restaurateur'}, gérant de ${formData.restaurantName || 'mon restaurant'} à ${formData.city}. Je souhaite des informations pour la formule ${formData.plan.toUpperCase()}.`
    );
    window.open(`https://wa.me/221776543210?text=${text}`, '_blank');
  };

  return (
    <section id="contact" className="py-20 bg-white border-b border-gray-100 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact details and Agency info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF6B00] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-orange-200/60">
                <span>Contact & Démonstration</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
                Discutons de votre <span className="text-[#00A86B]">restaurant</span>
              </h2>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                Remplissez ce formulaire ou écrivez-nous directement sur WhatsApp. Notre équipe se déplace 
                gratuitement dans votre établissement à Thiès, Dakar, Mbour et Saly.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-4">
              
              {/* WhatsApp direct card */}
              <a
                href="https://wa.me/221776543210?text=Bonjour%20Lou%20Ame%20Tay,%20je%20souhaite%20une%20d%C3%A9monstration%20du%20menu%20digital."
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-green-50/70 border border-green-200/80 flex items-center gap-4 hover:bg-green-100/80 transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                    WhatsApp Direct (Réponse en 5 min)
                  </span>
                  <span className="font-heading font-black text-base text-gray-900 group-hover:text-[#00A86B]">
                    +221 77 654 32 10
                  </span>
                </div>
              </a>

              {/* Phone call card */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-gray-200 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                    Téléphone Fixe / Mobile
                  </span>
                  <span className="font-bold text-sm sm:text-base text-gray-900">
                    +221 33 951 00 00 / +221 77 654 32 10
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-gray-200 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-orange-100 text-[#FF6B00] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                    Email Officiel
                  </span>
                  <span className="font-bold text-sm sm:text-base text-gray-900">
                    contact@louametay.sn
                  </span>
                </div>
              </div>

              {/* Office Location */}
              <div className="p-4 rounded-xl bg-[#F8F9FA] border border-gray-200 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-100 text-[#00A86B] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                    Bureaux & Agence Digitale
                  </span>
                  <span className="font-bold text-sm text-gray-900 block">
                    Thiès (Quartier Dixième) & Dakar (Point E)
                  </span>
                  <span className="text-[11px] text-gray-500">Sénégal 🇸🇳</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Interactive Lead Capture Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#F8F9FA] rounded-2xl p-6 sm:p-10 border border-gray-200 shadow-sm">
              
              {isSubmitted ? (
                <div className="py-10 text-center space-y-5 animate-in fade-in">
                  <div className="w-16 h-16 bg-emerald-100 text-[#00A86B] rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-heading font-black text-2xl text-gray-900">
                    Merci {formData.fullName || 'Cher Restaurateur'} !
                  </h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
                    Votre demande pour <strong>{formData.restaurantName || 'votre établissement'}</strong> a bien été transmise à notre équipe de Thiès. 
                    Un conseiller vous contactera sur le <strong>{formData.phone}</strong> sous 2 heures ouvrées.
                  </p>
                  
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleWhatsAppRedirect}
                      className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Accélérer la réponse sur WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs text-gray-500 hover:text-gray-900 underline font-semibold"
                    >
                      Envoyer une autre demande
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-2">
                    <h3 className="font-heading font-extrabold text-xl text-gray-900">
                      Demandez votre démo & essai gratuit
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Réponse garantie en moins de 2 heures par notre équipe sénégalaise.
                    </p>
                  </div>

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Modou Fall"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Numéro de Téléphone (WhatsApp) *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ex: 77 123 45 67"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                      />
                    </div>
                  </div>

                  {/* Email + Restaurant Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Email professionnel
                      </label>
                      <input
                        type="email"
                        placeholder="Ex: contact@monresto.sn"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Nom du Restaurant / Fast-food *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Le Teranga Lounge"
                        value={formData.restaurantName}
                        onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                      />
                    </div>
                  </div>

                  {/* City + Plan Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Ville / Zone géographique
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B] cursor-pointer"
                      >
                        <option value="Thiès">Thiès</option>
                        <option value="Dakar">Dakar (Plateau, Almadies, etc.)</option>
                        <option value="Mbour / Saly">Mbour / Saly Portudal</option>
                        <option value="Saint-Louis">Saint-Louis</option>
                        <option value="Autre région Sénégal">Autre région au Sénégal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Formule souhaitée
                      </label>
                      <select
                        value={formData.plan}
                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B] cursor-pointer"
                      >
                        <option value="starter">Starter (15 000 FCFA/mois)</option>
                        <option value="pro">Pro (25 000 FCFA/mois) - Recommandé</option>
                        <option value="enterprise">Enterprise (Sur mesure)</option>
                        <option value="demo">Simple demande de démonstration</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Votre message ou besoins particuliers (Optionnel)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Nombre de tables, spécialités, questions sur les QR codes..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00A86B]"
                    />
                  </div>

                  {/* Submit button */}
                  <div className="pt-2">
                    <button
                      id="contact-submit-btn"
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-4 rounded-xl bg-[#00A86B] hover:bg-[#00925d] active:scale-98 text-white font-bold text-sm shadow-lg shadow-[#00A86B]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <span>Envoi en cours...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Envoyer ma demande & Démarrer l'essai</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1.5 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#00A86B]" />
                    Vos données restent confidentielles et ne sont jamais partagées.
                  </p>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
