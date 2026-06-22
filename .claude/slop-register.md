# React Native Slop Register

Catch these 6 patterns before shipping any screen. Flag any match as a blocker.

## 1. Inline styles instead of NativeWind tokens
BAD:  `style={{ color: '#9ca3af', fontSize: 12 }}`
GOOD: `className="text-gray-400 text-xs"`
Exception: values that must be computed at runtime (e.g. animated translateY).

## 2. `Image` from react-native instead of expo-image
BAD:  `import { Image } from 'react-native'`
GOOD: `import { Image } from 'expo-image'`
expo-image has blurhash placeholder, better caching, and no flicker on re-render.

## 3. `useEffect` chains to drive animation timing
BAD:  `useEffect(() => { setVisible(true); }, []);`
      `useEffect(() => { /* animate */ }, [visible]);`
GOOD: Use Moti's `from/animate` props directly; timing is declarative.

## 4. `useEffect` for onLayout animation
BAD:  `onLayout={() => { setWidth(e.nativeEvent.layout.width); }}`
      + follow-up useEffect to trigger animation
GOOD: Use Reanimated's `useAnimatedStyle` with `useSharedValue`; measure inside the worklet.

## 5. Gray slop — `bg-gray-50/100/200` as the default surface color
These produce AI-looking interfaces. Every surface should use a named token from the
honey design system: `wax-*`, `bark-*`, or `hive-*` — not Tailwind's default grays.
Exception: true neutral UI chrome (e.g. system keyboard, OS pickers).

## 6. Font slop — Inter / Roboto / Arial / Space Grotesk without explicit intent
Default font = slop. Every text element must use one of:
  - `font-display`  → Playfair Display 700 (editorial headings)
  - `font-body`     → DM Sans 400 (body copy)
  - `font-ui`       → DM Sans 500 (labels, buttons)
  - `font-label`    → DM Sans 700 + tracking-widest + uppercase (small caps labels)
If you are reaching for `font-bold` on a system font, stop and assign a token instead.
