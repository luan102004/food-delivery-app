'use client';

import { useState, useEffect } from 'react';
import GoogleMap from './GoogleMap';
import { useDriverLocation } from '@/hooks/useRealtime';

interface RealtimeTrackerProps {
  orderId: string;
  restaurantLocation: { lat: number; lng: number };
  deliveryLocation: { lat: number; lng: number };
  driverId?: string;
}

export default function RealtimeTracker({
  orderId,
  restaurantLocation,
  deliveryLocation,
  driverId,
}: RealtimeTrackerProps) {
  const driverLocation = useDriverLocation(driverId || '');
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    const newMarkers = [
      {
        position: restaurantLocation,
        title: 'Restaurant',
        icon: '/icons/restaurant-marker.png',
      },
      {
        position: deliveryLocation,
        title: 'Delivery Location',
        icon: '/icons/home-marker.png',
      },
    ];

    if (driverLocation?.coordinates) {
      newMarkers.push({
        position: {
          lat: driverLocation.coordinates[1],
          lng: driverLocation.coordinates[0],
        },
        title: 'Driver',
        icon: '/icons/driver-marker.png',
      });
    }

    setMarkers(newMarkers);
  }, [restaurantLocation, deliveryLocation, driverLocation]);

  const center = driverLocation?.coordinates
    ? { lat: driverLocation.coordinates[1], lng: driverLocation.coordinates[0] }
    : restaurantLocation;

  return (
    <div className="w-full h-96">
      <GoogleMap center={center} zoom={14} markers={markers} />
    </div>
  );
}