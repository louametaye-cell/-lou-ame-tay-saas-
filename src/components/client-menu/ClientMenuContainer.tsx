'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { TableStickyHeader } from './TableStickyHeader';
import { CategoryNavbar } from './CategoryNavbar';
import { MenuItemCard } from './MenuItemCard';
import { ItemDetailDrawer } from './ItemDetailDrawer';
import { FloatingCartBar } from './FloatingCartBar';
import { CartCheckoutDrawer } from './CartCheckoutDrawer';
import { OrderSuccessTracker } from './OrderSuccessTracker';
import { ActiveOrderFloatingPill } from './ActiveOrderFloatingPill';
import { DailySpecialsSection } from './DailySpecialsSection';
import { WeeklyMenuCustomerBanner } from './WeeklyMenuCustomerBanner';
import { SplitBillDrawer } from './SplitBillDrawer';
import { UpsellDrawer } from './UpsellDrawer';
import { TableSessionModal } from './TableSessionModal';
import { MobileMoneyCheckout } from './MobileMoneyCheckout';
import { ComboSection } from './ComboSection';
import { CallWaiterModal } from './CallWaiterModal';
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
import { 
  getUIText, 
  translateCategoryName, 
  getSynchronousDishTranslation 
} from '@/lib/translation-engine';
import { useMenuSchedule } from '@/hooks/useMenuSchedule';
import { toast } from 'sonner';
import { Clock } from 'lucide-react';

interface ClientMenuContainerProps {
  initialRestaurant: RestaurantType;
  tableNumber: number;
  isExpress?: boolean;
}

export const ClientMenuContainer: React.FC<ClientMenuContainerProps> = ({
  initialRestaurant,
  tableNumber,
  isExpress = false,
}) => {
  const [restaurant, setRestaurant] = useState<RestaurantType>(initialRestaurant);
  const [currentLang, setCurrentLang] = useState<Language>('FR');
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>('FCFA');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(DEFAULT_EXCHANGE_RATES);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    initialRestaurant.categories[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Schedule Hook
  const schedule = useMenuSchedule();

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

  // Sync with Cart Store
  const {
    items,
    addItem,
    removeItem,
    deleteItem,
    clearCart,
    getTotalCount,
    getTotalPrice,
    getItemQuantity,
    customerNote,
    setCustomerNote,
    customerName,
    setCustomerName,
    paymentMethod,
    setPaymentMethod,
  } = useCartStore();

  // UI state for drawers/modals
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<MenuItemType | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUpsellOpen, setIsUpsellOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isMobileMoneyOpen, setIsMobileMoneyOpen] = useState(false);
  const [isSplitBillOpen, setIsSplitBillOpen] = useState(false);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderType | null>(null);
  const [isCallWaiterOpen, setIsCallWaiterOpen] = useState(false);

  // Table session accumulated orders
  const [sessionOrders, setSessionOrders] = useState<OrderType[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`louametay_session_orders_${tableNumber}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  });

  // Real-time polling to sync order status (PENDING -> PREPARING -> READY -> SERVED)
  useEffect(() => {
    if (sessionOrders.length === 0 && !activeOrder) return;

    const pollLiveOrders = async () => {
      try {
        const res = await fetch(`/api/orders/table/${tableNumber}?restaurantId=${restaurant.id || 'resto_thies_01'}`);
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
            setSessionOrders((prev) => {
              // Check if any order transitioned to SERVED
              data.orders.forEach((updatedOrd: OrderType) => {
                const prevOrd = prev.find((p) => p.id === updatedOrd.id);
                if (prevOrd && prevOrd.status !== 'SERVED' && updatedOrd.status === 'SERVED') {
                  const tableDisplay = isExpress ? 'Comptoir' : `Table ${tableNumber < 10 ? '0' + tableNumber : tableNumber}`;
                  toast.success(`🎉 Votre commande ${tableDisplay} a été servie ! Bon appétit ! 😋`);
                }
              });

              localStorage.setItem(`louametay_session_orders_${tableNumber}`, JSON.stringify(data.orders));
              return data.orders;
            });

            // Update activeOrder if matched
            if (activeOrder) {
              const matched = data.orders.find((o: OrderType) => o.id === activeOrder.id);
              if (matched && matched.status !== activeOrder.status) {
                setActiveOrder(matched);
              }
            }
          }
        }
      } catch (err) {}
    };

    pollLiveOrders();
    const interval = setInterval(pollLiveOrders, 3500);
    return () => clearInterval(interval);
  }, [tableNumber, restaurant.id, activeOrder?.id, sessionOrders.length, isExpress]);

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Flattened menu items for search and specials
  const allMenuItems = useMemo(() => {
    const dishes: MenuItemType[] = [];
    restaurant.categories.forEach((cat) => {
      cat.items?.forEach((dish) => dishes.push(dish));
    });
    return dishes;
  }, [restaurant]);

  // Categories filtered by search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return restaurant.categories;

    const query = searchQuery.toLowerCase();
    return restaurant.categories
      .map((cat) => ({
        ...cat,
        items: (cat.items || []).filter((item) => {
          const nameFr = item.name.toLowerCase();
          const nameWo = (item.nameWolof || item.wolofName || '').toLowerCase();
          const desc = item.description.toLowerCase();
          return nameFr.includes(query) || nameWo.includes(query) || desc.includes(query);
        }),
      }))
      .filter((cat) => (cat.items || []).length > 0);
  }, [restaurant.categories, searchQuery]);

  // Handlers
  const handleOpenDetails = (item: MenuItemType) => {
    setSelectedItemForDetail(item);
  };

  const handleCloseDetails = () => {
    setSelectedItemForDetail(null);
  };

  const handleQuickAdd = (item: MenuItemType) => {
    if (!item.isAvailable) {
      toast.error('Ce plat est actuellement épuisé.');
      return;
    }

    addItem(item);
    toast.success(`Ajouté au panier !`, {
      description: `${item.name} a été ajouté avec succès.`,
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

  // Upsell check before validating order
  const handleOpenCartOrUpsell = () => {
    const hasDrinkOrDessert = items.some(
      (i) =>
        i.menuItem.categoryId?.toLowerCase().includes('boisson') ||
        i.menuItem.categoryId?.toLowerCase().includes('dessert') ||
        i.menuItem.name.toLowerCase().includes('bissap') ||
        i.menuItem.name.toLowerCase().includes('bouye')
    );

    if (!hasDrinkOrDessert && items.length > 0) {
      setIsUpsellOpen(true);
    } else {
      setIsCartOpen(true);
    }
  };

  // Submit order action
  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('Votre panier est vide.');
      return;
    }

    // If Wave or OM selected, offer direct checkout flow
    if (paymentMethod === 'WAVE' || paymentMethod === 'ORANGE_MONEY') {
      setIsCartOpen(false);
      setIsMobileMoneyOpen(true);
      return;
    }

    await executeOrderPlacement();
  };

  const executeOrderPlacement = async (transactionRef?: string) => {
    setIsSubmittingOrder(true);
    try {
      const orderPayload = {
        restaurantId: restaurant.id,
        tableNumber: isExpress ? 0 : tableNumber,
        orderType: isExpress ? 'EXPRESS' : 'TABLE',
        customerName: customerName.trim() || undefined,
        customerNote: customerNote.trim() || undefined,
        paymentMethod,
        transactionRef,
        total: getTotalPrice(),
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          name: i.menuItem.name,
          quantity: i.quantity,
          price: i.menuItem.price,
          options: i.options,
          notes: i.customNotes,
        })),
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
        tableNumber: isExpress ? 0 : tableNumber,
        orderType: isExpress ? 'EXPRESS' : 'TABLE',
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
      setSessionOrders((prev) => {
        const updated = [...prev, placedOrder];
        if (typeof window !== 'undefined') {
          localStorage.setItem(`louametay_session_orders_${tableNumber}`, JSON.stringify(updated));
        }
        return updated;
      });

      setIsCartOpen(false);
      setIsMobileMoneyOpen(false);
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
      {/* 1. Fixed Header with Table Badge, Waiter Bell, 5-Flag Language Switcher & Search */}
      <TableStickyHeader
        restaurantName={restaurant.name}
        logoUrl={restaurant.logoUrl}
        tableNumber={tableNumber}
        isExpress={isExpress}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        lang={currentLang}
        onLanguageChange={handleLanguageChange}
      />

      {/* Schedule Banner & Currency Selector Bar */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-3 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {schedule.periodLabel && (
            <div className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-950 text-xs px-3 py-1.5 rounded-full font-bold border border-amber-200 shadow-2xs">
              <span className="text-sm">{schedule.periodIcon}</span>
              <span>{schedule.periodLabel}</span>
            </div>
          )}

          {/* Quick Currency Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-2xl text-xs font-bold shadow-2xs ml-auto">
            {(
              [
                { code: 'FCFA', symbol: 'FCFA', label: 'CFA' },
                { code: 'EUR', symbol: '€', label: 'EUR' },
                { code: 'USD', symbol: '$', label: 'USD' },
              ] as const
            ).map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrentCurrency(c.code)}
                className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${
                  currentCurrency === c.code
                    ? 'bg-emerald-600 text-white font-black shadow-xs'
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

      {/* 2. Daily Specials Carousel Section « Lou Ame Tay ? » & Weekly Multi-Dish Schedule */}
      {!searchQuery && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-4 space-y-4">
          {/* Emploi du Temps Hebdomadaire Multi-Plats (Lundi au Dimanche - Midi & Soir) */}
          <WeeklyMenuCustomerBanner
            onQuickAdd={handleQuickAdd}
            onOpenDetails={handleOpenDetails}
            lang={currentLang}
            currency={currentCurrency}
            exchangeRates={exchangeRates}
          />

          <DailySpecialsSection
            items={allMenuItems}
            onQuickAdd={handleQuickAdd}
            onOpenDetails={handleOpenDetails}
            lang={currentLang}
            currency={currentCurrency}
            exchangeRates={exchangeRates}
          />

          {/* Formule Midi / Soir Combinée */}
          <ComboSection
            onAddComboToCart={(comboDish) => {
              addItem(comboDish);
            }}
            lang={currentLang}
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

      {/* 5. Sticky Bottom Cart Bar */}
      <FloatingCartBar
        totalCount={getTotalCount()}
        totalPrice={getTotalPrice()}
        tableNumber={tableNumber}
        onOpenCart={handleOpenCartOrUpsell}
        onOpenSplitBill={() => setIsSplitBillOpen(true)}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 5.5. Persistent Floating Pill for Active Table Orders */}
      {sessionOrders.length > 0 && !isOrderSuccessOpen && (
        <ActiveOrderFloatingPill
          orders={sessionOrders}
          tableNumber={tableNumber}
          onOpenTracker={() => setIsOrderSuccessOpen(true)}
        />
      )}

      {/* 6. Item Detail Drawer */}
      <ItemDetailDrawer
        item={selectedItemForDetail}
        isOpen={Boolean(selectedItemForDetail)}
        onClose={handleCloseDetails}
        onAddToCart={(item, qty, options, notes) => {
          addItem(item, qty, options, notes);
          handleCloseDetails();
          toast.success(`Ajouté au panier !`, {
            description: `${qty}x ${item.name}`,
          });
        }}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
      />

      {/* 7. Upsell Drawer (Bissap, Bouye, Pastels) */}
      <UpsellDrawer
        isOpen={isUpsellOpen}
        onClose={() => {
          setIsUpsellOpen(false);
          setIsCartOpen(true);
        }}
        onAddUpsellItem={(item) => {
          addItem(item);
        }}
        onContinueToCheckout={() => {
          setIsUpsellOpen(false);
          setIsCartOpen(true);
        }}
      />

      {/* 8. Cart & Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={items}
        tableNumber={tableNumber}
        isExpress={isExpress}
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

      {/* 9. Mobile Money Direct Checkout (Wave QR / OM USSD) */}
      <MobileMoneyCheckout
        isOpen={isMobileMoneyOpen}
        onClose={() => setIsMobileMoneyOpen(false)}
        method={paymentMethod === 'ORANGE_MONEY' ? 'ORANGE_MONEY' : 'WAVE'}
        totalAmount={getTotalPrice()}
        tableNumber={tableNumber}
        restaurantName={restaurant.name}
        onPaymentCompleted={(txRef) => {
          executeOrderPlacement(txRef);
        }}
        lang={currentLang}
      />

      {/* 10. Split Bill Drawer with WhatsApp Share */}
      <SplitBillDrawer
        isOpen={isSplitBillOpen}
        onClose={() => setIsSplitBillOpen(false)}
        totalAmount={getTotalPrice()}
        tableNumber={tableNumber}
        restaurantName={restaurant.name}
        lang={currentLang}
      />

      {/* 11. Live Order Status & Digital Receipt Tracker */}
      <OrderSuccessTracker
        order={activeOrder}
        sessionOrders={sessionOrders}
        isOpen={isOrderSuccessOpen}
        onClose={() => setIsOrderSuccessOpen(false)}
        onOrderMore={() => setIsOrderSuccessOpen(false)}
        onCallWaiter={() => setIsCallWaiterOpen(true)}
        onPayOnline={(amount) => {
          setIsOrderSuccessOpen(false);
          setIsMobileMoneyOpen(true);
        }}
        lang={currentLang}
        currency={currentCurrency}
        exchangeRates={exchangeRates}
        restaurantName={restaurant.name}
      />

      {/* 12. Call Waiter / Server Dedicated Modal */}
      <CallWaiterModal
        isOpen={isCallWaiterOpen}
        onClose={() => setIsCallWaiterOpen(false)}
        tableNumber={tableNumber}
        restaurantId={restaurant.id}
        customerName={customerName}
        isExpress={isExpress}
      />
    </div>
  );
};