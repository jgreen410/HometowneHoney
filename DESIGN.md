# Hometowne Honey — Design System

## Aesthetic Direction: **Artisan Apiary Editorial**

The app should feel like a premium craft-food brand at a farmers market — warm, handcrafted, 
tactile — not a tech startup. Every UI decision should reinforce: *local, natural, alive*.

---

## Color Tokens

### Light Mode (Golden Light)
| Token         | Value     | Use                          |
|---------------|-----------|------------------------------|
| `wax-50`      | #FFFDF8   | Screen background            |
| `wax-100`     | #FFF8E8   | Card / surface               |
| `wax-200`     | #FFF0C0   | Subtle dividers              |
| `wax-600`     | #E8C97A   | Card borders                 |
| `hive-400`    | #F4CA44   | Honey gold — brand primary   |
| `hive-600`    | #C17B1A   | Deep amber — action primary  |
| `hive-700`    | #9B5E0E   | Pressed / active             |
| `bark-700`    | #2B1800   | Primary text                 |
| `bark-500`    | #7A5930   | Secondary text               |
| `grove-600`   | #2D6A18   | Accent / verified badge      |

### Dark Mode (Dark Hive)
| Token         | Value     | Use                          |
|---------------|-----------|------------------------------|
| `bark-900`    | #1A0D02   | Screen background            |
| `bark-800`    | #2C1A06   | Card / surface               |
| `bark-700`    | #3D2010   | Elevated card                |
| `bark-600`    | #5C3A10   | Card borders                 |
| `hive-400`    | #F4CA44   | Brand primary                |
| `hive-300`    | #FFD166   | Highlighted amber            |
| `wax-300`     | #F5DFA0   | Primary text                 |
| `wax-500`     | #D4A84A   | Secondary text               |
| `grove-400`   | #5AAF3A   | Accent (brighter in dark)    |

---

## Typography

### Fonts
- **Display**: Playfair Display 700 Bold — editorial headings, screen titles, shop names
- **Display Italic**: Playfair Display 700 Bold Italic — pull quotes, story text, taglines
- **Body**: DM Sans 400 Regular — all body copy
- **UI**: DM Sans 500 Medium — button labels, tab labels, field values
- **Label**: DM Sans 700 Bold + `tracking-widest` + `uppercase` — small caps labels

### Scale
| Role          | Class                          | Size  |
|---------------|--------------------------------|-------|
| Hero          | `font-display text-4xl`        | 36px  |
| Screen title  | `font-display text-3xl`        | 30px  |
| Section head  | `font-display text-2xl`        | 24px  |
| Card title    | `font-display text-xl`         | 20px  |
| Body          | `font-body text-base`          | 16px  |
| Secondary     | `font-body text-sm`            | 14px  |
| Label         | `font-label text-[10px]`       | 10px  |
| Button        | `font-ui text-base`            | 16px  |

---

## Texture Elements

### Honeycomb Background
`<HoneycombBackground />` — absolute-positioned SVG hex grid, 6% opacity.
Use on: login screen, discovery map overlay, shop hero, empty states.
Dark mode: amber lines at 8% opacity on dark background.

### Honey Drip
- **Header drip**: amber LinearGradient (#F4CA44 → #C17B1A) with a drip SVG path at bottom edge.
- **Tab bar drip** (dark mode): HoneyDrips SVG component across the top edge of the tab bar.
- **Button drip**: amber gradient + `shadow-hive` (amber-tinted box shadow).

### Card Style
```
Light: bg-wax-100 border border-wax-600 rounded-2xl shadow-sm
Dark:  bg-bark-800 border border-bark-600 rounded-2xl
```

---

## Button System

### Primary (Honey CTA)
Amber gradient (hive-400 → hive-600), full-width, `rounded-2xl`, `py-4`, `font-ui text-base`.
Pressed: `active:scale-95`, amber glow shadow.

### Secondary
`bg-transparent border border-hive-600 text-hive-600`, `rounded-2xl`.

### Ghost / Text button
`text-hive-600 dark:text-hive-400 font-ui`, no background.

### Destructive
`text-bark-700 dark:text-wax-300 border border-bark-400 dark:border-bark-600`.
Never red — it clashes with the amber brand.

---

## Tab Bars

### Light Mode — Honeycomb Shelf
Row of hexagonal SVG cells. Active cell fills with amber, inactive outlined in wax-600.
Center (Discover) cell is larger and raised 12px above the shelf.

### Dark Mode — Honey Drip Bar
Dark bark-900 background. SVG honey drip silhouette along the top edge (amber teardrops).
Active icon glows amber. Active drip above icon is filled amber.

---

## Anti-Slop Rules (summary)
1. Never use `gray-50/100/200` as a surface — use `wax-*` or `bark-*`.
2. Never use Inter, Roboto, Arial as the intended font — always assign a font token.
3. Use `expo-image` everywhere, never `react-native`'s `Image`.
4. Gradients beat flat color for any primary brand element.
5. Empty states must use honey/bee metaphors.
6. Every screen needs at least one texture element (hex bg, drip, amber border glow).
