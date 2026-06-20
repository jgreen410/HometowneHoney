/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        honey: {
          50: '#FDF8E8',
          100: '#FBEFC5',
          400: '#F4CA44',
          500: '#D9AA18',
          900: '#422F04',
        },
      },
    },
  },
  plugins: [],
}
