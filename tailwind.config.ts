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
        nomciu: {
          bg: "#0D0E13",
          card: "#161822",
          "card-hover": "#1E212D",
          cream: "#1C1E28",
          peach: "#FF5E7E",
          "peach-light": "#2D1822",
          "peach-dark": "#E11D48",
          sage: "#10B981",
          "sage-light": "#0E281F",
          "sage-dark": "#059669",
          amber: "#F59E0B",
          "amber-light": "#2E200C",
          charcoal: "#F3F4F6",
          muted: "#949BA8",
          border: "#252836",
        },
      },
      boxShadow: {
        tactile: "0 10px 25px -5px rgba(255, 94, 126, 0.35), 0 8px 10px -6px rgba(255, 94, 126, 0.2)",
        "tactile-active": "0 4px 12px -2px rgba(255, 94, 126, 0.3)",
        card: "0 4px 20px 0 rgba(0, 0, 0, 0.3)",
        "card-hover": "0 8px 30px 0 rgba(0, 0, 0, 0.4)",
        innerGlow: "inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
