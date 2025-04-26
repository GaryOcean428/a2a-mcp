import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigation } from '@/hooks/use-navigation';

interface BreadcrumbProps {
  homeLabel?: string;
  showHome?: boolean;
  additionalCrumbs?: {
    label: string;
    href?: string;
  }[];
}

export function Breadcrumb({ 
  homeLabel = 'Home', 
  showHome = true,
  additionalCrumbs = []
}: BreadcrumbProps) {
  const { activeRoute } = useNavigation();
  
  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4 py-2">
      {showHome && (
        <>
          <Link href="/">
            <div className="flex items-center hover:text-primary cursor-pointer">
              <Home className="h-4 w-4 mr-1" />
              <span>{homeLabel}</span>
            </div>
          </Link>
          <ChevronRight className="h-4 w-4" />
        </>
      )}
      
      {activeRoute && (
        <Link href={activeRoute.path}>
          <span className="hover:text-primary cursor-pointer">{activeRoute.name}</span>
        </Link>
      )}
      
      {additionalCrumbs.map((crumb, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4" />
          {crumb.href ? (
            <Link href={crumb.href}>
              <span className="hover:text-primary cursor-pointer">{crumb.label}</span>
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}