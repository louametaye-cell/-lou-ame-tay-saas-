import re

with open('src/components/cashier/CashierPOS.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'TactileGrid' not in c:
    c = c.replace(
        "import { formatFCFA, playOrderSound } from '@/lib/utils';",
        "import { formatFCFA, playOrderSound } from '@/lib/utils';\nimport { TactileGrid } from './TactileGrid';\nimport { CashierCart, CashierCartItem } from './CashierCart';"
    )

if 'const [activeMode' not in c:
    state_anchor = 'const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);'
    state_injection = """
  const [activeMode, setActiveMode] = useState<'QR_ORDERS' | 'NEW_ORDER'>('QR_ORDERS');
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<CashierCartItem[]>([]);
  const [isSubmittingNewOrder, setIsSubmittingNewOrder] = useState(false);

  useEffect(() => {
    if (activeMode === 'NEW_ORDER' && menuCategories.length === 0) {
      fetch('/api/cashier/menu?tenantId=' + (restaurantId || localStorage.getItem('current_restaurant_id')))
        .then(res => res.json())
        .then(data => {
          if (data.categories) setMenuCategories(data.categories);
        });
    }
  }, [activeMode, restaurantId]);

  const handleAddToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.menuItemId === item.id);
      if (existing) {
        return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(i => i.menuItemId === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const handleSubmitNewOrder = async (method: string, customerName: string, isPaidLater: boolean = false, tableNumber: number = 0) => {
    setIsSubmittingNewOrder(true);
    try {
      const res = await fetch('/api/cashier/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: restaurantId || localStorage.getItem('current_restaurant_id'),
          items: cartItems,
          paymentMethod: method,
          cashierId: currentCashier?.id,
          cashSessionId: currentSession?.id,
          customerName,
          isPaidLater,
          tableNumber
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Commande enregistrée et envoyée !');
        setCartItems([]);
        setActiveMode('QR_ORDERS');
        fetchActiveSession(restaurantId || localStorage.getItem('current_restaurant_id') || '');
      } else {
        toast.error(data.error || 'Erreur lors de la commande');
      }
    } catch (e) {
      toast.error('Erreur réseau');
    } finally {
      setIsSubmittingNewOrder(false);
    }
  };
"""
    c = c.replace(state_anchor, state_anchor + '\n' + state_injection)


header_end = '</header>'
tabs_injection = """
        {currentSession && (
          <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveMode('QR_ORDERS')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all ${
                activeMode === 'QR_ORDERS'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              Commandes (QR / Table)
            </button>
            <button
              onClick={() => setActiveMode('NEW_ORDER')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                activeMode === 'NEW_ORDER'
                  ? 'bg-amber-400 text-slate-900 shadow-md'
                  : 'bg-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              Nouveau Ticket (Comptoir / Sur Place)
            </button>
          </div>
        )}
"""

if "Commandes (QR / Table)" not in c:
    c = c.replace(header_end, header_end + '\n' + tabs_injection)

grid_start = '<main className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_350px] gap-6 items-start">'

replacement_start = """
        {activeMode === 'NEW_ORDER' && currentSession ? (
          <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start h-[calc(100vh-250px)]">
            <div className="h-full">
              <CashierCart 
                items={cartItems} 
                onUpdateQuantity={handleUpdateCartQuantity} 
                onClear={() => setCartItems([])}
                onSubmit={handleSubmitNewOrder}
                isSubmitting={isSubmittingNewOrder}
              />
            </div>
            <div className="h-full">
              <TactileGrid categories={menuCategories} onAddItem={handleAddToCart} />
            </div>
          </main>
        ) : (
          <main className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_350px] gap-6 items-start">
"""
if "activeMode === 'NEW_ORDER' && currentSession" not in c:
    c = c.replace(grid_start, replacement_start)

end_pattern = """</main>

      {/* 3. MODALS */}"""
end_replace = """</main>
        )}

      {/* 3. MODALS */}"""
if ")} <!-- END activeMode check -->" not in c and ")}\n\n      {/* 3. MODALS */}" not in c:
    c = c.replace(end_pattern, end_replace)

with open('src/components/cashier/CashierPOS.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

