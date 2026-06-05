/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // FORCES Tailwind to compile these classes even if it can't find them in the JS
  safelist: [
    'bg-emerald-500',
    'bg-rose-500',
    'text-emerald-500',
    'text-rose-500',
    'text-yellow-400'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
