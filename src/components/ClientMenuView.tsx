'use client';

import React from 'react';
import { ClientMenuContainer } from '@/components/client-menu';
import { RestaurantType } from '@/types';

interface ClientMenuViewProps {
  initialRestaurant: RestaurantType;
  tableNumber: number;
}

export const ClientMenuView: React.FC<ClientMenuViewProps> = ({
  initialRestaurant,
  tableNumber,
}) => {
  return (
    <ClientMenuContainer
      initialRestaurant={initialRestaurant}
      tableNumber={tableNumber}
    />
  );
};

