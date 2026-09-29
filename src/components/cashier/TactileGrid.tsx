'use client';

import React, { useState } from 'react';
import { formatFCFA } from '@/lib/utils';
import { Search } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  trackStock: boolean;
  currentStock: number;
  lowStockAlert: number;
  categoryId: string | null;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface TactileGridProps {
  categories: Category[];
  onAddItem: (item: MenuItem) => void;
}

export function TactileGrid({ categories, onAddItem }: TactileGridProps) {
  const [activeCategory, setActiveCategory] = useState<string | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all items or filter by category
  let itemsToDisplay = activeCategory === 'ALL' 
    ? categories.flatMap(c => c.items)
    : categories.find(c => c.id === activeCategory)?.items || [];

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    itemsToDisplay = itemsToDisplay.filter(i => i.name.toLowerCase().includes(q));
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Barre de navigation (Catégories + Recherche) */}
      <div className="p-4 bg-white border-b border-slate-200 space-y-4 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un plat, une boisson..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-100 border-none rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all placeholder:font-normal"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-black transition-all ${
              activeCategory === 'ALL' ? 'bg-amber-400 text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            TOUT
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-black transition-all ${
                activeCategory === cat.id ? 'bg-amber-400 text-slate-900 shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grille des produits */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-100/50">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {itemsToDisplay.map(item => {
            const isOutOfStock = item.trackStock && item.currentStock <= 0;
            const isLowStock = item.trackStock && item.currentStock <= item.lowStockAlert && item.currentStock > 0;
            
            return (
              <button
                key={item.id}
                disabled={isOutOfStock}
                onClick={() => onAddItem(item)}
                className={`relative aspect-square rounded-2xl flex flex-col overflow-hidden transition-all text-left shadow-xs border-2 group ${
                  isOutOfStock ? 'opacity-40 grayscale border-slate-200 cursor-not-allowed bg-slate-100' : 'bg-white border-transparent hover:border-amber-400 hover:shadow-md hover:-translate-y-1 active:scale-95'
                }`}
              >
                {/* Photo de l'article (placeholder visuel stylé si pas d'image) */}
                <div className="flex-1 w-full bg-slate-200 relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 font-bold text-[10px] uppercase text-center p-2">
                      {item.name.substring(0, 20)}
                    </div>
                  )}
                  
                  {/* Badge de Stock en Temps Réel */}
                  {item.trackStock && (
                    <div className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-black border shadow-xs flex items-center gap-1 backdrop-blur-md ${
                      isOutOfStock ? 'bg-rose-100/90 text-rose-800 border-rose-300' :
                      isLowStock ? 'bg-amber-100/90 text-amber-900 border-amber-300' :
                      'bg-emerald-100/90 text-emerald-900 border-emerald-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-rose-600' : isLowStock ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      {isOutOfStock ? 'ÉPUISÉ' : item.currentStock}
                    </div>
                  )}
                </div>

                {/* Info de l'article */}
                <div className="p-2.5 bg-white border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-700 leading-tight line-clamp-2 min-h-[30px]">
                    {item.name}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[11px] font-black font-mono text-slate-900">{formatFCFA(Number(item.price))}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {itemsToDisplay.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
            <p className="font-bold text-center">Aucun produit trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
