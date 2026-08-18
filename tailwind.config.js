/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: "#4B294F",
          50: "#F5EFF6",
          100: "#E8D9EA",
          200: "#CDA9D2",
          300: "#B27AB9",
          400: "#8A5590",
          500: "#4B294F",
          600: "#3D2140",
          700: "#2F1932",
          800: "#211123",
          900: "#150A16",
        },
        lavender: {
          DEFAULT: "#B8A2C8",
          light: "#D9CBE5",
        },
        lilac: "#D9CBE5",
        cream: "#F8F3EA",
        beige: "#E8DCCB",
        surface: "#FFFFFF",
        canvas: "#F6F1FA",
        ink: {
          DEFAULT: "#2A1C2E",
          muted: "#6E5C74",
          faint: "#A695AC",
        },
        accent: {
          rose: "#E8748A",
          flame: "#E8834A",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(75, 41, 79, 0.06)",
        soft: "0 8px 24px rgba(75, 41, 79, 0.10)",
        pop: "0 12px 32px rgba(75, 41, 79, 0.16)",
      },
    },
  },
  plugins: [],
};
