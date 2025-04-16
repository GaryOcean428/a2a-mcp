import React, { useState } from 'react';
import { RefreshCw, Copy } from 'lucide-react';

interface ToolSchemaProps {
  schema: any;
  onRefresh?: () => void;
}

export function ToolSchema({ schema, onRefresh }: ToolSchemaProps) {
  const [copied, setCopied] = useState(false);
  
  const formattedSchema = JSON.stringify(schema, null, 2);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium">Tool Schema Definition</h3>
        <div className="flex space-x-2">
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="text-sm text-primary hover:text-opacity-80 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </button>
          )}
          <button 
            onClick={handleCopy}
            className="text-sm text-primary hover:text-opacity-80 flex items-center"
          >
            <Copy className="h-4 w-4 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      
      <div className="font-mono text-sm bg-gray-50 rounded-lg p-5 border border-gray-200 overflow-auto max-h-96">
        <pre className="whitespace-pre-wrap break-words">
          <code>
            {formattedSchema.split('\n').map((line, index) => {
              // Apply syntax highlighting
              const highlightedLine = line
                .replace(/"([^"]+)":/g, '<span class="text-blue-600">$&</span>') // property keys
                .replace(/: "([^"]+)"/g, ': <span class="text-red-600">$&</span>') // string values
                .replace(/: (true|false|null)/g, ': <span class="text-purple-600">$&</span>') // boolean values
                .replace(/: (\d+)/g, ': <span class="text-green-600">$&</span>'); // number values
              
              return (
                <div key={index} dangerouslySetInnerHTML={{ __html: highlightedLine }} />
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}
