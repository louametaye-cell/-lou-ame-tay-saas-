'use client';

import React, { useMemo } from 'react';
import { ChefHat, Sparkles, CheckCircle } from 'lucide-react';
import { OrderType, OrderStatus } from '@/types';
import { OrderTicketCard } from './OrderTicketCard';
import { KitchenFilter } from './KitchenHeader';

interface OrderTicketGridProps {
  orders: OrderType[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  restaurantName?: string;
  activeFilter: KitchenFilter;
}

export const OrderTicketGrid: React.FC<OrderTicketGridProps> = ({
  orders,
  onUpdateStatus,
  restaurantName,
  activeFilter,
}) => {
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Exclude cancelled orders
        if (order.status === 'CANCELLED') return false;

        if (activeFilter === 'PENDING') return order.status === 'PENDING';
        if (activeFilter === 'PREPARING') return order.status === 'PREPARING';

        if (activeFilter === 'URGENT') {
          const diffMs = Date.now() - new Date(order.createdAt).getTime();
          const minutes = diffMs / (1000 * 60);
          return minutes >= 15 && order.status !== 'SERVED';
        }

        if (activeFilter === 'DRINKS') {
          return order.items.some((i) => {
            const itemName = (i.name || i.menuItem?.name || '').toLowerCase();
            const catId = (i.menuItem?.categoryId || '').toLowerCase();
            return (
              catId.includes('boisson') ||
              itemName.includes('bissap') ||
              itemName.includes('bouye') ||
              itemName.includes('eau') ||
              itemName.includes('jus') ||
              itemName.includes('coca')
            );
          });
        }

        // 'ALL' filter: show pending and preparing orders
        return order.status === 'PENDING' || order.status === 'PREPARING';
      })
      .sort((a, b) => {
        // PENDING first, then by oldest createdAt
        if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
        if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
  }, [orders, activeFilter]);

  if (filteredOrders.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-800 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">
            Tout est prêt en cuisine ! 👨‍🍳
          </h3>
          <p className="text-sm text-slate-400">
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
