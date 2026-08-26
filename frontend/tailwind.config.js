/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f7f9fb",
        "on-surface": "#191c1e",
      },
      spacing: {
        "margin-mobile": "16px",
        "margin-desktop": "48px",
        "unit": "8px",
        "container-max": "1280px",
        "gutter": "24px"
      },
      fontFamily: {
        "accent-display": ["Libre Caslon Text", "serif"],
        "headline-lg-mobile": ["Manrope", "sans-serif"],
        "label-caps": ["Manrope", "sans-serif"],
        "headline-lg": ["Manrope", "sans-serif"],
        "body-md": ["Manrope", "sans-serif"],
        "headline-xl": ["Manrope", "sans-serif"],
        "body-lg": ["Manrope", "sans-serif"]
      },
      fontSize: {
        "accent-display": ["48px", { lineHeight: "1.2", fontWeight: "400" }],
        "headline-lg-mobile": ["28px", { lineHeight: "1.3", fontWeight: "600" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "headline-xl": ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }]
      }
    },
  },
  plugins: [],
}