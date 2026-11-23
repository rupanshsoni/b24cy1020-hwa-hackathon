/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        oat: "#FAF6F0",
        pine: {
          DEFAULT: "#12352E",
          elevated: "#1A473E",
          base: "#0C2621",
        },
        cream: "#F7EFE2",
        sand: {
          DEFAULT: "#EFE3CF",
          deep: "#E5D4B8",
        },
        blush: "#F4B8C4",
        mint: "#8FD3C5",
        sky: {
          DEFAULT: "#4DA8DA",
          surface: "#85CAEF",
          led: "#4DA8DA",
          ink: "#114B7A",
        },
        butter: {
          DEFAULT: "#F5C942",
          ink: "#9A6B12",
        },
        cocoa: "#211A17",
        error: {
          DEFAULT: "#9E1C1C",
          dark: "#FFB4A9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 16px 44px -18px rgba(12,38,33,0.35)",
        lift: "0 26px 70px -22px rgba(12,38,33,0.5)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;
