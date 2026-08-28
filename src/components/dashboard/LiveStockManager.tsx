'use client';

import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  AlertTriangle,
  Pencil
} from 'lucide-react';
import { MenuItemType, CategoryType } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { EditMenuItemModal } from './EditMenuItemModal';
import { toast } from 'sonner';

interface LiveStockManagerProps {
  categories: CategoryType[];
  onItemUpdated?: (updatedItem: MenuItemType) => void;
}

export const LiveStockManager: React.FC<LiveStockManagerProps> = ({
  categories,
  onItemUpdated,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
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

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' || item.categoryId === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [allItems, searchQuery, selectedCategory]);

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
      const res = await fetch(`/api/restaurant/menu-items/${item.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSpecialOfTheDay: newSpecial }),
      });

      if (!res.ok) throw new Error();

      if (newSpecial) {
        toast.success(`⭐ « ${item.name} » défini comme PLAT DU JOUR !`);
      } else {
        toast.info(`Retiré des plats du jour`);
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
        <div className="bg-white border border-slate-200 p-4 rounded-3xl space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-bold block">Total Plats</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{totalCount}</span>
        </div>

        <div className="bg-white border border-emerald-300 p-4 rounded-3xl space-y-1 shadow-xs">
          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>En Stock</span>
          </span>
          <span className="text-2xl font-black text-emerald-700 font-mono">{inStockCount}</span>
        </div>

        <div className={`border p-4 rounded-3xl space-y-1 shadow-xs transition-all ${
          outOfStockCount > 0 ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-white border-slate-200 text-slate-500'
        }`}>
          <span className="text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Épuisés (Rupture)</span>
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono">{outOfStockCount}</span>
        </div>

        <div className="bg-white border border-amber-300 p-4 rounded-3xl space-y-1 shadow-xs">
          <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Plats du Jour ⭐</span>
          </span>
          <span className="text-2xl font-black text-amber-700 font-mono">{specialCount}</span>
        </div>
      </div>

      {/* 2. Filter & Search Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un plat par nom ou ingrédient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            Tous ({allItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const isSpecial = item.isSpecialOfTheDay || item.isSpecial;
          const isAvailable = item.isAvailable;

          return (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-3 shadow-xs ${
                !isAvailable
                  ? 'bg-slate-50 border-rose-200 opacity-75'
                  : isSpecial
                  ? 'bg-amber-50/50 border-amber-400 ring-1 ring-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src={item.imageUrl || '/placeholder-food.jpg'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {isSpecial && (
                    <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 p-0.5 rounded-md shadow-xs">
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-sm font-black text-slate-900 truncate leading-tight">
                    {item.name}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.description}
                  </p>
                  <div className="text-xs font-black text-orange-600 font-mono">
                    {formatFCFA(item.price)}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Edit, Daily Special, Availability */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="min-h-[38px] px-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1.5 transition-all shadow-2xs"
                  title="Modifier le plat (photos, prix, description)"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-600" />
                  <span>Modifier</span>
                </button>

                {/* Daily Special ⭐ */}
                <button
                  type="button"
                  disabled={isUpdatingId === item.id}
                  onClick={() => handleToggleDailySpecial(item)}
                  className={`min-h-[38px] px-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all border ${
                    isSpecial
                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-amber-700'
                  }`}
                  title="Définir comme plat du jour"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isSpecial ? 'fill-amber-500 text-amber-600' : ''}`} />
                  <span className="text-[11px]">
                    {isSpecial ? 'Plat du Jour ⭐' : 'Plat du Jour'}
                  </span>
                </button>

                {/* Stock Toggle */}
                <button
                  type="button"
                  disabled={isUpdatingId === item.id}
                  onClick={() => handleToggleAvailability(item)}
                  className={`min-h-[38px] px-3 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all border active:scale-95 shadow-2xs ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                  }`}
                >
                  {isAvailable ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>En Stock</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Épuisé</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dish Modal */}
      <EditMenuItemModal
        item={editingItem}
        categories={categories}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onItemSaved={handleItemSaved}
        onItemDeleted={handleItemDeleted}
      />
    </div>
  );
};