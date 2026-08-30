import React, { useState } from 'react';
import { 
  Smartphone, 
  ChefHat, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  CheckCircle2, 
  Clock, 
  Volume2, 
  AlertTriangle, 
  Sparkles, 
  QrCode,
  DollarSign,
  UtensilsCrossed,
  Layers,
  ArrowRight,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INITIAL_MENU_ITEMS, INITIAL_LIVE_ORDERS } from '@/components/landing/data/mockData';
import { MenuItem, LiveOrder } from '@/components/landing/types';

export const InteractiveLiveDemo: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>(INITIAL_LIVE_ORDERS);
  const [selectedTable, setSelectedTable] = useState<number>(5);
  const [cart, setCart] = useState<{ [key: string]: number }>({
    'thieb-penda': 1,
    'jus-bissap': 1
  });
  const [activeTab, setActiveTab] = useState<'both' | 'client' | 'kitchen'>('both');
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  // Add to cart
  const handleAddToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  // Remove or decrement
  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const updated = { ...prev };
      if (updated[itemId] > 1) {
        updated[itemId] -= 1;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
  };

  // Toggle item stock rupture (1-click rupture simulation)
  const handleToggleStock = (itemId: string) => {
    setMenuItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  // Calculate cart total in FCFA
  const cartTotal = Object.entries(cart).reduce((sum: number, [id, qty]) => {
    const item = menuItems.find(m => m.id === id);
    const quantity = Number(qty) || 0;
    return sum + (item ? item.price * quantity : 0);
  }, 0);

  const cartItemCount: number = Object.values(cart).reduce<number>(
    (a, b) => a + (typeof b === 'number' ? b : 0),
    0
  );

  // Send Order from Client to Kitchen Screen!
  const handleSendOrder = () => {
    if (cartItemCount === 0) return;

    const newOrderItems = Object.entries(cart).map(([id, qty]) => {
      const item = menuItems.find(m => m.id === id)!;
      const quantity = Number(qty) || 1;
      return {
        name: item.name,
        quantity,
        price: item.price,
        notes: item.id === 'thieb-penda' ? 'Bien assaisonné' : undefined
      };
    });

    const newOrder: LiveOrder = {
      id: `CMD-${Math.floor(100 + Math.random() * 900)}`,
      tableNumber: selectedTable,
      customerName: `Client Table ${selectedTable}`,
      items: newOrderItems,
      totalAmount: cartTotal,
      status: 'nouveau',
      timestamp: 'À l\'instant',
      paymentMethod: 'Sur place (Espèces/Wave)'
    };

    setLiveOrders(prev => [newOrder, ...prev]);
    setCart({});

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {
      // ignore
    }

    // Audio / visual alert trigger
    setRecentNotification(`🔔 Nouvelle commande reçue pour la TABLE #${selectedTable} (${newOrder.id}) !`);
    setTimeout(() => {
      setRecentNotification(null);
    }, 5000);
  };

  // Advance kitchen order status
  const handleUpdateOrderStatus = (orderId: string, currentStatus: LiveOrder['status']) => {
    const nextStatus: LiveOrder['status'] =
      currentStatus === 'nouveau'
        ? 'en_preparation'
        : currentStatus === 'en_preparation'
        ? 'pret'
        : 'servi';

    setLiveOrders(prev =>
      prev.map(ord => (ord.id === orderId ? { ...ord, status: nextStatus } : ord))
    );
  };

  return (
    <section id="demo-live" className="py-20 bg-white relative overflow-hidden border-b border-gray-100">
      
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#00A86B]/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00A86B]/10 text-[#00A86B] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simulateur Interactif Live</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight">
            Testez la commande en direct comme dans votre <span className="text-[#00A86B]">restaurant</span>
          </h2>

          <p className="text-base sm:text-lg text-gray-600 font-normal leading-relaxed">
            Passez une commande test sur le smartphone client à gauche et regardez-la sonner instantanément 
            sur l'écran cuisine à droite !
          </p>

          {/* Device toggle for mobile or responsive screens */}
          <div className="pt-2 flex justify-center">
            <div className="bg-gray-100 p-1 rounded-xl inline-flex text-xs font-semibold text-gray-700">
              <button
                onClick={() => setActiveTab('both')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'both' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                Vue Double (Client + Cuisine)
              </button>
              <button
                onClick={() => setActiveTab('client')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'client' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                📱 Vue Smartphone Client
              </button>
              <button
                onClick={() => setActiveTab('kitchen')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'kitchen' ? 'bg-white text-gray-900 shadow-xs' : 'hover:text-gray-900'
                }`}
              >
                👨‍🍳 Vue Écran Cuisine KDS
              </button>
            </div>
          </div>
        </div>

        {/* Global Live Notification Banner when order is placed */}
        {recentNotification && (
          <div className="mt-6 max-w-2xl mx-auto bg-gradient-to-r from-[#FF6B00] to-[#E05E00] text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-xs sm:text-sm">{recentNotification}</span>
            </div>
            <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded font-mono">Temps réel ⚡</span>
          </div>
        )}

        {/* Simulator Workspace Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Smartphone Client Simulator */}
          {(activeTab === 'both' || activeTab === 'client') && (
            <div className={`${activeTab === 'both' ? 'lg:col-span-6' : 'lg:col-span-8 lg:col-start-3'} flex flex-col items-center`}>
              
              <div className="w-full max-w-[420px] bg-white rounded-3xl border-2 border-gray-200 shadow-2xl overflow-hidden flex flex-col">
                
                {/* Simulated App Header */}
                <div className="bg-[#00A86B] text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100">
                        Restaurant Démo
                      </span>
                      <h4 className="font-heading font-extrabold text-base">Chez Fatou & Frères</h4>
                    </div>

                    {/* Interactive Table Picker */}
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-xl">
                      <QrCode className="w-3.5 h-3.5 text-white" />
                      <label className="text-[11px] font-bold text-white">Table :</label>
                      <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(Number(e.target.value))}
                        className="bg-transparent text-white font-black text-xs focus:outline-none cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map((num) => (
                          <option key={num} value={num} className="text-gray-900">
                            #{num}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className="text-[11px] text-emerald-100 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse inline-block" />
                    Scanné à la table #{selectedTable} • Menu du jour disponible
                  </p>
                </div>

                {/* Stock Rupture 1-Click Management Feature Showcase */}
                <div className="bg-amber-50 px-3 py-2 border-b border-amber-200 flex items-center justify-between text-[11px] text-amber-900">
                  <span className="flex items-center gap-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Testez la gestion des ruptures en 1 clic :
                  </span>
                </div>

                {/* Interactive Menu Dish List */}
                <div className="p-3 space-y-2.5 max-h-[380px] overflow-y-auto bg-gray-50/50">
                  {menuItems.map((item) => {
                    const quantityInCart = cart[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-2xl border transition-all ${
                          !item.isAvailable
                            ? 'bg-gray-100/80 border-gray-200 opacity-60'
                            : 'bg-white border-gray-200/90 shadow-xs hover:border-[#00A86B]/40'
                        }`}
                      >
                        <div className="flex gap-2.5 items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-xs text-gray-900 truncate">{item.name}</h5>
                              {!item.isAvailable && (
                                <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                                  Rupture
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[10px] text-gray-500 line-clamp-1">{item.description}</p>
                            
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-xs font-black text-[#FF6B00]">
                                {item.price.toLocaleString('fr-FR')} FCFA
                              </span>

                              {/* Action buttons: toggle rupture + add to cart */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleStock(item.id)}
                                  className="text-[9px] text-gray-500 hover:text-amber-700 underline font-medium cursor-pointer"
                                  title="Simuler rupture de stock"
                                >
                                  {item.isAvailable ? 'Mettre en rupture' : 'Remettre en stock'}
                                </button>

                                {item.isAvailable && (
                                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                                    {quantityInCart > 0 && (
                                      <>
                                        <button
                                          onClick={() => handleRemoveFromCart(item.id)}
                                          className="p-1 hover:bg-gray-200 rounded text-gray-700"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="text-xs font-bold px-1">{quantityInCart}</span>
                                      </>
                                    )}
                                    <button
                                      onClick={() => handleAddToCart(item.id)}
                                      className="p-1 bg-[#00A86B] hover:bg-[#00925d] text-white rounded font-bold"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart & Send to Kitchen Button */}
                <div className="p-4 bg-white border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">
                      Panier (Table #{selectedTable}) : <strong>{cartItemCount} article(s)</strong>
                    </span>
                    <span className="font-heading font-black text-sm text-gray-900">
                      Total: {cartTotal.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <button
                    id="demo-send-order-btn"
                    onClick={handleSendOrder}
                    disabled={cartItemCount === 0}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
                      cartItemCount > 0
                        ? 'bg-[#00A86B] hover:bg-[#00925d] active:scale-98 text-white cursor-pointer shadow-[#00A86B]/30'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer la commande en Cuisine 🚀</span>
                  </button>

                  <p className="text-[10px] text-center text-gray-500">
                    💡 La commande part instantanément sans passer par un carnet papier.
                  </p>
                </div>

              </div>
              
              <span className="mt-3 text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#00A86B]" />
                Vue smartphone du client assis à la table
              </span>
            </div>
          )}

          {/* RIGHT: Kitchen Screen (KDS) Live View */}
          {(activeTab === 'both' || activeTab === 'kitchen') && (
            <div className={`${activeTab === 'both' ? 'lg:col-span-6' : 'lg:col-span-8 lg:col-start-3'} flex flex-col items-center`}>
              
              <div className="w-full bg-[#1A1A1A] rounded-3xl border-2 border-gray-800 shadow-2xl p-4 sm:p-6 text-white flex flex-col min-h-[560px]">
                
                {/* Kitchen Screen Top Bar */}
                <div className="flex flex-wrap items-center justify-between pb-4 mb-4 border-b border-gray-800 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-[#FF6B00]">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-extrabold text-sm sm:text-base">
                        Écran Cuisine en Direct (KDS)
                      </h4>
                      <p className="text-[10px] text-gray-400">Poste Cuisson & Grillades • Synchronisation 100%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      {liveOrders.filter(o => o.status !== 'servi').length} en cours
                    </span>
                  </div>
                </div>

                {/* Orders List Container */}
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[400px] pr-1">
                  {liveOrders.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 text-sm">
                      Aucune commande en attente. Passez une commande à gauche !
                    </div>
                  ) : (
                    liveOrders.map((order) => {
                      const isNew = order.status === 'nouveau';
                      const isCooking = order.status === 'en_preparation';
                      const isReady = order.status === 'pret';
                      const isServed = order.status === 'servi';

                      return (
                        <div
                          key={order.id}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            isNew
                              ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                              : isCooking
                              ? 'bg-blue-950/40 border-blue-500/50'
                              : isReady
                              ? 'bg-emerald-950/40 border-emerald-500/60'
                              : 'bg-gray-900/60 border-gray-800 opacity-60'
                          }`}
                        >
                          {/* Order Card Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs px-2 py-0.5 rounded-md bg-white text-gray-900">
                                TABLE #{order.tableNumber}
                              </span>
                              <span className="text-[11px] font-mono text-gray-400">
                                {order.id}
                              </span>
                            </div>

                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#FF6B00]" />
                              {order.timestamp}
                            </span>
                          </div>

                          {/* Items Ordered List */}
                          <div className="space-y-1 my-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs text-gray-200">
                                <span className="font-semibold">
                                  {item.quantity}x {item.name}
                                </span>
                                {item.notes && (
                                  <span className="text-[10px] text-amber-300 italic">
                                    ({item.notes})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Total & Action Status Button */}
                          <div className="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-300">
                              {order.totalAmount.toLocaleString('fr-FR')} FCFA
                            </span>

                            {!isServed ? (
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, order.status)}
                                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                                  isNew
                                    ? 'bg-amber-500 hover:bg-amber-600 text-black'
                                    : isCooking
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-[#00A86B] hover:bg-[#00925d] text-white'
                                }`}
                              >
                                {isNew && <span>👨‍🍳 Passer en Préparation</span>}
                                {isCooking && <span>🍽️ Marquer comme Prêt</span>}
                                {isReady && <span>✓ Marquer comme Servi</span>}
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                Commande servie
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Kitchen Tips Footer */}
                <div className="mt-4 pt-3 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Fonctionne sur tablette Android, iPad ou PC</span>
                  <span className="text-emerald-400 font-bold">Zéro papier perdu 🍃</span>
                </div>

              </div>

              <span className="mt-3 text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-[#FF6B00]" />
                Écran installé en cuisine pour les cuisiniers & serveurs
              </span>
            </div>
          )}

        </div>

        {/* Value Proposition Callout under Demo */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-emerald-50 border border-emerald-200 px-6 py-4 rounded-2xl text-emerald-950">
            <span className="font-bold text-sm">
              ✨ Convaincu par la rapidité ? Nous configurons votre vrai menu en 24h chrono.
            </span>
            <a
              href="#contact"
              className="bg-[#00A86B] hover:bg-[#008957] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
            >
              Demander mon installation
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
