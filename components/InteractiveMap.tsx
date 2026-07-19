'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { CivicReport } from '@/types';

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  address?: string;
  zoom?: number;
  readOnly?: boolean;
  issues?: CivicReport[];
  onChange?: (lat: number, lng: number, address: string) => void;
  onIssueClick?: (issue: CivicReport) => void;
}

export default function InteractiveMap({
  latitude,
  longitude,
  address = '',
  zoom = 13,
  readOnly = false,
  issues = [],
  onChange,
  onIssueClick
}: InteractiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mainMarkerRef = useRef<L.Marker | null>(null);
  const issueMarkersRef = useRef<L.Marker[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);

  // Helper to reverse geocode coordinate to address
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      setAddressLoading(true);
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
        return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch (err) {
      console.error(err);
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } finally {
      setAddressLoading(false);
    }
  };

  // Initializing Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [latitude, longitude],
      zoom: zoom,
      zoomControl: true,
      attributionControl: false
    });

    mapRef.current = map;

    // Add OpenStreetMap TileLayer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // Create Main Pin (Issue Reporter Marker or Current Location Indicator)
    const primaryIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center h-8 w-8">
          <span class="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-indigo-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-indigo-600 border-2 border-white shadow-lg"></span>
        </div>
      `,
      className: 'custom-pin-primary',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    const marker = L.marker([latitude, longitude], {
      icon: primaryIcon,
      draggable: !readOnly
    }).addTo(map);

    mainMarkerRef.current = marker;

    if (!readOnly && onChange) {
      // Listen to Marker drag events
      marker.on('dragend', async () => {
        const position = marker.getLatLng();
        const addr = await fetchAddress(position.lat, position.lng);
        onChange(position.lat, position.lng, addr);
      });

      // Listen to click on Map to snap marker location
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        const addr = await fetchAddress(lat, lng);
        onChange(lat, lng, addr);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Main Marker Position when props change (e.g., GPS trigger)
  useEffect(() => {
    if (mapRef.current && mainMarkerRef.current) {
      mainMarkerRef.current.setLatLng([latitude, longitude]);
      mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
    }
  }, [latitude, longitude]);

  // Handle Civic Issue Pins Rendering (Dashboard & Community feeds)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous issue markers
    issueMarkersRef.current.forEach(m => m.remove());
    issueMarkersRef.current = [];

    // Add markers for all nearby issues
    issues.forEach(issue => {
      // Determine colors based on severity
      let colorClass = 'bg-emerald-500';
      let ringClass = 'bg-emerald-400';
      if (issue.severity === 'Medium') {
        colorClass = 'bg-amber-500';
        ringClass = 'bg-amber-400';
      } else if (issue.severity === 'High') {
        colorClass = 'bg-red-500';
        ringClass = 'bg-red-400';
      } else if (issue.severity === 'Critical') {
        colorClass = 'bg-rose-600 animate-pulse';
        ringClass = 'bg-rose-400';
      }

      const issueIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center h-8 w-8">
            <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full ${ringClass} opacity-60"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${colorClass} border-2 border-white shadow-md"></span>
          </div>
        `,
        className: 'custom-pin-issue',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const m = L.marker([issue.latitude, issue.longitude], {
        icon: issueIcon
      }).addTo(map);

      // Setup Popup
      const popupContent = `
        <div class="p-1">
          <h4 class="font-heading font-bold text-xs text-foreground leading-tight">${issue.title}</h4>
          <div class="flex items-center gap-1.5 mt-1.5">
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-input text-muted-foreground">${issue.category}</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">${issue.severity}</span>
          </div>
          <p class="text-[10px] text-muted-foreground truncate max-w-[180px] mt-1">${issue.address}</p>
        </div>
      `;

      m.bindPopup(popupContent);

      m.on('click', () => {
        if (onIssueClick) {
          onIssueClick(issue);
        }
      });

      issueMarkersRef.current.push(m);
    });

  }, [issues, onIssueClick]);

  return (
    <div className="relative h-full w-full rounded-2xl overflow-hidden border border-card-border shadow-inner">
      <div ref={mapContainerRef} className="h-full w-full" style={{ minHeight: '300px' }} />
      {addressLoading && (
        <div className="absolute bottom-4 left-4 bg-card/90 border border-card-border backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md z-[1000] text-xs flex items-center gap-2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span>Locating Address...</span>
        </div>
      )}
    </div>
  );
}
