import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ezidi: {
          sun: "#FDB813",
          gold: "#D4AF37",
          "gold-light": "#F3E5AB",
          "gold-dark": "#997A15",
          red: "#C0392B",
          white: "#FDFEFE",
        },
        brand: {
          50: "#fbf8ef",
          100: "#f6eed7",
          200: "#ecdaac",
          300: "#e0c077",
          400: "#d4a747",
          500: "#c78f29",
          600: "#ab7120",
          700: "#89521c",
          800: "#71421d",
          900: "#5f381d",
          950: "#361c0d",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glass-gold": "0 8px 32px 0 rgba(212, 175, 55, 0.15)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [],
};
export default config;
