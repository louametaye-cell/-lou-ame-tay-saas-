import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MenuItemType, CartItem, OrderType } from '@/types';

interface CartState {
  tableNumber: number;
  restaurantId: string;
  items: CartItem[];
  customerNote: string;
  activeOrder: OrderType | null;
  
  // Actions
  setTableNumber: (tableNumber: number) => void;
  setRestaurantId: (restaurantId: string) => void;
  setCustomerNote: (note: string) => void;
  addItem: (item: MenuItemType, customNotes?: string) => void;
  removeItem: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  getItemQuantity: (itemId: string) => number;
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
      activeOrder: null,

      setTableNumber: (tableNumber) => set({ tableNumber }),
      setRestaurantId: (restaurantId) => set({ restaurantId }),
      setCustomerNote: (customerNote) => set({ customerNote }),

      addItem: (item: MenuItemType, customNotes?: string) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.menuItem.id === item.id);

        if (existingIndex > -1) {
          const updatedItems = [...items];
          updatedItems[existingIndex] = {
            ...updatedItems[existingIndex],
            quantity: updatedItems[existingIndex].quantity + 1,
            customNotes: customNotes ?? updatedItems[existingIndex].customNotes,
          };
          set({ items: updatedItems });
        } else {
          const newItem: CartItem = {
            id: `cart_${item.id}_${Date.now()}`,
            menuItem: item,
            quantity: 1,
            customNotes,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (itemId: string) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.menuItem.id === itemId);

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
            set({ items: items.filter((i) => i.menuItem.id !== itemId) });
          }
        }
      },

      deleteItem: (itemId: string) => {
        const { items } = get();
        set({ items: items.filter((i) => i.menuItem.id !== itemId) });
      },

      updateItemNotes: (itemId: string, notes: string) => {
        const { items } = get();
        set({
          items: items.map((i) =>
            i.menuItem.id === itemId ? { ...i, customNotes: notes } : i
          ),
        });
      },

      getItemQuantity: (itemId: string) => {
        const { items } = get();
        const found = items.find((i) => i.menuItem.id === itemId);
        return found ? found.quantity : 0;
      },

      clearCart: () => set({ items: [], customerNote: '' }),

      setActiveOrder: (order) => set({ activeOrder: order }),

      getTotalCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'lou_ame_tay_cart_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tableNumber: state.tableNumber,
        restaurantId: state.restaurantId,
        items: state.items,
        customerNote: state.customerNote,
        activeOrder: state.activeOrder,
      }),
    }
  )
);
