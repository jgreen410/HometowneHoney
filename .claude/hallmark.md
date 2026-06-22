# Hallmark Design Gates — Hometowne Honey

Run this checklist before marking any screen as done. Each gate is pass/fail.

## Typography (T)
- [ ] T1. Every heading uses `font-display` (Playfair Display 700).
- [ ] T2. No body text smaller than `text-sm` (14px).
- [ ] T3. All small caps labels use `font-label tracking-widest uppercase text-[10px]`.
- [ ] T4. Line height on body paragraphs is `leading-relaxed` or greater.
- [ ] T5. No more than 2 font weights on any single screen.

## Color (C)
- [ ] C1. Background is `bg-wax-100 dark:bg-bark-900` — never `bg-white` or `bg-gray-50`.
- [ ] C2. Card surfaces use `bg-wax-50 dark:bg-bark-800` with `border-wax-600 dark:border-bark-700`.
- [ ] C3. Primary actions use the `bg-hive-gradient` (amber → deep amber) — never flat `bg-yellow-400`.
- [ ] C4. Text hierarchy: `text-bark-900 dark:text-wax-300` (primary) / `text-bark-500 dark:text-wax-500` (secondary).
- [ ] C5. No `gray-*` colors except in system chrome.

## Layout (L)
- [ ] L1. Screen has deliberate vertical rhythm — padding is not the same on every element.
- [ ] L2. No more than 3 border-radius values on a screen (`rounded-lg`, `rounded-2xl`, `rounded-full`).
- [ ] L3. Lists use `gap-*` not `mb-*` on each item.
- [ ] L4. Primary CTA is always full-width, bottom-anchored, with `pb-safe` clearance.

## Motion (M)
- [ ] M1. List items use staggered entry (`delay: index * 60`).
- [ ] M2. Buttons have `active:scale-95` press feedback.
- [ ] M3. No loading spinner — use skeleton or `opacity` fade.
- [ ] M4. Tab transitions use Moti spring, not `timing` with duration > 300ms.

## Honey Brand (H)
- [ ] H1. At least one honey-texture element per screen (honeycomb bg, drip gradient, amber border-glow).
- [ ] H2. Icons are `MaterialCommunityIcons` hive/bee vocabulary first, Ionicons second.
- [ ] H3. Empty states use a honey/bee metaphor, not generic "no data" language.
- [ ] H4. Buttons that are primary CTAs have amber glow shadow (`shadow-hive`).
- [ ] H5. Destructive actions use `bark-700 dark:wax-200` text — never `text-red-500`.

## Anti-Slop (A)
- [ ] A1. Zero `bg-gray-50/100/200` surfaces (slop-register rule 5).
- [ ] A2. Zero inline numeric color/size styles (slop-register rule 1).
- [ ] A3. All images use `expo-image` (slop-register rule 2).
- [ ] A4. No font-bold on system fonts (slop-register rule 6).
- [ ] A5. Spacing follows the 4px grid — only `space-1`, `space-2`, `space-4`, `space-6`, `space-8`, `space-12` used for gaps/padding.
