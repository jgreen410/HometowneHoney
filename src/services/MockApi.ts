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

export type { RegionBox };

// --- CONFIGURATION ---
const LAT_MIN = 25.0;
const LAT_MAX = 49.0; // Continental US Latitude
const LNG_MIN = -125.0;
const LNG_MAX = -70.0; // Continental US Longitude

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
      { id: 'p-1', name: 'Spring Wildflower', price: 1200, batchType: 'Wildflower', stockLevel: 24, images: [] },
      { id: 'p-2', name: 'Buckwheat Dark', price: 1500, batchType: 'Buckwheat', stockLevel: 8, images: [] }
    ]
  }
];

/** Demo seller id used by the "Explore as Seller" demo flow. */
export const DEMO_SELLER_ID = 's-999';

// --- 1. THE VOCABULARY EXPANSION ---

const FIRST_NAMES = [
  "Silas", "Maude", "Barnaby", "Opal", "Clementine", "August", "Beatrice", "Ezra", "Hazel", "Jasper",
  "Mabel", "Felix", "Iris", "Atticus", "Flora", "Gideon", "Maeve", "Orson", "Pearl", "Theodore", "Zorp", "Satan"
];

const LAST_NAMES = [
  "Thorne", "Meadows", "Fields", "Bloom", "Roots", "Woods", "Honeycutt", "Beech", "Gardner", "Wilde",
  "Comb", "Hiver", "Waxman", "Stinger", "Buzzwell", "Sweet"
];

const SHOP_ADJECTIVES = [
  "Golden", "Amber", "Velvet", "Rustic", "Wild", "Humble", "Busy", "Sweet", "Ancient", "Secret",
  "Royal", "Happy", "Lazy", "Drunken", "Mystic", "Whispering", "Singing", "Dancing", "Electric",
  "Hidden", "Sunny", "Cloudy", "Windy", "Stormy", "Quiet", "Loud", "Sticky", "Fuzzy"
];

const SHOP_NOUNS = [
  "Grove", "Meadow", "Orchard", "Garden", "Haven", "Hollow", "Hill", "Valley", "Creek", "River",
  "Barn", "Shed", "Coop", "Palace", "Sanctuary", "Apiary", "Hive", "Comb", "Nectar", "Drop",
  "Pot", "Jar", "Barrel", "Reserve", "Collective", "Project", "Experiment", "Laboratories"
];

const PRODUCT_ADJECTIVES = [
  "Raw", "Unfiltered", "Creamed", "Whipped", "Infused", "Spicy", "Smoky", "Floral", "Citrus",
  "Dark", "Light", "Bold", "Smooth", "Crunchy", "Forbidden", "Midnight", "Sunrise", "Sunset",
  "Moonlight", "Starlight", "Forest", "Mountain", "Desert", "Swamp", "Ghosts of"
];

const HONEY_TYPES = [
  "Wildflower", "Clover", "Buckwheat", "Orange Blossom", "Manuka", "Acacia", "Eucalyptus",
  "Sage", "Lavender", "Blueberry", "Tupelo", "Alfalfa", "Fireweed", "Heather"
];

const BIOS = [
  "We sing jazz standards to the bees every morning. They produce 20% more sass.",
  "Harvested by a team of retired librarians who crave danger.",
  "Our bees are free-range and politically active.",
  "Technically, the bees own the land. We just pay rent in sugar water.",
  "Made in a barn that may or may not be a portal to another dimension.",
  "We don't filter our honey because we're lazy. Also, it tastes better.",
  "Guaranteed to contain 0% ghosts.",
  "The only honey approved by the local cryptid community.",
  "If you listen closely to the jar, you can hear the ocean. Or buzzing.",
  "Sustainably harvested using tiny, bee-sized buckets."
];

// --- 2. GENERATORS ---

const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateShopName = () => {
  const mode = Math.random();
  if (mode < 0.3) return `${pick(SHOP_ADJECTIVES)} ${pick(SHOP_NOUNS)}`;
  if (mode < 0.6) return `${pick(FIRST_NAMES)}'s ${pick(SHOP_NOUNS)}`;
  return `The ${pick(SHOP_NOUNS)} at ${pick(LAST_NAMES)} Farm`;
};

const generateInventory = (id: string) => {
  const count = randInt(2, 6);
  const items: Product[] = [];
  for (let i = 0; i < count; i++) {
    items.push({
      id: `prod-${id}-${i}`,
      name: `${pick(PRODUCT_ADJECTIVES)} ${pick(HONEY_TYPES)}`,
      price: randInt(800, 3500),
      batchType: pick(HONEY_TYPES),
      stockLevel: randInt(0, 50),
      images: []
    });
  }
  return items;
};

// --- 3. DATA BUILDER ---

/**
 * Builds the full demo dataset (2 stable Maryland anchors + `count` generated
 * listings/sellers). Exported so `supabase/seed.ts` can reuse the exact same
 * generator to seed the real database — keeping demo and prod data identical.
 */
export function buildSeedData(count = 1000): {
  directory: DirectoryListing[];
  sellers: SellerProfile[];
} {
  const chaosDirectory: DirectoryListing[] = [];
  const chaosSellers: SellerProfile[] = [];

  for (let i = 0; i < count; i++) {
    const isClaimed = Math.random() > 0.65;
    const id = `gen-${i}`;
    const name = generateShopName();

    chaosDirectory.push({
      id,
      businessName: name,
      zipCode: (10000 + randInt(0, 89999)).toString(),
      lat: LAT_MIN + (Math.random() * (LAT_MAX - LAT_MIN)),
      lng: LNG_MIN + (Math.random() * (LNG_MAX - LNG_MIN)),
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
const { directory: FULL_DIRECTORY, sellers: FULL_SELLERS } = buildSeedData(1000);

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const withSeller = (l: DirectoryListing): MapPin => {
  if (l.isClaimed) {
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
    const visible = FULL_DIRECTORY.filter(p =>
      p.lat! >= box.minLat &&
      p.lat! <= box.maxLat &&
      p.lng! >= box.minLng &&
      p.lng! <= box.maxLng
    );
    // Limit to 40 items to prevent UI lag
    return visible.slice(0, 40).map(withSeller);
  },

  async getListingById(id: string) {
    await delay(200);
    const l = FULL_DIRECTORY.find(i => i.id === id);
    if (l && l.isClaimed) return withSeller(l);
    return l;
  },

  async getSellerById(id: string) {
    await delay(200);
    return FULL_SELLERS.find(s => s.id === id);
  },

  async searchLocation(query: string): Promise<MapPin | undefined> {
    if (query.length < 3) return undefined;
    await delay(200);
    return FULL_DIRECTORY.find(l =>
      l.zipCode.startsWith(query) ||
      l.businessName.toLowerCase().includes(query.toLowerCase())
    );
  },

  async findClosestHives(lat: number, lng: number): Promise<MapPin[]> {
    await delay(500);
    const sorted = [...FULL_DIRECTORY].sort((a, b) => {
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
      images: [],
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
