import { createContext, useContext, useState, useCallback, useRef } from 'react';

const MapContext = createContext(null);

// Convertir zoom Leaflet en altitude Globe
function getAltitudeFromZoom(zoom) {
  const altitudes = {
    1: 3.5, 2: 2.5, 3: 1.8, 4: 1.2, 5: 0.8,
    6: 0.5, 7: 0.35, 8: 0.25, 9: 0.18, 10: 0.12,
    11: 0.08, 12: 0.05, 13: 0.03, 14: 0.02, 15: 0.015,
    16: 0.01, 17: 0.007, 18: 0.005
  };
  return altitudes[Math.min(Math.max(zoom, 1), 18)] || 2.5;
}

export function MapProvider({ children }) {
  // État de la vue de la carte (persiste entre les écrans)
  const [mapView, setMapView] = useState({
    center: [20, 0],
    zoom: 2
  });

  // Référence vers l'instance de la carte Leaflet
  const mapRef = useRef(null);

  // Référence vers l'instance du globe 3D
  const globeRef = useRef(null);

  // Met à jour la vue
  const updateView = useCallback((center, zoom) => {
    setMapView({ center, zoom });
  }, []);

  // Zoom fluide vers une position (supporte Leaflet et Globe)
  const flyTo = useCallback((lat, lng, zoom = 5) => {
    // Support Leaflet (carte 2D)
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }

    // Support Globe 3D
    if (globeRef.current && globeRef.current.pointOfView) {
      const altitude = getAltitudeFromZoom(zoom);
      globeRef.current.pointOfView({ lat, lng, altitude }, 1500);
    }

    setMapView({ center: [lat, lng], zoom });
  }, []);

  // Recherche un pays via Nominatim et zoom dessus
  const searchAndFlyTo = useCallback(async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&accept-language=fr`
      );
      const results = await response.json();

      if (results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        // Déterminer le zoom en fonction du type (plus zoomé)
        let zoom = 7;
        if (result.type === 'country' || result.class === 'boundary') {
          zoom = 6;
        } else if (result.type === 'city' || result.type === 'town') {
          zoom = 12;
        } else if (result.type === 'village') {
          zoom = 14;
        }

        flyTo(lat, lng, zoom);
        return { success: true, name: result.display_name, lat, lng };
      }
      return { success: false, error: 'Aucun résultat trouvé' };
    } catch (error) {
      console.error('Erreur recherche:', error);
      return { success: false, error: 'Erreur de recherche' };
    }
  }, [flyTo]);

  return (
    <MapContext.Provider value={{
      mapView,
      mapRef,
      globeRef,
      updateView,
      flyTo,
      searchAndFlyTo
    }}>
      {children}
    </MapContext.Provider>
  );
}

// Valeurs par défaut pour le contexte (fallback)
const defaultContextValue = {
  mapView: { center: [20, 0], zoom: 2 },
  mapRef: { current: null },
  globeRef: { current: null },
  updateView: () => {},
  flyTo: () => {},
  searchAndFlyTo: async () => ({ success: false, error: 'Context not available' })
};

export function useMapContext() {
  const context = useContext(MapContext);
  // Retourner les valeurs par défaut si le provider n'est pas disponible
  return context || defaultContextValue;
}

export default MapContext;
