'use client';

import React from 'react';
import { ClientMenuContainer } from '@/components/client-menu';
import { RestaurantType, SpaceType, DestinationService } from '@/types';

interface ClientMenuViewProps {
  initialRestaurant: RestaurantType;
  tableNumber: number;
  isExpress?: boolean;
  orderContext?: {
    waiterId?: string;
    waiterName?: string;
    zoneId?: string;
    locationDetail?: string;
    spaceType?: SpaceType;
    destinationService?: DestinationService;
  };
}

export const ClientMenuView: React.FC<ClientMenuViewProps> = ({
  initialRestaurant,
  tableNumber,
  isExpress = false,
  orderContext,
}) => {
  return (
    <ClientMenuContainer
      initialRestaurant={initialRestaurant}
      tableNumber={tableNumber}
      isExpress={isExpress}
      orderContext={orderContext}
    />
  );
};

