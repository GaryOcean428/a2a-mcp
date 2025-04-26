import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values and resolves Tailwind CSS class conflicts
 * 
 * @param inputs List of class values, objects, or conditional classes
 * @returns Merged and deduped className string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}