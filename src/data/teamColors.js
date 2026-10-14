// Palette des équipes, partagée par la carte Leaflet, le globe et les écrans.
// L'ordre suit l'ordre d'arrivée des équipes : le téléphone et le présentateur
// calculent chacun la couleur depuis cet index, d'où une source unique.
// Teintes de pigments, sans la rouille réservée au site réel.
export const GROUP_COLORS = [
  '#2F5C78', // bleu ardoise
  '#B98A2E', // laiton
  '#5F6F35', // lichen
  '#6E3B5E', // lie-de-vin
  '#2E6B62', // vert-de-gris
  '#C0705A', // terre cuite
  '#3A342C', // graphite
  '#7A8FA6'  // ciel de plomb
];

// Couleur de l'équipe d'index donné ; au-delà de 8 équipes, la palette reboucle
// (en mode questionnaire, chaque étudiant est une équipe).
export function getTeamColor(index) {
  const n = GROUP_COLORS.length;
  const i = Number.isInteger(index) ? index : 0;
  return GROUP_COLORS[((i % n) + n) % n];
}
