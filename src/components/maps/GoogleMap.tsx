'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{
    position: { lat: number; lng: number };
    title: string;
    icon?: string;
  }>;
  onMapLoad?: (map: google.maps.Map) => void;
}

export default function GoogleMap({
  center,
  zoom = 14,
  markers = [],
  onMapLoad,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
    });

    loader.load().then(() => {
      if (mapRef.current && !map) {
        const newMap = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        setMap(newMap);
        onMapLoad?.(newMap);
      }
    });
  }, []);

  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    mapMarkers.forEach((marker) => marker.setMap(null));

    // Add new markers
    const newMarkers = markers.map((marker) => {
      const mapMarker = new google.maps.Marker({
        position: marker.position,
        map,
        title: marker.title,
        icon: marker.icon
          ? {
              url: marker.icon,
              scaledSize: new google.maps.Size(40, 40),
            }
          : undefined,
      });

      return mapMarker;
    });

    setMapMarkers(newMarkers);

    // Adjust bounds if multiple markers
    if (markers.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      markers.forEach((marker) => {
        bounds.extend(marker.position);
      });
      map.fitBounds(bounds);
    } else if (markers.length === 1) {
      map.setCenter(markers[0].position);
    }
  }, [map, markers]);

  return <div ref={mapRef} className="w-full h-full rounded-lg" />;
}