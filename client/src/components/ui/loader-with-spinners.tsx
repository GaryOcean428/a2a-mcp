import React from 'react';
import { AISpinner } from './ai-spinner';

interface LoaderWithSpinnersProps {
  isLoading: boolean;
  toolName: string;
  loadingLabel?: string;
  activeLabel?: string;
  inactiveLabel?: string;
  error?: string;
  isActive?: boolean;
  size?: 'xs' | 'sm' | 'md';
}

/**
 * A component that shows loading status with themed spinners
 */
export function LoaderWithSpinners({
  isLoading,
  toolName,
  loadingLabel = 'Connecting...',
  activeLabel = 'Ready',
  inactiveLabel = 'Not available',
  error,
  isActive = false,
  size = 'xs'
}: LoaderWithSpinnersProps) {
  // Determine which AI service icon to use
  const getServiceType = () => {
    switch (toolName) {
      case 'web_search':
        return 'websearch';
      case 'vector_storage':
        return 'pinecone';
      case 'pinecone':
        return 'pinecone';
      case 'weaviate':
        return 'weaviate';
      case 'openai':
        return 'openai';
      case 'anthropic':
        return 'anthropic';
      default:
        return 'generic';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center">
        <AISpinner 
          service={getServiceType()} 
          size={size} 
          type="ring"
          showIcon={true}
        />
        <span className="ml-2">{loadingLabel}</span>
      </div>
    );
  }

  if (isActive) {
    return <span className="text-green-600 font-medium">{activeLabel}</span>;
  }

  return <span className="text-red-600 font-medium">{error || inactiveLabel}</span>;
}