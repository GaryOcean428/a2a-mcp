# Web Search Feature Guide

## Overview

The Web Search feature of the MCP Integration Platform allows applications to search the web programmatically using multiple provider options. This guide provides detailed information about using the web search functionality, including provider differences, advanced parameters, and optimization techniques.

## Basic Usage

To use the web search feature, send a POST request to `/api/mcp` with the following payload structure:

```json
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

### Required Parameters

- `query` (string): The search query text
- `provider` (string): One of the supported providers (`tavily`, `perplexity`, `openai`)

### Optional Parameters

- `max_results` (number): Maximum number of results to return (default: 5, max: 20)
- `include_domains` (string[]): List of domains to include in the search
- `exclude_domains` (string[]): List of domains to exclude from the search
- `time_period` (string): Time period for search results (`day`, `week`, `month`, `year`, or `all`)
- `search_depth` (string): Depth of search (`basic` or `comprehensive`)

## Provider Comparison

### Tavily

**Strengths**:
- Fast response times (typically 1-3 seconds)
- Good general coverage of the web
- Reliable and consistent results
- Support for domain filtering

**Best for**:
- General queries requiring quick responses
- Applications where response time is critical
- News and current events searches

**Example**:
```json
{
  "id": "tavily-example",
  "name": "web_search",
  "parameters": {
    "query": "Latest AI research papers 2025",
    "provider": "tavily",
    "max_results": 5,
    "include_domains": ["arxiv.org", "research.google.com", "openai.com/research"],
    "time_period": "month"
  }
}
```

### Perplexity

**Strengths**:
- AI-powered search with detailed results
- Better understanding of complex queries
- Rich context and summaries included with results
- Good for technical and scientific content

**Best for**:
- Complex queries requiring understanding of context
- Research-oriented searches
- Technical or academic inquiries

**Example**:
```json
{
  "id": "perplexity-example",
  "name": "web_search",
  "parameters": {
    "query": "How do transformer neural networks work and what are their limitations?",
    "provider": "perplexity",
    "max_results": 3,
    "search_depth": "comprehensive"
  }
}
```

### OpenAI

**Strengths**:
- Integration with OpenAI's ecosystem
- Natural language understanding
- Good balance of speed and quality
- Consistent formatting of results

**Best for**:
- Applications already integrated with OpenAI services
- Queries requiring natural language understanding
- General-purpose search needs

**Example**:
```json
{
  "id": "openai-example",
  "name": "web_search",
  "parameters": {
    "query": "Recent advancements in renewable energy storage solutions",
    "provider": "openai",
    "max_results": 8
  }
}
```

## Response Format

All web search requests return responses in a standardized format:

```json
{
  "id": "request-123",
  "status": "success",
  "result": {
    "search_results": [
      {
        "title": "Article Title",
        "url": "https://example.com/article",
        "snippet": "A brief excerpt from the article...",
        "published_date": "2025-04-15T14:30:00Z" // Optional, if available
      },
      // Additional results...
    ],
    "meta": {
      "total_results": 854, // Estimated total results available
      "provider": "tavily",
      "query_time_ms": 1250
    }
  }
}
```

## Advanced Usage

### Domain Filtering

You can include or exclude specific domains from search results:

```json
{
  "parameters": {
    "query": "climate change solutions",
    "provider": "tavily",
    "include_domains": ["un.org", "who.int", "nasa.gov"],
    "exclude_domains": ["example-blog.com"]
  }
}
```

### Time-Based Filtering

Limit results to a specific time period:

```json
{
  "parameters": {
    "query": "cryptocurrency market trends",
    "provider": "perplexity",
    "time_period": "week" // Only results from the past week
  }
}
```

### Comprehensive Search

For deeper research, use the comprehensive search option (note: this may increase response time):

```json
{
  "parameters": {
    "query": "quantum computing applications in medicine",
    "provider": "perplexity",
    "search_depth": "comprehensive"
  }
}
```

## Best Practices

### Optimizing Search Queries

1. **Be specific**: Instead of "AI news", use "Recent advancements in generative AI for image creation"
2. **Use relevant keywords**: Include important technical terms and concepts
3. **Consider search intent**: Frame queries based on what information you're seeking

### Handling Rate Limits

Web search requests count toward both your global rate limit and the tool-specific rate limit. To optimize usage:

1. Cache common search results
2. Implement exponential backoff for retry logic
3. Batch similar queries where possible

### Error Handling

Common errors you might encounter:

- `429 Too Many Requests`: You've exceeded rate limits
- `400 Bad Request`: Invalid parameters in your request
- `503 Service Unavailable`: Search provider is temporarily unavailable

Implement robust error handling to manage these scenarios gracefully.

## Use Cases

### AI Agent Research

Enable AI agents to gather real-time information from the web to provide up-to-date responses to user queries.

```javascript
async function researchTopic(topic) {
  const response = await fetch('https://api.mcp-platform.com/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    },
    body: JSON.stringify({
      id: generateUniqueId(),
      name: 'web_search',
      parameters: {
        query: topic,
        provider: 'perplexity',
        max_results: 5
      }
    })
  });
  
  const data = await response.json();
  return data.result.search_results;
}
```

### Content Aggregation

Build a content aggregation platform that gathers information from multiple sources on specific topics.

### Fact-Checking

Verify claims by searching for corroborating or contradicting information from reliable sources.

## Limitations

- Search results are limited by the coverage of the underlying search providers
- Very recent content (within the last few hours) may not be indexed
- Some websites block search engine indexing
- Results may vary between providers for the same query

## FAQ

### Can I use multiple providers for the same query?

Currently, each request can only use one provider. If you want to compare results, you'll need to make separate requests with different providers.

### How fresh are the search results?

It depends on the provider and how recently the content was indexed. For very recent information (minutes or hours old), results may be limited.

### Are images included in search results?

The standard response includes text results only. For image search, a specialized endpoint may be available in the future.

### How is billing calculated for web search?

Web search requests are billed based on the number of requests made, regardless of the number of results returned. Each provider may have different pricing tiers.

### Can I filter results by language?

Language filtering is available for some providers through additional parameters. Check the API reference for provider-specific options.

## Further Resources

- [API Reference Documentation](/api-docs.yaml)
- [Rate Limiting Details](/docs/rate-limiting.md)
- [Provider-Specific Parameters](/docs/provider-parameters.md)
- [Error Code Reference](/docs/error-codes.md)
