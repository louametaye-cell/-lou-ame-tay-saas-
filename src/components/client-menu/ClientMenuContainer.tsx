'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TableStickyHeader } from './TableStickyHeader';
import { CategoryNavbar } from './CategoryNavbar';
import { MenuItemCard } from './MenuItemCard';
import { ItemDetailDrawer } from './ItemDetailDrawer';
import { FloatingCartBar } from './FloatingCartBar';
import { CartCheckoutDrawer } from './CartCheckoutDrawer';
import { OrderSuccessTracker } from './OrderSuccessTracker';
import { DailySpecialsSection } from './DailySpecialsSection';
import { SplitBillDrawer } from './SplitBillDrawer';
import { RestaurantClosedView } from '@/components/RestaurantClosedView';
import { 
  RestaurantType, 
  MenuItemType, 
  CartItemOption, 
  OrderType, 
  Language, 
  CurrencyCode, 
  ExchangeRates 
} from '@/types';
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
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
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

  // Dynamic translated menu categories
  const translatedCategories = useMemo(() => {
    return restaurant.categories.map((category) => {
      const translatedItems = (category.items || []).map((item) => {
        if (currentLang === 'FR') return item;

        if (Array.isArray(item.translations)) {
          const dynamicTrans = item.translations.find((t: any) => t.language === currentLang);
          if (dynamicTrans) {
            return {
              ...item,
              name: dynamicTrans.name || item.name,
              description: dynamicTrans.description || item.description,
            };
          }
        } else if (item.translations && typeof item.translations === 'object') {
          const dynamicTrans = (item.translations as any)[currentLang];
          if (dynamicTrans) {
            return {
              ...item,
              name: dynamicTrans.name || item.name,
              description: dynamicTrans.description || item.description,
            };
          }
        }
        return item;
      });

      return {
        ...category,
        items: translatedItems,
      };
    });
  }, [restaurant.categories, currentLang]);

  // Flattened items for daily specials & search
  const allMenuItems = useMemo(() => {
    return translatedCategories.flatMap((c) => c.items || []);
  }, [translatedCategories]);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return translatedCategories;

    const query = searchQuery.toLowerCase().trim();
    return translatedCategories
      .map((cat) => ({
        ...cat,
        items: (cat.items || []).filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [translatedCategories, searchQuery]);

  // Handlers
  const handleOpenDetails = (dish: MenuItemType) => {
    setSelectedDish(dish);
    setIsDetailDrawerOpen(true);
  };

  const handleQuickAdd = (dish: MenuItemType) => {
    addItem(dish);
    const t = getUIText(currentLang);
    toast.success(`✅ « ${dish.name} » ${t.added}`, {
      duration: 1800,
    });
  };

  const handleAddFromDrawer = (
    item: MenuItemType,
    options?: CartItemOption,
    customNotes?: string,
    quantity: number = 1
  ) => {
    addItem(item, options, customNotes, quantity);
    setIsDetailDrawerOpen(false);
    setSelectedDish(null);
    const t = getUIText(currentLang);
    toast.success(`✅ « ${item.name} » ${t.added} (${quantity}x)`, {
      duration: 2000,
    });
  };

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    const langNames: Record<Language, string> = {
      FR: 'Français 🇫🇷',
      WO: 'Wolof 🇸🇳',
      EN: 'English 🇬🇧',
      ES: 'Español 🇪🇸',
      IT: 'Italiano 🇮🇹',
    };
    toast.info(`Langue : ${langNames[lang]}`);
  };

  // Submit order action
  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide.');
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        restaurantId: restaurant.id,
        tableNumber,
        customerName: customerName.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
        paymentMethod,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          name: i.menuItem.name,
          price: i.menuItem.price,
          quantity: i.quantity,
          selectedSide: i.options?.side || null,
          selectedSpiceLevel: i.options?.spiceLevel || null,
          selectedExtras: i.options?.extras?.map((e) => e.name) || [],
          customNotes: i.customNotes || null,
        })),
        total: getTotalPrice(),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la commande.');
      }

      const placedOrder: OrderType = data.order || {
        id: `ord_${Date.now()}`,
        restaurantId: restaurant.id,
        tableNumber,
        customerName: customerName.trim() || null,
        customerNote: customerNote.trim() || null,
        paymentMethod,
        status: 'PENDING',
        total: getTotalPrice(),
        createdAt: new Date().toISOString(),
        items: items.map((i) => ({
          id: `item_${Math.random()}`,
          menuItemId: i.menuItem.id,
          name: i.menuItem.name,
          price: i.menuItem.price,
          quantity: i.quantity,
          options: i.options,
          notes: i.customNotes,
        })),
      };

      setActiveOrder(placedOrder);
      setIsCartOpen(false);
      clearCart();
      setIsOrderSuccessOpen(true);
    } catch (err: any) {
      toast.error(err.message || 'Impossible de transmettre la commande.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // If Restaurant is closed or suspended
  if (restaurant.status === 'SUSPENDED' || restaurant.isOnline === false) {
    return (
      <RestaurantClosedView
        restaurant={restaurant}
        tableNumber={tableNumber}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 pb-36 font-sans antialiased selection:bg-orange-500 selection:text-white">
      {/* 1. Fixed Header with Table Badge, Waiter Bell & Search */}
      <TableStickyHeader
        restaurantName={restaurant.name}
        logoUrl={restaurant.logoUrl}
        tableNumber={tableNumber}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lang={currentLang}
      />

      {/* Multilingual & Currency Selector Bar */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* 1. Language Flags with Wolof */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-orange-200 shadow-2xs overflow-x-auto no-scrollbar">
            {[
              { code: 'FR', label: 'FR', flag: '🇫🇷' },
              { code: 'WO', label: 'Wolof', flag: '🇸🇳' },
              { code: 'EN', label: 'EN', flag: '🇬🇧' },
              { code: 'ES', label: 'ES', flag: '🇪🇸' },
              { code: 'IT', label: 'IT', flag: '🇮🇹' },
            ].map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => handleLanguageChange(l.code as Language)}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 shrink-0 ${
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
            <span className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-wider hidden sm:inline">
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
                className={`px-2 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
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

      {/* 2. Daily Specials Carousel Section « Lou Ame Tay ? » */}
      {!searchQuery && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4">
          <DailySpecialsSection
            items={allMenuItems}
            onQuickAdd={handleQuickAdd}
            onOpenDetails={handleOpenDetails}
            lang={currentLang}
            currency={currentCurrency}
            exchangeRates={exchangeRates}
          />
        </div>
      )}

      {/* 3. Scrollable Category Pills */}
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

      {/* 4. Main Dishes Grid by Category */}
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
                  <div
                    className={`flex-1 h-[2px] ${
                      isSpecialCategory
                        ? 'bg-gradient-to-r from-amber-400 via-orange-300 to-transparent'
                        : 'bg-gradient-to-r from-emerald-300/80 via-slate-200 to-transparent'
                    } ml-2`}
                  />
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

      {/* 5. Bottom Floating Cart Bar with Split Bill Trigger */}
      <FloatingCartBar
        totalCount={getTotalCount()}
        totalPrice={getTotalPrice()}
        tableNumber={tableNumber}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSplitBill={() => setIsSplitBillOpen(true)}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 6. Customization BottomSheet Drawer */}
      <ItemDetailDrawer
        item={selectedDish}
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        onAddToCart={handleAddFromDrawer}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 7. Cart & Checkout Drawer with Wave / OM / Cash Change */}
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
        onAddItem={addItem}
        onRemoveItem={removeItem}
        onDeleteItem={deleteItem}
        onClearCart={clearCart}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmittingOrder}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 8. Split Bill Drawer with WhatsApp Share */}
      <SplitBillDrawer
        isOpen={isSplitBillOpen}
        onClose={() => setIsSplitBillOpen(false)}
        totalAmount={getTotalPrice()}
        tableNumber={tableNumber}
        restaurantName={restaurant.name}
        lang={currentLang}
      />

      {/* 9. Live Order Status Tracker */}
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