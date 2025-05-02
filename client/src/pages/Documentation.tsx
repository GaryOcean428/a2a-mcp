/**
 * Documentation Page
 * 
 * This page demonstrates the use of the standardized documentation components
 * and implements the style guide recommendations.
 */

import React from 'react';
import { 
  CodeBlock, 
  TerminalBlock,
  ApiParameter, 
  ApiParameterTable,
  ApiTable,
  ApiResponse 
} from '../components/docs';

export function DocumentationPage() {
  // Sample data for API parameters demonstration
  const parameters = [
    {
      name: 'query',
      type: 'string',
      required: true,
      description: 'The search query to execute',
      examples: ['machine learning', 'natural language processing']
    },
    {
      name: 'limit',
      type: 'number',
      required: false,
      defaultValue: 10,
      description: 'Maximum number of results to return',
      examples: ['5', '20', '100']
    },
    {
      name: 'filters',
      type: 'object',
      required: false,
      description: 'Optional filters to apply to the search',
      nestedParams: [
        {
          name: 'date',
          type: 'string',
          required: false,
          description: 'Filter by date in ISO format',
          examples: ['2025-01-15', '2025-01-15T12:00:00Z']
        },
        {
          name: 'category',
          type: 'string',
          required: false,
          description: 'Filter by content category',
          examples: ['article', 'blog', 'documentation']
        }
      ]
    }
  ];

  // Sample data for API table demonstration
  const tableColumns = [
    {
      header: 'Status Code',
      accessor: 'code',
      width: '120px',
      align: 'center' as const
    },
    {
      header: 'Description',
      accessor: 'description',
      align: 'left' as const
    },
    {
      header: 'Resolution',
      accessor: 'resolution',
      align: 'left' as const
    }
  ];

  const tableData = [
    {
      code: 200,
      description: 'Request successful',
      resolution: 'No action needed'
    },
    {
      code: 400,
      description: 'Bad request due to invalid parameters',
      resolution: 'Check request parameters and fix any validation errors'
    },
    {
      code: 401,
      description: 'Unauthorized - invalid or missing API key',
      resolution: 'Ensure a valid API key is included in the request'
    },
    {
      code: 404,
      description: 'Resource not found',
      resolution: 'Verify the requested resource exists'
    },
    {
      code: 429,
      description: 'Rate limit exceeded',
      resolution: 'Reduce request frequency or contact support for limit increase'
    },
    {
      code: 500,
      description: 'Internal server error',
      resolution: 'Contact support with request ID for assistance'
    }
  ];

  // Sample data for API response demonstration
  const responseExamples = [
    {
      title: 'Successful Response',
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        requestId: '8f4b2e1c-5d3a-4b7f-9c6e-2d1a0f8e9b7c',
        timestamp: '2025-05-02T02:15:32Z',
        results: [
          {
            id: 'doc-123',
            title: 'Machine Learning Fundamentals',
            snippet: 'An introduction to core machine learning concepts...',
            url: 'https://example.com/docs/ml-fundamentals',
            score: 0.92
          },
          {
            id: 'doc-456',
            title: 'Advanced Neural Networks',
            snippet: 'Deep dive into neural network architectures...',
            url: 'https://example.com/docs/advanced-neural-networks',
            score: 0.87
          }
        ],
        metadata: {
          totalResults: 127,
          processingTimeMs: 142,
          query: {
            text: 'machine learning',
            filters: {}
          }
        }
      }, null, 2),
      fieldDescriptions: [
        {
          field: 'success',
          type: 'boolean',
          description: 'Whether the request was successful'
        },
        {
          field: 'requestId',
          type: 'string',
          description: 'Unique identifier for the request, useful for troubleshooting'
        },
        {
          field: 'results',
          type: 'array',
          description: 'Array of search result objects'
        },
        {
          field: 'results[].id',
          type: 'string',
          description: 'Unique identifier for the result document'
        },
        {
          field: 'results[].score',
          type: 'number',
          description: 'Relevance score between 0 and 1'
        },
        {
          field: 'metadata',
          type: 'object',
          description: 'Additional information about the search results'
        }
      ]
    },
    {
      title: 'Error Response',
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        success: false,
        requestId: '2a7b6c5d-4e3f-2a1b-9c8d-7e6f5d4c3b2a',
        timestamp: '2025-05-02T02:16:03Z',
        error: {
          code: 'INVALID_PARAMETER',
          message: 'The parameter \'limit\' must be a positive integer',
          details: {
            parameter: 'limit',
            provided: '-10',
            constraints: 'Must be a positive integer'
          }
        }
      }, null, 2),
      fieldDescriptions: [
        {
          field: 'success',
          type: 'boolean',
          description: 'Always false for error responses'
        },
        {
          field: 'error',
          type: 'object',
          description: 'Error details'
        },
        {
          field: 'error.code',
          type: 'string',
          description: 'Machine-readable error code'
        },
        {
          field: 'error.message',
          type: 'string',
          description: 'Human-readable error message'
        },
        {
          field: 'error.details',
          type: 'object',
          description: 'Additional context about the error'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">MCP Integration Platform Documentation</h1>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Overview</h2>
        <p className="mb-4">
          The MCP Integration Platform provides a set of APIs for connecting diverse AI service capabilities. 
          This documentation demonstrates the use of our standardized documentation components.
        </p>
        
        <h3 className="text-xl font-medium mt-8 mb-4">Authentication</h3>
        <p className="mb-4">
          All API requests require authentication using an API key. Include your API key in the 
          <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Authorization</code> header.
        </p>
        
        <CodeBlock
          code={`const client = new MCPClient({
  apiKey: process.env.MCP_API_KEY,
  endpoint: "https://api.mcp.example.com/v1"
});`}
          language="javascript"
          title="Authentication Setup"
        />
        
        <h3 className="text-xl font-medium mt-8 mb-4">Installation</h3>
        <p className="mb-4">Install the MCP client library using npm or yarn:</p>
        
        <TerminalBlock
          code="npm install mcp-client-sdk"
          title="Installation"
        />
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Search API</h2>
        <p className="mb-4">
          The search API allows you to query documents and retrieve relevant results.
        </p>
        
        <h3 className="text-xl font-medium mt-8 mb-4">Request Parameters</h3>
        <ApiParameterTable 
          parameters={parameters}
          title="Search Parameters"
        />
        
        <h3 className="text-xl font-medium mt-8 mb-4">Code Example</h3>
        <CodeBlock
          code={`// Execute a search query
async function executeSearch(query, options = {}) {
  try {
    const response = await client.search.query({
      query,
      limit: options.limit || 10,
      filters: options.filters
    });
    
    return response.results;
  } catch (error) {
    console.error(\`Search failed: \${error.message}\`);
    throw error;
  }
}`}
          language="javascript"
          showLineNumbers={true}
        />
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Response Format</h2>
        
        <ApiResponse 
          examples={responseExamples}
          title="Search API Responses"
        />
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Status Codes</h2>
        <p className="mb-4">
          The API uses standard HTTP status codes to indicate the success or failure of requests.
        </p>
        
        <ApiTable
          columns={tableColumns}
          data={tableData}
          caption="HTTP Status Codes"
          striped={true}
          bordered={true}
        />
      </section>
    </div>
  );
}

export default DocumentationPage;
