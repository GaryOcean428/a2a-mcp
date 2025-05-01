# Data Scraping Feature Guide

## Overview

The Data Scraping feature of the MCP Integration Platform allows applications to extract structured data from websites using CSS selectors. This functionality enables use cases such as competitive monitoring, content aggregation, price tracking, and automated data collection from web sources.

## Basic Usage

To use the data scraping feature, send a POST request to `/api/mcp` with the following payload structure:

```json
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

### Required Parameters

- `url` (string): The URL of the webpage to scrape
- `selectors` (object): Key-value pairs of field names and their CSS selectors

### Optional Parameters

- `format` (string): Output format, either `"json"` or `"csv"` (default: "json")
- `render_javascript` (boolean): Whether to render JavaScript on the page before scraping (default: false)
- `wait_for_selector` (string): Wait for a specific element to appear before scraping
- `pagination` (object): Configuration for handling paginated content
- `timeout` (number): Maximum time in milliseconds to wait for page operations (default: 30000)
- `user_agent` (string): Custom user agent string to use for the request

## Response Format

Successful data scraping requests return a response with the following structure:

```json
{
  "id": "request-101",
  "status": "success",
  "result": {
    "data": [
      {
        "title": "Product One",
        "price": "$19.99",
        "description": "This is the first product description."
      },
      {
        "title": "Product Two",
        "price": "$29.99",
        "description": "This is the second product description."
      }
      // Additional items...
    ],
    "metadata": {
      "url": "https://example.com/products",
      "timestamp": "2025-05-01T12:34:56Z",
      "item_count": 2
    }
  }
}
```

## Advanced Usage

### Handling JavaScript-Rendered Content

Many modern websites load content dynamically using JavaScript. To scrape such sites, enable JavaScript rendering:

```json
{
  "id": "js-example",
  "name": "data_scraper",
  "parameters": {
    "url": "https://example.com/dynamic-content",
    "selectors": {
      "title": ".dynamic-title",
      "content": ".dynamic-content"
    },
    "render_javascript": true,
    "wait_for_selector": ".content-loaded",
    "timeout": 15000
  }
}
```

### Scraping Paginated Content

To scrape data across multiple pages, use the pagination configuration:

```json
{
  "id": "pagination-example",
  "name": "data_scraper",
  "parameters": {
    "url": "https://example.com/products?page=1",
    "selectors": {
      "title": ".product-title",
      "price": ".product-price"
    },
    "pagination": {
      "next_button": ".pagination a.next",
      "max_pages": 5
    }
  }
}
```

### Advanced Selector Techniques

#### Multiple Selector Fallbacks

You can provide multiple selectors for each field as fallbacks:

```json
{
  "parameters": {
    "selectors": {
      "price": [".product-price", ".price", "[data-price]"],
      "title": [".product-title", ".title", "h2"]
    }
  }
}
```

#### Attribute Selection

Extract specific attributes from elements:

```json
{
  "parameters": {
    "selectors": {
      "image_url": {
        "selector": ".product-image",
        "attribute": "src"
      },
      "product_id": {
        "selector": ".product",
        "attribute": "data-product-id"
      }
    }
  }
}
```

#### Text Content Transformation

Apply simple transformations to extracted text:

```json
{
  "parameters": {
    "selectors": {
      "price": {
        "selector": ".product-price",
        "transform": "number" // Extracts numeric value from text
      },
      "title": {
        "selector": ".product-title",
        "transform": "trim" // Removes whitespace
      }
    }
  }
}
```

Supported transforms: `"trim"`, `"lowercase"`, `"uppercase"`, `"number"`, `"boolean"`, `"date"`

### Data Extraction Strategies

#### List Items

Extract data from a list of similar items:

```json
{
  "parameters": {
    "url": "https://example.com/products",
    "list_selector": ".product-list .product",
    "item_selectors": {
      "title": ".title",
      "price": ".price",
      "rating": ".rating"
    }
  }
}
```

This extracts data from each item matching `.product-list .product`, applying the item selectors relative to each item.

#### Nested Data

Extract hierarchical data structures:

```json
{
  "parameters": {
    "url": "https://example.com/products",
    "selectors": {
      "product": {
        "selector": ".product",
        "multiple": true,
        "fields": {
          "title": ".title",
          "price": ".price",
          "specs": {
            "selector": ".specification",
            "multiple": true,
            "fields": {
              "name": ".spec-name",
              "value": ".spec-value"
            }
          }
        }
      }
    }
  }
}
```

## Best Practices

### Ethical and Legal Considerations

1. **Respect Terms of Service**: Only scrape websites where it's allowed by the terms of service
2. **Rate Limiting**: Implement appropriate rate limiting to avoid overwhelming the target website
3. **Respect `robots.txt`**: Honor robots exclusion standards
4. **Data Privacy**: Be cautious when scraping and storing personal data

### Robust Selector Design

1. **Use Specific Selectors**: Target elements as specifically as possible
2. **Include Fallbacks**: Provide multiple selector options for important data
3. **Test Thoroughly**: Verify selectors work across different scenarios

### Error Handling

Common errors you might encounter:

- `PAGE_LOAD_ERROR`: The page could not be loaded
- `SELECTOR_NOT_FOUND`: One or more specified selectors could not be found
- `TIMEOUT`: The operation timed out
- `ACCESS_DENIED`: The website blocked access to the scraper

Implement robust error handling to manage these scenarios gracefully.

## Use Cases

### Price Monitoring

Track product prices across e-commerce websites for competitive analysis or price alerts.

```javascript
async function monitorProductPrices(productUrls) {
  const results = [];
  
  for (const url of productUrls) {
    const response = await fetch('https://api.mcp-platform.com/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'your-api-key-here'
      },
      body: JSON.stringify({
        id: generateUniqueId(),
        name: 'data_scraper',
        parameters: {
          url: url,
          selectors: {
            product_name: [".product-title", ".name", "h1"],
            price: {
              selector: [".product-price", ".price", "[data-price]"],
              transform: "number"
            },
            availability: ".stock-status",
            rating: ".rating-value"
          },
          render_javascript: true
        }
      })
    });
    
    const data = await response.json();
    if (data.status === 'success') {
      results.push(data.result.data[0]);
    }
  }
  
  return results;
}
```

### Content Aggregation

Aggregate content from multiple sources into a unified format for analysis or presentation.

### Research Data Collection

Collect data for research purposes from publicly available web sources.

## Limitations

- **Anti-Scraping Measures**: Cannot bypass sophisticated anti-scraping technologies
- **Dynamic Content**: May have difficulty with complex JavaScript applications
- **Rate Limiting**: Subject to platform rate limits and target website constraints
- **Content Changes**: Selectors may break if website structure changes

## FAQ

### Can the data scraper bypass login pages?

No, the platform does not support automated login to protected areas of websites. Only publicly accessible content can be scraped.

### How often can I run scraping jobs?

Scraping requests count toward your API rate limits. The platform enforces additional rate limiting for scraping to prevent abuse.

### What happens if a website changes its structure?

If the website changes its structure, your selectors may stop working. Regular monitoring and maintenance of your scraping configurations is recommended.

### Can I scrape data from websites that load content dynamically?

Yes, with `render_javascript: true`, the platform can handle websites that load content using JavaScript. However, very complex single-page applications may still present challenges.

### Does the platform support proxies for scraping?

The platform handles proxy management internally to improve reliability and avoid IP blocking. You don't need to configure proxies manually.

## Further Resources

- [API Reference Documentation](/api-docs.yaml)
- [Rate Limiting Details](/docs/rate-limiting.md)
- [CSS Selector Guide](/docs/css-selectors.md)
- [Web Scraping Ethics](/docs/scraping-ethics.md)
- [Error Code Reference](/docs/error-codes.md)
