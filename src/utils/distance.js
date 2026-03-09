import * as turf from '@turf/turf';

/**
 * Calcule la distance en kilometres entre deux points geographiques
 * @param {number} lat1 - Latitude du premier point
 * @param {number} lng1 - Longitude du premier point
 * @param {number} lat2 - Latitude du deuxieme point
 * @param {number} lng2 - Longitude du deuxieme point
 * @returns {number} Distance en kilometres
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const from = turf.point([lng1, lat1]);
  const to = turf.point([lng2, lat2]);
  const distance = turf.distance(from, to, { units: 'kilometers' });
  return Math.round(distance);
}

/**
 * Calcule les points en fonction de la distance
 * Formule exponentielle inspirée de GeoGuessr : S = maxPoints × exp(-10 × d / D)
 * où D est un facteur d'échelle (5000 km pour une carte mondiale)
 * @param {number} distance - Distance en kilometres
 * @param {number} maxDistance - Non utilisé (conservé pour compatibilité)
 * @param {number} maxPoints - Points maximum (defaut: 1000)
 * @returns {number} Points obtenus
 */
export function calculatePoints(distance, maxDistance = 5000, maxPoints = 1000) {
  if (distance <= 0) return maxPoints;

  // Formule GeoGuessr : décroissance exponentielle
  // D = 5000 km comme facteur d'échelle pour carte mondiale
  const D = 5000;
  const points = Math.round(maxPoints * Math.exp(-10 * distance / D));

  return Math.max(0, points);
}

/**
 * Verifie si un point est dans le rayon de tolerance
 * @param {number} lat - Latitude du point
 * @param {number} lng - Longitude du point
 * @param {Object} target - Cible avec lat, lng et radius
 * @returns {boolean}
 */
export function isWithinRadius(lat, lng, target) {
  const distance = calculateDistance(lat, lng, target.lat, target.lng);
  return distance <= target.radius;
}

export default { calculateDistance, calculatePoints, isWithinRadius };
