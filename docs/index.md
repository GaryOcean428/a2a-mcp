# MCP Integration Platform Documentation

Welcome to the comprehensive documentation for the MCP Integration Platform. This platform provides a standardized interface for AI applications to leverage web search, form automation, vector storage, and data scraping capabilities.

## Documentation Sections

### Getting Started

- [Getting Started Guide](getting-started.md) - Quick setup and first steps
- [Overview](../README.md) - Platform overview and key concepts
- [FAQ](faq.md) - Frequently asked questions
- [Troubleshooting](troubleshooting.md) - Solutions to common issues

### Feature Documentation

- [Feature Overview](features/index.md) - Summary of all available features
  - [Web Search](features/web-search.md) - Search the web with multiple providers
  - [Form Automation](features/form-automation.md) - Programmatically fill and submit web forms
  - [Vector Storage](features/vector-storage.md) - Store and retrieve documents using vector embeddings
  - [Data Scraping](features/data-scraping.md) - Extract structured data from websites

### Integration Guides

- [Cline Integration](../CLINE_INTEGRATION.md) - Integrate with the Cline VS Code extension
- [Deployment Guide](../DEPLOYMENT.md) - Deploy the platform to production environments

## Key Resources

### API Reference

The complete API reference is available in OpenAPI format:

- [OpenAPI Specification](../api-docs.yaml) - Detailed API documentation

### Code Examples

Code examples in various languages are available throughout the feature documentation. Here's a quick example of using the web search feature:

```javascript
async function searchWeb(query) {
  const response = await fetch('https://api.mcp-platform.com/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    },
    body: JSON.stringify({
      id: 'search-request',
      name: 'web_search',
      parameters: {
        query: query,
        provider: 'tavily',
        max_results: 5
      }
    })
  });
  
  return await response.json();
}
```

## Contributing

We welcome contributions to improve this documentation. If you find errors, unclear explanations, or have suggestions for improvement, please contact the maintainers of this project.

## Support

For additional support or feature requests, please contact the maintainers of this project through the support channels listed on the Contact page.
