/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        meat: {
          50: '#f0f5f4',
          100: '#dae8e5',
          200: '#b5d1cc',
          300: '#8bb8b0',
          400: '#669d94',
          500: '#4d8075',
          600: '#3d665e',
          700: '#2e4d47',
          800: '#1e3330',
          900: '#0f1a19',
          light: '#425953',
          accent: '#e9c46a',
          'accent-dark': '#d4a017',
        },
        primary: {
          50: '#f0f5f4',
          100: '#dae8e5',
          200: '#b5d1cc',
          300: '#8bb8b0',
          400: '#669d94',
          500: '#4d8075',
          600: '#3d665e',
          700: '#2e4d47',
          800: '#1e3330',
          900: '#0f1a19',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
