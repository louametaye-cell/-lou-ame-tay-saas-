'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Utensils, 
  Plus, 
  ToggleLeft, 
  ToggleRight, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  Flame,
  ShieldCheck,
  Store
} from 'lucide-react';
import { SAMPLE_RESTAURANT } from '@/lib/sample-data';
import { RestaurantType, MenuItemType, LEGAL_14_ALLERGENS } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { LiveStockManager } from '@/components/dashboard/LiveStockManager';
import { ComboBuilder } from '@/components/dashboard/ComboBuilder';
import { toast } from 'sonner';

export default function DashboardMenuManagementPage() {
  const [restaurant, setRestaurant] = useState<RestaurantType>(SAMPLE_RESTAURANT);
  const [viewMode, setViewMode] = useState<'LIVE_STOCK' | 'CATALOG' | 'COMBOS'>('LIVE_STOCK');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states (Multilingual FR / EN / ES / IT)
  const [name, setName] = useState('');
  const [wolofName, setWolofName] = useState('');
  const [desc, setDesc] = useState('');
  
  // Multilingual translations state
  const [activeLangTab, setActiveLangTab] = useState<'FR' | 'EN' | 'ES' | 'IT'>('FR');
  const [translations, setTranslations] = useState<{
    FR: { name: string; description: string };
    EN: { name: string; description: string };
    ES: { name: string; description: string };
    IT: { name: string; description: string };
  }>({
    FR: { name: '', description: '' },
    EN: { name: '', description: '' },
    ES: { name: '', description: '' },
    IT: { name: '', description: '' },
  });
  const [isTranslating, setIsTranslating] = useState(false);

  const [price, setPrice] = useState<number>(3500);
  const [categoryId, setCategoryId] = useState<string>(SAMPLE_RESTAURANT.categories[0].id);
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80');
  const [prepTime, setPrepTime] = useState<number>(20);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [isSpecial, setIsSpecial] = useState<boolean>(false);

  // Load from API
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.restaurant) {
          setRestaurant(data.restaurant);
        }
      })
      .catch(() => {});
  }, []);

  // Toggle item availability
  const handleToggle = async (item: MenuItemType) => {
    const updated = !item.isAvailable;
    const cloned = JSON.parse(JSON.stringify(restaurant)) as RestaurantType;
    cloned.categories.forEach((c) => {
      const found = (c.items || []).find((i) => i.id === item.id);
      if (found) found.isAvailable = updated;
    });
    setRestaurant(cloned);

    try {
      await fetch(`/api/restaurant/menu-items/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: updated }),
      });
      toast.success(updated ? `"${item.name}" est de nouveau EN STOCK` : `"${item.name}" est marqué RUPTURE DE STOCK`);
    } catch (e) {
      toast.error('Erreur de mise à jour');
    }
  };

  // Toggle Daily Special
  const handleToggleSpecial = async (item: MenuItemType) => {
    const updated = !item.isSpecialOfTheDay;
    const cloned = JSON.parse(JSON.stringify(restaurant)) as RestaurantType;
    cloned.categories.forEach((c) => {
      const found = (c.items || []).find((i) => i.id === item.id);
      if (found) {
        found.isSpecialOfTheDay = updated;
        found.isSpecial = updated;
      }
    });
    setRestaurant(cloned);

    try {
      await fetch(`/api/restaurant/menu-items/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSpecialOfTheDay: updated }),
      });
      toast.success(updated ? `⭐ "${item.name}" défini comme PLAT DU JOUR !` : `"${item.name}" retiré des plats du jour.`);
    } catch (e) {
      toast.error('Erreur de mise à jour');
    }
  };

  // Auto-translate using AI / dictionary engine
  const handleAutoTranslate = async () => {
    if (!name.trim()) {
      toast.error('Veuillez renseigner le nom en Français d\'abord');
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: desc,
          wolofName,
        }),
      });

      const data = await res.json();
      if (data.translations) {
        setTranslations(data.translations);
        toast.success('✨ Traduction IA instantanée effectuée (EN, ES, IT) !');
      } else {
        throw new Error();
      }
    } catch (e) {
      toast.error('Erreur lors de la traduction IA');
    } finally {
      setIsTranslating(false);
    }
  };

  // Create dish
  const handleCreateDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newDish: MenuItemType = {
      id: `dish_${Date.now()}`,
      name,
      description: desc,
      price,
      imageUrl,
      isAvailable: true,
      preparationTime: prepTime,
      allergens,
      categoryId,
      isSpecialOfTheDay: isSpecial,
      isSpecial: isSpecial,
      translations: {
        FR: { name, description: desc },
        EN: translations.EN.name ? translations.EN : undefined,
        ES: translations.ES.name ? translations.ES : undefined,
        IT: translations.IT.name ? translations.IT : undefined,
      } as any,
    };

    const cloned = JSON.parse(JSON.stringify(restaurant)) as RestaurantType;
    const cat = cloned.categories.find((c) => c.id === categoryId);
    if (cat) {
      if (!cat.items) cat.items = [];
      cat.items.unshift(newDish);
    }
    setRestaurant(cloned);
    setIsAddModalOpen(false);
    toast.success(`✨ Plat "${name}" ajouté avec succès au menu !`);

    // Reset form
    setName('');
    setWolofName('');
    setDesc('');
    setTranslations({
      FR: { name: '', description: '' },
      EN: { name: '', description: '' },
      ES: { name: '', description: '' },
      IT: { name: '', description: '' },
    });
  };

  // Flattened items for table search
  const allItems = restaurant.categories.flatMap((c) =>
    (c.items || []).map((i) => ({ ...i, catName: c.name, catId: c.id }))
  );

  const filteredItems = allItems.filter((i) => {
    const matchesCat = selectedCategory === 'ALL' || i.catId === selectedCategory;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.wolofName && i.wolofName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-amber-500 selection:text-white pb-20">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-600" />
                <span>Gestion du Menu &amp; Ruptures</span>
              </h1>
              <p className="text-xs text-slate-500">
                {restaurant.name} • {allItems.length} plats enregistrés
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs sm:text-sm font-black px-4 py-2.5 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Plat</span>
          </button>
        </div>
      </header>

      {/* Main Container with View Mode Tabs */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6">
        {/* View Mode Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('LIVE_STOCK')}
              className={`min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                viewMode === 'LIVE_STOCK'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>⚡ Ruptures en Direct &amp; Plat du Jour</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('CATALOG')}
              className={`min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                viewMode === 'CATALOG'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>📑 Catalogue &amp; Fiches Détaillées</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('COMBOS')}
              className={`min-h-[40px] px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 ${
                viewMode === 'COMBOS'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🍱</span>
              <span>Formules Midi / Soir</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-mono font-medium">
            {allItems.length} plats • {allItems.filter((i) => i.isAvailable).length} en stock
          </div>
        </div>

        {/* View 0: Combo Builder */}
        {viewMode === 'COMBOS' && (
          <ComboBuilder categories={restaurant.categories} />
        )}

        {/* View 1: Live Stock Manager (Toggle 1-Clic) */}
        {viewMode === 'LIVE_STOCK' && (
          <LiveStockManager
            categories={restaurant.categories}
            onItemUpdated={(updated) => {
              const clone = JSON.parse(JSON.stringify(restaurant)) as RestaurantType;
              clone.categories.forEach((c) => {
                (c.items || []).forEach((item) => {
                  if (item.id === updated.id) {
                    item.isAvailable = updated.isAvailable;
                    item.isSpecialOfTheDay = updated.isSpecialOfTheDay;
                    item.isSpecial = updated.isSpecial;
                  }
                });
              });
              setRestaurant(clone);
            }}
          />
        )}

        {/* View 2: Detailed Catalog Grid */}
        {viewMode === 'CATALOG' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un plat (ex: Ceebu, Dibi)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-amber-500"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === 'ALL'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tous ({allItems.length})
                </button>
                {restaurant.categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === c.id
                        ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {c.name} ({c.items?.length || 0})
                  </button>
                ))}
              </div>
            </div>

            {/* Dishes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`border rounded-3xl p-4 transition-all shadow-xs ${
                    item.isAvailable
                      ? 'bg-white border-slate-200 hover:border-slate-300'
                      : 'bg-slate-50 border-rose-200 opacity-75'
                  }`}
                >
                  <div className="flex gap-4">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {item.name}
                        </h3>
                        <span className="text-xs font-black text-orange-600 shrink-0 font-mono">
                          {formatFCFA(item.price)}
                        </span>
                      </div>

                      {item.wolofName && (
                        <span className="text-[11px] text-amber-700 block font-medium">
                          « {item.wolofName} »
                        </span>
                      )}

                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 justify-between">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-600" />
                          <span>{item.preparationTime} min</span>
                        </span>

                        {/* Stock Switch */}
                        <button
                          onClick={() => handleToggle(item)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>EN STOCK</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>RUPTURE</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-slate-900">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-600" />
              <span>Ajouter un Plat au Menu</span>
            </h2>

            <form onSubmit={handleCreateDish} className="space-y-4">
              {/* Language Tabs & Auto-Translate Action */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    {[
                      { code: 'FR', label: 'Français', flag: '🇫🇷' },
                      { code: 'EN', label: 'English', flag: '🇬🇧' },
                      { code: 'ES', label: 'Español', flag: '🇪🇸' },
                      { code: 'IT', label: 'Italiano', flag: '🇮🇹' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => setActiveLangTab(l.code as any)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          activeLangTab === l.code
                            ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{l.flag}</span>
                        <span className="hidden sm:inline">{l.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={isTranslating}
                    className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isTranslating ? 'Traduction...' : '🌐 Traduction IA (Google)'}</span>
                  </button>
                </div>

                {/* Multilingual Inputs based on active tab */}
                {activeLangTab === 'FR' ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nom du plat (🇫🇷 Français)
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setTranslations((prev) => ({
                            ...prev,
                            FR: { ...prev.FR, name: e.target.value },
                          }));
                        }}
                        placeholder="Ex: Thiéboudienne Rouge Penda Mbaye..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Description & Ingrédients (🇫🇷 Français)
                      </label>
                      <textarea
                        rows={2}
                        value={desc}
                        onChange={(e) => {
                          setDesc(e.target.value);
                          setTranslations((prev) => ({
                            ...prev,
                            FR: { ...prev.FR, description: e.target.value },
                          }));
                        }}
                        placeholder="Légumes frais du terroir, mérou blanc, riz rouge..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Nom du plat ({activeLangTab === 'EN' ? '🇬🇧 English' : activeLangTab === 'ES' ? '🇪🇸 Español' : '🇮🇹 Italiano'})
                      </label>
                      <input
                        type="text"
                        value={translations[activeLangTab]?.name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTranslations((prev) => ({
                            ...prev,
                            [activeLangTab]: { ...prev[activeLangTab], name: val },
                          }));
                        }}
                        placeholder={`Traduction du nom en ${activeLangTab}...`}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Description ({activeLangTab === 'EN' ? '🇬🇧 English' : activeLangTab === 'ES' ? '🇪🇸 Español' : '🇮🇹 Italiano'})
                      </label>
                      <textarea
                        rows={2}
                        value={translations[activeLangTab]?.description || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTranslations((prev) => ({
                            ...prev,
                            [activeLangTab]: { ...prev[activeLangTab], description: val },
                          }));
                        }}
                        placeholder={`Traduction de la description en ${activeLangTab}...`}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nom en Wolof (Optionnel)</label>
                  <input
                    type="text"
                    value={wolofName}
                    onChange={(e) => setWolofName(e.target.value)}
                    placeholder="Ex: Ceebu Jën..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catégorie</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                >
                  {restaurant.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-800 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-xs"
                >
                  Enregistrer le Plat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}