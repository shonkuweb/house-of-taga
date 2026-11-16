/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // House of Taaga Brand Color Palette
        taaga: {
          terracotta: '#B65A37',      // Primary terracotta
          deep: '#A7472B',            // Deep terracotta
          ivory: '#FFF9F2',           // Warm ivory
          cream: '#FAF2E9',           // Cream background
          dark: '#382017',            // Dark brown typography
          gold: '#C69B52',            // Muted gold
          goldLight: '#E8D3AA',       // Soft gold highlight
          pink: '#D85179',            // Floral bougainvillea pink
          pinkLight: '#FDECEF',       // Soft blush tint
          sand: '#F4ECE1',            // Warm sand border
          border: '#E8D9C8',          // Soft border
          paper: '#F8F1E7',           // Handmade paper
        },
        brand: {
          50: '#FFF9F2',
          100: '#FAF2E9',
          200: '#F4ECE1',
          300: '#E8D3AA',
          400: '#D85179',
          500: '#B65A37',   // PRIMARY: House of Taaga Terracotta
          600: '#A7472B',   // Deep Terracotta hover
          700: '#8C3E20',   // Rich Terracotta title
          800: '#5A2614',   // Dark Espresso Terracotta
          900: '#382017',   // Dark Brown typography
          gold: '#C69B52',
          goldLight: '#E8D3AA',
          goldDark: '#9E7719',
          cream: '#FAF2E9',
          sand: '#F4ECE1',
          dark: '#382017',
          charcoal: '#22140E',
          accent: '#B65A37',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'serif'],
        sans: ['"DM Sans"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        script: ['"Caveat"', '"Dancing Script"', 'cursive'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(182, 90, 55, 0.08)',
        'card': '0 8px 30px -4px rgba(56, 32, 23, 0.08)',
        'nav': '0 -4px 25px rgba(56, 32, 23, 0.05)',
        'editorial': '0 12px 35px -8px rgba(56, 32, 23, 0.14)',
      }
    },
  },
  plugins: [],
}
