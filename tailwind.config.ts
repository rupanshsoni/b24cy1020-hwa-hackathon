/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        oat: "#FAF6F0",
        blush: "#F6D1D8",
        mint: "#BFE3DC",
        sky: "#4DA8DA",
        butter: "#F4D35E",
        cocoa: "#2B2623",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 12px 40px -12px rgba(43,38,35,0.18)",
        lift: "0 22px 60px -18px rgba(43,38,35,0.28)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
