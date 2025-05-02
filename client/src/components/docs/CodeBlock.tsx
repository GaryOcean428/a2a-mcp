/**
 * CodeBlock Component
 * 
 * A standardized component for rendering code blocks with proper syntax highlighting,
 * copying functionality, and consistent styling across the documentation.
 */

import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

// Syntax highlighting theme CSS will be loaded from a separate file

export interface CodeBlockProps {
  /**
   * The code content to display
   */
  code: string;
  
  /**
   * The programming language for syntax highlighting
   */
  language: string;
  
  /**
   * Optional title for the code block
   */
  title?: string;
  
  /**
   * Whether to show line numbers
   */
  showLineNumbers?: boolean;
  
  /**
   * Optional CSS class names to apply to the container
   */
  className?: string;
  
  /**
   * Whether to enable the copy button
   */
  enableCopy?: boolean;
  
  /**
   * Optional caption text to display below the code block
   */
  caption?: string;
  
  /**
   * Whether this is a terminal/shell command block
   */
  isTerminal?: boolean;
}

/**
 * Code block with syntax highlighting, copy button, and consistent styling
 */
export function CodeBlock({
  code,
  language,
  title,
  showLineNumbers = true,
  className = '',
  enableCopy = true,
  caption,
  isTerminal = false
}: CodeBlockProps) {
  // State for copy button
  const [copied, setCopied] = useState(false);
  
  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Generate line numbers if needed
  const lineNumbers = showLineNumbers 
    ? code.split('\n').map((_, i) => i + 1).map(num => 
        <span key={num} className="text-gray-500 text-xs select-none pr-4 text-right w-10 inline-block">
          {num}
        </span>
      )
    : null;
    
  // Determine language display label
  const languageLabel = isTerminal ? 'Terminal' : language;

  return (
    <div className={`my-6 rounded-md overflow-hidden shadow-sm border border-gray-200 ${className}`}>
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2">
        <div className="flex items-center space-x-2">
          {isTerminal ? (
            <Terminal size={16} className="text-gray-500" />
          ) : (
            <div className="w-3 h-3 rounded-full bg-purple-500" />
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {title || languageLabel}
          </span>
        </div>
        
        {enableCopy && (
          <button 
            onClick={handleCopy}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-md p-1"
            aria-label="Copy code"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        )}
      </div>
      
      {/* Code content */}
      <div className="relative">
        <pre className={`p-4 overflow-x-auto bg-gray-50 dark:bg-gray-900 text-sm ${isTerminal ? 'font-mono text-white bg-black' : ''}`}>
          {showLineNumbers && (
            <div className="absolute left-0 top-0 bottom-0 pt-4 pl-2 pr-2 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 select-none">
              {lineNumbers}
            </div>
          )}
          
          <code 
            className={`language-${language} ${showLineNumbers ? 'pl-12' : ''}`}
          >
            {code}
          </code>
        </pre>
      </div>
      
      {/* Optional caption */}
      {caption && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          {caption}
        </div>
      )}
    </div>
  );
}

/**
 * Terminal command block - specialized variant for shell commands
 */
export function TerminalBlock({
  code,
  title = 'Terminal',
  ...props
}: Omit<CodeBlockProps, 'language' | 'isTerminal'>) {
  return (
    <CodeBlock
      code={code}
      language="bash"
      title={title}
      isTerminal={true}
      {...props}
    />
  );
}
