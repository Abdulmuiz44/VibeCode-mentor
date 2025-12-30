import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "dark-bg": "#0a0a0a",
        "dark-card": "#1a1a1a",
        "dark-border": "#2a2a2a",
        "dark-hover": "#2d2d2d",
        "accent-primary": "#8b5cf6",
        "accent-secondary": "#ec4899",
      },
      backgroundColor: {
        "dark": "#0a0a0a",
        "dark-card": "#1a1a1a",
      },
    },
  },
  plugins: [],
};
export default config;
