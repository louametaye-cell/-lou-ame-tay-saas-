'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TableStickyHeader } from './TableStickyHeader';
import { CategoryNavbar } from './CategoryNavbar';
import { MenuItemCard } from './MenuItemCard';
import { ItemDetailDrawer } from './ItemDetailDrawer';
import { FloatingCartBar } from './FloatingCartBar';
import { CartCheckoutDrawer } from './CartCheckoutDrawer';
import { OrderSuccessTracker } from './OrderSuccessTracker';
import { RestaurantClosedView } from '@/components/RestaurantClosedView';
import { RestaurantType, MenuItemType, CartItemOption, OrderType, Language, CurrencyCode, ExchangeRates } from '@/types';
import { DEFAULT_EXCHANGE_RATES } from '@/lib/utils';
import { useCartStore } from '@/store/useCartStore';
import { getUIText, translateCategoryName } from '@/lib/translation-engine';
import { toast } from 'sonner';

interface ClientMenuContainerProps {
  initialRestaurant: RestaurantType;
  tableNumber: number;
}

export const ClientMenuContainer: React.FC<ClientMenuContainerProps> = ({
  initialRestaurant,
  tableNumber,
}) => {
  const [restaurant, setRestaurant] = useState<RestaurantType>(initialRestaurant);
  const [currentLang, setCurrentLang] = useState<Language>('FR');
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('FCFA');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    initialRestaurant.categories[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch live daily exchange rates
  useEffect(() => {
    fetch('/api/exchange-rates')
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates) {
          setExchangeRates(data.rates);
        }
      })
      .catch(() => {
        // Fallback to default rates
      });
  }, []);

  // Modals & Drawers state
  const [selectedDish, setSelectedDish] = useState<MenuItemType | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Cart store
  const {
    items,
    customerNote,
    customerName,
    paymentMethod,
    setTableNumber,
    setRestaurantId,
    setCustomerNote,
    setCustomerName,
    setPaymentMethod,
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

  // Log scan stats
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

  // Language switcher with auto-currency adaptation
  const handleLanguageChange = async (lang: Language) => {
    setCurrentLang(lang);
    
    // Auto adapt currency for foreigners
    if (lang === 'EN') {
      setCurrentCurrency('USD');
    } else if (lang === 'ES' || lang === 'IT') {
      setCurrentCurrency('EUR');
    } else {
      setCurrentCurrency('FCFA');
    }

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

  // Filtered categories & items
  const filteredCategories = useMemo(() => {
    return restaurant.categories
      .map((category) => {
        const matchingItems = (category.items || []).filter((item) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            (item.nameWolof && item.nameWolof.toLowerCase().includes(q)) ||
            (item.wolofName && item.wolofName.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q))
          );
        });

        return {
          ...category,
          items: matchingItems,
        };
      })
      .filter((category) => category.items.length > 0);
  }, [restaurant.categories, searchQuery]);

  // IntersectionObserver for auto-activating the category in view
  useEffect(() => {
    if (typeof window === 'undefined' || filteredCategories.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategoryId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-130px 0px -70% 0px',
        threshold: 0.1,
      }
    );

    filteredCategories.forEach((cat) => {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [filteredCategories]);

  // Handle dish card click to open customization drawer
  const handleOpenDetails = (dish: MenuItemType) => {
    setSelectedDish(dish);
    setIsDetailDrawerOpen(true);
  };

  // Quick direct add (+1)
  const handleQuickAdd = (dish: MenuItemType) => {
    addItem(dish);
    toast.success(`+1 ${dish.name}`, { duration: 1200 });
  };

  // Add from customization drawer
  const handleAddFromDrawer = (
    dish: MenuItemType,
    options: CartItemOption,
    notes: string,
    quantity: number
  ) => {
    addItem(dish, options, notes, quantity);
    toast.success(`${quantity}x ${dish.name} ajouté(s) à la commande`);
  };

  // Submit Order to Kitchen
  const handleSubmitOrder = async () => {
    if (items.length === 0) return;

    try {
      setIsSubmittingOrder(true);
      const orderTotal = getTotalPrice();
      const payload = {
        tableNumber,
        restaurantId: restaurant.id,
        subdomain: restaurant.subdomain,
        customerNote,
        customerName,
        paymentMethod,
        total: orderTotal,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          menuItem: i.menuItem,
          quantity: i.quantity,
          price: i.menuItem.price + (i.options?.extras || []).reduce((es, e) => es + e.price, 0),
          notes: i.customNotes,
          options: i.options,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Erreur de transmission de commande');
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

      setActiveOrder(placedOrder);
      clearCart();
      setIsCartOpen(false);
      setIsOrderSuccessOpen(true);
    } catch (error) {
      console.error(error);
      toast.error('Impossible de transmettre la commande. Veuillez réessayer.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (restaurant.isActive === false) {
    return <RestaurantClosedView restaurant={restaurant} tableNumber={tableNumber} />;
  }

  const t = getUIText(currentLang);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 text-slate-900 font-sans selection:bg-orange-500 selection:text-white">
      {/* 1. Sticky Header */}
      <TableStickyHeader
        restaurantName={restaurant.name}
        logoUrl={restaurant.logoUrl}
        tableNumber={tableNumber}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lang={currentLang}
      />

      {/* Multilingual & Currency Selector Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* 1. Language Flags */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-orange-200 shadow-2xs">
            {[
              { code: 'FR', label: 'FR', flag: '🇫🇷' },
              { code: 'EN', label: 'EN', flag: '🇬🇧' },
              { code: 'ES', label: 'ES', flag: '🇪🇸' },
              { code: 'IT', label: 'IT', flag: '🇮🇹' },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLanguageChange(l.code as Language)}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                  currentLang === l.code
                    ? 'bg-orange-500 text-white shadow-2xs scale-105'
                    : 'bg-transparent text-slate-700 hover:bg-orange-50'
                }`}
              >
                <span>{l.flag}</span>
                <span className="hidden sm:inline">{l.label}</span>
              </button>
            ))}
          </div>

          {/* 2. Currency Switcher Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <span className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-wider">
              Devise :
            </span>
            {[
              { code: 'FCFA', label: 'FCFA', symbol: '🇸🇳' },
              { code: 'EUR', label: 'EUR (€)', symbol: '🇪🇺' },
              { code: 'USD', label: 'USD ($)', symbol: '🇺🇸' },
            ].map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrentCurrency(c.code as CurrencyCode)}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                  currentCurrency === c.code
                    ? 'bg-emerald-600 text-white shadow-2xs scale-105'
                    : 'bg-transparent text-slate-700 hover:bg-emerald-50'
                }`}
              >
                <span>{c.symbol}</span>
                <span className="text-[11px] font-extrabold">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Scrollable Category Pills with IntersectionObserver */}
      {filteredCategories.length > 0 && (
        <CategoryNavbar
          categories={filteredCategories}
          activeCategoryId={activeCategoryId}
          lang={currentLang}
          onSelectCategory={(id) => {
            setActiveCategoryId(id);
            const el = document.getElementById(id);
            if (el) {
              const yOffset = -170;
              const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* 3. Main Dishes Grid by Category */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 pt-6 space-y-10">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center shadow-xs border border-orange-100 mt-6">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-base font-bold text-slate-900">
              Aucun plat ne correspond à votre recherche
            </h3>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-2xl transition-all"
            >
              Afficher tout le menu
            </button>
          </div>
        ) : (
          filteredCategories.map((category, idx) => {
            const icon = category.icon || '🍽️';
            const translatedCat = translateCategoryName(category.name, currentLang);
            const isSpecialCategory =
              idx === 0 ||
              category.name.toLowerCase().includes('lou ame tay') ||
              category.name.toLowerCase().includes('jour');

            return (
              <section key={category.id} id={category.id} className="scroll-mt-48 space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3 px-1">
                  <h2 className="text-base sm:text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span>{translatedCat}</span>
                  </h2>
                  <div className={`flex-1 h-[2px] ${isSpecialCategory ? 'bg-gradient-to-r from-amber-400 via-orange-300 to-transparent' : 'bg-gradient-to-r from-emerald-300/80 via-slate-200 to-transparent'} ml-2`} />
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {category.items?.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      quantity={getItemQuantity(item.id)}
                      onQuickAdd={handleQuickAdd}
                      onQuickRemove={removeItem}
                      onClickDetails={handleOpenDetails}
                      lang={currentLang}
                      currency={currentCurrency}
                      exchangeRates={exchangeRates}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* 4. Bottom Floating Cart Bar */}
      <FloatingCartBar
        totalCount={getTotalCount()}
        totalPrice={getTotalPrice()}
        tableNumber={tableNumber}
        onOpenCart={() => setIsCartOpen(true)}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 5. Customization BottomSheet Drawer */}
      <ItemDetailDrawer
        item={selectedDish}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onAddToCart={handleAddFromDrawer}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 6. Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        tableNumber={tableNumber}
        customerNote={customerNote}
        customerName={customerName}
        paymentMethod={paymentMethod}
        onCustomerNoteChange={setCustomerNote}
        onCustomerNameChange={setCustomerName}
        onPaymentMethodChange={setPaymentMethod}
        onAddItem={handleQuickAdd}
        onRemoveItem={removeItem}
        onDeleteItem={deleteItem}
        onClearCart={clearCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 7. Order Confirmation & Live Tracker */}
      <OrderSuccessTracker
        order={activeOrder}
        isOpen={isOrderSuccessOpen}
        onClose={() => setIsOrderSuccessOpen(false)}
        onOrderMore={() => setIsOrderSuccessOpen(false)}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />
    </div>
  );
};
