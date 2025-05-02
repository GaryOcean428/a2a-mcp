/**
 * API Parameter Component
 * 
 * A standardized component for displaying API parameter documentation with
 * consistent formatting, required/optional indicators, and proper type information.
 */

import React from 'react';

export interface ApiParameterProps {
  /**
   * Parameter name
   */
  name: string;
  
  /**
   * Parameter type (string, number, boolean, object, etc.)
   */
  type: string;
  
  /**
   * Whether this parameter is required
   */
  required?: boolean;
  
  /**
   * Default value if parameter is optional
   */
  defaultValue?: string | number | boolean | null;
  
  /**
   * Parameter description
   */
  description: string;
  
  /**
   * Example values for this parameter (optional)
   */
  examples?: string[];
  
  /**
   * Nested parameters if this parameter is an object
   */
  nestedParams?: ApiParameterProps[];
  
  /**
   * Additional CSS classes to apply
   */
  className?: string;
}

/**
 * Individual parameter display component
 */
export function ApiParameter({
  name,
  type,
  required = false,
  defaultValue,
  description,
  examples = [],
  nestedParams = [],
  className = ''
}: ApiParameterProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex flex-wrap items-start gap-2 mb-2">
        <span className="font-mono text-sm font-semibold">{name}</span>
        <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          {type}
        </span>
        {required ? (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            Required
          </span>
        ) : (
          <span className="px-2 py-0.5 text-xs rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
            Optional
          </span>
        )}
        {defaultValue !== undefined && defaultValue !== null && (
          <span className="px-2 py-0.5 text-xs rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
            Default: {JSON.stringify(defaultValue)}
          </span>
        )}
      </div>
      
      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
        {description}
      </div>
      
      {examples.length > 0 && (
        <div className="mb-2">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
            Examples:
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <code 
                key={index}
                className="px-2 py-1 text-xs font-mono bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
              >
                {example}
              </code>
            ))}
          </div>
        </div>
      )}
      
      {nestedParams.length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Properties:
          </div>
          {nestedParams.map((param, index) => (
            <ApiParameter key={index} {...param} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Container for a group of API parameters
 */
export function ApiParameterTable({
  parameters,
  title = 'Parameters',
  className = ''
}: {
  parameters: ApiParameterProps[];
  title?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-900">
        {parameters.length > 0 ? (
          parameters.map((param, index) => (
            <ApiParameter key={index} {...param} />
          ))
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No parameters required.
          </div>
        )}
      </div>
    </div>
  );
}
