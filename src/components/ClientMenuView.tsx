'use client';

import React from 'react';
import { ClientMenuContainer } from '@/components/client-menu';
import { RestaurantType } from '@/types';

interface ClientMenuViewProps {
  initialRestaurant: RestaurantType;
  tableNumber: number;
  isExpress?: boolean;
}

export const ClientMenuView: React.FC<ClientMenuViewProps> = ({
  initialRestaurant,
  tableNumber,
  isExpress = false,
}) => {
  return (
    <ClientMenuContainer
      initialRestaurant={initialRestaurant}
      tableNumber={tableNumber}
      isExpress={isExpress}
    />
  );
};

