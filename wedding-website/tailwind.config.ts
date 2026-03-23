import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: "#FFFEF9",
        gold: "#C9A96E",
        "gold-light": "#E8D5A8",
        "gold-dark": "#A88B4A",
        deep: "#2D2D2D",
        secondary: "#6B6B6B",
      },
      fontFamily: {
        serif: [
          "Playfair Display",
          "Noto Serif SC",
          "Georgia",
          "serif",
        ],
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
