/**
 * API Response Component
 * 
 * A standardized component for displaying API response examples with proper
 * formatting, syntax highlighting, and consistent styling.
 */

import React, { useState } from 'react';
import { CodeBlock } from './CodeBlock';

export interface ApiResponseExample {
  /**
   * Response title or description
   */
  title: string;
  
  /**
   * Response status code
   */
  status: number;
  
  /**
   * Response content type (json, text, xml, etc.)
   */
  contentType?: string;
  
  /**
   * Response body content (usually stringified JSON)
   */
  body: string;
  
  /**
   * Optional field descriptions for the response
   */
  fieldDescriptions?: {
    field: string;
    description: string;
    type?: string;
  }[];
}

export interface ApiResponseProps {
  /**
   * List of response examples to display
   */
  examples: ApiResponseExample[];
  
  /**
   * Optional title for the response section
   */
  title?: string;
  
  /**
   * Optional CSS class for the container
   */
  className?: string;
  
  /**
   * Whether to show field descriptions
   */
  showFieldDescriptions?: boolean;
}

/**
 * Maps HTTP status codes to descriptive labels
 */
const getStatusLabel = (status: number): string => {
  const statusMap: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error'
  };
  
  return statusMap[status] || `Status ${status}`;
};

/**
 * Get the appropriate class color for a status code
 */
const getStatusClass = (status: number): string => {
  if (status >= 200 && status < 300) {
    return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
  } else if (status >= 400 && status < 500) {
    return 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400';
  } else if (status >= 500) {
    return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
  }
  return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400';
};

/**
 * Formats JSON string for display
 */
const formatJsonString = (jsonString: string): string => {
  try {
    const parsed = JSON.parse(jsonString);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    return jsonString;
  }
};

/**
 * Detects content type based on response body
 */
const detectContentType = (body: string, contentType?: string): string => {
  if (contentType) {
    if (contentType.includes('json')) return 'json';
    if (contentType.includes('xml')) return 'xml';
    if (contentType.includes('html')) return 'html';
  }
  
  // Try to detect from content
  try {
    JSON.parse(body);
    return 'json';
  } catch (e) {
    if (body.trim().startsWith('<') && body.trim().endsWith('>')) {
      return body.includes('<!DOCTYPE html>') || body.includes('<html') ? 'html' : 'xml';
    }
  }
  
  return 'text';
};

export function ApiResponse({
  examples,
  title = 'Response Examples',
  className = '',
  showFieldDescriptions = true
}: ApiResponseProps) {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!examples || examples.length === 0) {
    return null;
  }

  const currentExample = examples[activeTab];
  const contentType = detectContentType(currentExample.body, currentExample.contentType);
  const formattedBody = contentType === 'json' ? formatJsonString(currentExample.body) : currentExample.body;

  return (
    <div className={`mb-8 ${className}`}>
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      
      {/* Tabs for multiple examples */}
      {examples.length > 1 && (
        <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
          {examples.map((example, index) => (
            <button
              key={index}
              className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === index
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              onClick={() => setActiveTab(index)}
            >
              {example.title}
            </button>
          ))}
        </div>
      )}
      
      {/* Response details */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-md mr-2 ${getStatusClass(currentExample.status)}`}>
            {currentExample.status} {getStatusLabel(currentExample.status)}
          </span>
          
          {currentExample.contentType && (
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {currentExample.contentType}
            </span>
          )}
        </div>
      </div>
      
      {/* Response body */}
      <CodeBlock 
        code={formattedBody}
        language={contentType}
        showLineNumbers={true}
        enableCopy={true}
        title="Response Body"
      />
      
      {/* Field descriptions */}
      {showFieldDescriptions && currentExample.fieldDescriptions && currentExample.fieldDescriptions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Response Fields</h4>
          <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-md">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Field
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {currentExample.fieldDescriptions.map((field, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300">
                      {field.field}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {field.type || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                      {field.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
