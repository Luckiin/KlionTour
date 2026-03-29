/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Verde principal (Neon) ──────────────────
        brand: {
          50: "#f0fff4",
          100: "#dcffe6",
          200: "#bdffd1",
          300: "#8bffad",
          400: "#4bff82",
          500: "#24cc4eff",   // cor principal (neon green)
          600: "#00db32",
          700: "#00b126",
          800: "#008a20",
          900: "#00681a",
        },
        // ── Backgrounds escuros absolutos ───────────
        dark: {
          50: "#2a2a2a",   // bordas / inputs
          100: "#1a1a1a",   // hover
          200: "#121212",   // card / surface
          300: "#0a0a0a",   // fundo base da página
          400: "#000000",   // fundo mais profundo
        },
        // ── Texto Neutro e Contrastante ─────────────
        ink: {
          100: "#ffffff",   // texto primário
          200: "#f3f4f6",
          300: "#9ca3af",   // texto secundário
          400: "#6b7280",   // texto muted
          500: "#4b5563",   // desabilitado
        },
        // ── Cores Neon de Suporte ───────────────────
        neon: {
          cyan: "#0df0e3",
          pink: "#ff00e6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "ken-burns": "ken-burns 30s ease-in-out infinite alternate",
      },
      keyframes: {
        "ken-burns": {
          "0%": { transform: "scale(1) translate(0, 0)" },
          "100%": { transform: "scale(1.1) translate(-2%, 1%)" },
        },
      },
    },
  },
  plugins: [],
};
