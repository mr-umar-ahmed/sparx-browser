/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We can define custom soothing theme colors here later
        sparx: {
          dark: '#0B0F19',
          card: '#1A2235',
          accent: '#3B82F6'
        }
      }
    },
  },
  plugins: [],
}