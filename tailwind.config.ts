import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        shelf: {
          950: "#07090e",
          900: "#0c0f17",
          850: "#121722",
          800: "#181f2e",
          700: "#242d40",
          600: "#36435d",
          500: "#4e5f82",
          400: "#7b8db0",
          300: "#a9b7d0",
          200: "#cbd5e1",
          100: "#f1f5f9",
        },
        brand: {
          purple: "#8b5cf6",
          cyan: "#06b6d4",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      aspectRatio: {
        cover: "2 / 3",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(139, 92, 246, 0.3)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;
