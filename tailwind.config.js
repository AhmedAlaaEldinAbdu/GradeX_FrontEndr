/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ================= Base Colors ================= */

        green: {
          100: '#00512E1A',
          500: '#00512E',
        },

        lightGreen: {
          100: '#1A9F581A',
          500: '#1A9F58',
        },

        red: {
          100: '#DD04171A',
          500: '#DD0417',
        },

        blue: {
          100: '#117BD71A',
          500: '#117BD7',
        },

        darkBlue: {
          100: '#0909B11A',
          500: '#0909B1',
        },

        sky: {
          100: '#0491DD1A',
          500: '#0491DD',
        },

        gray: {
          50: '#F6F8F9',
          500: '#6E7575',
        },

        black: {
          50: '#F2F2F2',
          100: '#E6E6E6',
          600: '#666666',
          700: '#4D4D4D',
          800: '#333333',
          900: '#0E1F1F',
        },

        orange: {
          100: '#F2960C1A',
          500: '#A96908',
        },

        yellow: {
          100: '#F8951B1A',
          400: '#F8951B',
          500: '#C8A713',
        },

        purple: {
          100: '#A353DD1A',
          500: '#A353DD',
        },

        teal: {
          100: '#25BDD729',
          500: '#16AAC4',
        },
      },

      /* ================= Shadow ================= */

      boxShadow: {
        card: '0px 1px 12px 1px #0000000F',
      },
    },
  },
  plugins: [],
};
