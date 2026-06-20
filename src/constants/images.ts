// A sanitized, high-availability list of Honey aesthetics
const HONEY_POOL = [
  "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
  "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=80",
  "https://images.unsplash.com/photo-1478486829545-2f41619c0b29?w=600&q=80",
  "https://images.unsplash.com/photo-1568484647311-c97793c1c4e7?w=600&q=80",
  "https://images.unsplash.com/photo-1599557434509-3226a29d91f8?w=600&q=80",
  "https://images.unsplash.com/photo-1581457195431-7b02c6762391?w=600&q=80",
  "https://images.unsplash.com/photo-1532296076779-724dc57297e6?w=600&q=80",
  "https://images.unsplash.com/photo-1443916560463-f25df4946338?w=600&q=80",
  "https://images.unsplash.com/photo-1520633803027-8178f564f89d?w=600&q=80",
  "https://images.unsplash.com/photo-1596436666352-05342bc466df?w=600&q=80",
  "https://images.unsplash.com/photo-1506459346617-68b2413e4b46?w=600&q=80",
  "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&q=80",
  "https://images.unsplash.com/photo-1555447405-05842c375627?w=600&q=80",
  "https://images.unsplash.com/photo-1589139268388-c0b965f7c5d7?w=600&q=80",
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80"
];

// Returns a consistent image based on any string ID
export const getHoneyImage = (id: string) => {
  if (!id) return HONEY_POOL[0];

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % HONEY_POOL.length;
  return HONEY_POOL[index];
};
