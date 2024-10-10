/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        pink: {
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        orange: {
          500: '#f97316',
          600: '#ea580c',
        },
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
  safelist: [
    {
      pattern: /bg-(blue|green|purple|yellow|cyan|pink|orange)-(400|500|600|700|800|900)/,
    },
    {
      pattern: /text-(blue|green|purple|yellow|cyan|pink|orange)-(400|500|600|700|800|900)/,
    },
    {
      pattern: /border-(blue|green|purple|yellow|cyan|pink|orange)-(400|500|600|700|800|900)/,
    },
    {
      pattern: /from-(blue|green|purple|yellow|cyan|pink|orange)-(400|500|600|700|800|900)/,
    },
    {
      pattern: /to-(blue|green|purple|yellow|cyan|pink|orange)-(400|500|600|700|800|900)/,
    },
    {
      pattern: /via-(blue|green|purple|yellow|cyan|pink|orange)-(400|500|600|700|800|900)/,
    },
  ],
};