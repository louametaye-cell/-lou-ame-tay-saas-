'use client';

import React, { useState } from 'react';
import { 
  Leaf, 
  Download, 
  Star, 
  UtensilsCrossed, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowLeft,
  MessageCircle,
  Copy,
  Check,
  Receipt as ReceiptIcon,
  ShieldCheck,
  Share2
} from 'lucide-react';
import Link from 'next/link';

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number; // Montant en FCFA
  notes?: string;
  selectedSide?: string;
  selectedSpice?: string;
}

export interface ReceiptData {
  orderId: string;
  orderNumber: string; // Ex: "#42"
  createdAt: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
  restaurantSlug: string;
  restaurantGoogleReviewUrl?: string;
  tableNumber?: number | string;
  serviceType: 'DINE_IN' | 'TAKEAWAY' | 'EXPRESS';
  paymentMethod: string;
  paymentStatus: string;
  items: ReceiptItem[];
  subtotal: number;
  tax?: number;
  total: number;
  cashierName?: string;
  customerName?: string;
}

interface DigitalCustomerReceiptProps {
  receipt: ReceiptData;
  onClose?: () => void;
  isModal?: boolean;
}

export default function DigitalCustomerReceipt({ 
  receipt, 
  onClose,
  isModal = false 
}: DigitalCustomerReceiptProps) {
  const [copied, setCopied] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [selectedStars, setSelectedStars] = useState<number>(5);

  // 1. Génération du message formaté pour le partage WhatsApp en 1 clic
  const handleWhatsAppShare = () => {
    const itemsList = receipt.items
      .map(item => `• ${item.quantity}x ${item.name} (${(item.quantity * item.price).toLocaleString('fr-FR')} FCFA)`)
      .join('\n');

    const serviceLabel = receipt.serviceType === 'DINE_IN'
      ? `Sur place (Table ${receipt.tableNumber || '-'})`
      : 'Retrait comptoir / À emporter';

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

    const message = 
      `🧾 *REÇU NUMÉRIQUE OFFICIEL - ${receipt.restaurantName.toUpperCase()}*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🎯 Commande N° : *${receipt.orderNumber}*\n` +
      `📅 Date : ${receipt.createdAt}\n` +
      `📍 Service : ${serviceLabel}\n` +
      `${receipt.customerName ? `👤 Client : ${receipt.customerName}\n` : ''}` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `*DÉTAILS DES CONSOMMATIONS :*\n${itemsList}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *TOTAL RÉGLÉ : ${receipt.total.toLocaleString('fr-FR')} FCFA*\n` +
      `✅ Règlement : ${receipt.paymentMethod} (Validé)\n\n` +
      `🌿 *Merci de préserver nos arbres — Ticket 100% numérique 🌱*\n` +
      `🔗 Consulter mon reçu certifié : ${currentUrl}`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // 2. Déclenchement de l'impression / Export PDF haute fidélité
  const handleDownloadPDF = () => {
    window.print();
  };

  // Copier le lien unique du reçu
  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRatingClick = (stars: number) => {
    setSelectedStars(stars);
    setRatingSubmitted(true);
    if (receipt.restaurantGoogleReviewUrl) {
      window.open(receipt.restaurantGoogleReviewUrl, '_blank');
    }
  };

  return (
    <div className={`w-full ${isModal ? 'p-0' : 'min-h-screen bg-slate-100 py-6 px-4 sm:px-6 flex flex-col items-center'} print:p-0 print:bg-white`}>
      {/* Conteneur Ticket Style Thermique Réaliste */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-w-none text-slate-900 mx-auto">
        
        {/* 🌿 1. BADGE ÉCO-RESPONSABLE NON-NÉGOCIABLE */}
        <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-center gap-2 text-center print:hidden shadow-inner">
          <Leaf className="w-5 h-5 flex-shrink-0 text-emerald-200" />
          <span className="text-xs sm:text-sm font-black tracking-wide">
            Merci de préserver nos arbres — Ticket 100% numérique 🌱
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          {/* EN-TÊTE ÉTABLISSEMENT */}
          <div className="text-center space-y-1.5 border-b border-dashed border-slate-200 pb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 mx-auto mb-1 shadow-xs">
              <UtensilsCrossed className="w-7 h-7 text-amber-700" />
            </div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              {receipt.restaurantName}
            </h1>
            <div className="text-xs text-slate-500 flex flex-col items-center gap-0.5 font-medium">
              {receipt.restaurantAddress && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {receipt.restaurantAddress}
                </span>
              )}
              {receipt.restaurantPhone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {receipt.restaurantPhone}
                </span>
              )}
            </div>
          </div>

          {/* NUMÉRO DE COMMANDE GÉANT & STATUT (ACCESSIBILITÉ UNIVERSELLE) */}
          <div className="text-center py-3 px-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest block">
              COMMANDE N°
            </span>
            <div className="text-5xl sm:text-6xl font-black text-slate-950 font-mono tracking-tight my-1">
              {receipt.orderNumber}
            </div>

            {/* Statut Encaissé (Vert = Validé / Bleu = Wave) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>Réglé • {receipt.paymentMethod}</span>
            </div>
          </div>

          {/* DÉTAILS CONTEXTUELS */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl text-slate-600 border border-slate-100">
            <div>
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Service</span>
              <span className="font-black text-slate-900 text-xs">
                {receipt.serviceType === 'DINE_IN' ? `🍽️ Table ${receipt.tableNumber || '-'}` : '🛍️ À emporter'}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-slate-400 font-bold uppercase text-[10px]">Date & Heure</span>
              <span className="font-black text-slate-900 text-xs">{receipt.createdAt}</span>
            </div>
          </div>

          {/* DÉTAIL DES ARTICLES */}
          <div className="space-y-2.5 pt-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Détail des consommations
            </h3>
            <div className="divide-y divide-slate-100">
              {receipt.items.map((item, idx) => (
                <div key={item.id || idx} className="py-2.5 flex items-start justify-between gap-3 text-sm">
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-slate-900 flex items-baseline gap-1.5">
                      <span className="text-amber-700 font-mono font-black">{item.quantity}x</span>
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.selectedSide && (
                      <p className="text-[11px] text-slate-500 pl-5">&gt; {item.selectedSide}</p>
                    )}
                    {item.notes && (
                      <p className="text-[11px] text-slate-500 italic pl-5 mt-0.5">* {item.notes}</p>
                    )}
                  </div>
                  <div className="font-mono font-black text-slate-900 text-right shrink-0">
                    {(item.quantity * item.price).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL FINANCIER GÉANT FCFA */}
          <div className="border-t-2 border-dashed border-slate-300 pt-4 space-y-1 bg-amber-50/50 -mx-6 sm:-mx-8 px-6 sm:px-8 py-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-800 uppercase tracking-wide">
                TOTAL PAYÉ
              </span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-slate-950 tracking-tight">
                {receipt.total.toLocaleString('fr-FR')} <span className="text-base text-emerald-700 font-sans">FCFA</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-500 text-right italic font-medium">
              Prix nets TTC • Service inclus
            </p>
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* BOUTONS D'ACTIONS INTERACTIFS CLIENTS (PRINT HIDDEN)        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="space-y-3 pt-2 print:hidden">
            
            {/* 💬 2. PARTAGE WHATSAPP EN 1 CLIC */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="w-full min-h-[52px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black flex items-center justify-center gap-3 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all text-sm"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Partager sur WhatsApp (Reçu)</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              {/* 📥 3. TÉLÉCHARGER / IMPRIMER PDF */}
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="min-h-[48px] bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs active:scale-[0.98] transition-all shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger PDF</span>
              </button>

              {/* Copier le lien direct */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center justify-center gap-2 text-xs active:scale-[0.98] transition-all border border-slate-200"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Lien copié !' : 'Copier le lien'}</span>
              </button>
            </div>

            {/* ⭐ 4. APPEL À L'ACTION INTERACTIF */}
            <div className="pt-2 space-y-2 border-t border-slate-100">
              {/* Avis interactif */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-center space-y-2">
                <span className="text-xs font-black text-amber-950 block">
                  {ratingSubmitted ? '🎉 Merci pour votre évaluation !' : '⭐ Donner votre avis sur le service'}
                </span>
                
                <div className="flex justify-center items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className="p-1 hover:scale-125 transition-transform active:scale-95"
                    >
                      <Star 
                        className={`w-6 h-6 ${
                          star <= selectedStars 
                            ? 'fill-amber-500 text-amber-500' 
                            : 'text-slate-300'
                        }`} 
                      />
                    </button>
                  ))}
                </div>

                {receipt.restaurantGoogleReviewUrl && (
                  <a
                    href={receipt.restaurantGoogleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[11px] font-bold text-amber-800 underline hover:text-amber-950"
                  >
                    Laisser un avis officiel sur Google Maps &rarr;
                  </a>
                )}
              </div>

              {/* Lien direct : Re-consulter le menu digital */}
              <Link
                href={`/r/${receipt.restaurantSlug}`}
                className="w-full min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black flex items-center justify-center gap-2 text-xs active:scale-[0.98] transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Consulter à nouveau le menu digital</span>
              </Link>
            </div>

          </div>

          {/* PIED DE TICKET SÉCURISÉ */}
          <div className="text-center pt-3 text-[10px] text-slate-400 uppercase tracking-widest border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-center gap-1 font-bold text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ticket certifié conforme Lou Ame Tay ?</span>
            </div>
            <div>Dakar, Sénégal • Restauration Connectée</div>
          </div>
        </div>
      </div>
    </div>
  );
}
