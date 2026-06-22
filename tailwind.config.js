/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ─── Legacy aliases (kept for backward compat during redesign) ───
        honey: {
          50:  '#FFFDF8',
          100: '#FFF8E8',
          400: '#F4CA44',
          500: '#D9AA18',
          900: '#422F04',
        },
        earth: {
          500: '#7A5930',
          900: '#2B1800',
        },

        // ─── Hive / Amber — brand primary ───────────────────────────────
        hive: {
          50:  '#FFFBF0',
          100: '#FFF3D0',
          200: '#FFE599',
          300: '#FFD166',
          400: '#F4CA44',
          500: '#D9AA18',
          600: '#C17B1A',
          700: '#9B5E0E',
          800: '#7A4508',
          900: '#5C3006',
        },

        // ─── Wax / Cream — backgrounds & surfaces (light mode) ──────────
        wax: {
          50:  '#FFFDF8',
          100: '#FFF8E8',
          200: '#FFF0C0',
          300: '#F5DFA0',
          400: '#E8C97A',
          500: '#D4A84A',
          600: '#B88830',
          700: '#8C6520',
          800: '#6A4C18',
          900: '#4A3310',
        },

        // ─── Bark / Earth — dark mode surfaces & text ───────────────────
        bark: {
          50:  '#F5EFE8',
          100: '#E8D5BE',
          200: '#D4B08A',
          300: '#B88B5C',
          400: '#9A6A3A',
          500: '#7A5930',
          600: '#5C4020',
          700: '#3D2010',
          800: '#2C1A06',
          900: '#1A0D02',
        },

        // ─── Grove / Forest — accent & verified ─────────────────────────
        grove: {
          50:  '#F0F7EC',
          100: '#D9EDD0',
          200: '#A8D490',
          300: '#7DC95E',
          400: '#5AAF3A',
          500: '#3D8A22',
          600: '#2D6A18',
          700: '#1F4E10',
          800: '#14370A',
          900: '#0A2005',
        },
      },

      fontFamily: {
        display:       ['PlayfairDisplay_700Bold'],
        'display-i':   ['PlayfairDisplay_700BoldItalic'],
        body:          ['DMSans_400Regular'],
        ui:            ['DMSans_500Medium'],
        label:         ['DMSans_700Bold'],
      },

      boxShadow: {
        // Amber glow for honey-branded CTAs
        hive:    '0 4px 20px rgba(217, 170, 24, 0.45)',
        'hive-sm': '0 2px 8px rgba(217, 170, 24, 0.30)',
      },
    },
  },
  plugins: [],
};
