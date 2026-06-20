import {
  DirectoryListing,
  MapPin,
  SellerProfile,
  Product,
  Profile,
  CartItem,
  Order,
} from '../types/schema';

export interface RegionBox {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * The single contract the app talks to. `MockApi` (demo) and `SupabaseApi`
 * (real backend) both implement it, so screens are backend-agnostic — the
 * active implementation is chosen by session mode in `services/api.ts`.
 */
export interface HoneyApi {
  // --- Catalog reads (direct mirror of the original MockApi) ---
  getMapPins(box: RegionBox): Promise<MapPin[]>;
  getListingById(id: string): Promise<DirectoryListing | MapPin | undefined>;
  getSellerById(id: string): Promise<SellerProfile | undefined>;
  searchLocation(query: string): Promise<MapPin | undefined>;
  findClosestHives(lat: number, lng: number): Promise<MapPin[]>;

  // --- Profile ---
  getProfile(): Promise<Profile | null>;
  updateProfile(patch: Partial<Pick<Profile, 'name' | 'defaultZip'>>): Promise<void>;
  /** Flip the seller flag; scaffolds a seller profile when turning on. */
  setSellerRole(isSeller: boolean): Promise<void>;

  // --- Orders ---
  getOrders(): Promise<Order[]>;
  placeOrder(items: CartItem[], total: number, customerName: string): Promise<Order>;
  markOrderShipped(orderId: string): Promise<void>;

  // --- Favorites ---
  getFavorites(): Promise<SellerProfile[]>;
  toggleFavorite(seller: SellerProfile): Promise<void>;

  // --- Seller actions ---
  addProduct(input: {
    name: string;
    price: number;
    batchType: string;
  }): Promise<Product>;
  claimListing(listingId: string): Promise<void>;
}
