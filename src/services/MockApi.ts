import {
  DirectoryListing,
  SellerProfile,
  MapPin,
  Product,
  Profile,
  CartItem,
  Order,
} from '../types/schema';
import { HoneyApi, RegionBox } from './HoneyApi';
import { productImageUrl } from '../constants/images';

export type { RegionBox };

// --- CONFIGURATION ---
const LAT_MIN = 25.0;
const LAT_MAX = 49.0; // Continental US Latitude
const LNG_MIN = -125.0;
const LNG_MAX = -70.0; // Continental US Longitude

// Size of one cell in the deterministic pin grid, in degrees (~5.5 miles).
const GRID_STEP = 0.08;

// --- ANCHOR DATA (Keep Maryland stable for testing) ---
export const ANCHOR_DIRECTORY: DirectoryListing[] = [
  { id: 'd-001', businessName: "Sunny Side Apiaries", zipCode: "21201", lat: 39.2904, lng: -76.6122, isClaimed: false, metaData: {} },
  { id: 'd-002', businessName: "Highland Hive Co.", zipCode: "21211", lat: 39.3289, lng: -76.6215, isClaimed: true, metaData: {} }
];

export const ANCHOR_SELLERS: SellerProfile[] = [
  {
    id: 's-999',
    directoryListingId: 'd-002',
    ownerName: 'Sarah Miller',
    storeName: "Highland Hive Co.",
    fulfillmentMethods: ['pickup'],
    story: "We've been rescuing hives in the Highlandtown area since 2015. All our honey is raw, unfiltered, and handled by hand.",
    inventory: [
      { id: 'p-1', name: 'Highlandtown Wildflower Reserve', price: 1200, batchType: 'Wildflower', stockLevel: 24, images: [productImageUrl('Highlandtown Wildflower Reserve', 'Wildflower', 'p-1')] },
      { id: 'p-2', name: 'Midnight Buckwheat', price: 1500, batchType: 'Buckwheat', stockLevel: 8, images: [productImageUrl('Midnight Buckwheat', 'Buckwheat', 'p-2')] }
    ]
  }
];

/** Demo seller id used by the "Explore as Seller" demo flow. */
export const DEMO_SELLER_ID = 's-999';

// --- 1. PRODUCT TEMPLATES & VOCABULARY ---

interface ProductTemplate {
  batchType: string;
  names: string[];
  minPrice: number;
  maxPrice: number;
}

// Each varietal's names are a ~50/50 blend of believable artisan branding and a lighter
// goofy wink. Images are NOT stored here — they're generated from the name via the image
// engine (see getDefaultProductImage / productImageUrl) so every picture matches its label.
export const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    batchType: 'Clover',
    names: ['Heirloom Clover Honey', 'Sweet Meadow Clover', 'Golden Field Clover', "Lucky Clover Gold", "Bee's Knees Clover", 'Four-Leaf Fortune Clover'],
    minPrice: 1000,
    maxPrice: 1800
  },
  {
    batchType: 'Wildflower',
    names: ['Backyard Reserve Wildflower', 'Golden Hour Wildflower', 'Summer Meadow Wildflower', 'Free-Range Backyard Buzz', 'Chaos Meadow Wildflower', 'Whatever-Grew-There Wildflower'],
    minPrice: 1100,
    maxPrice: 1900
  },
  {
    batchType: 'Orange Blossom',
    names: ['Grove-Fresh Orange Blossom', 'Sun-Drenched Orange Blossom', 'Citrus Grove Reserve', 'Lazy Day Citrus Sunshine', 'Orange You Glad Blossom', 'Vitamin Bee Orange Blossom'],
    minPrice: 1400,
    maxPrice: 2200
  },
  {
    batchType: 'Buckwheat',
    names: ['Midnight Buckwheat', 'Dark Harvest Buckwheat', 'Old Mill Buckwheat Reserve', 'Molasses Moon Buckwheat', 'Goth Phase Buckwheat', 'Buckwheat Goes Brrr'],
    minPrice: 1500,
    maxPrice: 2400
  },
  {
    batchType: 'Lavender',
    names: ['Provence Lavender Honey', 'Wild Lavender Infusion', 'Twilight Lavender Reserve', 'Sleepy Bee Lavender Dream', 'Emotional Support Lavender', 'Nap Trap Lavender'],
    minPrice: 1600,
    maxPrice: 2600
  },
  {
    batchType: 'Hot Honey',
    names: ['Firecracker Hot Honey', 'Smoked Chili Hot Honey', 'Habanero Gold Hot Honey', 'Bee-Sting Sweet Heat', 'Dragon Drool Hot Honey', 'Sweet Regret Hot Honey'],
    minPrice: 1500,
    maxPrice: 2500
  },
  {
    batchType: 'Blueberry',
    names: ['Wild Maine Blueberry Honey', 'Blueberry Barrens Reserve', 'Orchard Blueberry Honey', 'Bumble Blueberry Cobbler', 'Smurf Fuel Blueberry', 'Blue Steel Blueberry'],
    minPrice: 1500,
    maxPrice: 2400
  },
  {
    batchType: 'Cinnamon',
    names: ['Spiced Cinnamon Honey', 'Cinnamon Harvest Infusion', 'Fireside Cinnamon Honey', 'Snickerdoodle Spice Honey', 'Hug-in-a-Jar Cinnamon', 'Roll Models Cinnamon'],
    minPrice: 1400,
    maxPrice: 2200
  },
  {
    batchType: 'Creamed Honey',
    names: ['Vanilla Bean Creamed Honey', 'Whipped Wildflower Creamed Honey', 'Maple Cream Whipped Honey', 'Velvet Pillow Creamed Honey', 'Cloud Spread Creamed Honey', 'Toast Whisperer Creamed Honey'],
    minPrice: 1600,
    maxPrice: 2800
  },
  {
    batchType: 'Honeycomb',
    names: ['Raw Cut Comb', 'Pure Honeycomb Slice', 'Hand-Cut Comb Chunk', 'Straight-Outta-the-Hive Comb', "Nature's Fruit Snack Comb", 'Chewable Hexagons Comb'],
    minPrice: 1800,
    maxPrice: 3200
  },
  {
    batchType: 'Bourbon Barrel',
    names: ['Oak & Amber Barrel-Aged Honey', 'Bourbon Barrel Reserve', 'Smoky Cask Aged Honey', 'Tipsy Apiary Bourbon Honey', 'Designated Driver Bourbon Honey', 'Bees Gone Wild Bourbon Barrel'],
    minPrice: 2200,
    maxPrice: 3600
  },
  {
    batchType: 'Manuka',
    names: ['Manuka Gold 500+', 'Highland Manuka Reserve', 'Pure New Zealand Manuka', 'Doctor Bee Manuka Elixir', 'Trust Fund Manuka', 'Fancy Bee Energy Manuka'],
    minPrice: 2800,
    maxPrice: 5000
  },
  {
    batchType: 'Tupelo',
    names: ['Southern Tupelo Gold', 'River Tupelo Reserve', 'Pure Florida Tupelo', 'Swamp-Side Tupelo Honey', 'Swamp Royalty Tupelo', "Bubba's Best Tupelo"],
    minPrice: 1800,
    maxPrice: 3000
  },
  {
    batchType: 'Sourwood',
    names: ['Mountain Sourwood Honey', 'Appalachian Sourwood Reserve', 'Blue Ridge Sourwood', 'Ridgeline Sourwood Gold', "Hiker's Bribe Sourwood", 'Mountain Mystery Sourwood'],
    minPrice: 1700,
    maxPrice: 2900
  },
  {
    batchType: 'Goldenrod',
    names: ['Late Harvest Goldenrod', 'Wild Goldenrod Honey', 'Autumn Goldenrod Reserve', 'Sunny Field Goldenrod', 'Allergy Season MVP Goldenrod', 'Sneeze & Please Goldenrod'],
    minPrice: 1100,
    maxPrice: 1800
  },
  {
    batchType: 'Sage',
    names: ['California Sage Honey', 'Wild Coastal Sage', 'High Desert Sage Reserve', 'Whispering Sage Honey', 'Big Sage Energy', 'Wise Guy Sage'],
    minPrice: 1500,
    maxPrice: 2400
  }
];

/**
 * Returns a name-reflecting image for a product. Delegates to the single image engine
 * (productImageUrl) so demo data, the add-product flow, and the real Supabase backend
 * all produce matching imagery from the same logic.
 */
export function getDefaultProductImage(name: string, batchType: string): (string | number)[] {
  return [productImageUrl(name, batchType, name)];
}

const FIRST_NAMES = [
  "Silas", "Maude", "Hank", "Opal", "Clementine", "August", "Beatrice", "Ezra", "Hazel", "Jasper",
  "Mabel", "Felix", "Iris", "Walter", "Flora", "Gideon", "Maeve", "Orson", "Pearl", "Theodore",
  "Nora", "Otis", "Ruth", "Cyrus", "Della", "Amos"
];

const LAST_NAMES = [
  "Thorne", "Meadows", "Fields", "Bloom", "Hayes", "Woods", "Honeycutt", "Beech", "Gardner", "Wilde",
  "Combs", "Hollis", "Waxman", "Pickett", "Buckley", "Sweet", "Calloway", "Marsh"
];

const SHOP_ADJECTIVES = [
  "Golden", "Amber", "Wildwood", "Rustic", "Wild", "Humble", "Busy", "Sweet", "Old", "Cedar",
  "Hillside", "Maple", "Willow", "Briar", "Sunny", "Quiet", "Misty", "Two", "Little", "Buzzy",
  "Grumpy", "Sleepy", "Feral", "Drowsy", "Sticky", "Chaotic", "Smug"
];

const SHOP_NOUNS = [
  "Grove", "Meadow", "Orchard", "Garden", "Haven", "Hollow", "Hill", "Valley", "Creek", "Ridge",
  "Barn", "Acres", "Farm", "Field", "Apiary", "Hive", "Comb", "Bee Co.", "Honey Co.", "Reserve",
  "Bees", "Pastures", "Homestead", "Bee Farm", "Shenanigans", "Situation", "Endeavor", "Experiment"
];

const BIOS = [
  "Family-run apiary since 1998. Raw, unfiltered, and hand-bottled in small batches.",
  "We keep our hives along the wildflower line and let the bees do the rest.",
  "Third-generation beekeepers. Our honey is never heated, never blended.",
  "A handful of backyard hives, a lot of patience, and very happy bees.",
  "We harvest twice a year and pour every jar by hand. The bees supervise.",
  "Small-batch honey from hives we know by name. Mostly.",
  "Pollinated by our own orchards — you can taste the apple blossom in spring.",
  "We don't over-filter, so a little pollen and a lot of flavor stays in the jar.",
  "Our bees are free-range, well-fed, and slightly spoiled.",
  "Slow honey from a slow farm. Worth the wait, we promise.",
  "Our head beekeeper is technically a golden retriever. We don't ask questions.",
  "We played smooth jazz to the hive once. Now they only make honey to Kenny G.",
  "Every jar is inspected by Greg. Greg is a bee. Greg is very thorough.",
  "Voted 'Most Likely to Sting You Lovingly' three years running.",
  "We named all 40,000 bees. It took a while and we may have repeated a few.",
  "100% raw, 100% local, and 100% guarded by one extremely smug goose.",
  "Our bees commute from the meadow next door. Traffic is mostly pollen.",
  "We don't pasteurize. We barely supervise. The honey turns out great anyway.",
  "Harvested under a full moon because the bees insisted and we're not arguing.",
  "Side effects of our honey may include joy, sticky fingers, and humming.",
  "The recipe is a family secret. The secret is: it's just bees doing bee stuff.",
  "We tried to manage the hive. They formed a co-op and now out-vote us.",
  "Certified by no one official, but the raccoons keep coming back for more.",
  "Our bees unionized for better flowers. Honestly, fair."
];

// --- 2. GENERATORS ---

const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const FAMILY_SUFFIXES = ["Family Apiary", "Bee Farm", "Honey Co.", "Apiary", "Bees", "Honey Farm"];

const generateShopName = () => {
  const mode = Math.random();
  if (mode < 0.4) return `${pick(SHOP_ADJECTIVES)} ${pick(SHOP_NOUNS)}`;
  if (mode < 0.7) return `${pick(FIRST_NAMES)}'s ${pick(SHOP_NOUNS)}`;
  return `${pick(LAST_NAMES)} ${pick(FAMILY_SUFFIXES)}`;
};

const generateInventory = (id: string) => {
  const count = randInt(2, 6);
  const items: Product[] = [];
  
  // Shuffle product templates to avoid duplicates
  const shuffledTemplates = [...PRODUCT_TEMPLATES];
  for (let i = shuffledTemplates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledTemplates[i], shuffledTemplates[j]] = [shuffledTemplates[j], shuffledTemplates[i]];
  }

  for (let i = 0; i < Math.min(count, shuffledTemplates.length); i++) {
    const template = shuffledTemplates[i];
    const name = pick(template.names);
    const prodId = `prod-${id}-${i}`;
    items.push({
      id: prodId,
      name,
      price: randInt(template.minPrice, template.maxPrice),
      batchType: template.batchType,
      stockLevel: randInt(0, 50),
      images: [productImageUrl(name, template.batchType, prodId)]
    });
  }
  return items;
};

// --- 3. DATA BUILDER ---

interface City {
  name: string;
  lat: number;
  lng: number;
  biasLat?: 'north' | 'south' | 'none';
  biasLng?: 'east' | 'west' | 'none';
}

const CITIES: City[] = [
  // West Coast (bias East to avoid Pacific Ocean)
  { name: "Seattle", lat: 47.6062, lng: -122.3321, biasLng: 'east' },
  { name: "Portland", lat: 45.5152, lng: -122.6784, biasLng: 'east' },
  { name: "San Francisco", lat: 37.7749, lng: -122.4194, biasLng: 'east' },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437, biasLng: 'east' },
  { name: "San Diego", lat: 32.7157, lng: -117.1611, biasLng: 'east' },

  // East Coast (bias West to avoid Atlantic Ocean)
  { name: "Boston", lat: 42.3601, lng: -71.0589, biasLng: 'west' },
  { name: "New York", lat: 40.7128, lng: -74.0060, biasLng: 'west' },
  { name: "Philadelphia", lat: 39.9526, lng: -75.1652, biasLng: 'west' },
  { name: "Washington DC", lat: 38.9072, lng: -77.0369, biasLng: 'west' },
  { name: "Baltimore", lat: 39.2904, lng: -76.6122, biasLng: 'west' },
  { name: "Norfolk", lat: 36.8508, lng: -76.2859, biasLng: 'west' },
  { name: "Savannah", lat: 32.0809, lng: -81.0912, biasLng: 'west' },
  { name: "Charleston", lat: 32.7765, lng: -79.9309, biasLng: 'west' },

  // Florida (bias West, and North for South Florida to avoid Atlantic/Gulf)
  { name: "Miami", lat: 25.7617, lng: -80.1918, biasLat: 'north', biasLng: 'west' },
  { name: "Tampa", lat: 27.9506, lng: -82.4572, biasLat: 'north', biasLng: 'west' },
  { name: "Jacksonville", lat: 30.3322, lng: -81.6557, biasLng: 'west' },

  // Gulf Coast (bias North to avoid Gulf of Mexico)
  { name: "New Orleans", lat: 29.9511, lng: -90.0715, biasLat: 'north' },
  { name: "Houston", lat: 29.7604, lng: -95.3698, biasLat: 'north' },
  { name: "Corpus Christi", lat: 27.8006, lng: -97.3964, biasLat: 'north', biasLng: 'west' },

  // Interior - West / Mountain
  { name: "Phoenix", lat: 33.4484, lng: -112.0740 },
  { name: "Tucson", lat: 32.2226, lng: -110.9747 },
  { name: "Las Vegas", lat: 36.1716, lng: -115.1398 },
  { name: "Reno", lat: 39.5296, lng: -119.8138 },
  { name: "Salt Lake City", lat: 40.7608, lng: -111.8910 },
  { name: "Boise", lat: 43.6150, lng: -116.2023 },
  { name: "Denver", lat: 39.7392, lng: -104.9903 },
  { name: "Colorado Springs", lat: 38.8339, lng: -104.8214 },
  { name: "Albuquerque", lat: 35.0844, lng: -106.6511 },
  { name: "El Paso", lat: 31.7619, lng: -106.4850 },
  { name: "Helena", lat: 46.5891, lng: -112.0191 },
  { name: "Billings", lat: 45.7833, lng: -108.5007 },
  { name: "Cheyenne", lat: 41.1400, lng: -104.8203 },

  // Interior - Plains
  { name: "Dallas", lat: 32.7767, lng: -96.7970 },
  { name: "Austin", lat: 30.2672, lng: -97.7431 },
  { name: "San Antonio", lat: 29.4241, lng: -98.4936 },
  { name: "Oklahoma City", lat: 35.4676, lng: -97.5164 },
  { name: "Tulsa", lat: 36.1540, lng: -95.9928 },
  { name: "Wichita", lat: 37.6872, lng: -97.3301 },
  { name: "Kansas City", lat: 39.0997, lng: -94.5786 },
  { name: "St. Louis", lat: 38.6270, lng: -90.1994 },
  { name: "Omaha", lat: 41.2565, lng: -95.9345 },
  { name: "Des Moines", lat: 41.5868, lng: -93.6250 },
  { name: "Minneapolis", lat: 44.9778, lng: -93.2650 },
  { name: "Fargo", lat: 46.8772, lng: -96.7898 },
  { name: "Sioux Falls", lat: 43.5460, lng: -96.7313 },

  // Midwest
  { name: "Chicago", lat: 41.8781, lng: -87.6298, biasLng: 'west' }, // Avoid Lake Michigan
  { name: "Milwaukee", lat: 43.0389, lng: -87.9065, biasLng: 'west' }, // Avoid Lake Michigan
  { name: "Detroit", lat: 42.3314, lng: -83.0458 },
  { name: "Indianapolis", lat: 39.7684, lng: -86.1581 },
  { name: "Cleveland", lat: 41.4993, lng: -81.6944, biasLat: 'south' }, // Avoid Lake Erie
  { name: "Columbus", lat: 39.9612, lng: -82.9988 },
  { name: "Cincinnati", lat: 39.1031, lng: -84.5120 },
  { name: "Pittsburgh", lat: 40.4406, lng: -79.9959 },
  { name: "Louisville", lat: 38.2527, lng: -85.7585 },
  { name: "Nashville", lat: 36.1627, lng: -86.7816 },
  { name: "Memphis", lat: 35.1495, lng: -90.0490 },

  // South / Southeast
  { name: "Atlanta", lat: 33.7490, lng: -84.3880 },
  { name: "Charlotte", lat: 35.2271, lng: -80.8431 },
  { name: "Raleigh", lat: 35.7796, lng: -78.6382 },
  { name: "Richmond", lat: 37.5407, lng: -77.4360 },
  { name: "Birmingham", lat: 33.5186, lng: -86.8104 },
  { name: "Jackson", lat: 32.2988, lng: -90.1848 },
  { name: "Little Rock", lat: 34.7465, lng: -92.2896 },
  { name: "Knoxville", lat: 35.9606, lng: -83.9207 },

  // Northeast Inland
  { name: "Buffalo", lat: 42.8864, lng: -78.8784, biasLat: 'south' },
  { name: "Syracuse", lat: 43.0481, lng: -76.1474 },
  { name: "Albany", lat: 42.6526, lng: -73.7562 },
  { name: "Hartford", lat: 41.7637, lng: -72.6851 }
];

/**
 * Builds the full demo dataset (2 stable Maryland anchors + `count` generated
 * listings/sellers). Exported so `supabase/seed.ts` can reuse the exact same
 * generator to seed the real database — keeping demo and prod data identical.
 */
export function buildSeedData(count = 15000): {
  directory: DirectoryListing[];
  sellers: SellerProfile[];
} {
  const chaosDirectory: DirectoryListing[] = [];
  const chaosSellers: SellerProfile[] = [];

  for (let i = 0; i < count; i++) {
    const isClaimed = Math.random() > 0.65;
    const id = `gen-${i}`;
    const name = generateShopName();

    const city = CITIES[i % CITIES.length];

    // Generate random offset within [0.02, 0.45] degrees (approx 1 to 30 miles)
    const rLat = 0.02 + Math.random() * 0.43;
    const rLng = 0.02 + Math.random() * 0.43;

    // Apply bias to avoid oceans/Great Lakes
    const offsetLat = city.biasLat === 'north' ? rLat : (city.biasLat === 'south' ? -rLat : (Math.random() > 0.5 ? rLat : -rLat));
    const offsetLng = city.biasLng === 'east' ? rLng : (city.biasLng === 'west' ? -rLng : (Math.random() > 0.5 ? rLng : -rLng));

    const lat = city.lat + offsetLat;
    const lng = city.lng + offsetLng;

    chaosDirectory.push({
      id,
      businessName: name,
      zipCode: (10000 + randInt(0, 89999)).toString(),
      lat,
      lng,
      isClaimed,
      metaData: {}
    });

    if (isClaimed) {
      chaosSellers.push({
        id: `seller-${id}`,
        directoryListingId: id,
        ownerName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        storeName: name,
        fulfillmentMethods: ['pickup', 'shipping'],
        story: pick(BIOS),
        inventory: generateInventory(id)
      });
    }
  }

  return {
    directory: [...ANCHOR_DIRECTORY, ...chaosDirectory],
    sellers: [...ANCHOR_SELLERS, ...chaosSellers],
  };
}

// Module-level dataset that powers DEMO mode.
const { directory: FULL_DIRECTORY, sellers: FULL_SELLERS } = buildSeedData(15000);

// --- 3.1 DETERMINISTIC DYNAMIC GRID GENERATOR ---

function seedRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507) | 0;
    h = Math.imul(h ^ h >>> 13, 3266489909) | 0;
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function isWater(lat: number, lng: number): boolean {
  // Pacific Ocean
  if (lng < -125.0) return true;
  if (lat >= 42.0 && lng < -124.5) return true;
  if (lat >= 34.0 && lat < 42.0) {
    const coastLng = -124.5 + ((lat - 34.0) / 8.0) * 0.5; // linear interp from -124.5 to -124.0
    if (lng < coastLng) return true;
  }
  if (lat < 34.0 && lng < -120.5) return true;

  // Atlantic Ocean
  if (lng > -66.9) return true;
  if (lat >= 41.0 && lng > -70.0) return true;
  if (lat >= 35.0 && lat < 41.0) {
    const coastLng = -75.5 + ((lat - 35.0) / 6.0) * 5.5; // linear interp from -75.5 to -70.0
    if (lng > coastLng) return true;
  }
  if (lat >= 30.0 && lat < 35.0) {
    const coastLng = -81.0 + ((lat - 30.0) / 5.0) * 5.5; // linear interp from -81.0 to -75.5
    if (lng > coastLng) return true;
  }
  if (lat < 30.0 && lng > -80.0) return true;

  // Gulf of Mexico
  if (lat < 29.0 && lng > -94.0 && lng < -83.0) return true;
  // Southern Texas Gulf Coast curve
  if (lat < 28.0 && lng > -97.0 && lng < -94.0) {
    const coastLng = -97.0 + ((lat - 26.0) / 2.0) * 3.0;
    if (lng > coastLng) return true;
  }

  // Canada & Mexico boundary approximations
  if (lat > 49.0) return true; // Canada
  if (lat < 25.8) return true; // Mexico / Keys water

  return false;
}

function getDeterministicShopName(rand: () => number): string {
  const mode = rand();
  if (mode < 0.4) {
    const adj = SHOP_ADJECTIVES[Math.floor(rand() * SHOP_ADJECTIVES.length)];
    const noun = SHOP_NOUNS[Math.floor(rand() * SHOP_NOUNS.length)];
    return `${adj} ${noun}`;
  }
  if (mode < 0.7) {
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const noun = SHOP_NOUNS[Math.floor(rand() * SHOP_NOUNS.length)];
    return `${first}'s ${noun}`;
  }
  const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  const suffix = FAMILY_SUFFIXES[Math.floor(rand() * FAMILY_SUFFIXES.length)];
  return `${last} ${suffix}`;
}

function getDeterministicZipCode(rand: () => number): string {
  return Math.floor(10000 + rand() * 89999).toString();
}

/**
 * The single deterministic source for one grid cell's 1–3 demo pins. Both the
 * map (getMapPins / findClosestHives) and the detail lookups
 * (getDeterministicPinById) go through here, so a tapped marker always resolves
 * to the same business name / claimed state. Keep the RNG consumption order
 * (count → lat → lng → isClaimed → name → zip) stable; ids encode the cell.
 */
function generateCellPins(latIdx: number, lngIdx: number): MapPin[] {
  const cellLat = latIdx * GRID_STEP;
  const cellLng = lngIdx * GRID_STEP;
  const rand = seedRandom(`${latIdx}_${lngIdx}`);
  const count = Math.floor(1 + rand() * 3); // 1 to 3 pins per cell

  const pins: MapPin[] = [];
  for (let k = 0; k < count; k++) {
    const lat = cellLat + rand() * GRID_STEP;
    const lng = cellLng + rand() * GRID_STEP;
    const isClaimed = rand() > 0.6;
    const businessName = getDeterministicShopName(rand);
    const zipCode = getDeterministicZipCode(rand);
    pins.push({
      id: `det-${latIdx}-${lngIdx}-${k}`,
      businessName,
      zipCode,
      lat,
      lng,
      isClaimed,
      metaData: {},
    });
  }
  return pins;
}

function getDeterministicPinById(id: string): MapPin | undefined {
  // lngIdx is negative in the US, so a plain split('-') breaks on the `--`.
  // Parse with a regex that tolerates signed indices.
  const m = /^det-(-?\d+)-(-?\d+)-(\d+)$/.exec(id);
  if (!m) return undefined;
  const latIdx = parseInt(m[1], 10);
  const lngIdx = parseInt(m[2], 10);
  const k = parseInt(m[3], 10);
  return generateCellPins(latIdx, lngIdx)[k];
}

function getDeterministicInventory(pinId: string, rand: () => number): Product[] {
  const count = Math.floor(2 + rand() * 4); // 2 to 5 items
  const items: Product[] = [];
  
  const shuffledTemplates = [...PRODUCT_TEMPLATES];
  for (let i = shuffledTemplates.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffledTemplates[i], shuffledTemplates[j]] = [shuffledTemplates[j], shuffledTemplates[i]];
  }
  
  for (let i = 0; i < count; i++) {
    const template = shuffledTemplates[i % shuffledTemplates.length];
    const name = template.names[Math.floor(rand() * template.names.length)];
    const prodId = `prod-${pinId}-${i}`;
    items.push({
      id: prodId,
      name,
      price: Math.floor(1000 + rand() * 2000), // $10.00 to $30.00
      batchType: template.batchType,
      stockLevel: Math.floor(rand() * 50),
      images: [productImageUrl(name, template.batchType, prodId)]
    });
  }
  return items;
}

function getDeterministicSellerById(id: string): SellerProfile | undefined {
  const pinId = id.replace('seller-', '');
  const pin = getDeterministicPinById(pinId);
  if (!pin) return undefined;
  
  const rand = seedRandom(id);
  const firstName = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  
  return {
    id,
    directoryListingId: pinId,
    ownerName: `${firstName} ${lastName}`,
    storeName: pin.businessName,
    fulfillmentMethods: rand() > 0.5 ? ['pickup', 'shipping'] : ['pickup'],
    story: BIOS[Math.floor(rand() * BIOS.length)],
    inventory: getDeterministicInventory(pinId, rand)
  };
}

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withSeller = (l: DirectoryListing): MapPin => {
  if (l.isClaimed) {
    if (l.id.startsWith('det-')) {
      return { ...l, sellerProfile: getDeterministicSellerById(`seller-${l.id}`) };
    }
    return { ...l, sellerProfile: FULL_SELLERS.find(s => s.directoryListingId === l.id) };
  }
  return l;
};

// --- 4. IN-MEMORY USER STATE (demo only; resets on reload) ---

let demoProfile: Profile = { id: 'demo', name: 'Honey Lover', defaultZip: '', isSeller: false };
let demoOrders: Order[] = [];
let demoFaves: SellerProfile[] = [];

// --- 5. THE MOCK API (implements HoneyApi) ---

export const MockApi: HoneyApi = {
  // --- Catalog reads ---
  async getMapPins(box: RegionBox): Promise<MapPin[]> {
    await delay(300);

    const MAX_PINS = 40; // UI-lag guard

    // 1. Gather any matching anchor directory listings
    const anchors = ANCHOR_DIRECTORY.filter(p =>
      p.lat! >= box.minLat &&
      p.lat! <= box.maxLat &&
      p.lng! >= box.minLng &&
      p.lng! <= box.maxLng
    ).map(withSeller);

    // 2. Sweep the deterministic grid at an even stride so pins blanket the
    //    ENTIRE visible box. (The old code scanned south→north then sliced the
    //    first 40, which dumped every pin into the southernmost rows — a line.)
    const minLatIndex = Math.floor(box.minLat / GRID_STEP);
    const maxLatIndex = Math.ceil(box.maxLat / GRID_STEP);
    const minLngIndex = Math.floor(box.minLng / GRID_STEP);
    const maxLngIndex = Math.ceil(box.maxLng / GRID_STEP);

    const latSpan = maxLatIndex - minLatIndex;
    const lngSpan = maxLngIndex - minLngIndex;

    // Pick a stride so the cells we visit are spaced evenly across both axes and
    // yield roughly MAX_PINS pins. stride === 1 when zoomed in, so close-up views
    // keep their natural 1–3-per-cell clustering.
    const stride = Math.max(
      1,
      Math.round(Math.sqrt((latSpan * lngSpan) / MAX_PINS))
    );

    const pins: MapPin[] = [];
    for (let latIdx = minLatIndex; latIdx <= maxLatIndex; latIdx += stride) {
      for (let lngIdx = minLngIndex; lngIdx <= maxLngIndex; lngIdx += stride) {
        const cellLat = latIdx * GRID_STEP;
        const cellLng = lngIdx * GRID_STEP;

        // Continental-US bounds + ocean/Great-Lakes mask keep pins on land.
        if (cellLat < 24.0 || cellLat > 49.5 || cellLng < -125.5 || cellLng > -66.5) {
          continue;
        }
        if (isWater(cellLat, cellLng)) {
          continue;
        }

        pins.push(...generateCellPins(latIdx, lngIdx));
      }
    }

    // 3. If the sweep overshot the cap, subsample EVENLY across the collected
    //    set (the array is in raster order, so even index striding stays spread
    //    N–S and E–W) rather than slicing the head.
    let kept = pins;
    if (pins.length > MAX_PINS) {
      const pickStride = pins.length / MAX_PINS;
      kept = [];
      for (let i = 0; i < MAX_PINS; i++) {
        kept.push(pins[Math.floor(i * pickStride)]);
      }
    }

    return [...anchors, ...kept.map(withSeller)];
  },

  async getListingById(id: string) {
    await delay(200);
    const l = ANCHOR_DIRECTORY.find(i => i.id === id);
    if (l) return withSeller(l);

    if (id.startsWith('det-')) {
      const pin = getDeterministicPinById(id);
      if (pin) return withSeller(pin);
    }

    // Fallback for old gen-i ids (e.g. from static seed data or seed DB)
    const fallback = FULL_DIRECTORY.find(i => i.id === id);
    if (fallback) return withSeller(fallback);

    return undefined;
  },

  async getSellerById(id: string) {
    await delay(200);
    const anchor = ANCHOR_SELLERS.find(s => s.id === id);
    if (anchor) return anchor;

    if (id.startsWith('seller-det-')) {
      return getDeterministicSellerById(id);
    }

    return FULL_SELLERS.find(s => s.id === id);
  },

  async searchLocation(query: string): Promise<MapPin | undefined> {
    if (query.length < 3) return undefined;
    await delay(200);
    
    // Check anchors first
    const anchor = ANCHOR_DIRECTORY.find(l =>
      l.zipCode.startsWith(query) ||
      l.businessName.toLowerCase().includes(query.toLowerCase())
    );
    if (anchor) return withSeller(anchor);

    // Otherwise search cities list
    const city = CITIES.find(c => c.name.toLowerCase().includes(query.toLowerCase()));
    if (city) {
      const latIdx = Math.floor(city.lat / GRID_STEP);
      const lngIdx = Math.floor(city.lng / GRID_STEP);
      const id = `det-${latIdx}-${lngIdx}-0`;
      const pin = getDeterministicPinById(id);
      if (pin) return withSeller(pin);
    }

    // Fallback to static list search
    const fallback = FULL_DIRECTORY.find(l =>
      l.zipCode.startsWith(query) ||
      l.businessName.toLowerCase().includes(query.toLowerCase())
    );
    if (fallback) return withSeller(fallback);

    return undefined;
  },

  async findClosestHives(lat: number, lng: number): Promise<MapPin[]> {
    await delay(500);

    const centerLatIdx = Math.floor(lat / GRID_STEP);
    const centerLngIdx = Math.floor(lng / GRID_STEP);
    const pins: MapPin[] = [];

    // Search a 5x5 grid around the target coordinates
    for (let latOffset = -2; latOffset <= 2; latOffset++) {
      for (let lngOffset = -2; lngOffset <= 2; lngOffset++) {
        const latIdx = centerLatIdx + latOffset;
        const lngIdx = centerLngIdx + lngOffset;
        const cellLat = latIdx * GRID_STEP;
        const cellLng = lngIdx * GRID_STEP;

        if (cellLat < 24.0 || cellLat > 49.5 || cellLng < -125.5 || cellLng > -66.5) continue;
        if (isWater(cellLat, cellLng)) continue;

        pins.push(...generateCellPins(latIdx, lngIdx));
      }
    }

    // Sort by distance
    const sorted = pins.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.lat! - lat, 2) + Math.pow(a.lng! - lng, 2));
      const distB = Math.sqrt(Math.pow(b.lat! - lat, 2) + Math.pow(b.lng! - lng, 2));
      return distA - distB;
    });

    return sorted.slice(0, 10).map(withSeller);
  },

  // --- Profile ---
  async getProfile(): Promise<Profile> {
    return { ...demoProfile };
  },

  async updateProfile(patch) {
    demoProfile = { ...demoProfile, ...patch };
  },

  async setSellerRole(isSeller: boolean) {
    demoProfile = { ...demoProfile, isSeller };
  },

  // --- Orders ---
  async getOrders(): Promise<Order[]> {
    return [...demoOrders];
  },

  async placeOrder(items: CartItem[], total: number, customerName: string): Promise<Order> {
    const order: Order = {
      id: `ord-${Math.random().toString(36).substr(2, 5)}`,
      items,
      totalAmount: total,
      status: 'pending',
      customerName,
      timestamp: new Date(),
    };
    demoOrders = [order, ...demoOrders];
    return order;
  },

  async markOrderShipped(orderId: string) {
    demoOrders = demoOrders.map(o =>
      o.id === orderId ? { ...o, status: 'shipped' } : o
    );
  },

  // --- Favorites ---
  async getFavorites(): Promise<SellerProfile[]> {
    return [...demoFaves];
  },

  async toggleFavorite(seller: SellerProfile) {
    const exists = demoFaves.find(s => s.id === seller.id);
    demoFaves = exists
      ? demoFaves.filter(s => s.id !== seller.id)
      : [...demoFaves, seller];
  },

  // --- Seller actions ---
  async addProduct(input): Promise<Product> {
    const product: Product = {
      id: `prod-demo-${Math.random().toString(36).substr(2, 6)}`,
      name: input.name,
      price: input.price,
      batchType: input.batchType,
      stockLevel: 0,
      images: getDefaultProductImage(input.name, input.batchType),
    };
    // Attach to the demo seller's storefront so it shows up immediately.
    const seller = FULL_SELLERS.find(s => s.id === DEMO_SELLER_ID);
    if (seller) seller.inventory = [product, ...seller.inventory];
    return product;
  },

  async claimListing(listingId: string) {
    const listing = FULL_DIRECTORY.find(l => l.id === listingId);
    if (listing) listing.isClaimed = true;
  },
};
