# MCP Integration Platform Documentation Style Guide

This style guide establishes consistent standards for all technical documentation in the MCP Integration Platform. Follow these guidelines to ensure documentation is clear, consistent, and well-structured.

## Document Structure

### Heading Hierarchy

All documents should use a consistent heading hierarchy:

- **H1**: Main document title (only one per document)
- **H2**: Major sections
- **H3**: Subsections
- **H4**: Component parts within subsections
- **H5**: Rarely used, only for detailed breakdowns

Example:

```markdown
# API Reference Guide

## Authentication

### OAuth 2.0 Flow

#### Client Credentials Grant

##### Error Handling
```

### Document Sections

Include these standardized sections in all API documentation:

1. **Overview**: Brief description of the API resource
2. **Base URL**: Endpoint information
3. **Authentication**: Required authentication methods
4. **Request Parameters**: Complete parameter documentation
5. **Response Format**: Standard response structure
6. **Examples**: Working code examples
7. **Error Codes**: Specific error responses
8. **Rate Limits**: Any applicable limits

## Code Formatting

### Code Blocks

Always use fenced code blocks with language specifiers:

````markdown
```javascript
const client = new MCPClient({
  apiKey: process.env.MCP_API_KEY,
  endpoint: "https://api.example.com/v1"
});
```
````

### Language-Specific Conventions

- **JavaScript/TypeScript**: 2-space indentation
- **Python**: 4-space indentation, follow PEP 8
- **Shell commands**: Prefix with `$` for input lines
- **JSON**: Properly formatted with 2-space indentation

## API Documentation

### Parameter Documentation

Use this format for all API parameters:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | Yes | - | The name of the resource |
| `limit` | number | No | 10 | Maximum number of results to return |

### Endpoint Documentation

Endpoint documentation should follow this structure:

```
HTTP Method: GET
Endpoint: /api/resource/{id}
Content-Type: application/json
Authorization: Bearer {token}
```

### Response Examples

Provide properly formatted JSON response examples:

```json
{
  "id": "resource-123",
  "name": "Example Resource",
  "created": "2025-01-15T12:00:00Z",
  "status": "active",
  "properties": {
    "feature1": true,
    "feature2": "enabled"
  }
}
```

## Visual Elements

### Tables

Use tables for structured data with proper alignment:

- Include a header row with column names
- Use consistent column alignment (left for text, right for numbers)
- Avoid overly complex nested tables

### Diagrams

When including diagrams:

- Use SVG format when possible
- Provide alt text for accessibility
- Keep consistent styling across all diagrams
- Include captions explaining the diagram

## Language and Terminology

### API Term Consistency

Use these terms consistently:

- **Endpoint**: A specific URL path
- **Resource**: An object or entity accessed via API
- **Request**: Data sent to the API
- **Response**: Data returned from the API
- **Parameter**: A variable in a request
- **Field**: A property in a response

### HTTP Status Codes

Reference status codes consistently:

- **2xx**: Successful operations (200 OK, 201 Created, etc.)
- **4xx**: Client errors (400 Bad Request, 401 Unauthorized, etc.)
- **5xx**: Server errors (500 Internal Server Error, etc.)

## Example Implementation

Good documentation provides complete, working examples. For the MCP Integration Platform, include:

1. Authentication setup
2. Request construction
3. Response handling
4. Error handling

Example:

```javascript
// 1. Setup and authentication
const { MCPClient } = require('mcp-client');

const client = new MCPClient({
  apiKey: process.env.MCP_API_KEY
});

// 2. Request construction
async function searchDocuments(query, limit = 10) {
  try {
    // 3. Make the request
    const response = await client.search.query({
      query,
      limit
    });
    
    // 4. Process the response
    return response.results;
  } catch (error) {
    // 5. Handle errors
    if (error.statusCode === 401) {
      console.error('Authentication failed. Check your API key.');
    } else {
      console.error(`Search failed: ${error.message}`);
    }
    return [];
  }
}
```

## Implementation Notes

When implementing this style guide:

1. Use the `CodeBlock` component for all code examples
2. Use the `ApiParameter` component for parameter documentation
3. Use the `ApiTable` component for structured data
4. Use the `ApiResponse` component for response examples

These components ensure consistent rendering and formatting across all documentation.
