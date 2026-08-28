import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MenuItemType, CartItem, CartItemOption, OrderType } from '@/types';

export type PaymentMethod = 'CASH_TPE' | 'WAVE' | 'ORANGE_MONEY';

export interface CartState {
  tableNumber: number;
  restaurantId: string;
  items: CartItem[];
  customerNote: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  activeOrder: OrderType | null;

  // Actions
  setTableNumber: (tableNumber: number) => void;
  setRestaurantId: (restaurantId: string) => void;
  setCustomerNote: (note: string) => void;
  setCustomerName: (name: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  
  addItem: (
    item: MenuItemType,
    options?: CartItemOption,
    customNotes?: string,
    quantity?: number
  ) => void;
  
  removeItem: (itemIdOrCartId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  deleteItem: (cartItemId: string) => void;
  updateItemNotes: (cartItemId: string, notes: string) => void;
  getItemQuantity: (menuItemId: string) => number;
  clearCart: () => void;
  setActiveOrder: (order: OrderType | null) => void;

  // Computed values
  getTotalCount: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tableNumber: 1,
      restaurantId: 'resto_thies_01',
      items: [],
      customerNote: '',
      customerName: '',
      paymentMethod: 'CASH_TPE',
      activeOrder: null,

      setTableNumber: (tableNumber) => set({ tableNumber }),
      setRestaurantId: (restaurantId) => set({ restaurantId }),
      setCustomerNote: (customerNote) => set({ customerNote }),
      setCustomerName: (customerName) => set({ customerName }),
      setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

      addItem: (
        item: MenuItemType,
        options?: CartItemOption,
        customNotes?: string,
        quantityToAdd: number = 1
      ) => {
        const { items } = get();
        
        const hasCustomOptions = options && (options.side || options.spiceLevel || (options.extras && options.extras.length > 0));
        
        const existingIndex = hasCustomOptions
          ? -1
          : items.findIndex((i) => i.menuItem.id === item.id && !i.options?.side && !i.options?.spiceLevel && (!i.options?.extras || i.options.extras.length === 0));

        if (existingIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + quantityToAdd,
            customNotes: customNotes ?? updatedItems[existingIndex].customNotes,
          };
          set({ items: updatedItems });
        } else {
          const newItem: CartItem = {
            id: `cart_${item.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            menuItem: item,
            quantity: Math.max(1, quantityToAdd),
            customNotes,
            options,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (itemIdOrCartId: string) => {
        const { items } = get();
        const existingIndex = items.findIndex(
          (i) => i.id === itemIdOrCartId || i.menuItem.id === itemIdOrCartId
        );

        if (existingIndex > -1) {
          const item = items[existingIndex];
          if (item.quantity > 1) {
            const updatedItems = [...items];
            updatedItems[existingIndex] = {
              ...item,
              quantity: item.quantity - 1,
            };
            set({ items: updatedItems });
          } else {
            set({ items: items.filter((_, idx) => idx !== existingIndex) });
          }
        }
      },

      updateQuantity: (cartItemId: string, quantity: number) => {
        const { items } = get();
        if (quantity <= 0) {
          set({ items: items.filter((i) => i.id !== cartItemId && i.menuItem.id !== cartItemId) });
          return;
        }
        set({
          items: items.map((i) =>
            i.id === cartItemId || i.menuItem.id === cartItemId
              ? { ...i, quantity }
              : i
          ),
        });
      },

      deleteItem: (cartItemId: string) => {
        const { items } = get();
        set({ items: items.filter((i) => i.id !== cartItemId && i.menuItem.id !== cartItemId) });
      },

      updateItemNotes: (cartItemId: string, notes: string) => {
        const { items } = get();
        set({
          items: items.map((i) =>
            i.id === cartItemId || i.menuItem.id === cartItemId
              ? { ...i, customNotes: notes }
              : i
          ),
        });
      },

      getItemQuantity: (menuItemId: string) => {
        const { items } = get();
        return items
          .filter((i) => i.menuItem.id === menuItemId)
          .reduce((sum, item) => sum + item.quantity, 0);
      },

      clearCart: () => {
        set({ items: [], customerNote: '', customerName: '' });
      },

      setActiveOrder: (activeOrder: OrderType | null) => {
        set({ activeOrder });
      },

      getTotalCount: () => {
        const { items } = get();
        return items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((sum, item) => {
          const extrasTotal = (item.options?.extras || []).reduce(
            (eSum, extra) => eSum + (extra.price || 0),
            0
          );
          const unitPrice = (item.menuItem.price || 0) + extrasTotal;
          return sum + unitPrice * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'lou_ame_tay_cart_store_v2',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        tableNumber: state.tableNumber,
        restaurantId: state.restaurantId,
        customerNote: state.customerNote,
        customerName: state.customerName,
        paymentMethod: state.paymentMethod,
        activeOrder: state.activeOrder,
      }),
    }
  )
);
