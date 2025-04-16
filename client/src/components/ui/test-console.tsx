import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { mcpClient } from '@/lib/mcp-client';

interface TestConsoleProps {
  toolName: string;
  defaultParams?: any;
  inputSchema?: any;
}

export function TestConsole({ toolName, defaultParams = {}, inputSchema }: TestConsoleProps) {
  const [params, setParams] = useState<string>(JSON.stringify(defaultParams, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  
  const handleParamsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setParams(e.target.value);
  };
  
  const executeRequest = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setStatusCode(null);
    
    try {
      // Parse parameters from JSON
      const parsedParams = JSON.parse(params);
      
      // Send request to MCP server
      const result = await mcpClient.sendRequest({
        name: toolName,
        parameters: parsedParams
      });
      
      // Set response and status
      setResponse(result);
      setStatusCode(result.error ? 400 : 200);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setStatusCode(500);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStatusColorClass = () => {
    if (!statusCode) return '';
    if (statusCode >= 200 && statusCode < 300) return 'bg-green-600';
    if (statusCode >= 400 && statusCode < 500) return 'bg-yellow-500';
    return 'bg-red-600';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="border-b border-gray-200">
        <div className="px-6 py-4">
          <h3 className="text-lg font-medium">Test Console</h3>
          <p className="text-gray-500">Test the {toolName.replace(/_/g, ' ')} tool with sample parameters</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 divide-x divide-gray-200">
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="test-params" className="block text-sm font-medium text-gray-700 mb-1">
              Parameters (JSON)
            </label>
            <textarea 
              id="test-params"
              rows={10}
              className="w-full border border-gray-200 rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              value={params}
              onChange={handleParamsChange}
              placeholder={`Enter ${toolName} parameters in JSON format...`}
            />
          </div>
          
          <button 
            onClick={executeRequest}
            disabled={isLoading}
            className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? 'Executing...' : 'Execute Request'}
          </button>
        </div>
        
        <div className="p-6 h-full">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Response</h4>
            {statusCode && (
              <div className={`text-xs text-white py-1 px-2 rounded-full ${getStatusColorClass()}`}>
                {statusCode} {statusCode >= 200 && statusCode < 300 ? 'OK' : 'Error'}
              </div>
            )}
          </div>
          
          <div className="font-mono text-sm bg-gray-800 text-white rounded-lg p-4 overflow-auto h-[300px]">
            {error ? (
              <div className="text-red-400">
                Error: {error}
              </div>
            ) : response ? (
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div className="text-gray-400 italic">
                {isLoading ? 'Executing request...' : 'Execute a request to see the response here'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
