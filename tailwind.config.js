// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Change darkMode to 'class' to allow manual toggling
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        // X/Twitter colors
        primary: {
          DEFAULT: '#1DA1F2',
          dark: '#1a91da',
        },
        secondary: {
          DEFAULT: '#657786',
          light: '#AAB8C2',
          extraLight: '#E1E8ED',
          extraExtraLight: '#F5F8FA',
        },
        dark: {
          DEFAULT: '#15202B',  // X/Twitter dark mode background
          light: '#192734',    // X/Twitter dark mode secondary background
          border: '#38444d',   // X/Twitter dark mode borders
        },
        light: {
          DEFAULT: '#FFFFFF',  // X/Twitter light mode background
          border: '#EFF3F4',   // X/Twitter light mode borders
        },
        accent: {
          blue: '#1DA1F2',     // X/Twitter blue
          gold: '#FFD700',     // Verification badge (org)
        },
        success: '#4BB543',
        danger: '#FF3B30',
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        xxs: '0.625rem',
      },
      boxShadow: {
        modal: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      spacing: {
        '18': '4.5rem',
        '68': '17rem',
        '84': '21rem',
        '96': '24rem',
      },
      minWidth: {
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '36': '9rem',
      },
      screens: {
        'xs': '480px',
      },
      zIndex: {
        '60': '60',
        '70': '70',
      },
    },
  },
  plugins: [
    // Added aspect-ratio plugin for consistent image sizes
    require('@tailwindcss/aspect-ratio'),
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-none': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '4px',
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
          },
        },
      };
      addUtilities(newUtilities, ['responsive', 'hover']);
    },
  ],
}
