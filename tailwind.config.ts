import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nomciu: {
          bg: "#FAF6F0",
          card: "#FFFFFF",
          cream: "#F4ECE1",
          peach: "#FF7E5F",
          "peach-light": "#FFF0EB",
          "peach-dark": "#E66848",
          sage: "#34D399",
          "sage-light": "#E8F8F0",
          "sage-dark": "#10B981",
          amber: "#F59E0B",
          "amber-light": "#FEF3C7",
          charcoal: "#2C2D35",
          muted: "#8C8D98",
          border: "#EFE9E0",
        },
      },
      boxShadow: {
        tactile: "0 10px 25px -5px rgba(255, 126, 95, 0.35), 0 8px 10px -6px rgba(255, 126, 95, 0.2)",
        "tactile-active": "0 4px 12px -2px rgba(255, 126, 95, 0.3)",
        card: "0 4px 20px 0 rgba(0, 0, 0, 0.04)",
        "card-hover": "0 8px 30px 0 rgba(0, 0, 0, 0.08)",
        innerGlow: "inset 0 2px 4px 0 rgba(255, 255, 255, 0.6)",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
