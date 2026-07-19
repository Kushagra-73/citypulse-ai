'use client';

import { useState, useCallback } from 'react';

interface Coordinates {
  latitude: number;
  longitude: number;
  address: string;
}

export function useGeolocation() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'CityPulse-AI-Civic-Reporter',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error('Nominatim reverse geocoding failed:', err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const getCoordinates = useCallback(async (): Promise<Coordinates | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const address = await getAddressFromCoords(latitude, longitude);
          
          const newCoords = { latitude, longitude, address };
          setCoordinates(newCoords);
          setLoading(false);
          resolve(newCoords);
        },
        (err) => {
          let errMsg = 'Failed to retrieve location.';
          if (err.code === err.PERMISSION_DENIED) {
            errMsg = 'Location access was denied. Please select location manually on the map.';
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errMsg = 'Location information is unavailable.';
          } else if (err.code === err.TIMEOUT) {
            errMsg = 'Request to retrieve location timed out.';
          }
          setError(errMsg);
          setLoading(false);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return {
    coordinates,
    loading,
    error,
    getCoordinates,
  };
}
