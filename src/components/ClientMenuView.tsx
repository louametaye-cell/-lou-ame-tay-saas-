'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CategoryNav } from '@/components/CategoryNav';
import { MenuCard } from '@/components/MenuCard';
import { DishModal } from '@/components/DishModal';
import { FloatingCartBar } from '@/components/FloatingCartBar';
import { CartDrawer } from '@/components/CartDrawer';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { CallWaiterModal } from '@/components/CallWaiterModal';
import { RestaurantClosedView } from '@/components/RestaurantClosedView';
import { RestaurantType, MenuItemType, OrderType } from '@/types';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';

interface ClientMenuViewProps {
  initialRestaurant: RestaurantType;
  tableNumber: number;
}

export const ClientMenuView: React.FC<ClientMenuViewProps> = ({
  initialRestaurant,
  tableNumber,
}) => {
  const [restaurant, setRestaurant] = useState<RestaurantType>(initialRestaurant);
  const [currentLang, setCurrentLang] = useState<'FR' | 'EN' | 'ES' | 'IT'>('FR');
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    initialRestaurant.categories[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle language change dynamically
  const handleLanguageChange = async (lang: 'FR' | 'EN' | 'ES' | 'IT') => {
    setCurrentLang(lang);
    try {
      const res = await fetch(`/api/menu?subdomain=${restaurant.subdomain}&lang=${lang}`);
      if (res.ok) {
        const data = await res.json();
        if (data.restaurant) {
          setRestaurant(data.restaurant);
        }
      }
    } catch (e) {
      // Non-blocking
    }
  };

  // Modals state
  const [selectedDish, setSelectedDish] = useState<MenuItemType | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState(false);

  // Cart store
  const {
    items,
    customerNote,
    setTableNumber,
    setRestaurantId,
    setCustomerNote,
    addItem,
    removeItem,
    deleteItem,
    clearCart,
    getItemQuantity,
    getTotalCount,
    getTotalPrice,
    activeOrder,
    setActiveOrder,
  } = useCartStore();

  // Initialize table and restaurant in store
  useEffect(() => {
    setTableNumber(tableNumber);
    setRestaurantId(initialRestaurant.id);
  }, [tableNumber, initialRestaurant.id, setTableNumber, setRestaurantId]);

  // Step 5: Automatically call POST /api/stats/scans when QR page loads
  useEffect(() => {
    try {
      fetch('/api/stats/scans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain: restaurant.subdomain,
          restaurantId: restaurant.id,
          tableNumber,
        }),
      });
    } catch (err) {
      // Non-blocking
    }
  }, [restaurant.subdomain, restaurant.id, tableNumber]);

  // If the restaurant is currently closed (isActive === false), display the Closed View
  if (restaurant.isActive === false) {
    return <RestaurantClosedView restaurant={restaurant} tableNumber={tableNumber} />;
  }

  // Filtered categories and dishes
  const filteredCategories = useMemo(() => {
    return restaurant.categories
      .map((category) => {
        const matchingItems = (category.items || []).filter((item) => {
          const matchesQuery =
            !searchQuery ||
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.nameWolof && item.nameWolof.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.wolofName && item.wolofName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

          return matchesQuery;
        });

        return {
          ...category,
          items: matchingItems,
        };
      })
      .filter((category) => category.items.length > 0);
  }, [restaurant.categories, searchQuery]);

  // Handle dish card click
  const handleOpenDetails = (dish: MenuItemType) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  // Handle adding from modal
  const handleAddFromModal = (dish: MenuItemType, notes?: string, quantity: number = 1) => {
    for (let i = 0; i < quantity; i++) {
      addItem(dish, notes);
    }
    toast.success(`${dish.name} ajouté à votre commande`, {
      description: `Table ${tableNumber < 10 ? `0${tableNumber}` : tableNumber}`,
    });
  };

  // Handle direct card quick add
  const handleQuickAdd = (dish: MenuItemType) => {
    addItem(dish);
    toast.success(`+1 ${dish.name}`, {
      duration: 1500,
    });
  };

  // Submit order & Step 5: Automatically call POST /api/stats/orders with total amount
  const handleSubmitOrder = async () => {
    try {
      const orderTotal = getTotalPrice();
      const payload = {
        tableNumber,
        restaurantId: restaurant.id,
        subdomain: restaurant.subdomain,
        customerNote,
        total: orderTotal,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          menuItem: i.menuItem,
          quantity: i.quantity,
          price: i.menuItem.price,
          notes: i.customNotes,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Erreur de transmission');
      }

      // Track order stats asynchronously
      try {
        fetch('/api/stats/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId: restaurant.id,
            subdomain: restaurant.subdomain,
            total: orderTotal,
            tableNumber,
          }),
        });
      } catch (e) {
        // Non-blocking
      }

      const data = await res.json();
      const placedOrder: OrderType = data.order || {
        id: `ord_${Date.now()}`,
        tableNumber,
        customerNote,
        restaurantId: restaurant.id,
        status: 'PENDING',
        total: orderTotal,
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({
          id: i.id,
          menuItemId: i.menuItem.id,
          menuItem: i.menuItem,
          quantity: i.quantity,
          price: i.menuItem.price,
          notes: i.customNotes,
        })),
      };

      // Save active order and clear current basket
      setActiveOrder(placedOrder);
      clearCart();
      setIsCartOpen(false);
      setIsOrderSuccessOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Impossible de transmettre la commande. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] pb-28 text-gray-900 font-sans">
      {/* 1. Header (Clean, brand colors, no cumbersome top allergen list) */}
      <Header
        restaurant={restaurant}
        tableNumber={tableNumber}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCallWaiter={() => setIsCallWaiterOpen(true)}
      />

      {/* Multilingual 4-Flag Selector (FR, EN, ES, IT) */}
      <div className="max-w-4xl mx-auto px-4 pt-3 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
          <span>🌐 Langue du Menu :</span>
        </span>
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-orange-200/80 shadow-xs">
          {[
            { code: 'FR', label: 'FR', flag: '🇫🇷' },
            { code: 'EN', label: 'EN', flag: '🇬🇧' },
            { code: 'ES', label: 'ES', flag: '🇪🇸' },
            { code: 'IT', label: 'IT', flag: '🇮🇹' },
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => handleLanguageChange(l.code as any)}
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                currentLang === l.code
                  ? 'bg-[#FF6B00] text-white shadow-xs scale-105'
                  : 'bg-transparent text-gray-700 hover:bg-orange-50'
              }`}
            >
              <span>{l.flag}</span>
              <span className="hidden sm:inline">{l.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Sticky Category Navigation Tabs with Emojis */}
      {filteredCategories.length > 0 && (
        <CategoryNav
          categories={filteredCategories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={(id) => {
            setActiveCategoryId(id);
            const element = document.getElementById(id);
            if (element) {
              const yOffset = -180;
              const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* 3. Main Dishes Container (1 column mobile, full width paper menu style) */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-5 space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-orange-100 mt-6">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-base font-bold text-gray-900">
              Aucun plat ne correspond à votre recherche
            </h3>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 bg-[#FF6B00] hover:bg-orange-700 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition-all"
            >
              Afficher tout le menu
            </button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-48 space-y-4">
              {/* Category Section Title with Emoji */}
              <div className="flex items-center gap-3 px-1">
                <h2 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight flex items-center gap-2">
                  <span>{category.name}</span>
                </h2>
                <div className="flex-1 h-[2px] bg-gradient-to-r from-orange-300/80 via-emerald-300/40 to-transparent ml-2" />
              </div>

              {/* Grid of Dishes (Mobile First: 1 col, md: 2 cols) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {category.items?.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    quantity={getItemQuantity(item.id)}
                    onAdd={handleQuickAdd}
                    onRemove={removeItem}
                    onClickDetails={handleOpenDetails}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      {/* 4. Bottom Floating Cart Bar */}
      <FloatingCartBar
        totalCount={getTotalCount()}
        totalPrice={getTotalPrice()}
        tableNumber={tableNumber}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 5. Dish Details Modal */}
      <DishModal
        item={selectedDish}
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        onAddToCart={handleAddFromModal}
      />

      {/* 6. Client Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        tableNumber={tableNumber}
        customerNote={customerNote}
        onCustomerNoteChange={setCustomerNote}
        onAddItem={handleQuickAdd}
        onRemoveItem={removeItem}
        onDeleteItem={deleteItem}
        onClearCart={clearCart}
        onSubmitOrder={handleSubmitOrder}
      />

      {/* 7. Order Confirmation Modal */}
      <OrderSuccessModal
        order={activeOrder}
        isOpen={isOrderSuccessOpen}
        onClose={() => setIsOrderSuccessOpen(false)}
        onOrderMore={() => setIsOrderSuccessOpen(false)}
      />

      {/* 8. Call Server Modal */}
      <CallWaiterModal
        isOpen={isCallWaiterOpen}
        onClose={() => setIsCallWaiterOpen(false)}
        tableNumber={tableNumber}
      />
    </div>
  );
};
