/**
 * AI Spinner Component
 * 
 * A customizable loading spinner component with AI service branding.
 * Provides different spinner styles and icon options for various AI services.
 */

import { cn } from "@/lib/utils";
import React from "react";
import { SiOpenai, SiGoogle, SiAnthropic, SiHuggingface } from "react-icons/si";
import { Loader2, BrainCircuit, Cpu, Database, Globe, Search, Cloud } from "lucide-react";

export type AIServiceType = 
  | "openai" 
  | "anthropic" 
  | "google" 
  | "azure" 
  | "huggingface" 
  | "pinecone" 
  | "weaviate" 
  | "websearch" 
  | "generic";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerType = "ring" | "dots" | "pulse" | "wave";

export interface AISpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The AI service to theme the spinner for */
  service?: AIServiceType;
  /** Size of the spinner */
  size?: SpinnerSize;
  /** The spinner animation type */
  type?: SpinnerType;
  /** Show the service icon in the spinner */
  showIcon?: boolean;
  /** Optional label text */
  label?: string;
  /** Whether the spinner is currently active */
  active?: boolean;
}

/**
 * Renders a themed spinner based on the AI service
 */
export function AISpinner({ 
  service = "generic", 
  size = "md", 
  type = "ring",
  showIcon = true,
  label,
  active = true,
  className,
  ...props
}: AISpinnerProps) {
  // Get service-based styling
  const {
    icon: ServiceIcon,
    bgColor,
    textColor,
    ringColor
  } = getServiceTheme(service);
  
  // Size-based styling
  const sizeClasses = {
    xs: "h-4 w-4 text-xs",
    sm: "h-6 w-6 text-sm",
    md: "h-8 w-8 text-base",
    lg: "h-12 w-12 text-lg",
    xl: "h-16 w-16 text-xl",
  };
  
  // Container classes based on size
  const containerClasses = {
    xs: "h-6 w-6",
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
    xl: "h-28 w-28",
  };
  
  // Handle different spinner types
  const spinnerElement = React.useMemo(() => {
    switch (type) {
      case "dots":
        return (
          <div className={cn(
            "flex gap-1 items-center justify-center",
            containerClasses[size]
          )}>
            <div className={cn(
              "animate-bounce rounded-full",
              sizeClasses[size === "xl" ? "xs" : size === "lg" ? "sm" : "xs"],
              bgColor,
              "animation-delay-0"
            )}></div>
            <div className={cn(
              "animate-bounce rounded-full",
              sizeClasses[size === "xl" ? "xs" : size === "lg" ? "sm" : "xs"],
              bgColor,
              "animation-delay-150"
            )}></div>
            <div className={cn(
              "animate-bounce rounded-full",
              sizeClasses[size === "xl" ? "xs" : size === "lg" ? "sm" : "xs"],
              bgColor,
              "animation-delay-300"
            )}></div>
          </div>
        );
        
      case "pulse":
        return (
          <div className={cn(
            "flex items-center justify-center relative",
            containerClasses[size]
          )}>
            <div className={cn(
              "absolute inset-0 rounded-full",
              bgColor,
              "opacity-50 animate-ping"
            )}></div>
            <div className={cn(
              "relative rounded-full",
              sizeClasses[size === "xl" ? "lg" : size === "lg" ? "md" : size],
              bgColor
            )}></div>
          </div>
        );
        
      case "wave":
        return (
          <div className={cn(
            "flex items-end gap-1 justify-center",
            containerClasses[size]
          )}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-full w-1 animate-wave rounded-full",
                  bgColor,
                  `animation-delay-${i * 100}`
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                  height: `${30 + Math.sin(i / 2) * 30}%`,
                }}
              ></div>
            ))}
          </div>
        );
        
      case "ring":
      default:
        return (
          <div className={cn(
            "relative flex items-center justify-center",
            containerClasses[size]
          )}>
            <div className={cn(
              "absolute border-4 rounded-full animate-spin",
              ringColor,
              "border-t-transparent",
              containerClasses[size]
            )}></div>
            {showIcon && (
              <ServiceIcon className={cn(
                "relative",
                textColor,
                sizeClasses[size]
              )} />
            )}
          </div>
        );
    }
  }, [type, size, bgColor, ringColor, textColor, showIcon, ServiceIcon, containerClasses, sizeClasses]);

  if (!active) {
    return null;
  }

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-2",
        className
      )}
      {...props}
    >
      {spinnerElement}
      
      {label && (
        <span className={cn(
          "text-center font-medium animate-pulse",
          textColor,
          {
            "text-xs": size === "xs" || size === "sm",
            "text-sm": size === "md",
            "text-base": size === "lg",
            "text-lg": size === "xl",
          }
        )}>
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Get the theme settings for a specific AI service
 */
function getServiceTheme(service: AIServiceType) {
  switch (service) {
    case "openai":
      return {
        icon: SiOpenai,
        bgColor: "bg-emerald-500",
        textColor: "text-emerald-600",
        ringColor: "border-emerald-500",
      };
    case "anthropic":
      return {
        icon: SiAnthropic,
        bgColor: "bg-violet-500",
        textColor: "text-violet-600",
        ringColor: "border-violet-500",
      };
    case "google":
      return {
        icon: SiGoogle,
        bgColor: "bg-blue-500",
        textColor: "text-blue-600",
        ringColor: "border-blue-500",
      };
    case "azure":
      return {
        icon: SiMicrosoftazure,
        bgColor: "bg-blue-500",
        textColor: "text-blue-600",
        ringColor: "border-blue-500",
      };
    case "huggingface":
      return {
        icon: SiHuggingface,
        bgColor: "bg-yellow-500",
        textColor: "text-yellow-600",
        ringColor: "border-yellow-500",
      };
    case "pinecone":
      return {
        icon: Database,
        bgColor: "bg-emerald-500",
        textColor: "text-emerald-600",
        ringColor: "border-emerald-500",
      };
    case "weaviate":
      return {
        icon: Database,
        bgColor: "bg-purple-500",
        textColor: "text-purple-600",
        ringColor: "border-purple-500",
      };
    case "websearch":
      return {
        icon: Search,
        bgColor: "bg-blue-500",
        textColor: "text-blue-600",
        ringColor: "border-blue-500",
      };
    case "generic":
    default:
      return {
        icon: BrainCircuit,
        bgColor: "bg-slate-500",
        textColor: "text-slate-600",
        ringColor: "border-slate-500",
      };
  }
}

// Add CSS animation delays to the global stylesheet
const styleSheet = typeof document !== "undefined" 
  ? document.createElement("style") 
  : null;

if (styleSheet) {
  styleSheet.textContent = `
    .animation-delay-0 {
      animation-delay: 0ms;
    }
    .animation-delay-100 {
      animation-delay: 100ms;
    }
    .animation-delay-150 {
      animation-delay: 150ms;
    }
    .animation-delay-200 {
      animation-delay: 200ms;
    }
    .animation-delay-300 {
      animation-delay: 300ms;
    }
    .animation-delay-400 {
      animation-delay: 400ms;
    }
    @keyframes wave {
      0%, 100% {
        transform: scaleY(0.5);
      }
      50% {
        transform: scaleY(1);
      }
    }
    .animate-wave {
      animation: wave 1.3s ease-in-out infinite;
    }
  `;
  
  document.head.appendChild(styleSheet);
}