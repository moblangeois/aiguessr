import { useEffect, useState, useCallback, useRef, useMemo, useLayoutEffect } from 'react';
import Globe from 'react-globe.gl';
import { useMapContext } from '../contexts/MapContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../i18n/I18nContext';

// URLs des tuiles dynamiques (zoom infini haute résolution)
const TILE_PROVIDERS = {
  // ESRI World Imagery - satellite haute résolution
  esri: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  // OpenStreetMap - carte standard
  osm: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  // Fond étoilé
  background: 'https://unpkg.com/three-globe@2.31.1/example/img/night-sky.png'
};

// URL du GeoJSON des pays (Natural Earth)
const COUNTRIES_GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

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

// Icones SVG par categorie (pour les labels)
const CATEGORY_ICONS = {
  extraction: 'M',  // Mine
  production: 'P',  // Production
  datacenter: 'D',  // Datacenter
  dechets: 'R'      // Recyclage
};

// Convertir lat/lng en position de camera (altitude)
function getAltitudeFromZoom(zoom) {
  // Zoom Leaflet: 2 = monde entier, 18 = rue
  // Altitude Globe: 2.5 = très loin, 0.1 = très proche
  const altitudes = {
    1: 3.5,
    2: 2.5,
    3: 1.8,
    4: 1.2,
    5: 0.8,
    6: 0.5,
    7: 0.35,
    8: 0.25,
    9: 0.18,
    10: 0.12,
    11: 0.08,
    12: 0.05,
    13: 0.03,
    14: 0.02,
    15: 0.015,
    16: 0.01,
    17: 0.007,
    18: 0.005
  };
  return altitudes[Math.min(Math.max(zoom, 1), 18)] || 2.5;
}

function getZoomFromAltitude(altitude) {
  if (altitude > 3) return 1;
  if (altitude > 2) return 2;
  if (altitude > 1.5) return 3;
  if (altitude > 1) return 4;
  if (altitude > 0.6) return 5;
  if (altitude > 0.4) return 6;
  if (altitude > 0.3) return 7;
  if (altitude > 0.2) return 8;
  if (altitude > 0.15) return 9;
  if (altitude > 0.1) return 10;
  if (altitude > 0.06) return 11;
  if (altitude > 0.04) return 12;
  if (altitude > 0.025) return 13;
  if (altitude > 0.015) return 14;
  if (altitude > 0.012) return 15;
  if (altitude > 0.008) return 16;
  if (altitude > 0.006) return 17;
  return 18;
}

// Barre de recherche
function SearchBar() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const { searchAndFlyTo } = useMapContext();
  const { t } = useTranslation();

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
          placeholder={t('globe.searchPlaceholder')}
          className="w-56 px-4 py-2 bg-surface-1/95 backdrop-blur-sm text-text-primary placeholder-text-muted rounded-xl border border-border focus:outline-none focus:border-accent shadow-lg text-sm"
        />
        {error && (
          <div className="absolute bottom-full left-0 mb-1 px-3 py-1 bg-danger/90 text-white text-sm rounded-lg whitespace-nowrap">
            {error}
          </div>
        )}
      </div>
      <button
        type="submit"
        disabled={isSearching}
        className="px-4 py-2 bg-accent hover:bg-accent/80 disabled:bg-accent/40 text-white rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:scale-100"
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

export function GameGlobe({
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
  preserveView = true,
  showCategoryLegend = false,
  categoryData = null,
  showLegend = true
}) {
  const globeRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [countries, setCountries] = useState({ features: [] });
  const { mapView, updateView, globeRef: contextGlobeRef } = useMapContext();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  // Charger les frontières des pays
  useEffect(() => {
    fetch(COUNTRIES_GEOJSON_URL)
      .then(res => res.json())
      .then(data => {
        setCountries(data);
      })
      .catch(err => console.warn('Impossible de charger les frontières:', err));
  }, []);

  // Utiliser la vue sauvegardée si preserveView est true
  const initialCenter = preserveView ? mapView.center : center;
  const initialZoom = preserveView ? mapView.zoom : zoom;

  // Observer les dimensions du conteneur
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Enregistrer la référence du globe dans le contexte + cleanup
  useEffect(() => {
    if (globeRef.current && contextGlobeRef) {
      contextGlobeRef.current = globeRef.current;
    }
    return () => {
      if (contextGlobeRef) {
        contextGlobeRef.current = null;
      }
      // Cleanup pour libérer la mémoire
      if (globeRef.current) {
        globeRef.current = null;
      }
    };
  }, [contextGlobeRef]);

  // Configurer la vue initiale
  useEffect(() => {
    if (globeRef.current) {
      const altitude = getAltitudeFromZoom(initialZoom);
      globeRef.current.pointOfView({
        lat: initialCenter[0],
        lng: initialCenter[1],
        altitude
      }, 0);
      // Initialiser l'échelle des marqueurs
      setMarkerScale(Math.max(0.4, Math.min(1.2, altitude * 0.8)));
    }
  }, []);

  // Taille des marqueurs adaptative au zoom
  const [markerScale, setMarkerScale] = useState(1);

  // Mettre à jour l'échelle des marqueurs quand le zoom change
  const updateMarkerScale = useCallback(() => {
    if (globeRef.current) {
      const pov = globeRef.current.pointOfView();
      // Plus on est proche (altitude basse), plus les marqueurs sont petits
      // Altitude: 0.005 (très proche) à 3.5 (très loin)
      const scale = Math.max(0.4, Math.min(1.2, pov.altitude * 0.8));
      setMarkerScale(scale);
    }
  }, []);

  // Gestion du clic sur le globe
  const handleGlobeClick = useCallback((coords, event) => {
    console.log('Globe click:', coords, 'clickDisabled:', clickDisabled, 'onMapClick:', !!onMapClick);
    if (!clickDisabled && onMapClick && coords) {
      onMapClick(coords.lat, coords.lng);
    }
  }, [clickDisabled, onMapClick]);

  // Debounce timer pour éviter les re-renders excessifs au zoom rapide
  const viewChangeTimer = useRef(null);

  // Altitude minimale = zoom ~14, empêche le sur-zoom qui sature le cache de tuiles
  const MIN_ALTITUDE = 0.02;

  // Sauvegarder la position quand l'utilisateur bouge le globe (debounced)
  const handleViewChange = useCallback(() => {
    if (!globeRef.current) return;

    // Clamper l'altitude pour éviter le sur-zoom
    const pov = globeRef.current.pointOfView();
    if (pov.altitude < MIN_ALTITUDE) {
      globeRef.current.pointOfView({ ...pov, altitude: MIN_ALTITUDE }, 0);
    }

    // Debounce la mise à jour du state (évite les re-renders en rafale)
    clearTimeout(viewChangeTimer.current);
    viewChangeTimer.current = setTimeout(() => {
      if (globeRef.current) {
        const p = globeRef.current.pointOfView();
        const zoom = getZoomFromAltitude(p.altitude);
        updateView([p.lat, p.lng], zoom);
        updateMarkerScale();
      }
    }, 100);
  }, [updateView, updateMarkerScale]);

  // Préparer les données des points (marqueurs actuels)
  const pointsData = useMemo(() => {
    const points = [];

    // Marqueurs actuels
    markers.forEach((marker, index) => {
      points.push({
        lat: marker.lat,
        lng: marker.lng,
        color: marker.color || GROUP_COLORS[index % GROUP_COLORS.length],
        size: 0.8,
        name: marker.groupName,
        distance: marker.distance,
        points: marker.points,
        category: marker.category,
        isHistorical: false,
        isTarget: false
      });
    });

    // Marqueurs historiques
    if (showHistorical) {
      historicalMarkers.forEach((marker, index) => {
        points.push({
          lat: marker.lat,
          lng: marker.lng,
          color: marker.color || GROUP_COLORS[index % GROUP_COLORS.length],
          size: 0.5,
          name: marker.groupName,
          distance: marker.distance,
          questionIndex: marker.questionIndex,
          questionName: marker.questionName,
          category: marker.category,
          isHistorical: true,
          isTarget: false
        });
      });
    }

    // Point cible
    if (showTarget && targetZone) {
      points.push({
        lat: targetZone.lat,
        lng: targetZone.lng,
        color: '#10b981',
        size: 1.2,
        name: targetZone.name,
        isTarget: true,
        isHistorical: false
      });
    }

    return points;
  }, [markers, historicalMarkers, targetZone, showTarget, showHistorical]);

  // Données des arcs (lignes de distance)
  const arcsData = useMemo(() => {
    if (!showDistanceLines || !showTarget || !targetZone) return [];

    return markers.map((marker, index) => ({
      startLat: marker.lat,
      startLng: marker.lng,
      endLat: targetZone.lat,
      endLng: targetZone.lng,
      color: marker.color || GROUP_COLORS[index % GROUP_COLORS.length]
    }));
  }, [markers, targetZone, showDistanceLines, showTarget]);

  // Données des anneaux (zone cible)
  const ringsData = useMemo(() => {
    if (!showTarget || !targetZone) return [];

    return [{
      lat: targetZone.lat,
      lng: targetZone.lng,
      maxR: targetZone.radius / 100, // Convertir km en unités globe
      propagationSpeed: 2,
      repeatPeriod: 1000
    }];
  }, [targetZone, showTarget]);

  // Données pour les marqueurs HTML personnalisés
  const htmlMarkersData = useMemo(() => {
    return pointsData.map(point => ({
      lat: point.lat,
      lng: point.lng,
      color: point.color,
      // Taille de base plus petite, avec échelle adaptative
      baseSize: point.isTarget ? 20 : (point.isHistorical ? 10 : 14),
      name: point.name,
      distance: point.distance,
      points: point.points,
      isTarget: point.isTarget,
      isHistorical: point.isHistorical,
      category: point.category
    }));
  }, [pointsData]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', position: 'relative', background: isDark ? '#0C1222' : '#f8fafc' }}
    >
      {/* Style pour l'animation pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
      `}</style>
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}

        // Tuiles satellite dynamiques (zoom limité pour performances)
        globeImageUrl={null}
        globeTileEngineUrl={(x, y, z) => {
          // Limiter le zoom max à 12 pour éviter les freezes
          const maxZoom = 12;
          const clampedZ = Math.min(z, maxZoom);
          return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${clampedZ}/${y}/${x}`;
        }}
        backgroundImageUrl={isDark ? TILE_PROVIDERS.background : null}

        // Atmosphère accent (style app)
        atmosphereColor={isDark ? '#2DD4BF' : '#0D9488'}
        atmosphereAltitude={0.18}

        // Frontières des pays (lignes seulement, pas de surface cliquable)
        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(0, 0, 0, 0)'}
        polygonSideColor={() => 'rgba(0, 0, 0, 0)'}
        polygonStrokeColor={() => isDark ? '#2DD4BF' : '#0D9488'}
        polygonAltitude={0.001}
        polygonsTransitionDuration={0}
        onPolygonClick={(polygon, event, coords) => {
          // Transférer le clic au globe
          if (!clickDisabled && onMapClick && coords) {
            onMapClick(coords.lat, coords.lng);
          }
        }}

        // Marqueurs HTML personnalisés (style Leaflet)
        htmlElementsData={htmlMarkersData}
        htmlLat="lat"
        htmlLng="lng"
        htmlAltitude={d => d.isTarget ? 0.01 : 0.005}
        htmlElement={d => {
          const size = Math.round(d.baseSize * markerScale);
          const el = document.createElement('div');
          el.style.position = 'relative';
          el.style.width = `${size}px`;
          el.style.height = `${size}px`;

          // Cercle extérieur (halo)
          const outer = document.createElement('div');
          outer.style.position = 'absolute';
          outer.style.inset = '0';
          outer.style.borderRadius = '50%';
          outer.style.backgroundColor = d.color + '40';
          outer.style.border = `2px solid ${d.color}`;
          outer.style.boxShadow = d.isTarget
            ? `0 0 0 3px ${d.color}30, 0 2px 8px rgba(0,0,0,0.4)`
            : '0 2px 6px rgba(0,0,0,0.4)';
          if (d.isTarget) {
            outer.style.animation = 'pulse 2s infinite';
          }
          el.appendChild(outer);

          // Point central précis (toujours visible)
          const centerSize = Math.max(4, Math.round(size * 0.35));
          const center = document.createElement('div');
          center.style.position = 'absolute';
          center.style.top = '50%';
          center.style.left = '50%';
          center.style.transform = 'translate(-50%, -50%)';
          center.style.width = `${centerSize}px`;
          center.style.height = `${centerSize}px`;
          center.style.borderRadius = '50%';
          center.style.backgroundColor = 'white';
          center.style.border = `1px solid ${d.color}`;
          center.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
          el.appendChild(center);

          el.style.pointerEvents = 'none';
          el.style.transform = 'translate(-50%, -50%)';
          el.style.opacity = d.isHistorical ? '0.7' : '1';
          return el;
        }}

        // Arcs (lignes de distance) - fins et discrets
        arcsData={arcsData}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={d => d.color + '80'}
        arcDashLength={0.3}
        arcDashGap={0.15}
        arcDashAnimateTime={3000}
        arcStroke={0.3}
        arcAltitudeAutoScale={0.15}

        // Anneaux (zone cible pulsante)
        ringsData={ringsData}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor={() => isDark ? '#2DD4BF80' : '#0D948880'}

        // Interactions - clic sur le globe ET sur les océans
        onGlobeClick={handleGlobeClick}
        onZoom={handleViewChange}

        // Animation
        animateIn={true}
      />

      {/* Légende des marqueurs */}
      {showLegend && <div className="absolute top-4 left-4 z-[1000] bg-surface-1/95 backdrop-blur-sm rounded-xl p-3 border border-border text-text-primary text-sm max-w-[200px] max-h-[50vh] overflow-y-auto shadow-lg">
        <div className="font-bold text-accent mb-2">{t('globe.legend')}</div>
        <div className="space-y-1 text-xs">
          {/* Mode catégories */}
          {showCategoryLegend && categoryData && (
            <>
              {Object.entries(categoryData).map(([key, cat]) => (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium">{cat.name}</span>
                </div>
              ))}
            </>
          )}
          {/* Mode normal avec cible et marqueurs */}
          {!showCategoryLegend && (
            <>
              {showTarget && targetZone && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                  <span>{t('globe.target', { name: targetZone.name })}</span>
                </div>
              )}
              {markers.length > 0 && (
                <div className="text-text-muted mt-2">{t('globe.groupMarkers')}</div>
              )}
              {markers.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: m.color || GROUP_COLORS[i % GROUP_COLORS.length] }}
                  />
                  <span>{m.groupName}</span>
                  {m.distance !== undefined && <span className="text-text-muted">({m.distance} km)</span>}
                </div>
              ))}
            </>
          )}
        </div>
      </div>}

      {/* Barre de recherche */}
      {showSearch && <SearchBar />}

      {/* Instructions */}
      {onMapClick && !clickDisabled && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-surface-1/95 backdrop-blur-sm rounded-xl px-4 py-2 border border-border text-accent text-sm shadow-lg">
          {t('globe.clickToPlace')}
        </div>
      )}
    </div>
  );
}

export { GROUP_COLORS, CATEGORY_ICONS };
export default GameGlobe;
