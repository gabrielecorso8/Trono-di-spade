export const FACTIONS = [
  { id: "stark", name: "Stark", color: "#E5E7EB" }, // Gray/White
  { id: "baratheon", name: "Baratheon", color: "#FCD34D" }, // Yellow
  { id: "lannister", name: "Lannister", color: "#EF4444" }, // Red
  { id: "tyrell", name: "Tyrell", color: "#22C55E" }, // Green
  { id: "martell", name: "Martell", color: "#F97316" }, // Orange
  { id: "greyjoy", name: "Greyjoy", color: "#1E3A8A" }, // Dark Blue (Optional)
];

export const REGIONS = [
  { id: "beyond_the_wall", name: "Beyond the Wall", bonus: 2 },
  { id: "winterfell", name: "Winterfell", bonus: 3 },
  { id: "dreadfort", name: "Dreadfort", bonus: 2 },
  { id: "iron_islands", name: "Iron Islands", bonus: 1 },
  { id: "riverlands", name: "The Riverlands", bonus: 2 },
  { id: "westerlands", name: "The Westerlands", bonus: 2 },
  { id: "vale_of_arryn", name: "Vale of Arryn", bonus: 1 },
  { id: "crownlands", name: "The Crownlands", bonus: 2 },
  { id: "stormlands", name: "The Stormlands", bonus: 1 },
  { id: "reach", name: "The Reach", bonus: 4 },
  { id: "dorne", name: "Dorne", bonus: 1 },
];

export const TERRITORIES = {
  // Beyond the Wall
  "lands_of_always_winter": { name: "The Lands of Always Winter", region: "beyond_the_wall", x: 25, y: 4, hasCastle: true },
  "frozen_shore": { name: "Frozen Shore", region: "beyond_the_wall", x: 30, y: 9 },
  "fist_of_the_first_men": { name: "Fist of the First Men", region: "beyond_the_wall", x: 45, y: 6 },
  "haunted_forest": { name: "The Haunted Forest", region: "beyond_the_wall", x: 55, y: 7 },
  "hardhome": { name: "Hardhome", region: "beyond_the_wall", x: 65, y: 3, hasPort: true, portCoast: "east" },

  // Winterfell
  "bear_island": { name: "Bear Island", region: "winterfell", x: 25, y: 15 },
  "wolfswood": { name: "Wolfswood", region: "winterfell", x: 32, y: 22, hasPort: true, portCoast: "west" },
  "stoney_shore": { name: "Stoney Shore", region: "winterfell", x: 18, y: 30 },
  "barrowlands": { name: "Barrowlands", region: "winterfell", x: 35, y: 33, hasCastle: true },
  "winterfell_territory": { name: "Winterfell", region: "winterfell", x: 48, y: 26, hasCastle: true },
  "cape_kraken": { name: "Cape Kraken", region: "winterfell", x: 22, y: 42, hasPort: true, portCoast: "west" },
  "the_neck": { name: "The Neck", region: "winterfell", x: 40, y: 42 },

  // Dreadfort
  "the_gift": { name: "The Gift", region: "dreadfort", x: 55, y: 12 },
  "skagos": { name: "Skagos", region: "dreadfort", x: 70, y: 10 },
  "karhold": { name: "Karhold", region: "dreadfort", x: 70, y: 18 },
  "the_dreadfort": { name: "The Dreadfort", region: "dreadfort", x: 60, y: 22, hasCastle: true },
  "widows_watch": { name: "Widow's Watch", region: "dreadfort", x: 65, y: 28, hasPort: true, portCoast: "east" },
  "white_harbor": { name: "White Harbor", region: "dreadfort", x: 55, y: 34, hasPort: true, portCoast: "east" },

  // Iron Islands
  "harlaw": { name: "Harlaw", region: "iron_islands", x: 25, y: 48, hasPort: true, portCoast: "west" },
  "pyke": { name: "Pyke", region: "iron_islands", x: 18, y: 52, hasCastle: true, hasPort: true, portCoast: "west" },

  // Riverlands
  "the_twins": { name: "The Twins", region: "riverlands", x: 42, y: 48, hasCastle: true },
  "the_trident": { name: "The Trident", region: "riverlands", x: 50, y: 52, hasPort: true, portCoast: "west" },
  "riverrun": { name: "Riverrun", region: "riverlands", x: 42, y: 58, hasCastle: true },
  "stoney_sept": { name: "Stoney Sept", region: "riverlands", x: 45, y: 63 },
  "harrenhal": { name: "Harrenhal", region: "riverlands", x: 52, y: 61 },

  // Westerlands
  "the_crag": { name: "The Crag", region: "westerlands", x: 30, y: 56 },
  "golden_tooth": { name: "Golden Tooth", region: "westerlands", x: 38, y: 60 },
  "casterly_rock": { name: "Casterly Rock", region: "westerlands", x: 25, y: 65, hasCastle: true, hasPort: true, portCoast: "west" },
  "silverhill": { name: "Silverhill", region: "westerlands", x: 35, y: 68 },
  "crakehall": { name: "Crakehall", region: "westerlands", x: 25, y: 72, hasCastle: true },

  // Vale of Arryn
  "mountains_of_the_moon": { name: "Mountains of the Moon", region: "vale_of_arryn", x: 60, y: 50 },
  "the_fingers": { name: "The Fingers", region: "vale_of_arryn", x: 70, y: 46 },
  "the_eyrie": { name: "The Eyrie", region: "vale_of_arryn", x: 68, y: 53, hasCastle: true },
  "gulltown": { name: "Gulltown", region: "vale_of_arryn", x: 72, y: 58, hasPort: true, portCoast: "east" },

  // Crownlands
  "crackclaw_point": { name: "Crackclaw Point", region: "crownlands", x: 68, y: 63 },
  "dragonstone": { name: "Dragonstone", region: "crownlands", x: 78, y: 65, hasCastle: true, hasPort: true, portCoast: "east" },
  "kings_landing": { name: "King's Landing", region: "crownlands", x: 62, y: 68, hasCastle: true, hasPort: true, portCoast: "east" },
  "kingswood": { name: "Kingswood", region: "crownlands", x: 65, y: 75 },

  // Stormlands
  "storms_end": { name: "Storm's End", region: "stormlands", x: 72, y: 80, hasPort: true, portCoast: "east", hasCastle: true },
  "tarth": { name: "Tarth", region: "stormlands", x: 82, y: 78 },
  "rainwood": { name: "Rainwood", region: "stormlands", x: 75, y: 85 },
  "dornish_marches": { name: "Dornish Marches", region: "stormlands", x: 60, y: 82, hasCastle: true },

  // Reach
  "searoad_marshes": { name: "Searoad Marshes", region: "reach", x: 28, y: 76 },
  "blackwater_rush": { name: "Blackwater Rush", region: "reach", x: 45, y: 72 },
  "the_mander": { name: "The Mander", region: "reach", x: 45, y: 80, hasCastle: true },
  "highgarden": { name: "Highgarden", region: "reach", x: 32, y: 85, hasCastle: true },
  "oldtown": { name: "Oldtown", region: "reach", x: 20, y: 90, hasPort: true, portCoast: "west", hasCastle: true },
  "three_towers": { name: "Three Towers", region: "reach", x: 28, y: 93 },
  "the_arbor": { name: "The Arbor", region: "reach", x: 15, y: 97 },

  // Dorne
  "red_mountains": { name: "Red Mountains", region: "dorne", x: 45, y: 90 },
  "sandstone": { name: "Sandstone", region: "dorne", x: 42, y: 96, hasCastle: true },
  "sunspear": { name: "Sunspear", region: "dorne", x: 72, y: 94, hasCastle: true, hasPort: true, portCoast: "east" },
  "greenblood": { name: "Greenblood", region: "dorne", x: 58, y: 95 },
};

// Adjacency lists (simplified for now, needs refinement based on map)
export const ADJACENCY = {
  "lands_of_always_winter": ["frozen_shore", "fist_of_the_first_men", "haunted_forest"],
  "frozen_shore": ["lands_of_always_winter", "fist_of_the_first_men"],
  "fist_of_the_first_men": ["lands_of_always_winter", "frozen_shore", "haunted_forest", "the_gift"],
  "haunted_forest": ["lands_of_always_winter", "fist_of_the_first_men", "hardhome", "the_gift"],
  "hardhome": ["haunted_forest"],
  
  "bear_island": ["wolfswood", "winterfell_territory", "stoney_shore"],
  "wolfswood": ["bear_island", "stoney_shore", "winterfell_territory", "barrowlands"],
  "stoney_shore": ["bear_island", "wolfswood", "barrowlands"],
  "barrowlands": ["stoney_shore", "wolfswood", "winterfell_territory", "the_neck", "white_harbor"],
  "winterfell_territory": ["bear_island", "wolfswood", "barrowlands", "the_gift", "the_dreadfort", "white_harbor", "widows_watch"],
  "cape_kraken": ["the_neck"],
  "the_neck": ["cape_kraken", "barrowlands", "white_harbor", "the_twins", "harlaw"],

  "the_gift": ["fist_of_the_first_men", "haunted_forest", "skagos", "karhold", "the_dreadfort"],
  "skagos": ["the_gift", "karhold"],
  "karhold": ["skagos", "the_gift", "the_dreadfort"],
  "the_dreadfort": ["the_gift", "karhold", "widows_watch", "winterfell_territory"],
  "widows_watch": ["the_dreadfort", "white_harbor", "winterfell_territory"],
  "white_harbor": ["widows_watch", "winterfell_territory", "barrowlands", "the_neck"],

  "harlaw": ["the_neck", "the_twins"],
  "pyke": ["the_crag", "riverrun"],

  "the_twins": ["the_neck", "the_trident", "riverrun", "mountains_of_the_moon", "harlaw"],
  "the_trident": ["the_twins", "mountains_of_the_moon", "harrenhal", "riverrun"],
  "riverrun": ["the_twins", "the_trident", "harrenhal", "stoney_sept", "golden_tooth", "the_crag", "pyke"],
  "stoney_sept": ["riverrun", "harrenhal", "blackwater_rush", "silverhill", "golden_tooth", "casterly_rock"],
  "harrenhal": ["the_trident", "mountains_of_the_moon", "crackclaw_point", "kings_landing", "blackwater_rush", "stoney_sept", "riverrun"],

  "the_crag": ["riverrun", "golden_tooth", "casterly_rock", "pyke"],
  "golden_tooth": ["the_crag", "riverrun", "stoney_sept", "casterly_rock"],
  "casterly_rock": ["the_crag", "golden_tooth", "silverhill", "crakehall", "stoney_sept"],
  "silverhill": ["casterly_rock", "stoney_sept", "blackwater_rush", "searoad_marshes", "crakehall"],
  "crakehall": ["casterly_rock", "silverhill", "searoad_marshes"],

  "mountains_of_the_moon": ["the_twins", "the_trident", "harrenhal", "the_eyrie"],
  "the_fingers": ["mountains_of_the_moon"],
  "the_eyrie": ["mountains_of_the_moon", "gulltown"],
  "gulltown": ["the_eyrie"],

  "crackclaw_point": ["harrenhal", "kings_landing", "dragonstone"],
  "dragonstone": ["crackclaw_point", "kings_landing", "kingswood"],
  "kings_landing": ["crackclaw_point", "harrenhal", "blackwater_rush", "kingswood", "dragonstone"],
  "kingswood": ["kings_landing", "blackwater_rush", "the_mander", "storms_end", "dragonstone"],

  "storms_end": ["kingswood", "rainwood", "tarth", "the_mander", "dornish_marches"],
  "tarth": ["storms_end", "rainwood"],
  "rainwood": ["storms_end", "dornish_marches", "tarth"],
  "dornish_marches": ["storms_end", "the_mander", "highgarden", "red_mountains", "rainwood"],

  "searoad_marshes": ["crakehall", "silverhill", "blackwater_rush", "highgarden"],
  "blackwater_rush": ["searoad_marshes", "silverhill", "stoney_sept", "harrenhal", "kings_landing", "kingswood", "the_mander"],
  "the_mander": ["blackwater_rush", "kingswood", "dornish_marches", "highgarden", "storms_end"],
  "highgarden": ["searoad_marshes", "the_mander", "dornish_marches", "red_mountains", "oldtown"],
  "oldtown": ["highgarden", "three_towers", "the_arbor"],
  "three_towers": ["oldtown", "red_mountains", "the_arbor"],
  "the_arbor": ["oldtown", "three_towers"],

  "red_mountains": ["highgarden", "dornish_marches", "greenblood", "sandstone", "three_towers"],
  "sandstone": ["red_mountains", "greenblood"],
  "sunspear": ["greenblood"],
  "greenblood": ["sandstone", "red_mountains", "sunspear"],
};
