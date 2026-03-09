import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapContext } from '../contexts/MapContext';

// Fix pour les icones Leaflet avec Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icones SVG par categorie
const CATEGORY_ICONS = {
  extraction: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  production: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l4.59-4.58L18 11l-6 6z"/></svg>`,
  datacenter: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M4 1h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2zm0 8h16c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-4c0-1.1.9-2 2-2zm0 8h16c1.1 0 2 .9 2 2v2c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2z"/></svg>`,
  dechets: `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`
};

// Creer une icone coloree avec point central precis
function createColoredIcon(color, category = null, isHistorical = false) {
  const icon = category && CATEGORY_ICONS[category]
    ? CATEGORY_ICONS[category]
    : '';

  const size = isHistorical ? 16 : 20;
  const centerSize = Math.max(4, Math.round(size * 0.35));
  const opacity = isHistorical ? 0.7 : 1;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
      opacity: ${opacity};
    ">
      <div style="
        position: absolute;
        inset: 0;
        background-color: ${color}40;
        border-radius: 50%;
        border: 2px solid ${color};
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        ${isHistorical ? 'filter: saturate(0.7);' : ''}
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${centerSize}px;
        height: ${centerSize}px;
        background-color: white;
        border-radius: 50%;
        border: 1px solid ${color};
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

// Creer une icone cible avec point central precis
function createTargetIcon(color) {
  const size = 24;
  const centerSize = 6;
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      position: relative;
      width: ${size}px;
      height: ${size}px;
    ">
      <div style="
        position: absolute;
        inset: 0;
        background-color: ${color}40;
        border-radius: 50%;
        border: 2px solid ${color};
        box-shadow: 0 0 0 3px ${color}30, 0 2px 8px rgba(0,0,0,0.4);
        animation: pulse 2s infinite;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: ${centerSize}px;
        height: ${centerSize}px;
        background-color: white;
        border-radius: 50%;
        border: 1px solid ${color};
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    </div>
    <style>
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
    </style>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

// Composant pour gerer les clics sur la carte
function ClickHandler({ onClick, disabled }) {
  useMapEvents({
    click: (e) => {
      if (!disabled && onClick) {
        onClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Composant pour gérer la vue et sauvegarder l'état
function MapController({ center, zoom, preserveView }) {
  const map = useMap();
  const { mapRef, updateView, mapView } = useMapContext();

  // Enregistrer la référence de la carte
  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);

  // Sauvegarder la position quand l'utilisateur bouge la carte
  useEffect(() => {
    const handleMoveEnd = () => {
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      updateView([currentCenter.lat, currentCenter.lng], currentZoom);
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, updateView]);

  // Appliquer la vue initiale seulement si on ne préserve pas
  useEffect(() => {
    if (!preserveView && center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map, preserveView]);

  return null;
}

// Couleurs pour les groupes
const GROUP_COLORS = [
  '#3b82f6', // bleu
  '#ef4444', // rouge
  '#10b981', // vert
  '#f59e0b', // orange
  '#8b5cf6', // violet
  '#ec4899', // rose
  '#06b6d4', // cyan
  '#84cc16'  // lime
];

// URLs des tuiles
const TILE_LAYERS = {
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri'
  }
};

// Barre de recherche de pays
function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const { searchAndFlyTo } = useMapContext();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    const result = await searchAndFlyTo(query);

    if (!result.success) {
      setError(result.error);
      setTimeout(() => setError(null), 3000);
    } else {
      setQuery('');
    }
    setIsSearching(false);
  };

  return (
    <form onSubmit={handleSearch} className="absolute bottom-4 left-4 z-[1000] flex gap-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un lieu..."
          className="w-56 px-4 py-2 bg-white/95 backdrop-blur-sm text-slate-700 placeholder-slate-400 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-500 shadow-lg text-sm"
        />
        {error && (
          <div className="absolute bottom-full left-0 mb-1 px-3 py-1 bg-red-600/90 text-white text-sm rounded-lg whitespace-nowrap">
            {error}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={isSearching}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:scale-100"
      >
        {isSearching ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </button>
    </form>
  );
}

export function GameMap({
  markers = [],
  historicalMarkers = [],
  targetZone = null,
  onMapClick = null,
  clickDisabled = false,
  showTarget = false,
  showDistanceLines = false,
  center = [20, 0],
  zoom = 2,
  height = '100%',
  allowSatellite = false,
  showHistorical = true,
  showSearch = false,
  preserveView = true
}) {
  const [isSatellite, setIsSatellite] = useState(false);
  const tileLayer = isSatellite ? TILE_LAYERS.satellite : TILE_LAYERS.standard;
  const { mapView } = useMapContext();

  // Utiliser la vue sauvegardée si preserveView est true
  const initialCenter = preserveView ? mapView.center : center;
  const initialZoom = preserveView ? mapView.zoom : zoom;

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
      >
        <TileLayer
          key={isSatellite ? 'satellite' : 'standard'}
          attribution={tileLayer.attribution}
          url={tileLayer.url}
        />

        <ClickHandler onClick={onMapClick} disabled={clickDisabled} />
        <MapController center={center} zoom={zoom} preserveView={preserveView} />

        {/* Lignes de distance entre marqueurs et cible - fines et discrètes */}
        {showDistanceLines && showTarget && targetZone && markers.map((marker, index) => (
          <Polyline
            key={`line-${marker.groupName}-${index}`}
            positions={[
              [marker.lat, marker.lng],
              [targetZone.lat, targetZone.lng]
            ]}
            pathOptions={{
              color: marker.color || GROUP_COLORS[index % GROUP_COLORS.length],
              weight: 1,
              opacity: 0.5,
              dashArray: '6, 4'
            }}
          />
        ))}

        {/* Zone cible */}
        {showTarget && targetZone && (
          <>
            <Circle
              center={[targetZone.lat, targetZone.lng]}
              radius={targetZone.radius * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '5, 5'
              }}
            />
            <Marker
              position={[targetZone.lat, targetZone.lng]}
              icon={createTargetIcon('#10b981')}
            >
              <Popup>
                <div className="font-bold text-emerald-600">{targetZone.name}</div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Marqueurs historiques (questions precedentes) */}
        {showHistorical && historicalMarkers.map((marker, index) => (
          <Marker
            key={`historical-${marker.groupName}-${marker.questionId}-${index}`}
            position={[marker.lat, marker.lng]}
            icon={createColoredIcon(
              marker.color || GROUP_COLORS[index % GROUP_COLORS.length],
              marker.category,
              true // isHistorical
            )}
          >
            <Popup>
              <div className="text-sm">
                <div className="text-emerald-600 font-bold mb-1">Q{marker.questionIndex}</div>
                <strong>{marker.groupName}</strong>
                {marker.questionName && (
                  <div className="text-gray-600 text-xs">{marker.questionName}</div>
                )}
                {marker.distance !== undefined && (
                  <div>{marker.distance} km</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Marqueurs des groupes (question actuelle) */}
        {markers.map((marker, index) => (
          <Marker
            key={`${marker.groupName}-${marker.questionId || index}`}
            position={[marker.lat, marker.lng]}
            icon={createColoredIcon(
              marker.color || GROUP_COLORS[index % GROUP_COLORS.length],
              marker.category,
              false // not historical
            )}
          >
            <Popup>
              <div className="text-sm">
                <strong>{marker.groupName}</strong>
                {marker.distance !== undefined && (
                  <div>{marker.distance} km</div>
                )}
                {marker.points !== undefined && (
                  <div>{marker.points} pts</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Barre de recherche */}
      {showSearch && <SearchBar />}

      {/* Toggle satellite */}
      {allowSatellite && (
        <button
          onClick={() => setIsSatellite(!isSatellite)}
          className="absolute bottom-4 right-4 z-[1000] px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-xl shadow-lg border border-slate-300 transition-all duration-200 hover:scale-105"
        >
          {isSatellite ? 'Vue carte' : 'Vue satellite'}
        </button>
      )}
    </div>
  );
}

export { GROUP_COLORS, CATEGORY_ICONS };
export default GameMap;
