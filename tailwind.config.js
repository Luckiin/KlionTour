/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Paleta principal azul (brand) ──────────
        // baseada em #B8BFD6 / #697A98 / #19335A / #8FC8EB / #4675C0
        brand: {
          50:  "#eef3fb",
          100: "#dbe4f3",
          200: "#b8bfd6", // mist blue (palette)
          300: "#8fc8eb", // sky blue (palette)
          400: "#6b9cd8",
          500: "#4675c0", // royal blue (palette) — cor principal
          600: "#3a62a8",
          700: "#2c4d87",
          800: "#223e6e",
          900: "#19335a", // deep navy (palette)
          950: "#0f1f3a",
        },

        // ── Slate/steel auxiliar ───────────────────
        steel: {
          50:  "#f5f6fa",
          100: "#e8ebf2",
          200: "#d1d6e2",
          300: "#b2b9cc",
          400: "#8a93ac",
          500: "#697a98", // steel blue (palette)
          600: "#54647e",
          700: "#434f65",
          800: "#343d4f",
          900: "#232a38",
        },

        // ── Superfícies semânticas ─────────────────
        // Usadas diretamente via bg-surface / dark:bg-surface-dark
        surface: {
          DEFAULT:   "#f7f8fc", // body bg (light)
          elevated:  "#ffffff", // card bg (light)
          subtle:    "#eef1f7", // tint (light)
          border:    "#e2e6ef",

          dark:            "#0a1528", // body bg (dark)
          "dark-elevated": "#0f1f3a", // card bg (dark)
          "dark-subtle":   "#152a4d", // elevated (dark)
          "dark-border":   "#1f3560",
        },

        // ── Legacy aliases (mantidos para compatibilidade com páginas ainda não migradas)
        // mapeiam para tons da nova paleta
        dark: {
          50:  "#1f3560",  // bordas / inputs
          100: "#152a4d",  // hover
          200: "#0f1f3a",  // card / surface
          300: "#0a1528",  // fundo base
          400: "#07101e",  // fundo profundo
        },
        ink: {
          100: "#f7f8fc",
          200: "#dbe4f3",
          300: "#b2b9cc",
          400: "#8a93ac",
          500: "#697a98",
        },
      },

      fontFamily: {
        sans:  ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Playfair Display", "Georgia", "serif"],
      },

      letterSpacing: {
        tightest: "-0.04em",
      },

      animation: {
        "ken-burns":    "ken-burns 24s ease-in-out infinite alternate",
        "float-slow":   "float 8s ease-in-out infinite",
        "shimmer":      "shimmer 2.4s linear infinite",
        "gradient-pan": "gradient-pan 14s ease infinite",
        "fade-in":      "fade-in 0.6s ease-out both",
        "fade-up":      "fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in":     "scale-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "marquee":      "marquee 30s linear infinite",
        "blob":         "blob 18s ease-in-out infinite",
      },

      keyframes: {
        "ken-burns": {
          "0%":   { transform: "scale(1) translate(0, 0)" },
          "100%": { transform: "scale(1.12) translate(-2%, 1%)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":      { backgroundPosition: "100% 50%" },
        },
        "fade-in": {
          "0%":   { opacity: 0 },
          "100%": { opacity: 1 },
        },
        "fade-up": {
          "0%":   { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "scale-in": {
          "0%":   { opacity: 0, transform: "scale(0.96)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        "marquee": {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "blob": {
          "0%,100%": { borderRadius: "42% 58% 62% 38% / 45% 55% 45% 55%", transform: "translate(0,0) scale(1)" },
          "33%":     { borderRadius: "58% 42% 38% 62% / 55% 45% 55% 45%", transform: "translate(3%,-4%) scale(1.05)" },
          "66%":     { borderRadius: "50% 50% 46% 54% / 50% 50% 54% 46%", transform: "translate(-3%,3%) scale(0.97)" },
        },
      },

      backgroundImage: {
        "grid-light":
          "linear-gradient(to right, rgba(25,51,90,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(25,51,90,0.06) 1px, transparent 1px)",
        "grid-dark":
          "linear-gradient(to right, rgba(143,200,235,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(143,200,235,0.08) 1px, transparent 1px)",
        "hero-glow":
          "radial-gradient(ellipse at top, rgba(70,117,192,0.35) 0%, rgba(25,51,90,0) 60%)",
        "brand-gradient":
          "linear-gradient(135deg, #19335a 0%, #4675c0 50%, #8fc8eb 100%)",
        "noise":
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.35'/></svg>\")",
      },

      boxShadow: {
        "soft":      "0 1px 2px rgba(25,51,90,0.04), 0 8px 24px rgba(25,51,90,0.06)",
        "soft-lg":   "0 4px 12px rgba(25,51,90,0.08), 0 24px 48px rgba(25,51,90,0.10)",
        "glow-blue": "0 0 40px rgba(70,117,192,0.45)",
        "ring-blue": "0 0 0 4px rgba(70,117,192,0.15)",
      },
    },
  },
  plugins: [],
};
