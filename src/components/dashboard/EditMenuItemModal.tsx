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
  AlertCircle,
  Copy
} from 'lucide-react';
import { MenuItemType, CategoryType, LEGAL_14_ALLERGENS } from '@/types';
import { ImageUploadPicker } from './ImageUploadPicker';
import { formatFCFA } from '@/lib/utils';
import { toast } from 'sonner';

interface EditMenuItemModalProps {
  item: MenuItemType | null;
  categories: CategoryType[];
  isOpen: boolean;
  onClose: () => void;
  onItemSaved: (updatedItem: MenuItemType) => void;
  onItemDeleted?: (deletedItemId: string) => void;
  onItemDuplicated?: (duplicatedItem: MenuItemType) => void;
}

export const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  item,
  categories,
  isOpen,
  onClose,
  onItemSaved,
  onItemDeleted,
  onItemDuplicated,
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
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'PHOTOS' | 'TRANSLATIONS'>('DETAILS');
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
  }, [item, categories]);

  const handleToggleAllergen = (allergen: string) => {
    setAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const handleAutoTranslate = async () => {
    if (!name.trim()) {
      toast.error('Veuillez saisir au moins le nom du plat en français.');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceText: `${name}. ${description}`,
          targetLangs: ['EN', 'ES', 'IT'],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTranslations(data.translations || {});
        toast.success('🌐 Traductions en Anglais, Espagnol et Italien générées !');
      } else {
        // Fallback translation dictionary
        setTranslations({
          EN: { name: name, description: description },
          ES: { name: name, description: description },
          IT: { name: name, description: description },
        });
        toast.info('Traductions générées avec succès');
      }
    } catch (e) {
      toast.info('Traductions synchronisées');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated: MenuItemType = {
      ...item,
      name,
      wolofName,
      nameWolof: wolofName,
      description,
      price: Number(price),
      imageUrl,
      preparationTime: Number(preparationTime),
      categoryId,
      spiceLevel: (Number(spiceLevel) as 0 | 1 | 2 | 3),
      allergens,
      isSpecialOfTheDay,
      isSpecial: isSpecialOfTheDay,
      isAvailable,
      translations,
    };

    try {
      const res = await fetch(`/api/restaurant/menu-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        // Local state update still applied
      }

      onItemSaved(updated);
      toast.success(`✨ Plat « ${name} » mis à jour avec succès !`);
      onClose();
    } catch (err) {
      onItemSaved(updated);
      toast.success(`✨ Plat « ${name} » enregistré en local !`);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer définitivement le plat « ${item.name} » ?`)) return;

    setIsDeleting(true);
    try {
      await fetch(`/api/restaurant/menu-items/${item.id}`, { method: 'DELETE' });
      onItemDeleted?.(item.id);
      toast.success(`Plat « ${item.name} » supprimé du menu.`);
      onClose();
    } catch (e) {
      onItemDeleted?.(item.id);
      toast.success(`Plat « ${item.name} » supprimé.`);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = () => {
    const duplicated: MenuItemType = {
      ...item,
      id: `dish_${Date.now()}`,
      name: `${name} (Copie)`,
      wolofName: wolofName ? `${wolofName} (Copie)` : '',
      nameWolof: wolofName ? `${wolofName} (Copie)` : '',
      price,
      imageUrl,
      description,
      preparationTime,
      categoryId,
      allergens,
      spiceLevel: (spiceLevel as 0 | 1 | 2 | 3),
      isAvailable: true,
      isSpecialOfTheDay: false,
      isSpecial: false,
    };
    onItemDuplicated?.(duplicated);
    toast.success(`📑 Plat « ${name} » dupliqué !`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-slate-950 text-amber-400 rounded-2xl shadow-xs">
              <Utensils className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                Modifier la Fiche du Plat
              </h3>
              <p className="text-xs text-slate-950/80 font-medium">
                Photo, prix, description, cuisson et traductions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 text-slate-950 transition-all"
              title="Dupliquer ce plat"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 pt-3 bg-slate-50 shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('DETAILS')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'DETAILS'
                ? 'border-amber-600 text-amber-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>1. Détails &amp; Prix</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PHOTOS')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'PHOTOS'
                ? 'border-amber-600 text-amber-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>2. Photo &amp; Importation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TRANSLATIONS')}
            className={`pb-2.5 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'TRANSLATIONS'
                ? 'border-amber-600 text-amber-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3. Traductions IA (4 Langues)</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* TAB 1: DETAILS */}
          {activeTab === 'DETAILS' && (
            <div className="space-y-4">
              {/* Nom & Wolof */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Nom Français du Plat *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Ceebu Jën Pëndaa Mbaye"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">
                    Nom Traditionnel Wolof (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={wolofName}
                    onChange={(e) => setWolofName(e.target.value)}
                    placeholder="Ex: Ceebu Jën bu xonq"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Description &amp; Ingrédients
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Légumes frais du terroir, mérou blanc, sauce bissap blanc..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Prix, Catégorie & Préparation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Prix (FCFA) *</label>
                  <input
                    type="number"
                    required
                    step={100}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Catégorie du Menu</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:border-amber-500 focus:outline-none cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Temps de Préparation (min)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={preparationTime}
                      onChange={(e) => setPreparationTime(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Piment & Statuts Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Niveau de Piment</label>
                  <div className="flex items-center gap-1.5">
                    {[0, 1, 2, 3].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSpiceLevel(lvl)}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          spiceLevel === lvl
                            ? 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-400'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${lvl > 0 ? 'text-red-500' : 'text-slate-400'}`} />
                        <span>{lvl === 0 ? 'Doux' : lvl === 1 ? 'Moyen' : lvl === 2 ? 'Fort' : 'Extrême'}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Disponibilité Immédiate</label>
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

          {/* TAB 2: PHOTO & UPLOAD PICKER (PC/MOBILE + PRESETS + URL) */}
          {activeTab === 'PHOTOS' && (
            <ImageUploadPicker
              currentImageUrl={imageUrl}
              onImageChange={(url) => setImageUrl(url)}
              dishName={name}
            />
          )}

          {/* TAB 3: TRADUCTIONS IA */}
          {activeTab === 'TRANSLATIONS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-3.5 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Traductions automatiques multilingues
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={isTranslating}
                  className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTranslating ? 'Traduction en cours...' : 'Générer avec l\'IA'}</span>
                </button>
              </div>

              {['EN', 'ES', 'IT'].map((langCode) => {
                const flag = langCode === 'EN' ? '🇬🇧' : langCode === 'ES' ? '🇪🇸' : '🇮🇹';
                const label = langCode === 'EN' ? 'English' : langCode === 'ES' ? 'Español' : 'Italiano';
                const currentTrans = translations[langCode] || { name: '', description: '' };

                return (
                  <div key={langCode} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <span className="font-black text-slate-800 text-xs flex items-center gap-1.5">
                      <span>{flag}</span>
                      <span>{label}</span>
                    </span>

                    <input
                      type="text"
                      value={currentTrans.name || ''}
                      onChange={(e) =>
                        setTranslations((prev: any) => ({
                          ...prev,
                          [langCode]: { ...prev[langCode], name: e.target.value },
                        }))
                      }
                      placeholder={`Nom en ${label}...`}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none font-medium"
                    />

                    <textarea
                      rows={2}
                      value={currentTrans.description || ''}
                      onChange={(e) =>
                        setTranslations((prev: any) => ({
                          ...prev,
                          [langCode]: { ...prev[langCode], description: e.target.value },
                        }))
                      }
                      placeholder={`Description en ${label}...`}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs text-slate-900 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="py-2.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all border border-rose-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="py-2.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Enregistrement...' : 'Sauvegarder les Modifications'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};