import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { base: { DEFAULT: "#050508", 950: "#050508" }, surface: { DEFAULT: "#0B0D14", raised: "#10121B", border: "rgba(255,255,255,0.08)" }, ink: { DEFAULT: "#F3F4F8", muted: "#9AA0B4", faint: "#6B7086" }, spark: { blue: "#3B82F6", indigo: "#6366F1", violet: "#8B5CF6" } },
    fontFamily: { heading: ["var(--font-manrope)", "system-ui", "sans-serif"], body: ["var(--font-dm-sans)", "system-ui", "sans-serif"] },
    backgroundImage: { "spark-gradient": "linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)", "spark-gradient-soft": "linear-gradient(135deg, rgba(59,130,246,0.16) 0%, rgba(99,102,241,0.12) 50%, rgba(139,92,246,0.16) 100%)", "grid-pattern": "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)" },
    backgroundSize: { grid: "48px 48px" },
    boxShadow: { glow: "0 0 80px -20px rgba(99,102,241,0.45)", card: "0 1px 0 0 rgba(255,255,255,0.05) inset, 0 20px 40px -20px rgba(0,0,0,0.6)" },
    keyframes: { "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } }, "glow-move": { "0%, 100%": { transform: "translate(0, 0)" }, "50%": { transform: "translate(4%, -6%)" } } },
    animation: { "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both", "glow-move": "glow-move 14s ease-in-out infinite" },
  } },
  plugins: [],
};
export default config;
