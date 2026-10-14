import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Pin en forme de goutte, ancré par sa pointe sur le point choisi
function pinIcon(color) {
  return L.divIcon({
    className: '',
    html: `<svg width="34" height="46" viewBox="0 0 34 46" style="display:block;filter:drop-shadow(0 3px 4px rgba(30,27,22,0.45))">
      <path d="M17 2C8.7 2 2 8.6 2 16.8 2 28 17 44 17 44s15-16 15-27.2C32 8.6 25.3 2 17 2z" fill="${color}" stroke="#F4EEE3" stroke-width="3"/>
      <circle cx="17" cy="17" r="6" fill="#F4EEE3"/>
    </svg>`,
    iconSize: [34, 46],
    iconAnchor: [17, 44]
  });
}

// Mire de relevé : le site réel
const reticleIcon = L.divIcon({
  className: '',
  html: `<svg width="34" height="34" viewBox="0 0 34 34" style="display:block;overflow:visible">
    <circle cx="17" cy="17" r="9" fill="rgba(244,238,227,0.6)" stroke="#1E1B16" stroke-width="2"/>
    <circle cx="17" cy="17" r="2.5" fill="#A8431C"/>
    <path d="M17 0v8M17 26v8M0 17h8M26 17h8" stroke="#1E1B16" stroke-width="2"/>
  </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

/**
 * Carte Leaflet du téléphone.
 * - marker + onMapClick : l'équipe pose son point
 * - target : mode résultat, avec le site réel et un tiret jusqu'au point, carte cadrée sur les deux
 */
export function MapLeaflet({
  marker,
  onMapClick,
  height = '100%',
  markerColor = '#2F5C78',
  target = null,
  targetZoom = 5,
  interactive = true
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markerRef = useRef(null);
  const targetLayerRef = useRef(null);

  // Initialiser la carte
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxBoundsViscosity: 1.0,
      maxBounds: [[-85, -180], [85, 180]],
      zoomControl: interactive,
      attributionControl: true,
      // Carte de situation figée (fiche d'impact)
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive
    });

    map.attributionControl.setPrefix(false);

    // Carte topographique : relief et courbes de niveau, passée au sépia par .leaflet-tile-pane
    L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      subdomains: 'abc',
      attribution: '&copy; OpenTopoMap, &copy; OpenStreetMap'
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

  // Mode résultat : site réel, tiret jusqu'au point, cadrage
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (targetLayerRef.current) {
      map.removeLayer(targetLayerRef.current);
      targetLayerRef.current = null;
    }
    if (!target) return;

    // Mesurer le conteneur avant de cadrer, sinon Leaflet cadre sur une taille provisoire
    map.invalidateSize();
    const layer = L.layerGroup().addTo(map);
    L.marker([target.lat, target.lng], { icon: reticleIcon, interactive: false }).addTo(layer);
    if (marker) {
      L.polyline([[marker.lat, marker.lng], [target.lat, target.lng]], {
        color: '#1E1B16', weight: 1.5, dashArray: '4 5', interactive: false
      }).addTo(layer);
      map.fitBounds([[marker.lat, marker.lng], [target.lat, target.lng]], { padding: [48, 48], maxZoom: 7 });
    } else {
      map.setView([target.lat, target.lng], targetZoom);
    }
    targetLayerRef.current = layer;
  }, [target, marker, targetZoom]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', touchAction: 'none' }}
    />
  );
}

export default MapLeaflet;
