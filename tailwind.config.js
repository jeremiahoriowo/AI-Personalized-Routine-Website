module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        calm: {
          50: '#f7fbfb',
          100: '#eef7f6',
          200: '#d9efee',
          500: '#6fb8b2'
        }
      }
    }
  },
  plugins: []
}
