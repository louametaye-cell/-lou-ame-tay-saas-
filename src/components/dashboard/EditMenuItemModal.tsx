'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Clock, 
  Flame, 
  Check, 
  Save, 
  Trash2, 
  Globe, 
  Utensils, 
  Camera,
  AlertCircle
} from 'lucide-react';
import { MenuItemType, CategoryType, LEGAL_14_ALLERGENS } from '@/types';
import { SENEGALESE_FOOD_PHOTO_PRESETS } from '@/lib/order-routing';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface EditMenuItemModalProps {
  item: MenuItemType | null;
  categories: CategoryType[];
  isOpen: boolean;
  onClose: () => void;
  onItemSaved: (updatedItem: MenuItemType) => void;
  onItemDeleted?: (deletedItemId: string) => void;
}

export const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  item,
  categories,
  isOpen,
  onClose,
  onItemSaved,
  onItemDeleted,
}) => {
  if (!isOpen || !item) return null;

  const [name, setName] = useState(item.name || '');
  const [wolofName, setWolofName] = useState(item.wolofName || item.nameWolof || '');
  const [description, setDescription] = useState(item.description || '');
  const [price, setPrice] = useState<number>(item.price || 0);
  const [imageUrl, setImageUrl] = useState(item.imageUrl || '');
  const [preparationTime, setPreparationTime] = useState<number>(item.preparationTime || 15);
  const [categoryId, setCategoryId] = useState(item.categoryId || categories[0]?.id || '');
  const [spiceLevel, setSpiceLevel] = useState<number>(item.spiceLevel || 0);
  const [allergens, setAllergens] = useState<string[]>(item.allergens || []);
  const [isSpecialOfTheDay, setIsSpecialOfTheDay] = useState(Boolean(item.isSpecialOfTheDay || item.isSpecial));
  const [isAvailable, setIsAvailable] = useState(item.isAvailable ?? true);

  // Translations
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'TRANSLATIONS' | 'PHOTOS'>('DETAILS');
  const [translations, setTranslations] = useState<any>(item.translations || {});
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setName(item.name || '');
    setWolofName(item.wolofName || item.nameWolof || '');
    setDescription(item.description || '');
    setPrice(item.price || 0);
    setImageUrl(item.imageUrl || '');
    setPreparationTime(item.preparationTime || 15);
    setCategoryId(item.categoryId || categories[0]?.id || '');
    setSpiceLevel(item.spiceLevel || 0);
    setAllergens(item.allergens || []);
    setIsSpecialOfTheDay(Boolean(item.isSpecialOfTheDay || item.isSpecial));
    setIsAvailable(item.isAvailable ?? true);
    setTranslations(item.translations || {});
  }, [item]);

  const handleToggleAllergen = (allergen: string) => {
    setAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const handleAutoTranslate = async () => {
    if (!name.trim()) {
      toast.error('Veuillez renseigner le nom du plat');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          wolofName,
        }),
      });

      const data = await res.json();
      if (data.translations) {
        setTranslations(data.translations);
        toast.success('✨ Traduction IA effectuée en Anglais, Espagnol et Italien !');
      }
    } catch (e) {
      toast.error('Erreur traduction automatique');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Le nom du plat est obligatoire');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<MenuItemType> = {
        name,
        wolofName,
        nameWolof: wolofName,
        description,
        price: Number(price),
        imageUrl,
        preparationTime: Number(preparationTime),
        categoryId,
        allergens,
        spiceLevel: spiceLevel as any,
        isSpecialOfTheDay,
        isSpecial: isSpecialOfTheDay,
        isAvailable,
        translations,
      };

      const res = await fetch(`/api/restaurant/menu-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la sauvegarde');

      onItemSaved(data.item || { ...item, ...payload });
      toast.success(`✅ Plat « ${name} » modifié avec succès !`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Impossible d\'enregistrer les modifications');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement « ${item.name} » ?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/restaurant/menu-items/${item.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();

      onItemDeleted?.(item.id);
      toast.success(`🗑️ Plat « ${item.name} » supprimé`);
      onClose();
    } catch (e) {
      toast.error('Erreur suppression plat');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 text-slate-900 space-y-5 my-6 max-h-[92vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Modifier le Plat : {item.name}
              </h2>
              <p className="text-xs text-slate-500">
                Mise à jour immédiate sur le menu digital en salle
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'DETAILS'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            📋 Informations & Prix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PHOTOS')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'PHOTOS'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo & Galerie</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TRANSLATIONS')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'TRANSLATIONS'
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Traductions IA</span>
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* TAB 1: DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-4">
              {/* Photo Preview Thumbnail & Name */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <img
                  src={imageUrl || '/placeholder-food.jpg'}
                  alt={name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0 bg-white"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Aperçu fiche plat
                  </span>
                  <h4 className="text-sm font-black text-slate-900 truncate">{name || 'Sans titre'}</h4>
                  <p className="text-[11px] font-mono font-bold text-orange-600">
                    {formatFCFA(price)} • {preparationTime} min
                  </p>
                </div>
              </div>

              {/* Names: French & Wolof */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nom du Plat (Français) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Ceebu Jën Pëndaa Mbaye"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Appellation en Wolof (Optionnel)</label>
                  <input
                    type="text"
                    value={wolofName}
                    onChange={(e) => setWolofName(e.target.value)}
                    placeholder="Ex: Ceebu Jën bu xonq"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description détaillée du plat</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Riz rouge cuit au bouillon de mérou blanc frais, légumes du terroir..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Price, Category & Prep Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Prix (FCFA) *</label>
                  <input
                    type="number"
                    required
                    step={100}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Catégorie</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Temps prépa (min)</label>
                  <input
                    type="number"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Piment & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Niveau Piment */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Niveau de Piment</label>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { lvl: 0, label: 'Doux' },
                      { lvl: 1, label: 'Moyen 🌶️' },
                      { lvl: 2, label: 'Fort 🌶️🌶️' },
                      { lvl: 3, label: 'Extra 🔥' },
                    ].map((p) => (
                      <button
                        key={p.lvl}
                        type="button"
                        onClick={() => setSpiceLevel(p.lvl)}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          spiceLevel === p.lvl
                            ? 'bg-rose-100 text-rose-900 border-rose-400 font-black'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles Disponibilité & Plat du Jour */}
                <div className="space-y-2">
                  <label className="font-bold text-slate-700 block">Statuts d'affichage</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAvailable(!isAvailable)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isAvailable
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <span>{isAvailable ? '✅ En Stock' : '❌ Épuisé'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsSpecialOfTheDay(!isSpecialOfTheDay)}
                      className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isSpecialOfTheDay
                          ? 'bg-amber-100 text-amber-900 border-amber-400 font-black'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isSpecialOfTheDay ? 'fill-amber-500' : ''}`} />
                      <span>{isSpecialOfTheDay ? 'Plat du Jour ⭐' : 'Standard'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 14 Allergènes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block">14 Allergènes Déclarés</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {LEGAL_14_ALLERGENS.map((all) => {
                    const checked = allergens.includes(all);
                    return (
                      <button
                        key={all}
                        type="button"
                        onClick={() => handleToggleAllergen(all)}
                        className={`p-2 rounded-xl text-left text-[11px] font-bold border transition-all flex items-center justify-between ${
                          checked
                            ? 'bg-orange-50 text-orange-900 border-orange-300'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{all}</span>
                        {checked && <Check className="w-3.5 h-3.5 text-orange-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTOS & GALERIE HD */}
          {activeTab === 'PHOTOS' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">URL directe de la Photo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono focus:border-amber-500 focus:outline-none"
                  />
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Aperçu"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Galerie HD Gastronomie Sénégalaise (Sélectionnez en 1 clic) :
                  </label>
                  <span className="text-[11px] text-amber-700 font-bold">100% Optimisé Mobile</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
                  {SENEGALESE_FOOD_PHOTO_PRESETS.map((preset, idx) => {
                    const isSelected = imageUrl === preset.url;
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setImageUrl(preset.url);
                          toast.success(`Photo « ${preset.name} » appliquée`);
                        }}
                        className={`p-2 rounded-2xl border-2 transition-all cursor-pointer space-y-1.5 ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 shadow-sm ring-1 ring-amber-400'
                            : 'bg-white border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-100">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 p-1 rounded-lg shadow-xs">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] font-black text-slate-900 block truncate">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {preset.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRADUCTIONS IA */}
          {activeTab === 'TRANSLATIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-900">Traduction IA Multilingue</span>
                  <p className="text-[11px] text-amber-700">
                    Génère instantanément les traductions en Anglais, Espagnol et Italien.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isTranslating}
                  onClick={handleAutoTranslate}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTranslating ? 'Traduction...' : 'Traduire en 1 Clic'}</span>
                </button>
              </div>

              {/* English */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>🇬🇧</span>
                  <span>English Translation</span>
                </div>
                <input
                  type="text"
                  value={translations?.EN?.name || ''}
                  onChange={(e) =>
                    setTranslations((prev: any) => ({
                      ...prev,
                      EN: { ...(prev?.EN || {}), name: e.target.value },
                    }))
                  }
                  placeholder="Dish name in English..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
                <textarea
                  rows={2}
                  value={translations?.EN?.description || ''}
                  onChange={(e) =>
                    setTranslations((prev: any) => ({
                      ...prev,
                      EN: { ...(prev?.EN || {}), description: e.target.value },
                    }))
                  }
                  placeholder="Description in English..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 resize-none"
                />
              </div>

              {/* Spanish */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>🇪🇸</span>
                  <span>Traducción al Español</span>
                </div>
                <input
                  type="text"
                  value={translations?.ES?.name || ''}
                  onChange={(e) =>
                    setTranslations((prev: any) => ({
                      ...prev,
                      ES: { ...(prev?.ES || {}), name: e.target.value },
                    }))
                  }
                  placeholder="Nombre del plato en español..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
                <textarea
                  rows={2}
                  value={translations?.ES?.description || ''}
                  onChange={(e) =>
                    setTranslations((prev: any) => ({
                      ...prev,
                      ES: { ...(prev?.ES || {}), description: e.target.value },
                    }))
                  }
                  placeholder="Descripción en español..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 resize-none"
                />
              </div>

              {/* Italian */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>🇮🇹</span>
                  <span>Traduzione in Italiano</span>
                </div>
                <input
                  type="text"
                  value={translations?.IT?.name || ''}
                  onChange={(e) =>
                    setTranslations((prev: any) => ({
                      ...prev,
                      IT: { ...(prev?.IT || {}), name: e.target.value },
                    }))
                  }
                  placeholder="Nome del piatto in italiano..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                />
                <textarea
                  rows={2}
                  value={translations?.IT?.description || ''}
                  onChange={(e) =>
                    setTranslations((prev: any) => ({
                      ...prev,
                      IT: { ...(prev?.IT || {}), description: e.target.value },
                    }))
                  }
                  placeholder="Descrizione in italiano..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 resize-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              className="py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? 'Suppression...' : 'Supprimer'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="py-2.5 px-6 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};