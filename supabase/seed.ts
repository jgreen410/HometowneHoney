/**
 * Seeds the Supabase database with the SAME data the demo uses, by reusing the
 * MockApi generator. Run AFTER applying schema.sql:
 *
 *   npm i -D tsx dotenv
 *   npx tsx -r dotenv/config supabase/seed.ts
 *
 * Requires in .env:
 *   EXPO_PUBLIC_SUPABASE_URL          (your project URL)
 *   SUPABASE_SERVICE_ROLE_KEY         (service_role key — server only, NEVER shipped)
 */
import { createClient } from '@supabase/supabase-js';
import { buildSeedData } from '../src/services/MockApi';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    'Missing env. Set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function insertInChunks<T>(table: string, rows: T[], size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    const chunk = rows.slice(i, i + size);
    const { error } = await supabase.from(table).upsert(chunk as any, { onConflict: 'id' });
    if (error) throw new Error(`${table} insert failed: ${error.message}`);
    console.log(`  ${table}: ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
}

async function main() {
  console.log('Generating dataset (reusing MockApi.buildSeedData)…');
  const { directory, sellers } = buildSeedData(1000);

  const listingRows = directory.map((l) => ({
    id: l.id,
    business_name: l.businessName,
    zip_code: l.zipCode,
    is_claimed: l.isClaimed,
    lat: l.lat ?? null,
    lng: l.lng ?? null,
    metadata: l.metaData ?? {},
  }));

  const sellerRows = sellers.map((s) => ({
    id: s.id,
    directory_listing_id: s.directoryListingId,
    user_id: null,
    owner_name: s.ownerName,
    store_name: s.storeName ?? null,
    fulfillment_methods: s.fulfillmentMethods,
    story: s.story,
  }));

  const productRows = sellers.flatMap((s) =>
    s.inventory.map((p) => ({
      id: p.id,
      seller_profile_id: s.id,
      name: p.name,
      price: p.price,
      batch_type: p.batchType,
      stock_level: p.stockLevel,
      images: p.images,
    }))
  );

  console.log(
    `Seeding ${listingRows.length} listings, ${sellerRows.length} sellers, ${productRows.length} products…`
  );

  // Order matters for the FKs: listings → sellers → products.
  await insertInChunks('directory_listings', listingRows);
  await insertInChunks('seller_profiles', sellerRows);
  await insertInChunks('products', productRows);

  console.log('✅ Seed complete.');
}

main().catch((e) => {
  console.error('❌ Seed failed:', e.message);
  process.exit(1);
});
