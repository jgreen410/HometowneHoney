// ── Unified honey image engine ────────────────────────────────────────────────
// Every product and seller image is a local, bundled asset — instant, offline, and
// guaranteed to load. Each flavor (and every varietal name, including custom ones)
// maps to one of the 8 local flavor pools below; nothing is ever fetched at render
// time, so there are no broken links, rate limits, or placeholder images.

// One verified (HTTP 200) Unsplash honey photo, used only as a last-resort on-error
// fallback if a local asset ever fails to decode (effectively never happens).
export const FALLBACK_HONEY_IMAGE =
  'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80';

// Static mapping for the 8 flavors we have real artwork for, each with 5 variations.
const LOCAL_HONEY_IMAGES: Record<string, any[]> = {
  wildflower: [
    require('../../assets/images/honey/wildflower-1.jpg'),
    require('../../assets/images/honey/wildflower-2.jpg'),
    require('../../assets/images/honey/wildflower-3.jpg'),
    require('../../assets/images/honey/wildflower-4.jpg'),
    require('../../assets/images/honey/wildflower-5.jpg'),
  ],
  clover: [
    require('../../assets/images/honey/clover-1.jpg'),
    require('../../assets/images/honey/clover-2.jpg'),
    require('../../assets/images/honey/clover-3.jpg'),
    require('../../assets/images/honey/clover-4.jpg'),
    require('../../assets/images/honey/clover-5.jpg'),
  ],
  'orange blossom': [
    require('../../assets/images/honey/orange-blossom-1.jpg'),
    require('../../assets/images/honey/orange-blossom-2.jpg'),
    require('../../assets/images/honey/orange-blossom-3.jpg'),
    require('../../assets/images/honey/orange-blossom-4.jpg'),
    require('../../assets/images/honey/orange-blossom-5.jpg'),
  ],
  buckwheat: [
    require('../../assets/images/honey/buckwheat-1.jpg'),
    require('../../assets/images/honey/buckwheat-2.jpg'),
    require('../../assets/images/honey/buckwheat-3.jpg'),
    require('../../assets/images/honey/buckwheat-4.jpg'),
    require('../../assets/images/honey/buckwheat-5.jpg'),
  ],
  lavender: [
    require('../../assets/images/honey/lavender-1.jpg'),
    require('../../assets/images/honey/lavender-2.jpg'),
    require('../../assets/images/honey/lavender-3.jpg'),
    require('../../assets/images/honey/lavender-4.jpg'),
    require('../../assets/images/honey/lavender-5.jpg'),
  ],
  'hot honey': [
    require('../../assets/images/honey/hot-honey-1.jpg'),
    require('../../assets/images/honey/hot-honey-2.jpg'),
    require('../../assets/images/honey/hot-honey-3.jpg'),
    require('../../assets/images/honey/hot-honey-4.jpg'),
    require('../../assets/images/honey/hot-honey-5.jpg'),
  ],
  blueberry: [
    require('../../assets/images/honey/blueberry-1.jpg'),
    require('../../assets/images/honey/blueberry-2.jpg'),
    require('../../assets/images/honey/blueberry-3.jpg'),
    require('../../assets/images/honey/blueberry-4.jpg'),
    require('../../assets/images/honey/blueberry-5.jpg'),
  ],
  cinnamon: [
    require('../../assets/images/honey/cinnamon-1.jpg'),
    require('../../assets/images/honey/cinnamon-2.jpg'),
    require('../../assets/images/honey/cinnamon-3.jpg'),
    require('../../assets/images/honey/cinnamon-4.jpg'),
    require('../../assets/images/honey/cinnamon-5.jpg'),
  ],
};

// 15 diverse, high-quality local apiary/seller images to prevent repeats.
const LOCAL_APIARY_IMAGES = [
  require('../../assets/images/apiaries/apiary-1.jpg'),
  require('../../assets/images/apiaries/apiary-2.jpg'),
  require('../../assets/images/apiaries/apiary-3.jpg'),
  require('../../assets/images/apiaries/apiary-4.jpg'),
  require('../../assets/images/apiaries/apiary-5.jpg'),
  require('../../assets/images/apiaries/apiary-6.jpg'),
  require('../../assets/images/apiaries/apiary-7.jpg'),
  require('../../assets/images/apiaries/apiary-8.jpg'),
  require('../../assets/images/apiaries/apiary-9.jpg'),
  require('../../assets/images/apiaries/apiary-10.jpg'),
  require('../../assets/images/apiaries/apiary-11.jpg'),
  require('../../assets/images/apiaries/apiary-12.jpg'),
  require('../../assets/images/apiaries/apiary-13.jpg'),
  require('../../assets/images/apiaries/apiary-14.jpg'),
  require('../../assets/images/apiaries/apiary-15.jpg'),
];

// Stable djb2-style string hash → deterministic seeds (same id always renders the same image).
const hashString = (s: string): number => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Map any product/seller name + batch type to one of the 8 local flavor pools we have
// real artwork for. ALWAYS returns a valid key (defaults to wildflower) so a product
// never falls back to a remote service — every jar shows a real, bundled honey image.
// Varietals without their own artwork (bourbon, manuka, tupelo, sourwood, goldenrod,
// sage, creamed, honeycomb) are routed to the nearest local flavor by colour/character.
const resolveFlavorKey = (name: string, batchType: string): string => {
  const hay = `${batchType} ${name}`.toLowerCase();

  // Exact local-flavor name match first (e.g. "orange blossom", "hot honey").
  for (const key of Object.keys(LOCAL_HONEY_IMAGES)) {
    if (hay.includes(key)) return key;
  }

  // Keyword routing.
  if (/(hot|spicy|chili|chilli|habanero|jalapeno|pepper|heat|sting|fire)/.test(hay)) return 'hot honey';
  if (/(lavender|sleep|dream|lullaby|twilight|calm)/.test(hay)) return 'lavender';
  if (/(blueberry|berry|cobbler)/.test(hay)) return 'blueberry';
  if (/(cinnamon|spice|snicker|chai|fireside)/.test(hay)) return 'cinnamon';
  if (/(orange|citrus|lemon|zest|sunshine|tangerine)/.test(hay)) return 'orange blossom';
  // Dark amber varietals → buckwheat
  if (/(buckwheat|bourbon|barrel|cask|oak|whiskey|aged|tipsy|dark|midnight|molasses)/.test(hay)) return 'buckwheat';
  // Light / golden varietals → clover
  if (/(clover|manuka|tupelo|goldenrod|creamed|whipped|velvet|cloud|cream|maple|elixir)/.test(hay)) return 'clover';

  // Everything else (wildflower, sourwood, sage, honeycomb, generic) → wildflower
  return 'wildflower';
};

/** Deterministic local image for a product, reflecting its flavor. Never hits the network. */
export const productImageUrl = (name: string, batchType: string, id: string): string | number => {
  const flavorKey = resolveFlavorKey(name, batchType);
  const variations = LOCAL_HONEY_IMAGES[flavorKey] || LOCAL_HONEY_IMAGES.wildflower;
  const seed = hashString(id || name || 'default-honey');
  return variations[seed % variations.length];
};

/** Deterministic apiary/seller image for a shop or listing, selecting from 15 local variations. */
export const sellerImageUrl = (id: string, nameHint?: string): string | number => {
  const seed = hashString(id + (nameHint || ''));
  return LOCAL_APIARY_IMAGES[seed % LOCAL_APIARY_IMAGES.length];
};

/**
 * Route existing image requests. Product ids start with `p-`/`prod-`;
 * everything else is treated as a seller / directory listing.
 */
export const getHoneyImage = (id: string, nameHint?: string): string | number => {
  if (!id) return sellerImageUrl('seed', nameHint);
  const isProduct = id.startsWith('p-') || id.startsWith('prod-');
  return isProduct
    ? productImageUrl(nameHint || '', nameHint || '', id)
    : sellerImageUrl(id, nameHint);
};
