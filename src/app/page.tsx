'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { HeroSection } from '@/components/landing/HeroSection';
import { MissionSection } from '@/components/landing/MissionSection';
import { ProblemsSection } from '@/components/landing/ProblemsSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { DemoVideoSection } from '@/components/landing/DemoVideoSection';
import { InteractiveLiveDemo } from '@/components/landing/InteractiveLiveDemo';
import { RoiCalculator } from '@/components/landing/RoiCalculator';
import { ProximitySection } from '@/components/landing/ProximitySection';
import { CustomerJourneySection } from '@/components/landing/CustomerJourneySection';
import { PricingSection } from '@/components/landing/PricingSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { CtaBanner } from '@/components/landing/CtaBanner';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';
import { FreeTrialModal } from '@/components/landing/FreeTrialModal';
import { QrGeneratorModal } from '@/components/landing/QrGeneratorModal';
import { CrmModal } from '@/components/landing/CrmModal';

export default function HomePage() {
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [initialCrmAgentId, setInitialCrmAgentId] = useState<string | undefined>(undefined);
  const [selectedPlanForTrial, setSelectedPlanForTrial] = useState<string>('premium');

  useEffect(() => {
    // Check URL parameters for direct commercial / admin login links: ?agent=slug or ?token=token
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const agentParam = urlParams.get('agent') || urlParams.get('crm');
        const tokenParam = urlParams.get('token');

        if (agentParam || tokenParam) {
          setIsCrmModalOpen(true);
          if (agentParam) {
            setInitialCrmAgentId(agentParam);
          }
        }
      }
    } catch {
      // ignore in environments where window.location is restricted
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Secret key combination: Ctrl + Shift + A or Cmd + Shift + A (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsCrmModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenTrialWithPlan = (planId: string) => {
    setSelectedPlanForTrial(planId);
    setIsTrialModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-[#1A1A1A] relative selection:bg-[#00A86B]/20 selection:text-[#00A86B]">
      
      {/* Top Main Navigation Header */}
      <Header
        onOpenTrial={() => setIsTrialModalOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
      />

      {/* Main Landing Page Sections */}
      <main className="flex-grow">
        
        {/* 1. Hero Section */}
        <HeroSection
          onOpenTrial={() => setIsTrialModalOpen(true)}
          onOpenQrModal={() => setIsQrModalOpen(true)}
        />

        {/* 1.5 Mission & Vision - Campagne de Digitalisation 100% Sénégalaise */}
        <MissionSection />

        {/* 2. Problems & Solutions (Pourquoi digitaliser ?) */}
        <ProblemsSection />

        {/* 3. How it Works (3 Steps + 4 Key Screens) */}
        <HowItWorksSection />

        {/* 3.5 Demo Video Section (Voyez Lou Ame Tay? en action - 30s) */}
        <DemoVideoSection />

        {/* 4. Interactive Live Simulator (Phone Order to Kitchen Screen Sync) */}
        <InteractiveLiveDemo />

        {/* 5. ROI & Profitability Calculator in FCFA */}
        <RoiCalculator />

        {/* 5.5 Proximity Section (Notre différence : l'hyper-proximité Thiès & Dakar) */}
        <ProximitySection />

        {/* 7. Customer Journey & WhatsApp Onboarding (J0 -> J45) */}
        <CustomerJourneySection />

        {/* 8. Pricing Tiers (2 offres simplifiées + Pack Lancement) */}
        <PricingSection onSelectPlan={handleOpenTrialWithPlan} />

        {/* 9. Verified Local Testimonials */}
        <TestimonialsSection />

        {/* 10. Frequently Asked Questions */}
        <FaqSection />

        {/* 11. Giant Final CTA Banner */}
        <CtaBanner onOpenTrial={() => setIsTrialModalOpen(true)} />

        {/* 12. Lead Capture Contact Form */}
        <ContactSection initialPlan={selectedPlanForTrial} />

      </main>

      {/* 13. Footer with Agency Coordinates & Legal Modals */}
      <Footer 
        onOpenQrModal={() => setIsQrModalOpen(true)} 
      />

      {/* 14-Day Free Trial Sign-up Modal */}
      <FreeTrialModal
        isOpen={isTrialModalOpen}
        onClose={() => setIsTrialModalOpen(false)}
        selectedPlanId={selectedPlanForTrial}
      />

      {/* QR Code Table Generator Modal */}
      <QrGeneratorModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* CRM & Prospection Terrain Dashboard Modal (Contains Espace Commercial & Guide Commercial) */}
      <CrmModal
        isOpen={isCrmModalOpen}
        onClose={() => setIsCrmModalOpen(false)}
        initialAgentSlug={initialCrmAgentId}
      />

    </div>
  );
}