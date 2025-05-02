/**
 * API Table Component
 * 
 * A standardized component for displaying tabular data in API documentation with
 * consistent column alignment, responsive design, and proper header formatting.
 */

import React from 'react';

export interface ApiTableColumn {
  /**
   * Column header label
   */
  header: string;
  
  /**
   * Object key to display in this column
   */
  accessor: string;
  
  /**
   * Optional custom renderer for this column
   */
  render?: (value: any, row: any) => React.ReactNode;
  
  /**
   * Optional CSS class names for this column
   */
  className?: string;
  
  /**
   * Optional column width specification (percentage or pixel value)
   */
  width?: string;
  
  /**
   * Column alignment
   */
  align?: 'left' | 'center' | 'right';
}

export interface ApiTableProps {
  /**
   * Array of column definitions
   */
  columns: ApiTableColumn[];
  
  /**
   * Data to display in the table
   */
  data: any[];
  
  /**
   * Optional table caption
   */
  caption?: string;
  
  /**
   * Optional CSS class names for the table container
   */
  className?: string;
  
  /**
   * Whether to make the table striped
   */
  striped?: boolean;
  
  /**
   * Whether to add borders between cells
   */
  bordered?: boolean;
  
  /**
   * Whether to add hover effect to rows
   */
  hover?: boolean;
  
  /**
   * Whether the table is compact
   */
  compact?: boolean;
  
  /**
   * Optional empty state message when data is empty
   */
  emptyMessage?: string;
  
  /**
   * Whether the table should scroll horizontally on smaller screens
   */
  responsive?: boolean;
}

export function ApiTable({
  columns,
  data,
  caption,
  className = '',
  striped = true,
  bordered = false,
  hover = true,
  compact = false,
  emptyMessage = 'No data available',
  responsive = true
}: ApiTableProps) {
  // Generate alignment classes for a column
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  // Generate table classes based on props
  const tableClasses = [
    'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
    striped ? 'table-striped' : '',
    bordered ? 'table-bordered' : '',
    hover ? 'table-hover' : '',
    compact ? 'table-compact' : '',
    className
  ].filter(Boolean).join(' ');
  
  // Wrapper classes for responsive tables
  const wrapperClasses = [
    'overflow-hidden rounded-md border border-gray-200 dark:border-gray-700',
    responsive ? 'overflow-x-auto' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <table className={tableClasses}>
        {caption && (
          <caption className="p-2 text-sm text-gray-500 dark:text-gray-400 text-left bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {caption}
          </caption>
        )}
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                scope="col" 
                className={`px-4 py-3.5 text-sm font-semibold text-gray-700 dark:text-gray-300 ${getAlignClass(column.align)} ${column.className || ''}`}
                style={column.width ? { width: column.width } : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className={`${hover ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''} ${
                  striped && rowIndex % 2 === 1 ? 'bg-gray-50/50 dark:bg-gray-800/30' : ''
                }`}
              >
                {columns.map((column, colIndex) => {
                  const value = row[column.accessor];
                  return (
                    <td 
                      key={colIndex} 
                      className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${getAlignClass(column.align)} ${bordered ? 'border-x border-gray-200 dark:border-gray-700' : ''} ${column.className || ''}`}
                    >
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-4 py-8 text-sm text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
