import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "ink" = the near-white canvas color (main backgrounds)
        ink: "#FCFAF3",
        // "charcoal" = secondary light surface, one shade deeper than ink
        charcoal: "#F4EDDB",
        // "hairline" = light warm border
        hairline: "#E6D9B4",
        // "bone" = the dark warm text color (renamed from its old light-on-dark role)
        bone: "#1C1710",
        "bone-dim": "#EAE3D2",
        gold: "#96691F",
        "gold-light": "#C79A4E",
        "gold-dim": "#7A551A",
        rust: "#8C3B2E",
      },
      fontFamily: {
        display: ["var(--font-bodoni)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      maxWidth: {
        app: "480px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
