# Making Your First API Call

This guide will walk you through the process of making your first API call to the MCP Integration Platform, from setting up your environment to receiving and interpreting the response.

## Prerequisites

Before you begin, ensure you have:

1. Registered for an account on the MCP Integration Platform
2. Generated an API key from the Settings page
3. Basic knowledge of making HTTP requests in your preferred programming language

## Step 1: Prepare Your Environment

Create a new directory for your project and set up your environment. Here, we'll demonstrate using Node.js, but the principles apply to any language.

```bash
# Create a new directory
mkdir mcp-quickstart
cd mcp-quickstart

# Initialize a new Node.js project (if using JavaScript)
npm init -y

# Install dependencies
npm install node-fetch
```

## Step 2: Store Your API Key Securely

Create a file to store your API key. In a production environment, you would use environment variables or a secure secret management system.

```javascript
// config.js
module.exports = {
  apiKey: "your-api-key-here",  // Replace with your actual API key
  baseUrl: "https://api.mcp-platform.com"
};
```

## Step 3: Set Up Your API Client

Create a simple API client to make requests to the MCP Integration Platform.

```javascript
// mcp-client.js
const fetch = require('node-fetch');
const { apiKey, baseUrl } = require('./config');

async function mcpRequest(name, parameters) {
  try {
    const response = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        id: `request-${Date.now()}`,
        name: name,
        parameters: parameters
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error making MCP request:', error);
    throw error;
  }
}

module.exports = { mcpRequest };
```

## Step 4: Make Your First API Call

Now you're ready to make your first API call. Let's start with a simple web search.

```javascript
// index.js
const { mcpRequest } = require('./mcp-client');

async function runWebSearch() {
  try {
    console.log('Making a web search request...');
    
    const result = await mcpRequest('web_search', {
      query: "What is Model Context Protocol?",
      provider: "tavily",
      max_results: 3
    });
    
    console.log('\nSearch Results:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.status === 'success') {
      console.log('\nTop 3 Results:');
      result.result.search_results.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`URL: ${item.url}`);
        console.log(`Snippet: ${item.snippet}`);
      });
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('Failed to execute web search:', error);
  }
}

runWebSearch();
```

## Step 5: Run Your Code

Execute your code to make the API call.

```bash
node index.js
```

## Step 6: Interpret the Response

The API will return a JSON response with the following structure:

```json
{
  "id": "request-1234567890",
  "status": "success",
  "result": {
    "search_results": [
      {
        "title": "Model Context Protocol (MCP) - AI Integration Standard",
        "url": "https://example.com/mcp-overview",
        "snippet": "The Model Context Protocol (MCP) is a standardized interface for AI applications to leverage web search, form automation, vector storage, and data scraping capabilities..."
      },
      // Additional results...
    ],
    "meta": {
      "total_results": 128,
      "provider": "tavily",
      "query_time_ms": 1250
    }
  }
}
```

Successful responses have:
- A `status` field with value `"success"`
- A `result` field containing the actual data

Error responses have:
- A `status` field with value `"error"`
- An `error` field with error details

## Step 7: Handle Errors

Update your code to handle potential errors gracefully.

```javascript
// Error handling example
async function runWebSearch() {
  try {
    const result = await mcpRequest('web_search', {
      query: "What is Model Context Protocol?",
      provider: "tavily",
      max_results: 3
    });
    
    if (result.status === 'success') {
      // Process successful response
      processResults(result.result.search_results);
    } else {
      // Handle API error
      handleApiError(result.error);
    }
  } catch (error) {
    // Handle network or other errors
    handleNetworkError(error);
  }
}

function processResults(results) {
  // Process the results
  console.log(`Found ${results.length} results`);
  // ...
}

function handleApiError(error) {
  console.error(`API Error: ${error.code} - ${error.message}`);
  
  // Handle specific error types
  switch (error.code) {
    case 'AUTHENTICATION_ERROR':
      console.error('Please check your API key');
      break;
    case 'RATE_LIMITED':
      console.error('Rate limit exceeded. Please try again later.');
      break;
    case 'INVALID_PARAMETERS':
      console.error('Invalid parameters:', error.details);
      break;
    default:
      console.error('An unexpected error occurred');
  }
}

function handleNetworkError(error) {
  console.error('Network error:', error.message);
  console.error('Please check your internet connection and try again.');
}
```

## Next Steps

Now that you've made your first API call, you can explore other features of the MCP Integration Platform:

1. Try different search providers (Perplexity, OpenAI) and compare results
2. Experiment with form automation to interact with web forms
3. Use vector storage to store and retrieve documents semantically
4. Extract data from websites using the data scraping feature

For more detailed information about each feature, refer to the [Feature Documentation](features/index.md).

For ready-to-use code examples in various programming languages, check out the [Code Examples](examples/index.md) section.

## Troubleshooting

### Common Issues

#### Authentication Errors

**Problem**: Receiving `401 Unauthorized` or authentication errors.

**Solution**: Verify your API key is correct and properly included in the `X-API-Key` header.

#### Rate Limiting

**Problem**: Receiving `429 Too Many Requests` errors.

**Solution**: Implement exponential backoff and respect the rate limits (100 requests per minute globally, 20 requests per minute per tool).

#### Network Issues

**Problem**: Failed to connect to the API.

**Solution**: Check your internet connection and verify the API endpoint URL is correct.

For more troubleshooting help, see the [Troubleshooting Guide](troubleshooting.md).