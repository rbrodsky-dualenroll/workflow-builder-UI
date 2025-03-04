/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#006CA8",
          foreground: "hsl(var(--primary-foreground))",
          50: "#e9f0f5",
          100: "#c7d7e5",
          200: "#a2bed3",
          300: "#7ca5c2",
          400: "#5f92b4",
          500: "#427ea6",
          600: "#30679f",
          700: "#245a8f",
          800: "#184e7f",
          900: "#0c3764",
        },
        secondary: {
          DEFAULT: "#59B5E8",
          foreground: "hsl(var(--secondary-foreground))",
          50: "#eaf6fd",
          100: "#c9e5f7",
          200: "#a5d4f1",
          300: "#81c2ea",
          400: "#59B5E8",
          500: "#4ea1d3",
          600: "#3f89be",
          700: "#2e71a9",
          800: "#1f5994",
          900: "#0d427f",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "#e9f2f7",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        card: "0 2px 4px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
