import re

with open('src/components/cashier/CashierPOS.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Inject tabs
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

# 2. Wrap main grid
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
if "activeMode === 'NEW_ORDER'" not in c[c.find(header_end):]:
    c = c.replace(grid_start, replacement_start)

# 3. Close the ternary
end_pattern = """</main>

      {/* 3. MODALS */}"""
end_replace = """</main>
        )}

      {/* 3. MODALS */}"""
if ")} <!-- END activeMode check -->" not in c and ")}\n\n      {/* 3. MODALS */}" not in c:
    c = c.replace(end_pattern, end_replace)

with open('src/components/cashier/CashierPOS.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

