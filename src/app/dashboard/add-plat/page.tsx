'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Utensils, 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  Check, 
  ShieldCheck, 
  Clock, 
  Store, 
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { LEGAL_14_ALLERGENS, MenuRequestType } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

export default function AddPlatPage() {
  const [name, setName] = useState('');
  const [wolofName, setWolofName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState('Plats Traditionnels');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<MenuRequestType[]>([]);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('/api/dashboard/menu-request');
      if (res.ok) {
        const data = await res.json();
        setMyRequests(data.requests || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleToggleAllergen = (allergen: string) => {
    if (selectedAllergens.includes(allergen)) {
      setSelectedAllergens(selectedAllergens.filter((a) => a !== allergen));
    } else {
      setSelectedAllergens([...selectedAllergens, allergen]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) {
      toast.error('Veuillez renseigner le nom et le prix du plat');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/menu-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: 'resto_thies_01',
          restaurantName: 'Chez Fatou & Frères',
          name,
          wolofName: wolofName.trim() ? wolofName : undefined,
          description,
          price: Number(price),
          category,
          imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          allergens: selectedAllergens,
        }),
      });

      if (res.ok) {
        toast.success('Plat soumis avec succès ! L\'équipe agence l\'intègre dans les 24h.');
        setName('');
        setWolofName('');
        setDescription('');
        setPrice('');
        setImageUrl('');
        setSelectedAllergens([]);
        fetchMyRequests();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Erreur lors de la soumission du plat');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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
                <span>📤 Soumettre un nouveau plat</span>
              </h1>
              <p className="text-xs text-gray-500">
                Remplissez ce formulaire pour soumettre un nouveau plat à votre menu. L&apos;agence validera et l&apos;intégrera dans les 24h.
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
            {/* Nom du Plat & Wolof */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Nom du plat (Français) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Thiof Braisé Royal"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-green-600 transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Nom en Wolof (optionnel)
                </label>
                <input
                  type="text"
                  value={wolofName}
                  onChange={(e) => setWolofName(e.target.value)}
                  placeholder="Ex: Jën ci Xonq"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-green-600 transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Description du plat & Ingrédients
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez la garniture, les épices, la sauce, l'accompagnement..."
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm outline-none resize-none focus:bg-white focus:border-green-600 transition-all"
              />
            </div>

            {/* Prix & Catégorie */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Prix en FCFA *
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  step={100}
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Ex: 5000"
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-black text-green-700 outline-none focus:bg-white focus:border-green-600 transition-all font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Catégorie du Menu
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-green-600 transition-all"
                >
                  <option value="🌟 Lou Ame Tay (Plats du Jour)">🌟 Plats du Jour</option>
                  <option value="🥗 Entrées & Tapas">🥗 Entrées & Tapas</option>
                  <option value="🥩 Grillades">🥩 Grillades</option>
                  <option value="🐟 Poissons & Fruits de Mer">🐟 Poissons & Fruits de Mer</option>
                  <option value="🍲 Plats Traditionnels">🍲 Plats Traditionnels</option>
                  <option value="🍰 Desserts">🍰 Desserts</option>
                  <option value="🥤 Boissons">🥤 Boissons</option>
                </select>
              </div>
            </div>

            {/* Photo / Fichier */}
            <div>
              <label className="font-bold text-gray-700 block mb-1">
                Photo du plat (URL ou Fichier)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Lien d'image HD ou laissez vide pour photo de banque d'images"
                  className="flex-1 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-none focus:bg-white focus:border-green-600"
                />
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 text-gray-700">
                  <Upload className="w-4 h-4" />
                  <span>Charger</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        toast.success(`Fichier ${e.target.files[0].name} sélectionné`);
                        setImageUrl('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80');
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* 14 ALLERGÈNES LÉGAUX */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Déclaration obligatoire des 14 Allergènes Majeurs :</span>
              </div>
              <p className="text-xs text-amber-800">
                Sélectionnez tous les allergènes présents dans votre recette pour protéger vos clients :
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                {LEGAL_14_ALLERGENS.map((allergen) => {
                  const isChecked = selectedAllergens.includes(allergen);
                  return (
                    <label
                      key={allergen}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all text-xs ${
                        isChecked
                          ? 'bg-amber-200/80 border-amber-400 text-amber-950 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleAllergen(allergen)}
                        className="rounded text-green-600 focus:ring-green-500 w-4 h-4"
                      />
                      <span>{allergen}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[56px] bg-green-600 hover:bg-green-700 text-white text-base font-black rounded-2xl shadow-xl shadow-green-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSubmitting ? 'Transmission à l\'agence...' : 'Soumettre mon plat 🚀'}</span>
            </button>
          </form>
        </div>

        {/* Mes demandes en attente */}
        {myRequests.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Mes plats en cours de validation agence ({myRequests.length})</span>
            </h3>

            <div className="space-y-3">
              {myRequests.map((req) => (
                <div key={req.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    <span className="font-bold text-gray-900 text-sm block">{req.name}</span>
                    <span className="text-gray-500">{req.category} • {formatFCFA(req.price)}</span>
                  </div>

                  <span className="bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full uppercase text-[10px]">
                    ⏳ Validation sous 24h
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
