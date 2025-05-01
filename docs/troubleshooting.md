# Troubleshooting Guide

This guide provides solutions to common issues you might encounter when using the MCP Integration Platform.

## Authentication Issues

### 401 Unauthorized Error

**Problem**: API requests return a `401 Unauthorized` response.

**Possible causes**:
- Missing API key in the request header
- Invalid or expired API key
- Incorrect header format

**Solutions**:
1. Ensure you're including the API key in the `X-API-Key` header
2. Verify your API key is valid by checking in your account settings
3. Check the header format: `X-API-Key: your-api-key-here`
4. Generate a new API key if needed

**Example of correct request**:
```bash
curl -X POST "https://api.mcp-platform.com/api/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "id": "request-123",
    "name": "web_search",
    "parameters": {
      "query": "AI news",
      "provider": "tavily",
      "max_results": 5
    }
  }'
```

## Rate Limiting Issues

### 429 Too Many Requests Error

**Problem**: API requests return a `429 Too Many Requests` response.

**Possible causes**:
- Exceeded global rate limit (100 requests per minute)
- Exceeded tool-specific rate limit (20 requests per minute per tool)

**Solutions**:
1. Implement exponential backoff and retry logic
2. Reduce request frequency
3. Optimize request patterns (batch operations where possible)
4. Upgrade to a higher tier plan for increased limits

**Example backoff implementation (JavaScript)**:
```javascript
async function fetchWithBackoff(url, options, maxRetries = 5) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 429) return response;
      
      // If rate limited, wait with exponential backoff
      const retryAfter = response.headers.get('Retry-After') || Math.pow(2, retries);
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      retries++;
    } catch (error) {
      console.error('Request failed:', error);
      retries++;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## Web Search Issues

### Empty or Irrelevant Search Results

**Problem**: Web search returns no results or irrelevant results.

**Possible causes**:
- Overly specific query
- Search provider limitations
- Network issues

**Solutions**:
1. Use more general search terms
2. Try a different search provider (e.g., switch from Tavily to Perplexity)
3. Check network connectivity
4. Verify the search provider's API status

**Example of improving search query**:

Instead of:
```json
{
  "query": "XYZ123 specific error in System ABC version 2.4.5",
  "provider": "tavily"
}
```

Try:
```json
{
  "query": "XYZ123 error System ABC",
  "provider": "perplexity"
}
```

## Form Automation Issues

### Form Submission Failures

**Problem**: Form automation fails to submit forms successfully.

**Possible causes**:
- Website uses CAPTCHA or anti-bot measures
- Form fields are incorrectly identified
- JavaScript-heavy form implementation
- Form validation requirements

**Solutions**:
1. Check if the website uses CAPTCHA (the platform cannot bypass these)
2. Verify field names match the actual form field names on the website
3. Add required fields that might be missing in your request
4. Try using the form's actual HTML field names instead of simplified keys

**Example of improved form submission**:
```json
{
  "id": "request-456",
  "name": "form_automation",
  "parameters": {
    "url": "https://example.com/contact",
    "fields": {
      "contact[name]": "John Doe",
      "contact[email]": "john@example.com",
      "contact[subject]": "Inquiry",
      "contact[message]": "Hello world",
      "contact[terms]": "1"
    },
    "submit": true,
    "wait_for_navigation": true
  }
}
```

## Vector Storage Issues

### Semantic Search Returning Unexpected Results

**Problem**: Vector storage search returns unexpected or irrelevant results.

**Possible causes**:
- Query is too ambiguous
- Not enough documents in the collection
- Issues with embedding quality

**Solutions**:
1. Make search queries more specific
2. Add more relevant documents to your collection
3. Try adjusting the similarity threshold
4. Use different embedding models for better results

**Example of improved vector search**:
```json
{
  "id": "request-789",
  "name": "vector_storage",
  "parameters": {
    "operation": "search",
    "collection": "documentation",
    "query": "How to implement authentication with JWT tokens in Node.js",
    "limit": 5,
    "similarity_threshold": 0.75,
    "embedding_model": "text-embedding-3-large"
  }
}
```

## Data Scraping Issues

### No Data Returned from Scraping

**Problem**: Data scraping returns empty results or fails.

**Possible causes**:
- Incorrect CSS selectors
- Website structure has changed
- Website blocks scraping
- Dynamic content loaded with JavaScript

**Solutions**:
1. Verify CSS selectors using browser developer tools
2. Check if the website has changed its structure
3. Use more general CSS selectors that are less likely to change
4. Enable JavaScript rendering for dynamically loaded content

**Example of improved scraping request**:
```json
{
  "id": "request-101",
  "name": "data_scraper",
  "parameters": {
    "url": "https://example.com/products",
    "selectors": {
      "title": ".product .title, .product h2, .item-title",
      "price": ".product .price, .price-tag, [data-price]",
      "description": ".product .description, .product-desc, .item-description"
    },
    "format": "json",
    "render_javascript": true,
    "wait_for_selector": ".product",
    "timeout": 10000
  }
}
```

## Connection Issues

### API Timeout or Connection Errors

**Problem**: Requests time out or fail with connection errors.

**Possible causes**:
- Network connectivity issues
- Server under high load
- Operation takes too long to complete

**Solutions**:
1. Check your network connection
2. Increase request timeout in your client
3. For long operations, consider breaking them into smaller chunks
4. Retry failed requests with exponential backoff

**Example of implementing timeouts (JavaScript)**:
```javascript
const mcpRequest = async (endpoint, data, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(`https://api.mcp-platform.com/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key-here'
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
};
```

## Still Having Issues?

If you've tried the solutions in this guide and are still experiencing problems, please:

1. Check our [community forum](https://community.mcp-platform.com) for similar issues and solutions
2. Collect detailed error information (response codes, error messages, request payloads)
3. Contact our support team with this information

For urgent issues or questions about enterprise plans, please email support@mcp-platform.com or use the support chat on our website.
