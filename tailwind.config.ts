import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C99A45", // Ouro Antigo
          light: "#E2B85B",   // Dourado Luminoso
          dark: "#A67A2E",
        },
        night: {
          DEFAULT: "#171717", // Noite de Ouro Preto
          light: "#262626",
          dark: "#0F0F0F",
        },
        ivory: {
          DEFAULT: "#F4F0E7", // Marfim Colonial
          light: "#FAF7F2",
          dark: "#EAE4D6",
        },
        blue: {
          tile: "#8FAFC1",    // Azul Azulejo
          deep: "#304B5A",    // Azul Profundo
        },
        stone: {
          DEFAULT: "#E5E0D8", // Pedra / Divisórias
          dark: "#736B63",    // Cinza Pedra Escuro
          light: "#F0ECE6",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Merriweather", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "Menlo", "monospace"],
      },
      screens: {
        xs: "480px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "65ch",
            color: "#171717",
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
