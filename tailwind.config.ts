import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "fade-in": {
          "0%": {
            opacity: "0"
          },
          "100%": {
            opacity: "1"
          }
        }
      },
      animation: {
        "fade-in-down": "fade-in-down 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out"
      }
    }
  },
  safelist: [
    // Core critical classes that must not be purged
    "text-transparent",
    "bg-clip-text",
    "bg-gradient-to-r",
    "bg-gradient-to-l",
    "bg-gradient-to-t",
    "bg-gradient-to-b",
    "feature-card",
    "from-purple-600",
    "to-indigo-600",
    "from-indigo-500",
    "to-blue-500",
    "from-purple-500",
    "to-indigo-500",
    "from-violet-500",
    "to-purple-500",
    "hover:from-purple-700",
    "hover:to-indigo-700",
    "animate-fade-in-down",
    "animate-fade-in",
    "duration-300",
    "duration-500",
    "opacity-0",
    "opacity-100",
    "group-hover:opacity-100",
    "transition-opacity",
    // Animation classes
    "animate-in",
    "animate-out",
    // Failsafe classes
    "gradient-text",
    "Layout",
    "main-content",
    "sidebar",
    "sidebar-backdrop",
    "page-container",
    "overlay",
    "modal-container",
    "modal"
  ]
};

export default config;