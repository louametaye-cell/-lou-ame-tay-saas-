'use client';

import React, { useMemo } from 'react';
import { ChefHat, CheckCircle } from 'lucide-react';
import { OrderType, OrderStatus } from '@/types';
import { OrderTicketCard } from './OrderTicketCard';
import { KitchenFilter } from './KitchenHeader';
import { isKitchenDish } from '@/lib/order-routing';

interface OrderTicketGridProps {
  orders: OrderType[];
  recentlyCancelledOrders?: OrderType[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  restaurantName?: string;
  activeFilter: KitchenFilter;
}

export const OrderTicketGrid: React.FC<OrderTicketGridProps> = ({
  orders,
  recentlyCancelledOrders = [],
  onUpdateStatus,
  restaurantName,
  activeFilter,
}) => {
  const filteredOrders = useMemo(() => {
    const liveOrders = orders
      .filter((order) => {
        // Exclude cancelled orders
        if (order.status === 'CANCELLED') return false;

        // La cuisine KDS ne traite que les commandes contenant au moins un plat de cuisson/cuisine
        const hasKitchenDishes = order.items && order.items.length > 0
          ? order.items.some(isKitchenDish)
          : true;
        if (!hasKitchenDishes) return false;

        if (activeFilter === 'PENDING') return order.status === 'PENDING';
        if (activeFilter === 'PREPARING') return order.status === 'PREPARING';
        if (activeFilter === 'READY') return order.status === 'READY';

        if (activeFilter === 'URGENT') {
          const diffMs = Date.now() - new Date(order.createdAt).getTime();
          const minutes = diffMs / (1000 * 60);
          return minutes >= 15 && order.status !== 'SERVED';
        }

        // 'ALL' filter: show pending, preparing and ready orders
        return order.status === 'PENDING' || order.status === 'PREPARING' || order.status === 'READY';
      });

    // Si une commande était affichée et vient d'être annulée, on l'affiche avec son badge rouge d'alerte
    const cancelledVisible = recentlyCancelledOrders.filter((c) => {
      if (activeFilter === 'PREPARING' || activeFilter === 'READY') return false;
      return true;
    });

    return [...cancelledVisible, ...liveOrders].sort((a, b) => {
      // Les commandes récemment annulées en premier pour alerte visuelle immédiate
      if (a.status === 'CANCELLED' && b.status !== 'CANCELLED') return -1;
      if (b.status === 'CANCELLED' && a.status !== 'CANCELLED') return 1;
      // PENDING first, then by oldest createdAt
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [orders, recentlyCancelledOrders, activeFilter]);

  if (filteredOrders.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900">
            Tout est prêt en cuisine ! 👨‍🍳
          </h3>
          <p className="text-sm text-slate-500">
            {activeFilter === 'ALL'
              ? 'Aucune commande en attente. Les nouveaux tickets apparaîtront instantanément ici.'
              : `Aucune commande correspondant au filtre sélectionné.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {filteredOrders.map((order) => (
        <OrderTicketCard
          key={order.id}
          order={order}
          onUpdateStatus={onUpdateStatus}
          restaurantName={restaurantName}
        />
      ))}
    </div>
  );
};