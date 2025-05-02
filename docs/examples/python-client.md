# Using MCP Integration Platform with Python

This guide demonstrates how to use the MCP Integration Platform API with Python.

## Prerequisites

- Python 3.7 or higher
- `requests` library (`pip install requests`)

## Basic Usage

Here's a simple Python client for the MCP Integration Platform:

```python
import requests
import json
import uuid

class MCPClient:
    def __init__(self, api_key, base_url="https://api.mcp-platform.com"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }
    
    def _generate_request_id(self):
        return str(uuid.uuid4())
    
    def web_search(self, query, provider="tavily", max_results=5, include_domains=None, exclude_domains=None):
        endpoint = f"{self.base_url}/api/mcp"
        
        payload = {
            "id": self._generate_request_id(),
            "name": "web_search",
            "parameters": {
                "query": query,
                "provider": provider,
                "max_results": max_results
            }
        }
        
        if include_domains:
            payload["parameters"]["include_domains"] = include_domains
        
        if exclude_domains:
            payload["parameters"]["exclude_domains"] = exclude_domains
        
        response = requests.post(endpoint, headers=self.headers, json=payload)
        return response.json()
    
    def form_automation(self, url, fields, submit=True, wait_for_navigation=True):
        endpoint = f"{self.base_url}/api/mcp"
        
        payload = {
            "id": self._generate_request_id(),
            "name": "form_automation",
            "parameters": {
                "url": url,
                "fields": fields,
                "submit": submit,
                "wait_for_navigation": wait_for_navigation
            }
        }
        
        response = requests.post(endpoint, headers=self.headers, json=payload)
        return response.json()
    
    def vector_storage_store(self, collection, documents):
        endpoint = f"{self.base_url}/api/mcp"
        
        payload = {
            "id": self._generate_request_id(),
            "name": "vector_storage",
            "parameters": {
                "operation": "store",
                "collection": collection,
                "documents": documents
            }
        }
        
        response = requests.post(endpoint, headers=self.headers, json=payload)
        return response.json()
    
    def vector_storage_search(self, collection, query, limit=5, filters=None):
        endpoint = f"{self.base_url}/api/mcp"
        
        payload = {
            "id": self._generate_request_id(),
            "name": "vector_storage",
            "parameters": {
                "operation": "search",
                "collection": collection,
                "query": query,
                "limit": limit
            }
        }
        
        if filters:
            payload["parameters"]["filters"] = filters
        
        response = requests.post(endpoint, headers=self.headers, json=payload)
        return response.json()
    
    def data_scraper(self, url, selectors, format="json", render_javascript=False):
        endpoint = f"{self.base_url}/api/mcp"
        
        payload = {
            "id": self._generate_request_id(),
            "name": "data_scraper",
            "parameters": {
                "url": url,
                "selectors": selectors,
                "format": format,
                "render_javascript": render_javascript
            }
        }
        
        response = requests.post(endpoint, headers=self.headers, json=payload)
        return response.json()
```

## Usage Examples

### Web Search Example

```python
from mcp_client import MCPClient

# Initialize the client with your API key
client = MCPClient(api_key="your-api-key-here")

# Perform a web search
results = client.web_search(
    query="Latest developments in quantum computing",
    provider="perplexity",
    max_results=3
)

# Print the results
if results["status"] == "success":
    for i, result in enumerate(results["result"]["search_results"]):
        print(f"Result {i+1}: {result['title']}")
        print(f"URL: {result['url']}")
        print(f"Snippet: {result['snippet']}")
        print("---")
else:
    print(f"Error: {results['error']['message']}")
```

### Vector Storage Example

```python
from mcp_client import MCPClient

# Initialize the client with your API key
client = MCPClient(api_key="your-api-key-here")

# Store documents
documents = [
    {
        "text": "Python is a programming language that lets you work quickly and integrate systems more effectively.",
        "metadata": {
            "title": "Python Overview",
            "category": "programming"
        }
    },
    {
        "text": "JavaScript is a lightweight, interpreted, or just-in-time compiled programming language with first-class functions.",
        "metadata": {
            "title": "JavaScript Overview",
            "category": "programming"
        }
    }
]

store_result = client.vector_storage_store(collection="knowledge_base", documents=documents)
print(f"Stored {store_result['result']['inserted_count']} documents")

# Search for documents
search_result = client.vector_storage_search(
    collection="knowledge_base",
    query="What is Python used for?",
    limit=1
)

if search_result["status"] == "success":
    for match in search_result["result"]["matches"]:
        print(f"Match (score: {match['score']}): {match['text']}")
else:
    print(f"Error: {search_result['error']['message']}")
```

### Data Scraping Example

```python
from mcp_client import MCPClient

# Initialize the client with your API key
client = MCPClient(api_key="your-api-key-here")

# Define selectors for product information
selectors = {
    "title": ".product-title",
    "price": ".product-price",
    "description": ".product-description"
}

# Scrape product data
result = client.data_scraper(
    url="https://example.com/products",
    selectors=selectors,
    render_javascript=True
)

# Print the scraped data
if result["status"] == "success":
    for item in result["result"]["data"]:
        print(f"Product: {item['title']}")
        print(f"Price: {item['price']}")
        print(f"Description: {item['description']}")
        print("---")
else:
    print(f"Error: {result['error']['message']}")
```

## Error Handling

Implement robust error handling with retries and exponential backoff:

```python
import time
import random

def retry_with_backoff(func, max_retries=5, initial_delay=1, max_delay=60):
    def wrapper(*args, **kwargs):
        retries = 0
        delay = initial_delay
        
        while retries < max_retries:
            try:
                result = func(*args, **kwargs)
                
                # Check for rate limiting error
                if result.get("status") == "error" and result.get("error", {}).get("code") == "RATE_LIMITED":
                    raise Exception("Rate limited")
                
                return result
            except Exception as e:
                retries += 1
                if retries >= max_retries:
                    raise
                
                # Calculate backoff delay with jitter
                sleep_time = min(max_delay, delay * (2 ** retries)) * (0.5 + random.random())
                print(f"Retrying after {sleep_time:.2f} seconds...")
                time.sleep(sleep_time)
    
    return wrapper

# Example usage
client = MCPClient(api_key="your-api-key-here")

# Apply retry decorator to a method
web_search_with_retry = retry_with_backoff(client.web_search)

# Use the retry-wrapped method
result = web_search_with_retry(query="Python programming best practices")
```

## Advanced Usage: Asynchronous Requests

For applications that need to make many API calls, you can use `aiohttp` for asynchronous requests:

```python
import aiohttp
import asyncio
import json
import uuid

class AsyncMCPClient:
    def __init__(self, api_key, base_url="https://api.mcp-platform.com"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Content-Type": "application/json",
            "X-API-Key": self.api_key
        }
    
    def _generate_request_id(self):
        return str(uuid.uuid4())
    
    async def web_search(self, query, provider="tavily", max_results=5):
        endpoint = f"{self.base_url}/api/mcp"
        
        payload = {
            "id": self._generate_request_id(),
            "name": "web_search",
            "parameters": {
                "query": query,
                "provider": provider,
                "max_results": max_results
            }
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(endpoint, headers=self.headers, json=payload) as response:
                return await response.json()

# Example usage
async def main():
    client = AsyncMCPClient(api_key="your-api-key-here")
    
    # Run multiple searches concurrently
    queries = [
        "Python web frameworks",
        "JavaScript frameworks",
        "Data science tools"
    ]
    
    tasks = [client.web_search(query) for query in queries]
    results = await asyncio.gather(*tasks)
    
    for i, result in enumerate(results):
        print(f"Query: {queries[i]}")
        if result["status"] == "success":
            print(f"Found {len(result['result']['search_results'])} results")
        else:
            print(f"Error: {result['error']['message']}")

# Run the async code
asyncio.run(main())
```

## Conclusion

This Python client provides a convenient way to interact with the MCP Integration Platform API. You can customize it further to fit your specific needs or integrate it into larger applications.

For more information, refer to the [API Reference Documentation](/api-docs.yaml) and the [Feature Documentation](../features/index.md).