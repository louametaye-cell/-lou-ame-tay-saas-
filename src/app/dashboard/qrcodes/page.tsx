'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  QrCode, 
  ShoppingCart, 
  Package, 
  Check, 
  Clock, 
  Truck, 
  ShieldCheck, 
  Store, 
  ArrowLeft, 
  Sparkles,
  Phone,
  MapPin,
  DollarSign,
  X,
  Printer
} from 'lucide-react';
import { QRCodePhysicalOrder } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface OrderCardProps {
  title: string;
  price: string;
  format: string;
  tables: number;
  popular?: boolean;
  onOrder: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  title,
  price,
  format,
  tables,
  popular,
  onOrder,
}) => {
  return (
    <div
      className={`rounded-3xl p-6 border-2 transition-all flex flex-col justify-between relative bg-white shadow-lg hover:shadow-xl ${
        popular ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-200'
      }`}
    >
      {popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
          ⭐ Le Plus Populaire
        </span>
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="text-xs font-black text-gray-500 uppercase bg-gray-100 px-2.5 py-1 rounded-full">
            {tables} tables
          </span>
        </div>

        <h3 className="text-lg font-black text-gray-900 mb-1">{title}</h3>
        <p className="text-2xl font-black text-orange-600 mb-4">{price}</p>

        <div className="space-y-2 text-xs text-gray-600 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold text-gray-800">Support : {format}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Impression HD 300 DPI anti-reflet</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Plastification étanche & lavable</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Livraison rapide partout au Sénégal (24-48h)</span>
          </div>
        </div>
      </div>

      <button
        onClick={onOrder}
        className="w-full mt-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
      >
        <ShoppingCart className="w-4 h-4 stroke-[2.5]" />
        <span>Commander ce pack</span>
      </button>
    </div>
  );
};

export default function QRCodeOrderPage() {
  const [orders, setOrders] = useState<QRCodePhysicalOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal order state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<{
    title: string;
    price: number;
    format: string;
    tables: number;
  } | null>(null);

  const [restaurantName, setRestaurantName] = useState('Chez Fatou & Frères');
  const [phone, setPhone] = useState('+221 77 654 32 10');
  const [city, setCity] = useState('Thiès');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/dashboard/qrcodes/order?restaurantId=resto_thies_01');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenOrder = (tables: number, title: string, price: number, format: string) => {
    setSelectedPack({ tables, title, price, format });
    setIsModalOpen(true);
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPack) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/qrcodes/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'resto_thies_01',
          restaurantName,
          packTitle: selectedPack.title,
          tableCount: selectedPack.tables,
          format: selectedPack.format,
          price: selectedPack.price,
          city,
          phone,
        }),
      });

      if (res.ok) {
        toast.success(`Commande de ${selectedPack.title} confirmée avec succès !`, {
          description: 'Votre lot part en impression dans notre atelier.',
        });
        setIsModalOpen(false);
        fetchOrders();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Erreur lors de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-xs">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-950 flex items-center gap-2">
                <span>🛒 Commander des chevalets QR codes</span>
              </h1>
              <p className="text-xs text-gray-500">
                Supports de table haute résistance A5 plastifiés, plexiglas et PVC étanches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/kitchen"
              target="_blank"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all"
            >
              Écran Cuisine →
            </a>
          </div>
        </div>

        {/* 3 Packs Order Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <OrderCard
            title="Jeu de 1 à 5 tables"
            price="5 000 FCFA"
            format="A5 plastifié haute résistance"
            tables={5}
            onOrder={() => handleOpenOrder(5, 'Jeu de 1 à 5 tables', 5000, 'A5 plastifié')}
          />

          <OrderCard
            title="Jeu de 6 à 12 tables"
            price="8 000 FCFA"
            format="A5 plastifié + chevalet pliable"
            tables={12}
            popular={true}
            onOrder={() => handleOpenOrder(12, 'Jeu de 6 à 12 tables', 8000, 'A5 plastifié + chevalet')}
          />

          <OrderCard
            title="Jeu de 13 à 20 tables"
            price="12 000 FCFA"
            format="A5 plastifié + chevalet + PVC étanche"
            tables={20}
            onOrder={() => handleOpenOrder(20, 'Jeu de 13 à 20 tables', 12000, 'A5 plastifié + chevalet + PVC')}
          />
        </div>

        {/* SECTION: MES COMMANDES PASSÉES */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" />
              <span>📦 Mes commandes passées</span>
            </h2>
            <span className="text-xs font-bold bg-orange-50 text-orange-700 px-3 py-1 rounded-full">
              {orders.length} commande{orders.length > 1 ? 's' : ''}
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-sm">Vous n&apos;avez pas encore commandé de chevalets physiques.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-gray-50/60 flex items-center justify-between flex-wrap gap-3 hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center font-black">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-gray-900">{ord.packTitle}</h4>
                        <span className="text-xs font-bold text-gray-500 font-mono">
                          ({ord.tableCount} tables)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {ord.format} • Livraison : <span className="font-semibold text-gray-700">{ord.city || 'Thiès'}</span> • {new Date(ord.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-orange-600">
                      {formatFCFA(ord.price)}
                    </span>

                    <span
                      className={`text-xs font-black uppercase px-3 py-1 rounded-full ${
                        ord.status === 'LIVRE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'EXPEDIE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status === 'LIVRE'
                        ? '✓ Livré'
                        : ord.status === 'EXPEDIE'
                        ? '🚚 Expédié'
                        : '⏳ En cours d\'impression'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CONFIRMATION DE COMMANDE */}
      {isModalOpen && selectedPack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2.5 bg-orange-100 text-orange-600 rounded-2xl">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-gray-900">
                  Finaliser ma commande de chevalets
                </h3>
                <p className="text-xs text-gray-500">{selectedPack.title}</p>
              </div>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4 text-xs">
              <div className="bg-orange-50 border border-orange-200 p-3.5 rounded-2xl flex items-center justify-between text-orange-950">
                <div>
                  <span className="font-bold block">{selectedPack.title}</span>
                  <span className="text-[11px] opacity-80">{selectedPack.format}</span>
                </div>
                <span className="text-base font-black text-orange-600">
                  {formatFCFA(selectedPack.price)}
                </span>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Nom du Restaurant</label>
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Numéro WhatsApp de contact</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Ville de Livraison</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none font-semibold"
                >
                  <option value="Thiès">Thiès (Livraison 24h)</option>
                  <option value="Dakar">Dakar / Banlieue (Livraison 24h)</option>
                  <option value="Saly">Mbour / Saly / Somone (Livraison 24h)</option>
                  <option value="Saint-Louis">Saint-Louis / Régions (Livraison 48h)</option>
                </select>
              </div>

              {/* Wave & Orange Money payment instructions */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl space-y-1.5 text-emerald-950 text-[11px]">
                <span className="font-black block uppercase text-emerald-800">
                  💳 Paiement à la commande :
                </span>
                <p>
                  Réglez par <strong>Wave</strong> au <span className="font-mono font-bold">+221 77 123 45 67</span> ou <strong>Orange Money</strong> au <span className="font-mono font-bold">+221 78 987 65 43</span>.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-extrabold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  {isSubmitting ? 'Traitement...' : 'Confirmer & Lancer la production 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
