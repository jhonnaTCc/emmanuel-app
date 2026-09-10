/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#2563eb',
        'primary-container': '#eff6ff',
        secondary: '#d97706',
        'secondary-container': '#fef3c7',
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [],
};
 
