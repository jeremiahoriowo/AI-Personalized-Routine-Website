module.exports = {
  darkMode: 'class',
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        surface: "var(--color-surface)",
        accent: "var(--color-accent)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        "border-color": "var(--color-border)",
        calm: {
          50: '#f7fbfb',
          100: '#eef7f6',
          200: '#d9efee',
          500: '#6fb8b2'
        }
      },
      fontFamily: {
        sans: "var(--font-family)"
      }
    }
  },
  plugins: []
}
