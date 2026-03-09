// Définitions des équivalences visuelles pour l'écran d'impact
// Utilise des icônes SVG au lieu d'emojis

export const EQUIVALENCES = {
  // ==================== SURFACES ====================
  football_field: {
    iconType: "football_field",
    label: "terrain de foot",
    labelPlural: "terrains de foot",
    label_en: "football field",
    labelPlural_en: "football fields",
    value: 0.00714, // km² (100m x 70m)
    unit: "km²",
    color: "#22c55e"
  },
  paris: {
    iconType: "paris",
    label: "fois Paris",
    labelPlural: "fois Paris",
    label_en: "times Paris",
    labelPlural_en: "times Paris",
    value: 105, // km²
    unit: "km²",
    color: "#3b82f6"
  },
  manhattan: {
    iconType: "manhattan",
    label: "fois Manhattan",
    labelPlural: "fois Manhattan",
    label_en: "times Manhattan",
    labelPlural_en: "times Manhattan",
    value: 59, // km²
    unit: "km²",
    color: "#8b5cf6"
  },

  // ==================== EAU ====================
  olympic_pool: {
    iconType: "olympic_pool",
    label: "piscine olympique",
    labelPlural: "piscines olympiques",
    label_en: "Olympic pool",
    labelPlural_en: "Olympic pools",
    value: 2500000, // litres
    unit: "litres",
    color: "#0ea5e9"
  },
  shower_year: {
    iconType: "shower_year",
    label: "an de douches",
    labelPlural: "ans de douches",
    label_en: "year of showers",
    labelPlural_en: "years of showers",
    value: 21900, // litres (60L x 365 jours)
    unit: "litres",
    color: "#06b6d4"
  },
  bottle: {
    iconType: "bottle",
    label: "bouteille 1,5L",
    labelPlural: "bouteilles 1,5L",
    label_en: "1.5L bottle",
    labelPlural_en: "1.5L bottles",
    value: 1.5,
    unit: "litres",
    color: "#0284c7"
  },

  // ==================== PERSONNES / ENFANTS ====================
  child: {
    iconType: "child",
    label: "enfant",
    labelPlural: "enfants",
    label_en: "child",
    labelPlural_en: "children",
    value: 1,
    unit: "personne",
    unit_en: "person",
    color: "#f59e0b"
  },
  worker: {
    iconType: "worker",
    label: "travailleur",
    labelPlural: "travailleurs",
    label_en: "worker",
    labelPlural_en: "workers",
    value: 1,
    unit: "personne",
    unit_en: "person",
    color: "#ea580c"
  },
  family: {
    iconType: "family",
    label: "famille",
    labelPlural: "familles",
    label_en: "family",
    labelPlural_en: "families",
    value: 4,
    unit: "personne",
    unit_en: "person",
    color: "#f97316"
  },

  // ==================== MORTS / DANGER ====================
  death: {
    iconType: "death",
    label: "mort",
    labelPlural: "morts",
    label_en: "death",
    labelPlural_en: "deaths",
    value: 1,
    unit: "personne",
    unit_en: "person",
    color: "#dc2626"
  },
  coffin: {
    iconType: "coffin",
    label: "victime",
    labelPlural: "victimes",
    label_en: "victim",
    labelPlural_en: "victims",
    value: 1,
    unit: "personne",
    unit_en: "person",
    color: "#7f1d1d"
  },
  injured: {
    iconType: "injured",
    label: "blessé",
    labelPlural: "blessés",
    label_en: "injured",
    labelPlural_en: "injured",
    value: 1,
    unit: "personne",
    unit_en: "person",
    color: "#b91c1c"
  },

  // ==================== TOXICITÉ ====================
  toxic_barrel: {
    iconType: "toxic_barrel",
    label: "baril toxique",
    labelPlural: "barils toxiques",
    label_en: "toxic barrel",
    labelPlural_en: "toxic barrels",
    value: 200, // litres
    unit: "litres",
    color: "#84cc16"
  },
  skull: {
    iconType: "skull",
    label: "dose létale",
    labelPlural: "doses létales",
    label_en: "lethal dose",
    labelPlural_en: "lethal doses",
    value: 1,
    unit: "dose",
    color: "#65a30d"
  },
  radioactive: {
    iconType: "radioactive",
    label: "tonne radioactive",
    labelPlural: "tonnes radioactives",
    label_en: "radioactive ton",
    labelPlural_en: "radioactive tons",
    value: 1000, // kg
    unit: "kg",
    color: "#eab308"
  },

  // ==================== ÉMISSIONS CO₂ ====================
  car_year: {
    iconType: "car_year",
    label: "voiture/an",
    labelPlural: "voitures/an",
    label_en: "car/year",
    labelPlural_en: "cars/year",
    value: 4600, // kg CO₂ par voiture par an
    unit: "kg CO₂",
    color: "#64748b"
  },
  flight_paris_ny: {
    iconType: "flight_paris_ny",
    label: "vol Paris-NY",
    labelPlural: "vols Paris-NY",
    label_en: "Paris-NY flight",
    labelPlural_en: "Paris-NY flights",
    value: 1000, // kg CO₂
    unit: "kg CO₂",
    color: "#475569"
  },
  french_person_year: {
    iconType: "french_person_year",
    label: "Français/an",
    labelPlural: "Français/an",
    label_en: "French person/year",
    labelPlural_en: "French persons/year",
    value: 9000, // kg CO₂
    unit: "kg CO₂",
    color: "#334155"
  },
  google_search: {
    iconType: "google_search",
    label: "recherche Google",
    labelPlural: "recherches Google",
    label_en: "Google search",
    labelPlural_en: "Google searches",
    value: 0.0002, // kg CO₂ (0.2g)
    unit: "kg CO₂",
    color: "#4285f4"
  },

  // ==================== POIDS ====================
  eiffel_tower: {
    iconType: "eiffel_tower",
    label: "Tour Eiffel",
    labelPlural: "Tours Eiffel",
    label_en: "Eiffel Tower",
    labelPlural_en: "Eiffel Towers",
    value: 7300000, // kg (7 300 tonnes)
    unit: "kg",
    color: "#78716c"
  },
  elephant: {
    iconType: "elephant",
    label: "éléphant",
    labelPlural: "éléphants",
    label_en: "elephant",
    labelPlural_en: "elephants",
    value: 5000, // kg
    unit: "kg",
    color: "#a8a29e"
  },
  blue_whale: {
    iconType: "blue_whale",
    label: "baleine bleue",
    labelPlural: "baleines bleues",
    label_en: "blue whale",
    labelPlural_en: "blue whales",
    value: 140000, // kg (140 tonnes)
    unit: "kg",
    color: "#1e40af"
  },
  smartphone: {
    iconType: "smartphone",
    label: "smartphone",
    labelPlural: "smartphones",
    label_en: "smartphone",
    labelPlural_en: "smartphones",
    value: 0.2, // kg
    unit: "kg",
    color: "#1f2937"
  },

  // ==================== ÉNERGIE ====================
  house_year: {
    iconType: "house_year",
    label: "maison/an",
    labelPlural: "maisons/an",
    label_en: "house/year",
    labelPlural_en: "houses/year",
    value: 4500, // kWh
    unit: "kWh",
    color: "#059669"
  },
  french_person_elec: {
    iconType: "french_person_elec",
    label: "Français/an (élec)",
    labelPlural: "Français/an (élec)",
    label_en: "French person/year (elec)",
    labelPlural_en: "French persons/year (elec)",
    value: 6300, // kWh
    unit: "kWh",
    color: "#047857"
  },
  iphone_charge: {
    iconType: "iphone_charge",
    label: "charge iPhone",
    labelPlural: "charges iPhone",
    label_en: "iPhone charge",
    labelPlural_en: "iPhone charges",
    value: 0.012, // kWh
    unit: "kWh",
    color: "#10b981"
  },

  // ==================== TEMPS ====================
  hour: {
    iconType: "hour",
    label: "heure",
    labelPlural: "heures",
    label_en: "hour",
    labelPlural_en: "hours",
    value: 1,
    unit: "heure",
    unit_en: "hour",
    color: "#6366f1"
  },
  day: {
    iconType: "day",
    label: "jour",
    labelPlural: "jours",
    label_en: "day",
    labelPlural_en: "days",
    value: 24,
    unit: "heure",
    unit_en: "hour",
    color: "#8b5cf6"
  },
  year: {
    iconType: "year",
    label: "an",
    labelPlural: "ans",
    label_en: "year",
    labelPlural_en: "years",
    value: 8760,
    unit: "heure",
    unit_en: "hour",
    color: "#a855f7"
  },

  // ==================== ARGENT ====================
  dollar: {
    iconType: "dollar",
    label: "dollar",
    labelPlural: "dollars",
    label_en: "dollar",
    labelPlural_en: "dollars",
    value: 1,
    unit: "USD",
    color: "#16a34a"
  },
  smic_month: {
    iconType: "smic_month",
    label: "SMIC mensuel",
    labelPlural: "SMIC mensuels",
    label_en: "monthly minimum wage",
    labelPlural_en: "monthly minimum wages",
    value: 1400, // euros ~= USD
    unit: "USD",
    color: "#15803d"
  },

  // ==================== FORÊT / NATURE ====================
  tree: {
    iconType: "tree",
    label: "arbre",
    labelPlural: "arbres",
    label_en: "tree",
    labelPlural_en: "trees",
    value: 1,
    unit: "arbre",
    unit_en: "tree",
    color: "#166534"
  },
  hectare_forest: {
    iconType: "hectare_forest",
    label: "hectare de forêt",
    labelPlural: "hectares de forêt",
    label_en: "hectare of forest",
    labelPlural_en: "hectares of forest",
    value: 1,
    unit: "hectare",
    color: "#14532d"
  }
};

// Types de stats génériques avec leurs icônes
export const STAT_TYPES = {
  water: { iconType: "water", color: "#0ea5e9" },
  electricity: { iconType: "iphone_charge", color: "#eab308" },
  co2: { iconType: "car_year", color: "#64748b" },
  waste: { iconType: "toxic_barrel", color: "#84cc16" },
  toxic: { iconType: "skull", color: "#dc2626" },
  children: { iconType: "child", color: "#f59e0b" },
  workers: { iconType: "worker", color: "#ea580c" },
  deaths: { iconType: "death", color: "#dc2626" },
  money: { iconType: "dollar", color: "#16a34a" },
  time: { iconType: "hour", color: "#6366f1" },
  surface: { iconType: "football_field", color: "#22c55e" },
  warning: { iconType: "warning", color: "#f59e0b" },
  percentage: { iconType: "percentage", color: "#8b5cf6" },
  radioactive: { iconType: "radioactive", color: "#eab308" },
  mercury: { iconType: "mercury", color: "#a8a29e" }
};

// Calcule le nombre d'équivalences pour une valeur donnée
export function calculateEquivalenceCount(value, equivalenceType) {
  const equiv = EQUIVALENCES[equivalenceType];
  if (!equiv) return 0;
  return Math.round(value / equiv.value);
}

// Retourne le label approprié (singulier ou pluriel)
export function getEquivalenceLabel(equivalenceType, count, locale = 'fr') {
  const equiv = EQUIVALENCES[equivalenceType];
  if (!equiv) return "";
  if (locale === 'en') {
    return count > 1 ? (equiv.labelPlural_en || equiv.labelPlural) : (equiv.label_en || equiv.label);
  }
  return count > 1 ? equiv.labelPlural : equiv.label;
}

// Retourne la couleur de l'équivalence
export function getEquivalenceColor(equivalenceType) {
  const equiv = EQUIVALENCES[equivalenceType];
  return equiv?.color || "#10b981";
}

// Retourne le type d'icône pour une équivalence
export function getEquivalenceIconType(equivalenceType) {
  const equiv = EQUIVALENCES[equivalenceType];
  return equiv?.iconType || "warning";
}

export default EQUIVALENCES;
