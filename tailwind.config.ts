import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{ts,tsx,css,md,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        museum: {
          dark: '#1a1a1a',
          light: '#f8fafc',
          accent: '#6366f1',
        }
      }
    },
  },
  safelist: [
    // Admin 页面中动态颜色类（由变量拼接），需显式 safelist
    { pattern: /bg-(amber|green|blue|purple)-100/ },
    { pattern: /text-(amber|green|blue|purple)-800/ },
  ],
  plugins: [],
} satisfies Config; 