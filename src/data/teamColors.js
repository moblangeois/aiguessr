// Palette des équipes, partagée par la carte Leaflet, le globe et les écrans.
// L'ordre suit l'ordre d'arrivée des équipes : le téléphone et le présentateur
// calculent chacun la couleur depuis cet index, d'où une source unique.
export const GROUP_COLORS = [
  '#3b82f6', // bleu
  '#ef4444', // rouge
  '#10b981', // vert
  '#f59e0b', // orange
  '#8b5cf6', // violet
  '#ec4899', // rose
  '#06b6d4', // cyan
  '#84cc16'  // lime
];

// Couleur de l'équipe d'index donné ; au-delà de 8 équipes, la palette reboucle
// (en mode questionnaire, chaque étudiant est une équipe).
export function getTeamColor(index) {
  const n = GROUP_COLORS.length;
  const i = Number.isInteger(index) ? index : 0;
  return GROUP_COLORS[((i % n) + n) % n];
}
