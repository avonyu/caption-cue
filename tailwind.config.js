/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {}
  },
  mode: "jit",
  darkMode: "class",
  content: [
    "./*.{ts,tsx}",
    "./contents/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./stores/**/*.{ts,tsx}",
    "./background/**/*.{ts,tsx}"
  ],
  plugins: []
}
