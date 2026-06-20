import {
  DirectoryListing,
  SellerProfile,
  MapPin,
  Product,
  Profile,
  CartItem,
  Order,
  OrderStatus,
} from '../types/schema';
import { HoneyApi, RegionBox } from './HoneyApi';
import { requireSupabase } from './supabase';

// --- Row → domain mappers ---

const mapProduct = (r: any): Product => ({
  id: r.id,
  name: r.name,
  price: r.price,
  batchType: r.batch_type,
  stockLevel: r.stock_level ?? 0,
  images: r.images ?? [],
});

const mapSeller = (r: any): SellerProfile => ({
  id: r.id,
  directoryListingId: r.directory_listing_id,
  ownerName: r.owner_name ?? '',
  storeName: r.store_name ?? undefined,
  fulfillmentMethods: r.fulfillment_methods ?? [],
  story: r.story ?? '',
  inventory: (r.products ?? []).map(mapProduct),
});

const mapListing = (r: any): MapPin => {
  // PostgREST returns the embed as an object (to-one, due to the unique FK) or
  // an array depending on inference — handle both.
  const embed = r.seller_profiles;
  const seller = Array.isArray(embed) ? embed[0] : embed;
  const base: DirectoryListing = {
    id: r.id,
    businessName: r.business_name,
    zipCode: r.zip_code,
    isClaimed: r.is_claimed,
    lat: r.lat,
    lng: r.lng,
  };
  return seller ? { ...base, sellerProfile: mapSeller(seller) } : base;
};

// Embedded select that pulls a listing + its seller + the seller's products.
const LISTING_SELECT =
  'id, business_name, zip_code, is_claimed, lat, lng, seller_profiles(*, products(*))';

async function currentUserId(): Promise<string | null> {
  const { data } = await requireSupabase().auth.getUser();
  return data.user?.id ?? null;
}

async function requireUserId(): Promise<string> {
  const id = await currentUserId();
  if (!id) throw new Error('You must be signed in to do that.');
  return id;
}

/** Returns the signed-in user's seller_profiles.id, or null if not a seller. */
async function mySellerProfileId(): Promise<string | null> {
  const uid = await currentUserId();
  if (!uid) return null;
  const { data } = await requireSupabase()
    .from('seller_profiles')
    .select('id')
    .eq('user_id', uid)
    .maybeSingle();
  return data?.id ?? null;
}

export const SupabaseApi: HoneyApi = {
  // --- Catalog reads ---
  async getMapPins(box: RegionBox): Promise<MapPin[]> {
    const { data, error } = await requireSupabase()
      .from('directory_listings')
      .select(LISTING_SELECT)
      .gte('lat', box.minLat)
      .lte('lat', box.maxLat)
      .gte('lng', box.minLng)
      .lte('lng', box.maxLng)
      .limit(40);
    if (error) throw error;
    return (data ?? []).map(mapListing);
  },

  async getListingById(id: string) {
    const { data, error } = await requireSupabase()
      .from('directory_listings')
      .select(LISTING_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapListing(data) : undefined;
  },

  async getSellerById(id: string) {
    const { data, error } = await requireSupabase()
      .from('seller_profiles')
      .select('*, products(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapSeller(data) : undefined;
  },

  async searchLocation(query: string): Promise<MapPin | undefined> {
    if (query.length < 3) return undefined;
    const { data, error } = await requireSupabase()
      .from('directory_listings')
      .select(LISTING_SELECT)
      .or(`zip_code.ilike.${query}%,business_name.ilike.%${query}%`)
      .limit(1);
    if (error) throw error;
    return data && data.length ? mapListing(data[0]) : undefined;
  },

  async findClosestHives(lat: number, lng: number): Promise<MapPin[]> {
    // RPC returns the 10 nearest directory_listings ordered by distance.
    const { data, error } = await requireSupabase().rpc('find_closest_hives', {
      in_lat: lat,
      in_lng: lng,
      in_limit: 10,
    });
    if (error) throw error;
    const rows = (data ?? []) as any[];

    // Attach seller profiles for the claimed listings in a single follow-up query.
    const claimedIds = rows.filter(r => r.is_claimed).map(r => r.id);
    let sellersByListing: Record<string, any> = {};
    if (claimedIds.length) {
      const { data: sellers } = await requireSupabase()
        .from('seller_profiles')
        .select('*, products(*)')
        .in('directory_listing_id', claimedIds);
      for (const s of sellers ?? []) sellersByListing[s.directory_listing_id] = s;
    }

    return rows.map(r =>
      mapListing({ ...r, seller_profiles: sellersByListing[r.id] ? [sellersByListing[r.id]] : [] })
    );
  },

  // --- Profile ---
  async getProfile(): Promise<Profile | null> {
    const uid = await currentUserId();
    if (!uid) return null;
    const { data, error } = await requireSupabase()
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      name: data.name ?? '',
      defaultZip: data.default_zip ?? '',
      isSeller: data.is_seller ?? false,
    };
  },

  async updateProfile(patch) {
    const uid = await requireUserId();
    const row: Record<string, any> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.defaultZip !== undefined) row.default_zip = patch.defaultZip;
    const { error } = await requireSupabase().from('profiles').update(row).eq('id', uid);
    if (error) throw error;
  },

  async setSellerRole(isSeller: boolean) {
    const uid = await requireUserId();
    const sb = requireSupabase();
    const { error } = await sb.from('profiles').update({ is_seller: isSeller }).eq('id', uid);
    if (error) throw error;

    if (isSeller) {
      // Scaffold a storefront if the user doesn't have one yet.
      const existing = await mySellerProfileId();
      if (!existing) {
        const { data: profile } = await sb
          .from('profiles')
          .select('name')
          .eq('id', uid)
          .maybeSingle();
        const { error: insErr } = await sb.from('seller_profiles').insert({
          user_id: uid,
          owner_name: profile?.name ?? 'New Beekeeper',
          store_name: `${profile?.name ?? 'My'}'s Hive`,
          fulfillment_methods: ['pickup'],
          story: 'Welcome to my hive!',
        });
        if (insErr) throw insErr;
      }
    }
  },

  // --- Orders ---
  async getOrders(): Promise<Order[]> {
    const uid = await requireUserId();
    const sb = requireSupabase();
    const sellerId = await mySellerProfileId();

    // Order ids relevant to this user: their own purchases + (if a seller) any
    // order containing one of their items.
    const orderIds = new Set<string>();
    const { data: bought } = await sb.from('orders').select('id').eq('buyer_id', uid);
    for (const o of bought ?? []) orderIds.add(o.id);

    if (sellerId) {
      const { data: sold } = await sb
        .from('order_items')
        .select('order_id')
        .eq('seller_id', sellerId);
      for (const oi of sold ?? []) orderIds.add(oi.order_id);
    }

    if (orderIds.size === 0) return [];

    const { data, error } = await sb
      .from('orders')
      .select('*, order_items(*)')
      .in('id', Array.from(orderIds))
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data ?? []).map((o: any): Order => ({
      id: o.id,
      totalAmount: o.total_amount,
      status: o.status as OrderStatus,
      customerName: o.customer_name,
      timestamp: new Date(o.created_at),
      items: (o.order_items ?? []).map((it: any): CartItem => ({
        id: it.product_id,
        cartId: it.id,
        name: it.name,
        price: it.price,
        batchType: it.batch_type,
        stockLevel: 0,
        images: [],
        sellerId: it.seller_id,
        sellerName: it.seller_name,
      })),
    }));
  },

  async placeOrder(items: CartItem[], total: number, customerName: string): Promise<Order> {
    const uid = await requireUserId();
    const sb = requireSupabase();

    const { data: orderRow, error } = await sb
      .from('orders')
      .insert({ buyer_id: uid, total_amount: total, status: 'pending', customer_name: customerName })
      .select('id, created_at')
      .single();
    if (error) throw error;

    const itemRows = items.map(it => ({
      order_id: orderRow.id,
      product_id: it.id,
      seller_id: it.sellerId,
      seller_name: it.sellerName,
      name: it.name,
      price: it.price,
      batch_type: it.batchType,
    }));
    const { error: itemsErr } = await sb.from('order_items').insert(itemRows);
    if (itemsErr) throw itemsErr;

    return {
      id: orderRow.id,
      items,
      totalAmount: total,
      status: 'pending',
      customerName,
      timestamp: new Date(orderRow.created_at),
    };
  },

  async markOrderShipped(orderId: string) {
    const { error } = await requireSupabase()
      .from('orders')
      .update({ status: 'shipped' })
      .eq('id', orderId);
    if (error) throw error;
  },

  // --- Favorites ---
  async getFavorites(): Promise<SellerProfile[]> {
    const uid = await requireUserId();
    const { data, error } = await requireSupabase()
      .from('favorites')
      .select('seller_profiles(*, products(*))')
      .eq('user_id', uid);
    if (error) throw error;
    return (data ?? [])
      .map((row: any) => row.seller_profiles)
      .filter(Boolean)
      .map(mapSeller);
  },

  async toggleFavorite(seller: SellerProfile) {
    const uid = await requireUserId();
    const sb = requireSupabase();
    const { data: existing } = await sb
      .from('favorites')
      .select('user_id')
      .eq('user_id', uid)
      .eq('seller_profile_id', seller.id)
      .maybeSingle();

    if (existing) {
      const { error } = await sb
        .from('favorites')
        .delete()
        .eq('user_id', uid)
        .eq('seller_profile_id', seller.id);
      if (error) throw error;
    } else {
      const { error } = await sb
        .from('favorites')
        .insert({ user_id: uid, seller_profile_id: seller.id });
      if (error) throw error;
    }
  },

  // --- Seller actions ---
  async addProduct(input): Promise<Product> {
    const sellerId = await mySellerProfileId();
    if (!sellerId) throw new Error('Turn on seller mode before adding products.');
    const { data, error } = await requireSupabase()
      .from('products')
      .insert({
        seller_profile_id: sellerId,
        name: input.name,
        price: input.price,
        batch_type: input.batchType,
        stock_level: 0,
        images: [],
      })
      .select('*')
      .single();
    if (error) throw error;
    return mapProduct(data);
  },

  async claimListing(listingId: string) {
    const uid = await requireUserId();
    const sb = requireSupabase();
    // Mark claimed and attach/scaffold a seller profile for this user.
    const { error } = await sb
      .from('directory_listings')
      .update({ is_claimed: true })
      .eq('id', listingId);
    if (error) throw error;

    const { data: listing } = await sb
      .from('directory_listings')
      .select('business_name')
      .eq('id', listingId)
      .maybeSingle();

    const { error: upErr } = await sb.from('seller_profiles').upsert(
      {
        directory_listing_id: listingId,
        user_id: uid,
        owner_name: 'Owner',
        store_name: listing?.business_name ?? 'My Hive',
        fulfillment_methods: ['pickup'],
        story: 'Newly claimed — story coming soon!',
      },
      { onConflict: 'directory_listing_id' }
    );
    if (upErr) throw upErr;
    await sb.from('profiles').update({ is_seller: true }).eq('id', uid);
  },
};
