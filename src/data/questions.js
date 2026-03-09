// Banque de questions sur l'empreinte matérielle de l'IA
// Questions reformulées pour ne pas révéler les chiffres chocs
// Les données d'impact sont révélées après les réponses

export const categories = {
  extraction: {
    name: "Extraction minière",
    name_en: "Mining & Extraction",
    color: "#ef4444",
    description: "Mines et extraction des matières premières critiques",
    description_en: "Mines and extraction of critical raw materials"
  },
  production: {
    name: "Production & Assemblage",
    name_en: "Production & Assembly",
    color: "#f59e0b",
    description: "Fabrication des semi-conducteurs et assemblage",
    description_en: "Semiconductor manufacturing and assembly"
  },
  datacenter: {
    name: "Data Centers",
    name_en: "Data Centers",
    color: "#3b82f6",
    description: "Infrastructure et consommation énergétique",
    description_en: "Infrastructure and energy consumption"
  },
  dechets: {
    name: "Déchets électroniques",
    name_en: "Electronic Waste",
    color: "#10b981",
    description: "E-waste et fin de vie des équipements",
    description_en: "E-waste and end-of-life equipment"
  }
};

export const questions = [
  // ============================================
  // EXTRACTION MINIÈRE - COBALT (RDC)
  // ============================================
  {
    id: "cobalt-mutanda",
    question: "Localisez la plus grande mine de cobalt au monde en 2018.",
    question_en: "Locate the world's largest cobalt mine in 2018.",
    category: "extraction",
    target: {
      lat: -10.667,
      lng: 25.833,
      name: "Mine de Mutanda, RDC",
      name_en: "Mutanda Mine, DRC",
      radius: 50
    },
    hints: [
      { level: 1, text: "Province de Lualaba, RDC", text_en: "Lualaba Province, DRC", penalty: 0.2 },
      { level: 2, text: "40 km au sud-est de Kolwezi", text_en: "40 km southeast of Kolwezi", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 27300,
          unit: "tonnes",
          label: "de cobalt extraites en 2018 (pic de production)",
          label_en: "of cobalt extracted in 2018 (peak production)",
          iconType: "toxic_barrel",
          color: "#84cc16"
        },
        {
          type: "percentage",
          value: 74,
          label: "du cobalt mondial provient de la RDC",
          label_en: "of global cobalt comes from the DRC",
          iconType: "radioactive",
          sublabel: "Un quasi-monopole géographique",
          sublabel_en: "A near geographical monopoly"
        }
      ]
    },
    explanation: "La mine de Mutanda, située à 40 km de Kolwezi en RDC. Des déversements toxiques ont causé la mort de travailleurs. La RDC fournit 74% du cobalt mondial.",
    explanation_en: "The Mutanda mine, located 40 km from Kolwezi in the DRC. Toxic spills have caused worker deaths. The DRC supplies 74% of the world's cobalt.",
    source: "USGS Mineral Commodity Summaries 2024"
  },
  {
    id: "cobalt-katanga",
    question: "Trouvez la région où 40 000 enfants travaillent dans les mines artisanales de cobalt.",
    question_en: "Find the region where 40,000 children work in artisanal cobalt mines.",
    category: "extraction",
    target: {
      lat: -10.5,
      lng: 26.0,
      name: "Mines artisanales du Katanga, RDC",
      name_en: "Artisanal mines of Katanga, DRC",
      radius: 100
    },
    hints: [
      { level: 1, text: "Sud d'un grand pays d'Afrique centrale", text_en: "South of a large Central African country", penalty: 0.2 },
      { level: 2, text: "Rapport Amnesty 'This is what we die for' (2016)", text_en: "Amnesty report 'This is what we die for' (2016)", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "grid",
          gridType: "child",
          count: 100,
          label: "40 000 enfants travaillent dans les mines de cobalt du sud de la RDC",
          label_en: "40,000 children work in cobalt mines in southern DRC",
          maxItems: 100
        },
        {
          type: "count",
          value: 80,
          unit: "morts",
          label: "mineurs artisanaux décédés entre sept. 2014 et déc. 2015",
          label_en: "artisanal miners died between Sept. 2014 and Dec. 2015",
          iconType: "death",
          color: "#dc2626"
        },
        {
          type: "count",
          value: 12,
          unit: "heures/jour",
          label: "de travail pour 1-2 USD par jour",
          label_en: "of work for 1-2 USD per day",
          iconType: "worker",
          color: "#ea580c"
        }
      ]
    },
    explanation: "La région du Katanga en RDC. Rapport Amnesty (2016) : journées de 10-12h pour 1-2 USD/jour, aucun équipement de protection, exposition aux poussières causant des maladies pulmonaires.",
    explanation_en: "The Katanga region in the DRC. Amnesty report (2016): 10-12 hour days for 1-2 USD/day, no protective equipment, exposure to dust causing lung diseases.",
    source: "Amnesty International 2016, UNICEF 2014"
  },

  // ============================================
  // EXTRACTION MINIÈRE - LITHIUM
  // ============================================
  {
    id: "lithium-atacama",
    question: "Localisez le plus grand gisement de lithium au monde.",
    question_en: "Locate the world's largest lithium deposit.",
    category: "extraction",
    target: {
      lat: -23.5,
      lng: -68.25,
      name: "Salar de Atacama, Chili",
      name_en: "Salar de Atacama, Chile",
      radius: 80
    },
    hints: [
      { level: 1, text: "Désert le plus aride du monde", text_en: "The driest desert in the world", penalty: 0.2 },
      { level: 2, text: "Opéré par SQM et Albemarle, à 2 300 m d'altitude", text_en: "Operated by SQM and Albemarle, at 2,300 m altitude", penalty: 0.4 }
    ],
    impact: {
      realtime: {
        rate: 1850,
        unit: "litres",
        unit_en: "liters",
        per: "seconde",
        per_en: "second",
        label: "d'eau perdus par la nappe phréatique",
        label_en: "of water lost from the aquifer",
        iconType: "water"
      },
      stats: [
        {
          type: "percentage",
          value: 65,
          label: "de l'eau de la région consommée par l'extraction",
          label_en: "of the region's water consumed by extraction",
          iconType: "water",
          sublabel: "Dans le désert le plus aride du monde",
          sublabel_en: "In the driest desert in the world"
        },
        {
          type: "count",
          value: 1900000,
          unit: "litres",
          label: "d'eau consommés par tonne de lithium extraite",
          label_en: "of water consumed per ton of lithium extracted",
          iconType: "olympic_pool",
          equivalence: { type: "olympic_pool", count: 1 }
        }
      ]
    },
    explanation: "Le Salar de Atacama au Chili. 3 000 km² avec la concentration de lithium la plus élevée au monde. L'extraction assèche progressivement la région.",
    explanation_en: "The Salar de Atacama in Chile. 3,000 km² with the highest lithium concentration in the world. Extraction is progressively drying out the region.",
    source: "Rapports environnementaux Chili 2024"
  },

  // ============================================
  // EXTRACTION MINIÈRE - TERRES RARES
  // ============================================
  {
    id: "terres-rares-bayan-obo",
    question: "Trouvez la plus grande mine de terres rares au monde.",
    question_en: "Find the world's largest rare earth mine.",
    category: "extraction",
    target: {
      lat: 41.8,
      lng: 109.9,
      name: "Bayan Obo, Mongolie Intérieure",
      name_en: "Bayan Obo, Inner Mongolia",
      radius: 50
    },
    hints: [
      { level: 1, text: "Nord de la Chine, région autonome", text_en: "Northern China, autonomous region", penalty: 0.2 },
      { level: 2, text: "Opérée par Baogang Group depuis 1957", text_en: "Operated by Baogang Group since 1957", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "surface",
          value: 10,
          unit: "km²",
          label: "de bassin de boues radioactives",
          label_en: "of radioactive tailings pond",
          iconType: "radioactive",
          color: "#eab308",
          equivalence: { type: "football_field", count: 1400 }
        },
        {
          type: "count",
          value: 70000,
          unit: "tonnes",
          label: "de thorium radioactif stockées sans protection",
          label_en: "of radioactive thorium stored without protection",
          iconType: "radioactive",
          color: "#eab308"
        },
        {
          type: "count",
          value: 200,
          unit: "millions",
          label: "de personnes menacées via le fleuve Jaune",
          label_en: "people threatened via the Yellow River",
          iconType: "warning",
          color: "#f59e0b"
        }
      ]
    },
    explanation: "Bayan Obo en Mongolie Intérieure. L'infiltration des boues progresse de 20-30 m/an vers le fleuve Jaune. 200 millions de tonnes de résidus radioactifs.",
    explanation_en: "Bayan Obo in Inner Mongolia. Tailings seepage advances 20-30 m/year toward the Yellow River. 200 million tons of radioactive residue.",
    source: "Chinese Society of Rare Earths"
  },

  // ============================================
  // EXTRACTION MINIÈRE - TANTALE/COLTAN
  // ============================================
  {
    id: "tantale-rubaya",
    question: "Identifiez la plus grande mine de coltan au monde, contrôlée par un groupe armé.",
    question_en: "Identify the world's largest coltan mine, controlled by an armed group.",
    category: "extraction",
    target: {
      lat: -1.5,
      lng: 29.0,
      name: "Mine de Rubaya, Nord-Kivu, RDC",
      name_en: "Rubaya Mine, North Kivu, DRC",
      radius: 50
    },
    hints: [
      { level: 1, text: "Est de la RDC, près d'une frontière", text_en: "Eastern DRC, near a border", penalty: 0.2 },
      { level: 2, text: "Région de Masisi, ~40 km ouest de Goma", text_en: "Masisi region, ~40 km west of Goma", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 800000,
          unit: "USD/mois",
          label: "générés par le M23 via la taxation du coltan",
          label_en: "generated by M23 through coltan taxation",
          iconType: "dollar",
          color: "#16a34a"
        },
        {
          type: "count",
          value: 150,
          unit: "tonnes/mois",
          label: "de coltan contrebandées vers le Rwanda",
          label_en: "of coltan smuggled to Rwanda",
          iconType: "toxic_barrel"
        },
        {
          type: "count",
          value: 14,
          unit: "heures/jour",
          label: "de travail pour ~1 USD, sans protection",
          label_en: "of work for ~1 USD, without protection",
          iconType: "worker",
          color: "#ea580c"
        }
      ]
    },
    explanation: "La mine de Rubaya au Nord-Kivu, RDC. Produit 15-30% du tantale mondial. Un effondrement en juin 2025 a causé 16-21 morts.",
    explanation_en: "The Rubaya mine in North Kivu, DRC. Produces 15-30% of the world's tantalum. A collapse in June 2025 caused 16-21 deaths.",
    source: "UN Group of Experts, Global Witness 2022"
  },

  // ============================================
  // EXTRACTION MINIÈRE - NICKEL
  // ============================================
  {
    id: "nickel-morowali",
    question: "Trouvez le plus grand site de traitement de nickel au monde.",
    question_en: "Find the world's largest nickel processing site.",
    category: "extraction",
    target: {
      lat: -2.35,
      lng: 121.5,
      name: "IMIP, Sulawesi, Indonésie",
      name_en: "IMIP, Sulawesi, Indonesia",
      radius: 50
    },
    hints: [
      { level: 1, text: "Sur une île en forme de 'K' d'un archipel asiatique", text_en: "On a 'K'-shaped island in an Asian archipelago", penalty: 0.2 },
      { level: 2, text: "Indonesia Morowali Industrial Park", text_en: "Indonesia Morowali Industrial Park", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 12300,
          unit: "hectares",
          label: "de forêt détruite dans la zone de Morowali",
          label_en: "of forest destroyed in the Morowali area",
          iconType: "hectare_forest",
          color: "#14532d",
          equivalence: { type: "football_field", count: 17200 }
        },
        {
          type: "count",
          value: 101,
          unit: "morts",
          label: "dans 114 incidents depuis 2015",
          label_en: "in 114 incidents since 2015",
          iconType: "death",
          color: "#dc2626"
        },
        {
          type: "count",
          value: 240,
          unit: "blessés",
          label: "dont 38 graves lors de l'explosion de déc. 2023",
          label_en: "including 38 serious injuries in the Dec. 2023 explosion",
          iconType: "injured",
          color: "#b91c1c"
        }
      ]
    },
    explanation: "L'IMIP à Sulawesi, Indonésie. L'Indonésie est 1er producteur mondial de nickel avec 1,8 million de tonnes en 2023 (50% mondial).",
    explanation_en: "IMIP in Sulawesi, Indonesia. Indonesia is the world's top nickel producer with 1.8 million tons in 2023 (50% global).",
    source: "USGS 2024, IUCN NL"
  },

  // ============================================
  // EXTRACTION MINIÈRE - OR
  // ============================================
  {
    id: "or-ghana",
    question: "Identifiez le pays où le 'galamsey' (orpaillage illégal) a contaminé 60% des cours d'eau.",
    question_en: "Identify the country where 'galamsey' (illegal gold mining) has contaminated 60% of waterways.",
    category: "extraction",
    target: {
      lat: 7.5,
      lng: -1.5,
      name: "Ghana",
      name_en: "Ghana",
      radius: 150
    },
    hints: [
      { level: 1, text: "Afrique de l'Ouest, golfe de Guinée", text_en: "West Africa, Gulf of Guinea", penalty: 0.2 },
      { level: 2, text: "Ancienne Côte-de-l'Or britannique", text_en: "Former British Gold Coast", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "percentage",
          value: 60,
          label: "des cours d'eau contaminés au mercure",
          label_en: "of waterways contaminated with mercury",
          iconType: "mercury",
          sublabel: "Contamination irréversible",
          sublabel_en: "Irreversible contamination"
        },
        {
          type: "count",
          value: 5,
          unit: "tonnes/an",
          label: "de mercure rejetées par les opérations artisanales",
          label_en: "of mercury released by artisanal operations",
          iconType: "toxic_barrel",
          color: "#84cc16"
        },
        {
          type: "multiplier",
          value: 3,
          label: "fois la concentration de mercure autorisée dans les poissons",
          label_en: "times the permitted mercury concentration in fish",
          comparison: "Par rapport aux niveaux sécuritaires EPA",
          comparison_en: "Compared to EPA safe levels"
        }
      ]
    },
    explanation: "Le Ghana. Entre 300 000 et 1,1 million de personnes travaillent directement dans l'orpaillage artisanal.",
    explanation_en: "Ghana. Between 300,000 and 1.1 million people work directly in artisanal gold mining.",
    source: "EPA Ghana, études environnementales"
  },

  // ============================================
  // PRODUCTION - SEMI-CONDUCTEURS
  // ============================================
  {
    id: "tsmc-fab18",
    question: "Localisez la plus grande usine de semi-conducteurs au monde.",
    question_en: "Locate the world's largest semiconductor factory.",
    category: "production",
    target: {
      lat: 23.05,
      lng: 120.22,
      name: "Fab 18, Tainan Science Park, Taïwan",
      name_en: "Fab 18, Tainan Science Park, Taiwan",
      radius: 20
    },
    hints: [
      { level: 1, text: "Sur une île revendiquée par la Chine", text_en: "On an island claimed by China", penalty: 0.2 },
      { level: 2, text: "TSMC, Tainan Science Park", text_en: "TSMC, Tainan Science Park", penalty: 0.4 }
    ],
    impact: {
      realtime: {
        rate: 3200,
        unit: "litres",
        unit_en: "liters",
        per: "seconde",
        per_en: "second",
        label: "d'eau consommée par TSMC",
        label_en: "of water consumed by TSMC",
        iconType: "water"
      },
      stats: [
        {
          type: "count",
          value: 25,
          unit: "TWh/an",
          label: "d'électricité consommée par TSMC",
          label_en: "of electricity consumed by TSMC",
          iconType: "house_year",
          color: "#059669",
          equivalence: { type: "house_year", count: 5555556 }
        },
        {
          type: "percentage",
          value: 25,
          label: "de la consommation électrique des ménages taïwanais",
          label_en: "of Taiwanese household electricity consumption",
          iconType: "house_year",
          sublabel: "Une seule entreprise = 1/4 de la population",
          sublabel_en: "A single company = 1/4 of the population"
        }
      ]
    },
    explanation: "La Fab 18 de TSMC à Taïwan. TSMC consomme ~101 millions m³ d'eau annuellement. 90% des capacités de fabrication avancées sont concentrées à Taiwan.",
    explanation_en: "TSMC's Fab 18 in Taiwan. TSMC consumes ~101 million m³ of water annually. 90% of advanced manufacturing capacity is concentrated in Taiwan.",
    source: "TSMC Annual Report"
  },
  {
    id: "gpu-h100",
    question: "Où sont fabriqués les GPU NVIDIA H100 ?",
    question_en: "Where are NVIDIA H100 GPUs manufactured?",
    category: "production",
    target: {
      lat: 24.8,
      lng: 121.0,
      name: "Taïwan (TSMC)",
      name_en: "Taiwan (TSMC)",
      radius: 100
    },
    hints: [
      { level: 1, text: "Détroit séparant cette île de la Chine continentale", text_en: "Strait separating this island from mainland China", penalty: 0.2 },
      { level: 2, text: "Processus custom 4N de TSMC", text_en: "TSMC custom 4N process", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 80,
          unit: "milliards",
          label: "de transistors par GPU H100",
          label_en: "transistors per H100 GPU",
          iconType: "smartphone"
        },
        {
          type: "count",
          value: 164,
          unit: "kg CO₂",
          label: "d'empreinte carbone par carte GPU H100",
          label_en: "carbon footprint per H100 GPU card",
          iconType: "car_year",
          equivalence: { type: "flight_paris_ny", count: 1 }
        },
        {
          type: "count",
          value: 1312,
          unit: "kg CO₂",
          label: "pour un baseboard HGX H100 (8 GPU)",
          label_en: "for an HGX H100 baseboard (8 GPUs)",
          iconType: "car_year",
          color: "#64748b"
        }
      ]
    },
    explanation: "Taïwan. La répartition de l'empreinte carbone : mémoire HBM (42%), circuits intégrés (25%), thermique (18%).",
    explanation_en: "Taiwan. Carbon footprint breakdown: HBM memory (42%), integrated circuits (25%), thermal (18%).",
    source: "NVIDIA Product Carbon Footprint"
  },

  // ============================================
  // PRODUCTION - ASSEMBLAGE FOXCONN
  // ============================================
  {
    id: "foxconn-longhua",
    question: "Trouvez le plus grand campus d'assemblage électronique au monde.",
    question_en: "Find the world's largest electronics assembly campus.",
    category: "production",
    target: {
      lat: 22.66,
      lng: 114.04,
      name: "Longhua, Shenzhen, Chine",
      name_en: "Longhua, Shenzhen, China",
      radius: 20
    },
    hints: [
      { level: 1, text: "Zone économique spéciale près de Hong Kong", text_en: "Special economic zone near Hong Kong", penalty: 0.2 },
      { level: 2, text: "Livre 'Dying for an iPhone' de Chan, Selden & Pun", text_en: "Book 'Dying for an iPhone' by Chan, Selden & Pun", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 300000,
          unit: "travailleurs",
          label: "employés sur ce campus en 2010",
          label_en: "workers employed on this campus in 2010",
          iconType: "worker",
          color: "#ea580c"
        },
        {
          type: "count",
          value: 137000,
          unit: "iPhones/jour",
          label: "assemblés (~90 par minute)",
          label_en: "assembled (~90 per minute)",
          iconType: "smartphone"
        },
        {
          type: "grid",
          gridType: "death",
          count: 14,
          label: "14 suicides de janvier à mai 2010, tous par saut depuis les bâtiments",
          label_en: "14 suicides from January to May 2010, all by jumping from buildings",
          maxItems: 14
        }
      ]
    },
    explanation: "Longhua à Shenzhen. Réponses aux suicides : filets anti-suicide (toujours en place), contrats 'promesse de ne pas se suicider'.",
    explanation_en: "Longhua in Shenzhen. Responses to suicides: anti-suicide nets (still in place), 'promise not to commit suicide' contracts.",
    source: "Chan, Selden & Pun 2020, 'Dying for an iPhone'"
  },
  {
    id: "foxconn-zhengzhou",
    question: "Trouvez la plus grande usine d'assemblage d'iPhone au monde.",
    question_en: "Find the world's largest iPhone assembly factory.",
    category: "production",
    target: {
      lat: 34.52,
      lng: 113.84,
      name: "Zhengzhou, Chine",
      name_en: "Zhengzhou, China",
      radius: 30
    },
    hints: [
      { level: 1, text: "Centre de la Chine, province du Henan", text_en: "Central China, Henan province", penalty: 0.2 },
      { level: 2, text: "80% des exportations de Zhengzhou", text_en: "80% of Zhengzhou's exports", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 200000,
          unit: "travailleurs",
          label: "employés en haute saison",
          label_en: "workers employed in peak season",
          iconType: "worker"
        },
        {
          type: "count",
          value: 75,
          unit: "heures/semaine",
          label: "de travail (limite légale : 49h)",
          label_en: "of work (legal limit: 49h)",
          iconType: "hour",
          color: "#6366f1"
        },
        {
          type: "percentage",
          value: 50,
          label: "de travailleurs 'dispatch' (limite légale : 10%)",
          label_en: "of 'dispatch' workers (legal limit: 10%)",
          iconType: "worker",
          sublabel: "Précarité institutionnalisée",
          sublabel_en: "Institutionalized precarity"
        }
      ]
    },
    explanation: "Zhengzhou en Chine. Heures sup : 80-130h/mois en haute saison. Discrimination documentée contre Ouïghours, Tibétains, Hui.",
    explanation_en: "Zhengzhou in China. Overtime: 80-130h/month in peak season. Documented discrimination against Uyghurs, Tibetans, and Hui.",
    source: "China Labor Watch 2025"
  },

  // ============================================
  // DATA CENTERS - ÉTATS-UNIS
  // ============================================
  {
    id: "datacenter-ashburn",
    question: "Localisez la plus grande concentration de data centers au monde.",
    question_en: "Locate the world's largest concentration of data centers.",
    category: "datacenter",
    target: {
      lat: 39.04,
      lng: -77.49,
      name: "Ashburn, Virginie, USA",
      name_en: "Ashburn, Virginia, USA",
      radius: 20
    },
    hints: [
      { level: 1, text: "Près de la capitale fédérale américaine", text_en: "Near the American federal capital", penalty: 0.2 },
      { level: 2, text: "Virginie du Nord, électricité Dominion Virginia Power", text_en: "Northern Virginia, Dominion Virginia Power electricity", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 152,
          unit: "installations",
          label: "de data centers dans cette zone",
          label_en: "data centers in this area",
          iconType: "house_year"
        },
        {
          type: "percentage",
          value: 70,
          label: "du trafic internet mondial transite ici",
          label_en: "of global internet traffic passes through here",
          iconType: "warning",
          sublabel: "Un point de concentration critique",
          sublabel_en: "A critical concentration point"
        },
        {
          type: "percentage",
          value: 26,
          label: "de l'électricité de Virginie consommée par les data centers",
          label_en: "of Virginia's electricity consumed by data centers",
          iconType: "house_year"
        }
      ]
    },
    explanation: "Ashburn en Virginie. Premier marché à dépasser 1 GW de capacité. Exemptions fiscales massives.",
    explanation_en: "Ashburn in Virginia. First market to exceed 1 GW capacity. Massive tax exemptions.",
    source: "IEA 2025"
  },
  {
    id: "datacenter-the-dalles",
    question: "Trouvez le data center Google qui consomme 29% de l'eau d'une ville américaine.",
    question_en: "Find the Google data center that consumes 29% of an American town's water.",
    category: "datacenter",
    target: {
      lat: 45.60,
      lng: -121.18,
      name: "The Dalles, Oregon, USA",
      name_en: "The Dalles, Oregon, USA",
      radius: 20
    },
    hints: [
      { level: 1, text: "Oregon, nord-ouest des États-Unis", text_en: "Oregon, northwestern United States", penalty: 0.2 },
      { level: 2, text: "Ville en zone de sécheresse chronique", text_en: "Town in a chronic drought zone", penalty: 0.4 }
    ],
    impact: {
      realtime: {
        rate: 42,
        unit: "litres",
        unit_en: "liters",
        per: "seconde",
        per_en: "second",
        label: "d'eau consommée par ce data center",
        label_en: "of water consumed by this data center",
        iconType: "water"
      },
      stats: [
        {
          type: "percentage",
          value: 29,
          label: "de la consommation d'eau totale de la ville",
          label_en: "of the town's total water consumption",
          iconType: "water",
          sublabel: "Un seul data center = presque 1/3 de la ville",
          sublabel_en: "A single data center = almost 1/3 of the town"
        },
        {
          type: "multiplier",
          value: 3,
          label: "fois plus d'eau consommée qu'en 2017",
          label_en: "times more water consumed than in 2017",
          comparison: "Augmentation exponentielle",
          comparison_en: "Exponential increase"
        },
        {
          type: "count",
          value: 260,
          unit: "millions USD",
          label: "d'exemptions fiscales accordées à Google",
          label_en: "in tax exemptions granted to Google",
          iconType: "dollar"
        }
      ]
    },
    explanation: "The Dalles en Oregon. La ville a poursuivi en justice pour empêcher la divulgation des données - Google finançant les frais.",
    explanation_en: "The Dalles in Oregon. The town sued to prevent data disclosure - with Google funding the legal fees.",
    source: "Washington Post, documents juridiques Oregon"
  },
  {
    id: "datacenter-dublin",
    question: "Quelle capitale européenne a imposé un moratoire sur les data centers jusqu'en 2028 ?",
    question_en: "Which European capital imposed a moratorium on data centers until 2028?",
    category: "datacenter",
    target: {
      lat: 53.35,
      lng: -6.26,
      name: "Dublin, Irlande",
      name_en: "Dublin, Ireland",
      radius: 30
    },
    hints: [
      { level: 1, text: "Capitale d'un pays insulaire de l'UE", text_en: "Capital of an EU island country", penalty: 0.2 },
      { level: 2, text: "Hub européen des géants tech (Google, Meta, Microsoft)", text_en: "European hub for tech giants (Google, Meta, Microsoft)", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "percentage",
          value: 22,
          label: "de l'électricité nationale consommée par les data centers",
          label_en: "of national electricity consumed by data centers",
          iconType: "house_year",
          sublabel: "Plus d'1/5 de l'électricité d'un pays entier",
          sublabel_en: "More than 1/5 of an entire country's electricity"
        },
        {
          type: "multiplier",
          value: 473,
          label: "% d'augmentation depuis 2015",
          label_en: "% increase since 2015",
          comparison: "Croissance presque x5 en moins de 10 ans",
          comparison_en: "Almost 5x growth in less than 10 years"
        }
      ]
    },
    explanation: "Dublin en Irlande. Le moratoire jusqu'en 2028 interdit les nouvelles connexions au réseau pour éviter les blackouts.",
    explanation_en: "Dublin in Ireland. The moratorium until 2028 bans new grid connections to prevent blackouts.",
    source: "EirGrid, Irish government 2024"
  },
  {
    id: "training-gpt3",
    question: "Dans quel État américain GPT-3 a-t-il été entraîné ?",
    question_en: "In which American state was GPT-3 trained?",
    category: "datacenter",
    target: {
      lat: 41.9,
      lng: -93.1,
      name: "Iowa, USA",
      name_en: "Iowa, USA",
      radius: 150
    },
    hints: [
      { level: 1, text: "Midwest américain, 'Corn Belt'", text_en: "American Midwest, 'Corn Belt'", penalty: 0.2 },
      { level: 2, text: "Data centers Microsoft", text_en: "Microsoft data centers", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 700000,
          unit: "litres",
          label: "d'eau consommés pour entraîner GPT-3",
          label_en: "of water consumed to train GPT-3",
          iconType: "olympic_pool",
          equivalence: { type: "shower_year", count: 32 }
        },
        {
          type: "count",
          value: 552,
          unit: "tonnes CO₂",
          label: "émises pour l'entraînement",
          label_en: "emitted for training",
          iconType: "car_year",
          equivalence: { type: "car_year", count: 120 }
        },
        {
          type: "ratio",
          smallValue: "0.2g CO₂",
          smallLabel: "Recherche Google",
          smallLabel_en: "Google Search",
          smallIconType: "google_search",
          bigValue: "2-5g CO₂",
          bigLabel: "Requête ChatGPT",
          bigLabel_en: "ChatGPT Query",
          bigIconType: "warning",
          ratio: 15
        }
      ]
    },
    explanation: "L'Iowa. GPT-3 : 1 287 MWh d'électricité. Équivalent à 5 voitures sur leur durée de vie ou 550 vols New York-San Francisco.",
    explanation_en: "Iowa. GPT-3: 1,287 MWh of electricity. Equivalent to 5 cars over their lifetime or 550 New York-San Francisco flights.",
    source: "Patterson et al. 2021"
  },

  // ============================================
  // DÉCHETS ÉLECTRONIQUES
  // ============================================
  {
    id: "ewaste-agbogbloshie",
    question: "Trouvez le plus grand dépotoir d'e-déchets d'Afrique (démoli en 2021).",
    question_en: "Find Africa's largest e-waste dump (demolished in 2021).",
    category: "dechets",
    target: {
      lat: 5.55,
      lng: -0.225,
      name: "Agbogbloshie, Accra, Ghana",
      name_en: "Agbogbloshie, Accra, Ghana",
      radius: 10
    },
    hints: [
      { level: 1, text: "Capitale d'un pays d'Afrique de l'Ouest", text_en: "Capital of a West African country", penalty: 0.2 },
      { level: 2, text: "Berges de la Korle Lagoon, série photo 'Permanent Error' de Pieter Hugo", text_en: "Banks of the Korle Lagoon, 'Permanent Error' photo series by Pieter Hugo", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "surface",
          value: 1.5,
          unit: "km²",
          label: "de superficie du dépotoir",
          label_en: "of dump site area",
          iconType: "football_field",
          equivalence: { type: "football_field", count: 210 }
        },
        {
          type: "percentage",
          value: 80,
          label: "des enfants empoisonnés au plomb sur ce site",
          label_en: "of children poisoned by lead at this site",
          iconType: "child",
          sublabel: "Contamination de masse",
          sublabel_en: "Mass contamination"
        },
        {
          type: "multiplier",
          value: 100,
          label: "fois les limites de toxines acceptables dans la lagune",
          label_en: "times the acceptable toxin limits in the lagoon",
          comparison: "Plomb, mercure, thallium, cyanure...",
          comparison_en: "Lead, mercury, thallium, cyanide..."
        }
      ]
    },
    explanation: "Agbogbloshie à Accra, Ghana. Le pays importait ~215 000 tonnes d'e-déchets d'Europe occidentale par an.",
    explanation_en: "Agbogbloshie in Accra, Ghana. The country imported ~215,000 tons of e-waste from Western Europe per year.",
    source: "Pieter Hugo 'Permanent Error', études environnementales Ghana"
  },
  {
    id: "ewaste-guiyu",
    question: "Trouvez le plus grand site de recyclage d'e-waste au monde (Record Guinness 2013).",
    question_en: "Find the world's largest e-waste recycling site (Guinness Record 2013).",
    category: "dechets",
    target: {
      lat: 23.55,
      lng: 116.32,
      name: "Guiyu, Guangdong, Chine",
      name_en: "Guiyu, Guangdong, China",
      radius: 20
    },
    hints: [
      { level: 1, text: "Province côtière du sud de la Chine", text_en: "Coastal province in southern China", penalty: 0.2 },
      { level: 2, text: "60-80% des familles impliquées, déplacé vers un parc industriel depuis 2017", text_en: "60-80% of families involved, relocated to an industrial park since 2017", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 6000,
          unit: "ateliers",
          label: "familiaux traitant les e-déchets",
          label_en: "family workshops processing e-waste",
          iconType: "family"
        },
        {
          type: "count",
          value: 1600000,
          unit: "tonnes/an",
          label: "d'e-déchets traités",
          label_en: "of e-waste processed",
          iconType: "toxic_barrel",
          equivalence: { type: "eiffel_tower", count: 219 }
        },
        {
          type: "percentage",
          value: 82,
          label: "des enfants avec niveaux de plomb sanguin dangereux",
          label_en: "of children with dangerous blood lead levels",
          iconType: "child",
          sublabel: "Zone de Dutou : 100% des enfants testés dépassaient les seuils",
          sublabel_en: "Dutou area: 100% of tested children exceeded thresholds"
        }
      ]
    },
    explanation: "Guiyu dans le Guangdong. Études Huo et al. (2007) : BLL moyen de 15,3 µg/dL (vs 9,94 dans la ville témoin).",
    explanation_en: "Guiyu in Guangdong. Huo et al. studies (2007): average BLL of 15.3 µg/dL (vs 9.94 in the control town).",
    source: "Huo et al. Environmental Health Perspectives 2007"
  },

  // ============================================
  // QUESTIONS SUPPLÉMENTAIRES
  // ============================================
  {
    id: "silicium-xinjiang",
    question: "Localisez la région produisant 45% du polysilicium mondial.",
    question_en: "Locate the region producing 45% of the world's polysilicon.",
    category: "extraction",
    target: {
      lat: 41.0,
      lng: 85.0,
      name: "Xinjiang, Chine",
      name_en: "Xinjiang, China",
      radius: 200
    },
    hints: [
      { level: 1, text: "Nord-ouest de la Chine", text_en: "Northwestern China", penalty: 0.2 },
      { level: 2, text: "L'Uyghur Forced Labor Prevention Act (2021) interdit les importations aux USA", text_en: "The Uyghur Forced Labor Prevention Act (2021) bans imports to the USA", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "percentage",
          value: 45,
          label: "du polysilicium mondial produit dans cette région",
          label_en: "of global polysilicon produced in this region",
          iconType: "radioactive",
          sublabel: "35-45% de la production mondiale",
          sublabel_en: "35-45% of global production"
        },
        {
          type: "percentage",
          value: 82,
          label: "du polysilicium mondial produit en Chine au total",
          label_en: "of global polysilicon produced in China overall",
          iconType: "warning"
        }
      ]
    },
    explanation: "Le Xinjiang en Chine. Le procédé Siemens pour le polysilicium consomme 100-200 kWh/kg.",
    explanation_en: "Xinjiang in China. The Siemens process for polysilicon consumes 100-200 kWh/kg.",
    source: "US Department of Labor 2021, Sheffield Hallam University 2023"
  },
  {
    id: "cuivre-escondida",
    question: "Identifiez la plus grande mine de cuivre au monde.",
    question_en: "Identify the world's largest copper mine.",
    category: "extraction",
    target: {
      lat: -24.267,
      lng: -69.067,
      name: "Mine d'Escondida, Chili",
      name_en: "Escondida Mine, Chile",
      radius: 200
    },
    hints: [
      { level: 1, text: "À 3 100 m d'altitude dans un désert sud-américain", text_en: "At 3,100 m altitude in a South American desert", penalty: 0.2 },
      { level: 2, text: "~9,5% de la production mondiale de cuivre", text_en: "~9.5% of global copper production", penalty: 0.4 }
    ],
    impact: {
      realtime: {
        rate: 1400,
        unit: "litres",
        unit_en: "liters",
        per: "seconde",
        per_en: "second",
        label: "d'eau historiquement extraite de l'aquifère local",
        label_en: "of water historically extracted from the local aquifer",
        iconType: "water"
      },
      stats: [
        {
          type: "count",
          value: 1055000,
          unit: "tonnes",
          label: "de cuivre produites en 2023",
          label_en: "of copper produced in 2023",
          iconType: "elephant",
          equivalence: { type: "elephant", count: 211000 }
        },
        {
          type: "count",
          value: 4,
          unit: "milliards USD",
          label: "investis dans la désalinisation depuis 2020",
          label_en: "invested in desalination since 2020",
          iconType: "dollar"
        }
      ]
    },
    explanation: "La mine d'Escondida au Chili. Située dans le désert d'Atacama à 3 100 m d'altitude.",
    explanation_en: "The Escondida mine in Chile. Located in the Atacama Desert at 3,100 m altitude.",
    source: "BHP Annual Report 2023"
  },
  {
    id: "or-madre-de-dios",
    question: "Localisez l'épicentre de l'orpaillage illégal en Amazonie péruvienne.",
    question_en: "Locate the epicenter of illegal gold mining in the Peruvian Amazon.",
    category: "extraction",
    target: {
      lat: -12.5,
      lng: -69.2,
      name: "Madre de Dios, Pérou",
      name_en: "Madre de Dios, Peru",
      radius: 100
    },
    hints: [
      { level: 1, text: "Amazonie d'un pays andin", text_en: "Amazon region of an Andean country", penalty: 0.2 },
      { level: 2, text: "Région de Puerto Maldonado", text_en: "Puerto Maldonado region", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 95750,
          unit: "hectares",
          label: "de forêt perdus entre 1985 et 2017",
          label_en: "of forest lost between 1985 and 2017",
          iconType: "hectare_forest",
          color: "#14532d"
        },
        {
          type: "percentage",
          value: 78,
          label: "des adultes de Puerto Maldonado avec mercure au-dessus des standards",
          label_en: "of Puerto Maldonado adults with mercury above standards",
          iconType: "mercury"
        },
        {
          type: "percentage",
          value: 67,
          label: "de la déforestation entre 2009 et 2017",
          label_en: "of deforestation between 2009 and 2017",
          iconType: "tree",
          sublabel: "Accélération dramatique",
          sublabel_en: "Dramatic acceleration"
        }
      ]
    },
    explanation: "Madre de Dios au Pérou. Orpaillage illégal massif dans cette région amazonienne.",
    explanation_en: "Madre de Dios in Peru. Massive illegal gold mining in this Amazon region.",
    source: "Études environnementales Pérou"
  },
  {
    id: "datacenter-lulea",
    question: "Localisez le data center au meilleur PUE mondial (1.04).",
    question_en: "Locate the data center with the best PUE in the world (1.04).",
    category: "datacenter",
    target: {
      lat: 65.58,
      lng: 22.16,
      name: "Luleå, Suède",
      name_en: "Luleå, Sweden",
      radius: 30
    },
    hints: [
      { level: 1, text: "Nord d'un pays scandinave", text_en: "North of a Scandinavian country", penalty: 0.2 },
      { level: 2, text: "Premier data center Meta hors USA", text_en: "First Meta data center outside the USA", penalty: 0.4 }
    ],
    impact: {
      stats: [
        {
          type: "count",
          value: 1.04,
          unit: "PUE",
          label: "Meilleur PUE au monde (vs moyenne industrie 1.58)",
          label_en: "Best PUE in the world (vs industry average 1.58)",
          iconType: "house_year"
        },
        {
          type: "percentage",
          value: 100,
          label: "d'hydroélectricité utilisée",
          label_en: "hydroelectricity used",
          iconType: "water",
          sublabel: "Énergie 100% renouvelable",
          sublabel_en: "100% renewable energy"
        },
        {
          type: "count",
          value: 10,
          unit: "mois/an",
          label: "de refroidissement naturel gratuit (free-air cooling)",
          label_en: "of free natural cooling (free-air cooling)",
          iconType: "hour"
        }
      ]
    },
    explanation: "Luleå en Suède. Le climat arctique permet le meilleur PUE au monde grâce au free-air cooling 8-10 mois par an.",
    explanation_en: "Luleå in Sweden. The Arctic climate enables the world's best PUE thanks to free-air cooling 8-10 months per year.",
    source: "Meta"
  }
];

// Fonction pour obtenir le nombre total de questions par catégorie
export function getQuestionCountByCategory() {
  const counts = {};
  for (const cat of Object.keys(categories)) {
    counts[cat] = questions.filter(q => q.category === cat).length;
  }
  return counts;
}

// Fonction pour obtenir le nombre total de questions
export function getTotalQuestionCount() {
  return questions.length;
}

// Fonction pour échantillonner les questions
// countOrAllocation: number (total, répartition auto) ou objet { extraction: 3, production: 2, ... }
export function sampleQuestions(countOrAllocation) {
  const categoryKeys = Object.keys(categories);
  const questionsByCategory = {};

  for (const cat of categoryKeys) {
    questionsByCategory[cat] = questions.filter(q => q.category === cat);
  }

  let categoryAllocation;

  if (typeof countOrAllocation === 'object' && countOrAllocation !== null) {
    // Mode par catégorie : { extraction: 3, production: 2, ... }
    categoryAllocation = {};
    for (const cat of categoryKeys) {
      categoryAllocation[cat] = Math.min(
        countOrAllocation[cat] || 0,
        questionsByCategory[cat].length
      );
    }
  } else {
    // Mode total : répartition automatique équilibrée
    const count = countOrAllocation;
    categoryAllocation = {};
    const questionsPerCategory = Math.floor(count / categoryKeys.length);
    const remainder = count % categoryKeys.length;

    for (const cat of categoryKeys) {
      categoryAllocation[cat] = Math.min(questionsPerCategory, questionsByCategory[cat].length);
    }

    let remainderToDistribute = remainder;
    for (const cat of categoryKeys) {
      if (remainderToDistribute <= 0) break;
      if (categoryAllocation[cat] < questionsByCategory[cat].length) {
        categoryAllocation[cat]++;
        remainderToDistribute--;
      }
    }

    let totalAllocated = Object.values(categoryAllocation).reduce((a, b) => a + b, 0);
    while (totalAllocated < count) {
      for (const cat of categoryKeys) {
        if (totalAllocated >= count) break;
        if (categoryAllocation[cat] < questionsByCategory[cat].length) {
          categoryAllocation[cat]++;
          totalAllocated++;
        }
      }
      if (totalAllocated === Object.values(categoryAllocation).reduce((a, b) => a + b, 0)) {
        break;
      }
      totalAllocated = Object.values(categoryAllocation).reduce((a, b) => a + b, 0);
    }
  }

  const sampled = [];
  for (const cat of categoryKeys) {
    const available = [...questionsByCategory[cat]];
    const toSample = categoryAllocation[cat];

    for (let i = available.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [available[i], available[j]] = [available[j], available[i]];
    }

    sampled.push(...available.slice(0, toSample));
  }

  for (let i = sampled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sampled[i], sampled[j]] = [sampled[j], sampled[i]];
  }

  return sampled;
}

export default questions;
