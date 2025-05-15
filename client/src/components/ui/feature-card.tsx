import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient?: string;
}

export function FeatureCard({
  title,
  description,
  icon,
  gradient = "from-purple-500 to-indigo-500",
  className,
  ...props
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "feature-card",
        "relative flex flex-col bg-white rounded-lg p-6",
        "shadow-sm border border-gray-200",
        "hover:shadow-lg hover:border-purple-200 hover:-translate-y-1",
        "transition-all duration-300 ease-in-out",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/20 to-indigo-100/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      
      <div
        className={cn(
          "bg-gradient-to-r",
          gradient,
          "rounded-lg w-12 h-12 flex items-center justify-center mb-4",
          "group-hover:scale-110 transition-transform"
        )}
      >
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-700 transition-colors">
        {title}
      </h3>
      
      <p className="text-gray-600">{description}</p>
    </div>
  );
}