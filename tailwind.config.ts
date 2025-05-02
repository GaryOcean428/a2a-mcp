import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  safelist: [
    // Animation classes
    "animate-in",
    "animate-out",
    "animate-fade-in-down",
    "motion-safe:animate-in",
    "motion-safe:animate-out",
    "fade-in",
    "animate-spin",
    "animate-pulse",
    
    // Component classes
    "feature-card",
    
    // Hover effects
    "group-hover:scale-110",
    "group-hover:opacity-100",
    "group-hover:text-purple-700",
    "group-hover:text-indigo-700",
    "group-hover:text-violet-700",
    "hover:shadow-lg",
    "hover:border-purple-200",
    "hover:translate-y-[-2px]",
    "hover:bg-gray-50",
    "hover:bg-gray-100",
    "hover:bg-violet-50",
    "hover:text-purple-700",
    
    // Gradient backgrounds
    "bg-gradient-to-r",
    "bg-gradient-to-l",
    "bg-gradient-to-t",
    "bg-gradient-to-b",
    "bg-gradient-to-tr",
    "bg-gradient-to-tl",
    "bg-gradient-to-br",
    "bg-gradient-to-bl",
    
    // Gradient colors
    "from-purple-50",
    "from-purple-100",
    "from-purple-500",
    "from-purple-600",
    "from-purple-700",
    "from-indigo-500",
    "from-indigo-600",
    "via-indigo-50",
    "via-purple-500",
    "to-white",
    "to-indigo-500",
    "to-indigo-600",
    "to-indigo-700",
    "to-purple-500",
    "to-purple-600",
    
    // Background patterns
    "bg-grid-gray-100",
    "bg-blob-gradient",
    
    // Radix/Shadcn components
    "radix-side-top",
    "radix-side-right",
    "radix-side-bottom",
    "radix-side-left",
    
    // Custom component classes
    "ai-spinner-dot",
    "spinner-border",
    "loader-with-spinners-container",
    "loader-spinner-pulse",
    
    // Layout classes
    "gap-1",
    "gap-2",
    "gap-3",
    "gap-4",
    "gap-5",
    "gap-6",
    "gap-8",
    "gap-10",
    "grid-cols-1",
    "grid-cols-2",
    "grid-cols-3",
    "grid-cols-4",
    "grid-cols-5",
    "grid-cols-6",
    "grid-cols-12",
    "sm:grid-cols-2",
    "md:grid-cols-2",
    "md:grid-cols-3",
    "lg:grid-cols-3",
    "lg:grid-cols-4",
    "xl:grid-cols-4",
    "xl:grid-cols-5",
    
    // Transitions
    "transition-all",
    "transition-colors",
    "transition-opacity",
    "transition-shadow",
    "transition-transform",
    "duration-100",
    "duration-200",
    "duration-300",
    "duration-500",
    "ease-in-out",
    "ease-in",
    "ease-out",
    
    // Width/Max-width - replacing fixed widths
    "w-full",
    "max-w-xs",
    "max-w-sm",
    "max-w-md",
    "max-w-lg",
    "max-w-xl",
    "max-w-2xl",
    "max-w-3xl",
    "max-w-4xl",
    "max-w-5xl",
    "max-w-6xl",
    "max-w-7xl",
    "max-w-screen-sm",
    "max-w-screen-md",
    "max-w-screen-lg",
    "max-w-screen-xl",
    "max-w-screen-2xl",
    "max-w-prose",
    "max-w-none"
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
