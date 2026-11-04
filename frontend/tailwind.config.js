/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            50: '#F0F4F8',
            100: '#D9E2EC',
            200: '#BCCCDC',
            300: '#9FB3C8',
            400: '#829AB1',
            500: '#627D98',
            600: '#486581',
            700: '#2A4365',
            800: '#1A365D',
            900: '#0F2238',
            950: '#0A1524',
          },
          gold: {
            50: '#FCF9F0',
            100: '#F8F0D9',
            200: '#F0DFB0',
            300: '#E6CB85',
            400: '#DBB558',
            500: '#C79A2B',
            600: '#A97C19',
            700: '#835E11',
            800: '#60440E',
            900: '#422E0B',
          },
          surface: {
            DEFAULT: '#FDFBF7', // Warm off-white
            card: '#FFFFFF',
            muted: '#F6F3EE',
            border: '#E8E3DA',
            borderHover: '#D4CDC1',
          },
          dark: {
            DEFAULT: '#111827',
            muted: '#1F2937',
            card: '#182234',
          }
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Outfit"', '"Montserrat"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Montserrat"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Outfit"', '"Montserrat"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'], // Mapped to Outfit so existing headings immediately look energetic & modern
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'soft': '0 2px 8px -1px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        'soft-md': '0 6px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'soft-lg': '0 12px 28px -4px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        'soft-xl': '0 20px 40px -6px rgba(15, 23, 42, 0.12), 0 8px 16px -4px rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        'card': '0.875rem', // 14px
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
};

