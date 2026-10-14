import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Pin en forme de goutte, ancré par sa pointe sur le point choisi
function pinIcon(color) {
  return L.divIcon({
    className: '',
    html: `<svg width="34" height="46" viewBox="0 0 34 46" style="display:block;filter:drop-shadow(0 3px 4px rgba(15,23,42,0.45))">
      <path d="M17 2C8.7 2 2 8.6 2 16.8 2 28 17 44 17 44s15-16 15-27.2C32 8.6 25.3 2 17 2z" fill="${color}" stroke="#ffffff" stroke-width="3"/>
      <circle cx="17" cy="17" r="6" fill="#ffffff"/>
    </svg>`,
    iconSize: [34, 46],
    iconAnchor: [17, 44]
  });
}

export function MapLeaflet({ marker, onMapClick, height = '100%', markerColor = '#0D9488' }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markerRef = useRef(null);

  // Initialiser la carte
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxBoundsViscosity: 1.0,
      maxBounds: [[-85, -180], [85, 180]],
      zoomControl: true,
      attributionControl: true
    });

    map.attributionControl.setPrefix(false);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    mapRef.current = map;

    // Forcer un resize après le montage
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Mettre à jour le marqueur
  useEffect(() => {
    if (!mapRef.current) return;

    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }

    if (marker) {
      markerRef.current = L.marker([marker.lat, marker.lng], { icon: pinIcon(markerColor) }).addTo(mapRef.current);
    }
  }, [marker, markerColor]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', touchAction: 'none' }}
    />
  );
}

export default MapLeaflet;
