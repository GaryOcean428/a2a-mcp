import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '@/hooks/use-navigation';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  homeLabel?: string;
  showHome?: boolean;
  additionalCrumbs?: {
    label: string;
    href?: string;
  }[];
  className?: string;
}

export function Breadcrumb({ 
  homeLabel = 'Home', 
  showHome = true,
  additionalCrumbs = [],
  className
}: BreadcrumbProps) {
  const { activeRoute } = useNavigation();
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        "flex items-center text-sm text-muted-foreground", 
        className
      )}
    >
      <ol className="flex items-center space-x-2">
        {showHome && (
          <li className="flex items-center">
            <Link href="/">
              <div className="flex items-center hover:text-foreground transition-colors">
                <Home className="h-3.5 w-3.5 mr-1" />
                <span>{homeLabel}</span>
              </div>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/70" />
          </li>
        )}
        
        {activeRoute && (
          <li>
            <Link href={activeRoute.path}>
              <span className="hover:text-foreground transition-colors">{activeRoute.name}</span>
            </Link>
          </li>
        )}
        
        {additionalCrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="h-3.5 w-3.5 mx-1 text-muted-foreground/70" />
            {crumb.href ? (
              <Link href={crumb.href}>
                <span className="hover:text-foreground transition-colors">{crumb.label}</span>
              </Link>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}