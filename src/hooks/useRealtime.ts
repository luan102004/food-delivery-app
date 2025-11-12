'use client';

import { useEffect, useState } from 'react';
import { pusherClient } from '@/lib/pusher';

export function useOrderTracking(orderNumber: string) {
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const channel = pusherClient.subscribe(`order-${orderNumber}`);

    channel.bind('order-updated', (data: any) => {
      setOrderData(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [orderNumber]);

  return orderData;
}

export function useDriverLocation(driverId: string) {
  const [location, setLocation] = useState<any>(null);

  useEffect(() => {
    if (!driverId) return;

    const channel = pusherClient.subscribe(`driver-${driverId}`);

    channel.bind('location-updated', (data: any) => {
      setLocation(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [driverId]);

  return location;
}