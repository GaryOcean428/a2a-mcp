/**
 * MCP Integration Platform - Spinner Component
 * 
 * A simple spinner component for loading states that can be customized
 * with different sizes and colors.
 */

import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The size of the spinner
   * @default "md"
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Custom CSS class for the spinner
   */
  className?: string;
}

/**
 * Spinner Component
 * 
 * Displays a loading spinner with customizable size and appearance.
 */
export function Spinner({ size = 'md', className, ...props }: SpinnerProps) {
  // Size mappings
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4',
  };
  
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}
