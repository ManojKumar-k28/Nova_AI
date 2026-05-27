/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#080B14",
        "bg-secondary": "#0D1117",
        "bg-panel": "rgba(255, 255, 255, 0.03)",
        "accent-blue": "#3B82F6",
        "accent-cyan": "#06B6D4",
        "accent-violet": "#8B5CF6",
        "text-primary": "#E8EAF0",
        "text-secondary": "#6B7280",
        "text-muted": "#374151"
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
        mono: ["Space Mono", "monospace"]
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" }
        },
        glow: {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1.0" }
        }
      }
    }
  },
  plugins: []
}
