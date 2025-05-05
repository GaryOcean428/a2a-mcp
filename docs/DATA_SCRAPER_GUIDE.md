# Data Scraper Tool Guide

## Overview

The Data Scraper tool enables extraction of structured data from web pages with advanced options for pagination, JavaScript execution, and flexible data transformation. This guide explains how to use the tool effectively, including all available parameters and best practices.

## Basic Usage

At its simplest, the Data Scraper tool requires a URL and one or more CSS selectors to extract content:

```json
{
  "id": "scrape-request-1",
  "name": "data_scraper",
  "parameters": {
    "url": "https://example.com/products",
    "selectors": [".product-card", ".product-title", ".product-price"]
  }
}
```

This will extract all elements matching the provided CSS selectors from the specified URL.

## Advanced Parameters

### Complete Parameter Reference

| Parameter | Type | Description | Default |
|-----------|------|-------------|--------|
| `url` | string | URL of the page to scrape | *Required* |
| `selectors` | string[] | CSS selectors for elements to scrape | *Required* |
| `waitForSelector` | string | CSS selector to wait for before scraping | `null` |
| `transform` | string | Transform the scraped data format (`table`, `list`, `json`) | `json` |
| `javascript` | string | JavaScript to execute on the page before scraping | `null` |
| `pagination` | object | Configuration for paginated scraping | `{ enabled: false }` |
| `cookies` | object[] | Cookies to set before scraping | `[]` |
| `headers` | object | HTTP headers to send with the request | `{}` |
| `proxy` | string | Proxy server to use for the request | `null` |
| `timeout` | number | Timeout in milliseconds for the scraping operation | `30000` |

### Waiting for Dynamic Content

For pages that load content dynamically, use the `waitForSelector` parameter to ensure the content is available before scraping:

```json
{
  "parameters": {
    "url": "https://example.com/dynamic-page",
    "selectors": [".dynamic-content", ".item-title"],
    "waitForSelector": ".page-loaded-indicator",
    "timeout": 15000
  }
}
```

This will wait up to 15 seconds for an element matching `.page-loaded-indicator` to appear before proceeding with the scrape.

### Executing JavaScript

You can execute custom JavaScript on the page before scraping to manipulate the DOM or interact with elements:

```json
{
  "parameters": {
    "url": "https://example.com/load-more",
    "selectors": [".item", ".item-title", ".item-price"],
    "javascript": "document.querySelectorAll('.load-more-button').forEach(btn => btn.click()); await new Promise(r => setTimeout(r, 2000));"
  }
}
```

This will click all elements with the class `.load-more-button` and wait 2 seconds before scraping.

### Pagination

The pagination parameter allows scraping across multiple pages:

```json
{
  "parameters": {
    "url": "https://example.com/products/page/1",
    "selectors": [".product", ".product-name", ".product-price"],
    "pagination": {
      "enabled": true,
      "nextSelector": ".pagination .next",
      "maxPages": 5,
      "delay": 1000
    }
  }
}
```

This configuration will:
1. Start scraping the initial URL
2. Find the next page button using the CSS selector `.pagination .next`
3. Click the next page button and wait 1 second
4. Scrape the new page
5. Repeat until either no next button is found or 5 pages have been scraped

### Cookies and Headers

Set cookies and custom headers for sites that require authentication or specific configurations:

```json
{
  "parameters": {
    "url": "https://example.com/members-area",
    "selectors": [".member-content", ".member-name"],
    "cookies": [
      {
        "name": "session_id",
        "value": "abc123",
        "domain": "example.com",
        "path": "/"
      },
      {
        "name": "user_prefs",
        "value": "theme=dark",
        "domain": "example.com"
      }
    ],
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Referer": "https://example.com/login"
    }
  }
}
```

### Using a Proxy

For websites that restrict access based on IP address or location, you can use a proxy:

```json
{
  "parameters": {
    "url": "https://example.com/geo-restricted",
    "selectors": [".content", ".title"],
    "proxy": "http://username:password@proxyserver.com:8080"
  }
}
```

## Data Transformation

The `transform` parameter allows you to format the scraped data in different ways:

### JSON Format (default)

```json
{
  "parameters": {
    "url": "https://example.com/products",
    "selectors": [".product", ".product-name", ".product-price"],
    "transform": "json"
  }
}
```

Response:

```json
{
  "id": "scrape-request-1",
  "results": {
    "data": [
      {
        "element": ".product",
        "children": [
          {
            "element": ".product-name",
            "text": "Product 1"
          },
          {
            "element": ".product-price",
            "text": "$19.99"
          }
        ]
      },
      {
        "element": ".product",
        "children": [
          {
            "element": ".product-name",
            "text": "Product 2"
          },
          {
            "element": ".product-price",
            "text": "$29.99"
          }
        ]
      }
    ],
    "pagesScraped": 1,
    "totalItems": 2
  }
}
```

### Table Format

```json
{
  "parameters": {
    "url": "https://example.com/products",
    "selectors": [".product", ".product-name", ".product-price", ".product-rating"],
    "transform": "table"
  }
}
```

Response:

```json
{
  "id": "scrape-request-1",
  "results": {
    "data": {
      "headers": ["product-name", "product-price", "product-rating"],
      "rows": [
        ["Product 1", "$19.99", "4.5/5"],
        ["Product 2", "$29.99", "3.8/5"]
      ]
    },
    "pagesScraped": 1,
    "totalItems": 2
  }
}
```

### List Format

```json
{
  "parameters": {
    "url": "https://example.com/products",
    "selectors": [".product", ".product-name", ".product-price"],
    "transform": "list"
  }
}
```

Response:

```json
{
  "id": "scrape-request-1",
  "results": {
    "data": [
      ["Product 1", "$19.99"],
      ["Product 2", "$29.99"]
    ],
    "pagesScraped": 1,
    "totalItems": 2
  }
}
```

## Common Selector Strategies

### Basic Selectors

- `"#id"` - Select element with id="id"
- `".class"` - Select elements with class="class"
- `"tag"` - Select all elements with the given tag name
- `"selector1, selector2"` - Select elements matching either selector

### Hierarchical Selectors

- `"parent > child"` - Select direct children of parent
- `"ancestor descendant"` - Select all descendants of ancestor
- `"prev + next"` - Select element immediately after prev
- `"prev ~ siblings"` - Select all siblings after prev

### Attribute Selectors

- `"[attr]"` - Select elements with attribute
- `"[attr=value]"` - Select elements with attribute equal to value
- `"[attr^=value]"` - Select elements with attribute starting with value
- `"[attr$=value]"` - Select elements with attribute ending with value
- `"[attr*=value]"` - Select elements with attribute containing value

### Pseudo-classes

- `":first-child"` - Select element that is the first child
- `":last-child"` - Select element that is the last child
- `":nth-child(n)"` - Select element that is the nth child
- `":not(selector)"` - Select elements that do not match selector

## Best Practices

### Efficiency and Courtesy

1. **Be respectful of websites** - Don't scrape at high frequency or overload servers
2. **Check for APIs first** - Many sites offer APIs that are better than scraping
3. **Respect robots.txt** - Check if scraping is allowed before proceeding
4. **Implement delays** - Use pagination delay to avoid overwhelming the server
5. **Use specific selectors** - More specific selectors are less likely to break

### Error Handling

Prepare for these common errors when scraping:

- **Network errors** - The target website may be unavailable
- **Selector not found** - Selectors may change if the website updates
- **Timeout errors** - Dynamic content may take too long to load
- **Anti-scraping measures** - Some sites actively block scraping

### Example: E-commerce Product List Scraping

```json
{
  "id": "product-list-scrape",
  "name": "data_scraper",
  "parameters": {
    "url": "https://example-store.com/products",
    "selectors": [
      ".product-grid-item",
      ".product-title a",
      ".product-price .current-price",
      ".product-rating .stars",
      ".product-availability"
    ],
    "waitForSelector": ".product-grid-loaded",
    "transform": "table",
    "pagination": {
      "enabled": true,
      "nextSelector": ".pagination__next",
      "maxPages": 3,
      "delay": 2000
    },
    "javascript": "window.scrollTo(0, document.body.scrollHeight); await new Promise(r => setTimeout(r, 1000));",
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
  }
}
```

This example:
1. Scrapes product information from an e-commerce site
2. Waits for the product grid to load
3. Scrolls to the bottom of the page to trigger any lazy-loading
4. Formats the data as a table
5. Navigates through 3 pages of products
6. Uses a realistic user-agent to avoid detection