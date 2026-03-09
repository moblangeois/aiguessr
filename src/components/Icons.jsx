// Icônes SVG personnalisées pour l'écran d'impact
// Toutes les icônes suivent le thème vert émeraude / ambre

export function IconChild({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="6" r="3" />
      <path d="M12 10c-3 0-5 2-5 4v6h2v-4h2v4h2v-4h2v4h2v-6c0-2-2-4-5-4z" />
    </svg>
  );
}

export function IconWorker({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2L4 6v2h16V6L12 2z" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 16c-3 0-5 2-5 4v2h10v-2c0-2-2-4-5-4z" />
    </svg>
  );
}

export function IconSkull({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2C7 2 3 6 3 11c0 3 1.5 5.5 4 7v2c0 .5.5 1 1 1h8c.5 0 1-.5 1-1v-2c2.5-1.5 4-4 4-7 0-5-4-9-9-9zm-3 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm6 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
      <path d="M10 17h4v2h-4z" />
    </svg>
  );
}

export function IconWater({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2c-5 6-8 10-8 14 0 4.4 3.6 8 8 8s8-3.6 8-8c0-4-3-8-8-14zm0 20c-3.3 0-6-2.7-6-6 0-2.5 1.8-5.2 4-8.3V14l2 2 2-2V7.7c2.2 3.1 4 5.8 4 8.3 0 3.3-2.7 6-6 6z" />
    </svg>
  );
}

export function IconPool({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <rect x="2" y="8" width="20" height="10" rx="2" />
      <path d="M4 10h16v6H4z" fill="none" stroke={color} strokeWidth="1" />
      <circle cx="12" cy="5" r="2" />
      <path d="M10 7h4v2h-4z" />
    </svg>
  );
}

export function IconFootballField({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
      <rect x="2" y="5" width="20" height="14" rx="1" />
      <line x1="12" y1="5" x2="12" y2="19" />
      <circle cx="12" cy="12" r="3" />
      <rect x="2" y="8" width="3" height="8" />
      <rect x="19" y="8" width="3" height="8" />
    </svg>
  );
}

export function IconToxicBarrel({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M5 4h14l1 3H4l1-3z" />
      <rect x="4" y="7" width="16" height="14" rx="1" />
      <path d="M8 7v14M16 7v14" stroke="currentColor" strokeWidth="0.5" fill="none" />
      <circle cx="12" cy="14" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12v4M10 14h4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function IconRadioactive({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" strokeWidth="3" stroke={color} />
    </svg>
  );
}

export function IconCar({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M5 11l2-5h10l2 5H5z" />
      <rect x="3" y="11" width="18" height="6" rx="1" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

export function IconPlane({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

export function IconElephant({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M19 8c0-2-1-4-3-5l-1 3h-2V4c-2 0-4 1-5 3H6c-1 0-2 1-2 2v4c0 1 1 2 2 2h1v5h3v-3h4v3h3v-5h1c1 0 2-1 2-2V9c1 0 1-1 0-1z" />
      <circle cx="8" cy="9" r="1" fill="white" />
    </svg>
  );
}

export function IconHouse({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
    </svg>
  );
}

export function IconBattery({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <rect x="2" y="7" width="18" height="10" rx="2" />
      <rect x="20" y="10" width="2" height="4" />
      <rect x="4" y="9" width="8" height="6" />
    </svg>
  );
}

export function IconTree({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2L5 10h3l-3 5h3l-3 5h14l-3-5h3l-3-5h3L12 2z" />
      <rect x="10" y="18" width="4" height="4" />
    </svg>
  );
}

export function IconForest({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M8 3L3 9h2l-2 4h2l-2 4h10l-2-4h2l-2-4h2L8 3z" />
      <path d="M16 7l-3 4h1.5l-1.5 3h1.5l-1.5 3h8l-1.5-3h1.5l-1.5-3h1.5L16 7z" />
      <rect x="6" y="17" width="4" height="3" />
      <rect x="14" y="17" width="4" height="3" />
    </svg>
  );
}

export function IconDollar({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M9 9c0-1 1-2 3-2s3 1 3 2-1 2-3 2-3 1-3 2 1 2 3 2 3-1 3-2" />
    </svg>
  );
}

export function IconWarning({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6z" />
      <rect x="11" y="10" width="2" height="5" />
      <rect x="11" y="16" width="2" height="2" />
    </svg>
  );
}

export function IconPercent({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <line x1="19" y1="5" x2="5" y2="19" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function IconClock({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function IconMultiplier({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <path d="M6 6l12 12M6 18L18 6" />
    </svg>
  );
}

export function IconSearch({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="10" cy="10" r="7" />
      <path d="M15 15l6 6" />
    </svg>
  );
}

export function IconPerson({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="6" r="4" />
      <path d="M12 12c-4 0-7 2-7 5v3h14v-3c0-3-3-5-7-5z" />
    </svg>
  );
}

export function IconInjured({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="6" r="4" />
      <path d="M12 12c-4 0-7 2-7 5v3h14v-3c0-3-3-5-7-5z" />
      <path d="M8 4h8M12 2v4" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

export function IconTower({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l-4 8h8l-4-8z" />
      <rect x="8" y="10" width="8" height="4" />
      <path d="M6 14h12l-1 8H7l-1-8z" />
      <rect x="10" y="16" width="4" height="4" />
    </svg>
  );
}

export function IconWhale({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M2 12c0-3 2-6 6-6h8c4 0 6 3 6 6s-2 6-6 6H8c-4 0-6-3-6-6z" />
      <path d="M20 8c2 1 2 3 2 4s0 3-2 4" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="7" cy="11" r="1.5" fill="white" />
      <path d="M14 14c1 1 2 1 3 0" fill="none" stroke="white" strokeWidth="1" />
    </svg>
  );
}

export function IconSmartphone({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <rect x="8" y="4" width="8" height="14" fill="white" fillOpacity="0.3" />
      <circle cx="12" cy="20" r="1" fill="white" />
    </svg>
  );
}

export function IconMercury({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <path d="M9 2h6v8c2 1 3 3 3 5 0 3-2.5 5.5-5.5 5.5S7 18 7 15c0-2 1-4 3-5V2z" />
      <circle cx="12" cy="15" r="3" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

export function IconShower({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="5" r="3" />
      <path d="M7 8h10l-1 3H8L7 8z" />
      <path d="M9 11v2M11 11v3M13 11v2M15 11v3" strokeWidth="1.5" stroke={color} />
    </svg>
  );
}

export function IconBottle({ className = "w-6 h-6", color = "currentColor" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={color}>
      <rect x="9" y="2" width="6" height="3" rx="1" />
      <path d="M9 5h6l1 3v12c0 1-1 2-2 2h-4c-1 0-2-1-2-2V8l1-3z" />
      <rect x="10" y="10" width="4" height="8" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

// Map des icônes par type pour les équivalences
export const ICON_COMPONENTS = {
  child: IconChild,
  worker: IconWorker,
  death: IconSkull,
  coffin: IconSkull,
  injured: IconInjured,
  water: IconWater,
  olympic_pool: IconPool,
  shower_year: IconShower,
  bottle: IconBottle,
  football_field: IconFootballField,
  toxic_barrel: IconToxicBarrel,
  radioactive: IconRadioactive,
  car_year: IconCar,
  flight_paris_ny: IconPlane,
  french_person_year: IconPerson,
  google_search: IconSearch,
  eiffel_tower: IconTower,
  elephant: IconElephant,
  blue_whale: IconWhale,
  smartphone: IconSmartphone,
  house_year: IconHouse,
  french_person_elec: IconPerson,
  iphone_charge: IconBattery,
  hour: IconClock,
  day: IconClock,
  year: IconClock,
  dollar: IconDollar,
  smic_month: IconDollar,
  tree: IconTree,
  hectare_forest: IconForest,
  paris: IconTower,
  manhattan: IconTower,
  skull: IconSkull,
  warning: IconWarning,
  percentage: IconPercent,
  mercury: IconMercury,
  family: IconPerson
};

// Fonction pour obtenir le composant d'icône par type
export function getIconComponent(type) {
  return ICON_COMPONENTS[type] || IconWarning;
}

export default ICON_COMPONENTS;
