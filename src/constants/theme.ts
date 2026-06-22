// Imperative color tokens — the single source of truth for every screen's colors.
// Screens read these via `useTheme()` (src/store/themeStore.ts) as `C`, which
// guarantees a re-render + recolor whenever the user toggles the theme. We use
// runtime tokens (not NativeWind `dark:` classes) for colors specifically so the
// manual toggle is deterministic; all values come from the named honey palette in
// tailwind.config.js, so this stays anti-slop (no scattered magic hex).

export const LIGHT = {
  // surfaces
  bg:            '#FFFDF8', // wax-50  — screen background
  surface:       '#FFF8E8', // wax-100 — cards
  surfaceAlt:    '#FFF0C0', // wax-200 — inputs, chips, inset rows
  elevated:      '#FFFFFF', // floating elements over imagery
  border:        '#E8C97A', // wax-400 — card borders
  cardBorder:    '#E8C97A', // alias (legacy consumers)
  divider:       '#FFF0C0',

  // text
  textPrimary:   '#2B1800', // bark-700
  textSecondary: '#7A5930', // bark-500
  textMuted:     '#B88830', // wax-600
  onAmber:       '#2B1800', // text sitting on an amber gradient
  placeholder:   '#D4A84A', // wax-500

  // brand
  amberGold:     '#F4CA44', // hive-400
  amberDeep:     '#C17B1A', // hive-600
  amberPressed:  '#9B5E0E', // hive-700
  amberSoft:     '#FFF0C0', // tinted icon / chip background
  grove:         '#2D6A18', // verified / success accent
  white:         '#FFFDF8',
} as const;

export const DARK = {
  // surfaces
  bg:            '#1A0D02', // bark-900
  surface:       '#2C1A06', // bark-800 — cards
  surfaceAlt:    '#3D2010', // bark-700 — inputs, chips, inset rows
  elevated:      '#3D2010',
  border:        '#5C4020', // bark-600
  cardBorder:    '#5C4020',
  divider:       '#3D2010',

  // text
  textPrimary:   '#F5DFA0', // wax-300
  textSecondary: '#D4A84A', // wax-500
  textMuted:     '#8C6520', // wax-700
  onAmber:       '#2B1800',
  placeholder:   '#5C4020',

  // brand
  amberGold:     '#F4CA44',
  amberDeep:     '#D9AA18',
  amberPressed:  '#C17B1A',
  amberSoft:     '#3D2010',
  grove:         '#5AAF3A', // brighter in dark
  white:         '#F5DFA0',
} as const;

export type ThemePalette = Record<keyof typeof LIGHT, string>;

// Gradient stops for the honey CTA button (expo-linear-gradient — no className equiv)
export const HONEY_GRADIENT_LIGHT = ['#F4CA44', '#C17B1A'] as const;
export const HONEY_GRADIENT_DARK  = ['#F4CA44', '#D9AA18'] as const;

// Tab bar colors
export const TAB_ACTIVE_LIGHT   = '#C17B1A';
export const TAB_INACTIVE_LIGHT = '#B88830';
export const TAB_ACTIVE_DARK    = '#F4CA44';
export const TAB_INACTIVE_DARK  = '#5C4020';
