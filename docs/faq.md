# Frequently Asked Questions (FAQ)

## General Questions

### What is the MCP Integration Platform?

The MCP Integration Platform is a standardized interface for AI applications to leverage web search, form automation, vector storage, and data scraping capabilities. It supports the Model Context Protocol (MCP), enabling seamless integration with AI systems requiring real-time access to external tools and data sources.

### What can I do with the MCP Integration Platform?

You can use the platform to:
- Perform web searches using different providers (Tavily, Perplexity, OpenAI)
- Automate form filling and submission on websites
- Store and retrieve documents using vector embeddings for semantic search
- Extract structured data from websites using CSS selectors

### Is the platform free to use?

The platform offers both free and paid tiers. The free tier includes a limited number of API calls per day, while paid tiers offer higher rate limits and additional features. Check the pricing page for detailed information.

## API Usage

### How do I get an API key?

1. Register for an account on the platform
2. Navigate to the Settings page
3. Generate an API key from the API Keys section

### How should I include my API key in requests?

Include your API key in the `X-API-Key` header of your HTTP requests:

```
X-API-Key: your-api-key-here
```

### What are the rate limits for the API?

The API has the following rate limits:
- Global rate limit: 100 requests per minute
- Tool-specific rate limit: 20 requests per minute per tool

### Can I increase my rate limits?

Yes, paid plans offer higher rate limits. Contact the platform administrators for custom enterprise plans with even higher limits.

## Features

### Web Search

#### Which search provider should I use?

- **Tavily**: Best for fast, relevant web search with good general coverage
- **Perplexity**: Ideal for detailed, AI-powered search results with more context
- **OpenAI**: Good integration if you're already using OpenAI's other services

#### How recent are the search results?

Search results typically include content indexed within the last few days, depending on the provider. For real-time information, consider using more specialized data sources.

### Form Automation

#### Can I handle CAPTCHAs with form automation?

The platform does not currently support CAPTCHA solving. Form automation works best on forms that don't implement CAPTCHA or similar verification methods.

#### Does form automation work on all websites?

Form automation works on most standard HTML forms but may encounter difficulties with highly dynamic JavaScript-based forms or websites with complex anti-automation measures.

### Vector Storage

#### What vector databases are supported?

The platform currently supports connections to:
- Pinecone
- Weaviate
- Qdrant
- Milvus

#### What embedding models are available?

The platform supports various embedding models, including:
- OpenAI embeddings (text-embedding-ada-002, text-embedding-3-small, text-embedding-3-large)
- Several other options from different providers

### Data Scraping

#### Is data scraping legal?

Data scraping legality depends on the website's terms of service, the type of data being scraped, and your jurisdiction. Always review a website's terms of service before scraping and consider consulting legal advice for commercial use cases.

#### How do I handle pagination in scraped results?

The data scraping API supports pagination through the `pagination` parameter, where you can specify selectors for next page buttons and maximum page count.

## Troubleshooting

### I'm getting 401 Unauthorized errors

This means your API key is invalid or missing. Check that:
- You're including the API key in the `X-API-Key` header
- The API key is correct and not expired
- You're using the correct API endpoint

### I'm getting 429 Too Many Requests errors

You've exceeded the rate limits. Solutions include:
- Reducing your request frequency
- Implementing backoff strategies
- Upgrading to a plan with higher limits

### The API response is taking too long

Some operations, especially web search and data scraping, may take longer depending on the complexity of the request. Consider:
- Optimizing your query parameters
- Using more specific search queries
- Limiting the amount of data requested

## Integration

### How do I integrate with the Cline VS Code extension?

See the [Cline Integration Guide](/cline-integration) for detailed instructions on setting up the Cline VS Code extension with the MCP Integration Platform.

### Are there client libraries available?

Yes, we offer client libraries for several programming languages:
- JavaScript/TypeScript (npm: `mcp-client`)
- Python (pip: `mcp-client`)
- Other languages are in development

### Can I use the API in my commercial product?

Yes, paid plans allow for commercial use of the API. Review our terms of service for specific limitations and requirements.

## Contact and Support

### How do I report bugs or request features?

Please contact the maintainers of this project through the support channels listed on the Contact page.

### Is there a community forum?

Yes, we have a community forum where users can ask questions, share integration ideas, and get help from other users. Visit our website for the link to the community forum.
