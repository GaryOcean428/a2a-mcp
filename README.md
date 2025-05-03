# MCP Integration Platform

## Table of Contents
- [Overview](#overview)
- [Features](#features)
  - [Web Search](#web-search)
  - [Form Automation](#form-automation)
  - [Vector Storage](#vector-storage)
  - [Data Scraping](#data-scraping)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Integration with Cline](#integration-with-cline)
- [System Requirements](#system-requirements)
- [Contact](#contact)

## Overview
The MCP Integration Platform provides a standardized interface for AI applications to leverage web search, form automation, vector storage, and data scraping capabilities. Built to support the Model Context Protocol (MCP), this platform enables seamless integration with AI systems requiring real-time access to external tools and data sources.

## Features

### Web Search
Search the web with multiple provider options:
- Tavily - Fast and relevant web search
- Perplexity - AI-powered search with detailed results
- OpenAI - Search using OpenAI's integrated search capabilities

```
POST /api/mcp
{
  "id": "request-123",
  "name": "web_search",
  "parameters": {
    "query": "Latest developments in AI",
    "provider": "tavily",
    "max_results": 5
  }
}
```

### Form Automation
Fill and submit web forms programmatically with validation:
- Support for complex form fields
- Validation before submission
- Wait for response/redirect handling

```
POST /api/mcp
{
  "id": "request-456",
  "name": "form_automation",
  "parameters": {
    "url": "https://example.com/contact",
    "fields": {
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello world"
    },
    "submit": true
  }
}
```

### Vector Storage
Connect to vector databases for semantic search and retrieval:
- Store documents with vector embeddings
- Semantic search across collections
- Retrieve specific documents by ID
- Delete documents when no longer needed

```
POST /api/mcp
{
  "id": "request-789",
  "name": "vector_storage",
  "parameters": {
    "operation": "search",
    "collection": "documentation",
    "query": "How to integrate with OpenAI",
    "limit": 5
  }
}
```

### Data Scraping
Extract structured data from websites with configurable policies:
- CSS selector-based data extraction
- Support for pagination
- Multiple output formats (JSON, CSV)

```
POST /api/mcp
{
  "id": "request-101",
  "name": "data_scraper",
  "parameters": {
    "url": "https://example.com/products",
    "selectors": {
      "title": ".product-title",
      "price": ".product-price",
      "description": ".product-description"
    },
    "format": "json"
  }
}
```

## Authentication

All API requests require authentication using an API key. To use the API:

1. Register for an account on the platform
2. Navigate to the Settings page to generate an API key
3. Include your API key in the request header:
   ```
   X-API-Key: your-api-key-here
   ```

## Rate Limiting

The API is subject to rate limiting to ensure fair usage:
- Global rate limit: 100 requests per minute
- Tool-specific rate limit: 20 requests per minute per tool

## Integration with Cline

This platform integrates with the Cline VS Code extension, providing additional AI capabilities directly in your development environment. See the [Cline Integration Guide](/cline-integration) for detailed setup instructions.

## System Requirements

- Node.js v18+
- PostgreSQL database (for production deployments)

## Documentation

For detailed documentation, please refer to the following resources:

- [Documentation Home](docs/index.md) - Main documentation portal
- [Getting Started Guide](docs/getting-started.md) - Quick setup and first steps
- [Feature Documentation](docs/features/index.md) - Detailed feature guides
- [CSS & WebSocket Fixes](docs/css-websocket-fixes.md) - Comprehensive solution for UI rendering and connection stability
- [CSS Implementation Guide](docs/css-fixes.md) - Technical details on CSS fixes and failsafe mechanisms
- [FAQ](docs/faq.md) - Frequently asked questions
- [Troubleshooting](docs/troubleshooting.md) - Solutions to common issues

## Contributing

We welcome contributions to the MCP Integration Platform! Please refer to our [Contribution Guidelines](docs/contributing.md) for more information on how to get involved.

## Contact

For additional support or feature requests, please contact the maintainers of this project.