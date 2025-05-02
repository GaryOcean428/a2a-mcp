/**
 * MCP Integration Platform - Spinner Component Showcase
 * 
 * This component displays all loading spinner variants for demos and documentation.
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner, LoadingSpinnerProps } from './LazyLoad';

export interface SpinnerShowcaseProps {
  title?: string;
  description?: string;
}

/**
 * Spinner Showcase Component
 * Displays various spinner variants for documentation and testing
 */
const SpinnerShowcase: React.FC<SpinnerShowcaseProps> = ({
  title = 'Loading Indicators',
  description = 'These spinners are used throughout the application to indicate loading states.',
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-4 border rounded-md">
            <LoadingSpinner size="sm" />
            <p className="mt-2 text-sm font-medium">Small</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-md">
            <LoadingSpinner size="md" />
            <p className="mt-2 text-sm font-medium">Medium</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-md">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm font-medium">Large</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-md">
            <LoadingSpinner variant="primary" />
            <p className="mt-2 text-sm font-medium">Primary</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-primary">
            <LoadingSpinner variant="light" />
            <p className="mt-2 text-sm font-medium text-white">Light</p>
          </div>
          <div className="flex flex-col items-center justify-center p-4 border rounded-md bg-gray-900">
            <LoadingSpinner variant="light" />
            <p className="mt-2 text-sm font-medium text-white">Dark</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Export as default for lazy loading and dynamic imports
export default SpinnerShowcase;
