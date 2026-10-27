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
          950: "#0e1117", // Fondo principal gris carbón muy oscuro (evita negro absoluto)
          900: "#151922", // Superficie de paneles y barras laterales
          850: "#1c2230", // Superficie de tarjetas y contenedores
          800: "#242c3e", // Superficie interactiva / hover
          750: "#2d374d", // Bordes sutiles
          700: "#394560", // Bordes activos / divisores
          600: "#4e5d80", // Bordes destacados / iconos
          500: "#6d7d9e", // Texto secundario tenue / placeholders
          400: "#94a3b8", // Texto secundario con alto contraste
          300: "#cbd5e1", // Texto legible
          200: "#e2e8f0", // Texto principal
          100: "#f8fafc", // Blanco óptico
        },
        brand: {
          purple: "#7c3aed", // Violeta eléctrico primario
          "purple-hover": "#6d28d9",
          "purple-light": "#a78bfa",
          "purple-subtle": "rgba(124, 58, 237, 0.12)",
          cyan: "#0ea5e9",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      aspectRatio: {
        cover: "2 / 3",
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.35)",
        "card-hover": "0 12px 28px -4px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(124, 58, 237, 0.25)",
        modal: "0 24px 48px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        subtle: "0 2px 8px 0 rgba(0, 0, 0, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
