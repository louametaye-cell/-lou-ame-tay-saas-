'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Pencil,
  Copy,
  Layers,
  Flame,
  Clock,
  Plus
} from 'lucide-react';
import { MenuItemType, CategoryType } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { EditMenuItemModal } from './EditMenuItemModal';
import { toast } from 'sonner';

interface LiveStockManagerProps {
  categories: CategoryType[];
  onItemUpdated?: (updatedItem: MenuItemType) => void;
  onOpenAddModal?: () => void;
}

export const LiveStockManager: React.FC<LiveStockManagerProps> = ({
  categories,
  onItemUpdated,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'SPECIALS'>('ALL');

  const [itemsState, setItemsState] = useState<Record<string, MenuItemType>>(() => {
    const initial: Record<string, MenuItemType> = {};
    categories.forEach((cat) => {
      (cat.items || []).forEach((item) => {
        initial[item.id] = { ...item };
      });
    });
    return initial;
  });

  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItemType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const allItems = useMemo(() => {
    return Object.values(itemsState);
  }, [itemsState]);

  // Filtered dishes
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.wolofName && item.wolofName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'ALL' || item.categoryId === selectedCategory;

      let matchesStatus = true;
      if (statusFilter === 'IN_STOCK') {
        matchesStatus = item.isAvailable;
      } else if (statusFilter === 'OUT_OF_STOCK') {
        matchesStatus = !item.isAvailable;
      } else if (statusFilter === 'SPECIALS') {
        matchesStatus = Boolean(item.isSpecialOfTheDay || item.isSpecial);
      }

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [allItems, searchQuery, selectedCategory, statusFilter]);

  const totalCount = allItems.length;
  const inStockCount = allItems.filter((i) => i.isAvailable).length;
  const outOfStockCount = allItems.filter((i) => !i.isAvailable).length;
  const specialCount = allItems.filter((i) => i.isSpecialOfTheDay || i.isSpecial).length;

  const handleToggleAvailability = async (item: MenuItemType) => {
    const newStatus = !item.isAvailable;
    setIsUpdatingId(item.id);

    const updated = { ...item, isAvailable: newStatus };
    setItemsState((prev) => ({ ...prev, [item.id]: updated }));
    onItemUpdated?.(updated);

    try {
      const res = await fetch(`/api/restaurant/menu-items/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: newStatus }),
      });

      if (!res.ok) throw new Error();

      if (newStatus) {
        toast.success(`✅ « ${item.name} » remis en stock`);
      } else {
        toast.warning(`⚠️ « ${item.name} » marqué comme ÉPUISÉ`);
      }
    } catch (e) {
      toast.error('Erreur lors de la mise à jour');
      setItemsState((prev) => ({ ...prev, [item.id]: item }));
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleToggleDailySpecial = async (item: MenuItemType) => {
    const newSpecial = !(item.isSpecialOfTheDay || item.isSpecial);
    setIsUpdatingId(item.id);

    const updated = {
      ...item,
      isSpecialOfTheDay: newSpecial,
      isSpecial: newSpecial,
    };
    setItemsState((prev) => ({ ...prev, [item.id]: updated }));
    onItemUpdated?.(updated);

    try {
      const res = await fetch(`/api/restaurant/menu-items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSpecialOfTheDay: newSpecial }),
      });

      if (newSpecial) {
        toast.success(`🌟 « ${item.name} » défini comme Plat du Jour ⭐`);
      } else {
        toast.info(`« ${item.name} » retiré des Plats du Jour`);
      }
    } catch (e) {
      toast.error('Erreur lors de la mise à jour');
      setItemsState((prev) => ({ ...prev, [item.id]: item }));
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleOpenEdit = (item: MenuItemType) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleDuplicateDish = (item: MenuItemType) => {
    const newId = `dish_${Date.now()}`;
    const duplicated: MenuItemType = {
      ...item,
      id: newId,
      name: `${item.name} (Copie)`,
      nameWolof: item.nameWolof ? `${item.nameWolof} (Copie)` : '',
      wolofName: item.wolofName ? `${item.wolofName} (Copie)` : '',
    };
    setItemsState((prev) => ({ ...prev, [newId]: duplicated }));
    onItemUpdated?.(duplicated);
    toast.success(`📑 Plat « ${item.name} » dupliqué avec succès !`);
  };

  const handleItemSaved = (updated: MenuItemType) => {
    setItemsState((prev) => ({ ...prev, [updated.id]: updated }));
    onItemUpdated?.(updated);
  };

  const handleItemDeleted = (deletedId: string) => {
    setItemsState((prev) => {
      const copy = { ...prev };
      delete copy[deletedId];
      return copy;
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-3xl space-y-1 shadow-xs text-left transition-all border ${
            statusFilter === 'ALL'
              ? 'border-slate-900 bg-slate-900 text-white ring-2 ring-slate-800'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className={`text-xs font-bold block ${statusFilter === 'ALL' ? 'text-slate-300' : 'text-slate-500'}`}>
            Total Plats
          </span>
          <span className="text-2xl font-black font-mono">{totalCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('IN_STOCK')}
          className={`p-4 rounded-3xl space-y-1 shadow-xs text-left transition-all border ${
            statusFilter === 'IN_STOCK'
              ? 'border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-400'
              : 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-50/50'
          }`}
        >
          <span className="text-xs font-bold flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${statusFilter === 'IN_STOCK' ? 'bg-white' : 'bg-emerald-500'}`} />
            <span>En Stock</span>
          </span>
          <span className="text-2xl font-black font-mono">{inStockCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('OUT_OF_STOCK')}
          className={`p-4 rounded-3xl space-y-1 shadow-xs text-left transition-all border ${
            statusFilter === 'OUT_OF_STOCK'
              ? 'border-rose-600 bg-rose-600 text-white ring-2 ring-rose-400'
              : outOfStockCount > 0
              ? 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100/60'
              : 'bg-white border-slate-200 text-slate-500'
          }`}
        >
          <span className="text-xs font-bold flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${statusFilter === 'OUT_OF_STOCK' ? 'bg-white' : 'bg-rose-500'}`} />
            <span>Épuisés (Ruptures)</span>
          </span>
          <span className="text-2xl font-black font-mono">{outOfStockCount}</span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('SPECIALS')}
          className={`p-4 rounded-3xl space-y-1 shadow-xs text-left transition-all border ${
            statusFilter === 'SPECIALS'
              ? 'border-amber-600 bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400'
              : 'bg-white border-amber-300 text-amber-800 hover:bg-amber-50/50'
          }`}
        >
          <span className="text-xs font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plats du Jour ⭐</span>
          </span>
          <span className="text-2xl font-black font-mono">{specialCount}</span>
        </button>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="space-y-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        {/* Search row & Action */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un plat par nom ou ingrédient..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          {onOpenAddModal && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 rounded-2xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-all shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Ajouter un Plat</span>
            </button>
          )}
        </div>

        {/* 6 Standard Categories Selector Bar with Live Stock Counters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-amber-400 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <span>🍽️ Tous les Plats</span>
            <span className="text-[10px] opacity-75 font-mono">({allItems.length})</span>
          </button>

          {categories.map((cat) => {
            const catItems = allItems.filter((i) => i.categoryId === cat.id);
            const catInStock = catItems.filter((i) => i.isAvailable).length;
            const catOutOfStock = catItems.length - catInStock;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 bg-slate-50 border-slate-200'
                }`}
              >
                <span>{cat.icon} {cat.name}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-200 text-slate-700'
                }`}>
                  {catItems.length}
                </span>
                {catOutOfStock > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title={`${catOutOfStock} en rupture`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dish Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
          <span className="text-3xl">🔍</span>
          <h3 className="text-sm font-bold text-slate-800">Aucun plat ne correspond à vos critères</h3>
          <p className="text-xs text-slate-500">Modifiez votre recherche ou sélectionnez une autre catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((dish) => {
            const isSpecial = Boolean(dish.isSpecialOfTheDay || dish.isSpecial);
            const isAvailable = dish.isAvailable;
            const isUpdating = isUpdatingId === dish.id;

            return (
              <div
                key={dish.id}
                className={`rounded-3xl border-2 transition-all p-4 flex flex-col justify-between space-y-3 shadow-xs group ${
                  !isAvailable
                    ? 'bg-slate-50/80 border-slate-200 opacity-75'
                    : isSpecial
                    ? 'bg-amber-50/30 border-amber-400 ring-1 ring-amber-300'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header: Photo, Names, Price */}
                <div className="flex items-start gap-3">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    <img
                      src={dish.imageUrl || '/placeholder-food.jpg'}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-[10px] font-black text-white px-1 py-0.5 bg-rose-600 rounded">
                          Épuisé
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-amber-700 transition-colors">
                        {dish.name}
                      </h4>
                    </div>

                    {dish.wolofName && (
                      <span className="text-[11px] text-amber-700 font-bold block truncate">
                        « {dish.wolofName} »
                      </span>
                    )}

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="text-xs font-black text-slate-900 font-mono">
                        {formatFCFA(dish.price)}
                      </span>
                      {dish.preparationTime && (
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{dish.preparationTime}m</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {dish.description}
                </p>

                {/* Footer Controls: In Stock Toggle, Special Star, Duplicate, Edit */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                  {/* Stock Toggle Button */}
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleToggleAvailability(dish)}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
                    }`}
                    title="Cliquer pour basculer stock / rupture"
                  >
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span>{isAvailable ? 'En Stock' : 'Épuisé'}</span>
                  </button>

                  {/* Special Toggle */}
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleToggleDailySpecial(dish)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                      isSpecial
                        ? 'bg-amber-100 text-amber-900 border border-amber-400 font-black'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                    title="Mettre en avant comme Plat du Jour"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isSpecial ? 'fill-amber-500 text-amber-600' : ''}`} />
                    <span>{isSpecial ? 'Plat du Jour ⭐' : 'Standard'}</span>
                  </button>

                  {/* Duplicate & Edit Actions */}
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleDuplicateDish(dish)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-all"
                      title="Dupliquer ce plat"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(dish)}
                      className="py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs flex items-center gap-1 shadow-2xs transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      <EditMenuItemModal
        item={editingItem}
        categories={categories}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onItemSaved={handleItemSaved}
        onItemDeleted={handleItemDeleted}
        onItemDuplicated={(dup) => {
          setItemsState((prev) => ({ ...prev, [dup.id]: dup }));
          onItemUpdated?.(dup);
        }}
      />
    </div>
  );
};