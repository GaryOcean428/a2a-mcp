# MCP Integration Platform API Documentation

## Overview

The Model Context Protocol (MCP) Integration Platform provides a standardized interface for connecting diverse AI service capabilities with enhanced security and reliability. This document covers the API endpoints, WebSocket communication protocol, and available tools.

## REST API Endpoints

### Authentication

#### POST /api/auth/login

Authenticate a user and receive a session token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "confirmPassword": "string",
  "email": "string",
  "name": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "integer",
    "username": "string",
    "email": "string"
  }
}
```

#### GET /api/auth/logout

Log out the current user and invalidate their session.

**Response:**
```json
{
  "success": true
}
```

### System Status

#### GET /api/status

Get the current system status and available tools.

**Response:**
```json
{
  "version": "string",
  "uptime": "number",
  "transport": "string",
  "lastRequest": "string",
  "activeTools": [
    {
      "name": "string",
      "available": "boolean",
      "latency": "number",
      "lastUsed": "string"
    }
  ]
}
```

### API Keys

#### GET /api/keys

Get all API keys for the authenticated user.

**Response:**
```json
[
  {
    "id": "integer",
    "key": "string",
    "name": "string",
    "expiresAt": "string",
    "createdAt": "string",
    "lastUsedAt": "string"
  }
]
```

#### POST /api/keys

Create a new API key.

**Request Body:**
```json
{
  "name": "string",
  "expiresAt": "string" // Optional
}
```

**Response:**
```json
{
  "id": "integer",
  "key": "string",
  "name": "string",
  "expiresAt": "string",
  "createdAt": "string"
}
```

#### DELETE /api/keys/:id

Delete an API key.

**Response:**
```json
{
  "success": true
}
```

## WebSocket Communication

The MCP Integration Platform uses WebSockets for real-time communication with tools and services.

### Connection

Connect to the WebSocket server at:

```
ws://your-server-url/mcp-ws
```

or for secure connections:

```
wss://your-server-url/mcp-ws
```

### Authentication

After connecting, authenticate by sending:

```json
{
  "id": "auth",
  "token": "your-api-key-or-session-token"
}
```

Response:

```json
{
  "id": "auth",
  "success": true
}
```

With anonymous authentication:

```json
{
  "id": "auth",
  "token": "anonymous"
}
```

### Heartbeat

To keep the connection alive, send a ping every 15-30 seconds:

```json
{
  "messageType": "ping",
  "timestamp": 1622547645123
}
```

The server will respond with:

```json
{
  "messageType": "pong",
  "timestamp": 1622547645456
}
```

### MCP Tool Requests

To use an MCP tool, send a request in this format:

```json
{
  "id": "unique-request-id",
  "name": "tool-name",
  "parameters": {
    // Tool-specific parameters
  }
}
```

The server will respond with:

```json
{
  "id": "unique-request-id",
  "results": {
    // Tool-specific results
  }
}
```

Or in case of an error:

```json
{
  "id": "unique-request-id",
  "error": {
    "code": "error-code",
    "message": "error-message"
  }
}
```

## Available MCP Tools

### Web Search

Search the web for current information.

**Request:**
```json
{
  "id": "unique-request-id",
  "name": "web_search",
  "parameters": {
    "query": "search query",
    "numResults": 5,
    "includeLinks": true,
    "searchType": "web",
    "provider": "tavily",
    "tavilyOptions": {
      "searchDepth": "basic",
      "includeRawContent": false,
      "includeImages": false,
      "includeAnswer": true,
      "topic": "general"
    }
  }
}
```

**Response:**
```json
{
  "id": "unique-request-id",
  "results": {
    "items": [
      {
        "title": "Result Title",
        "snippet": "Result snippet text...",
        "url": "https://example.com/result",
        "publishedDate": "2023-04-15T14:32:20Z"
      }
    ],
    "answer": "Generated answer based on search results..."
  }
}
```

### Form Automation

Automate form filling and submission.

**Request:**
```json
{
  "id": "unique-request-id",
  "name": "form_automation",
  "parameters": {
    "url": "https://example.com/form",
    "fields": {
      "username": "user123",
      "email": "user@example.com",
      "message": "Hello world"
    },
    "submitSelector": "button[type=\"submit\"]",
    "waitForNavigation": true
  }
}
```

**Response:**
```json
{
  "id": "unique-request-id",
  "results": {
    "success": true,
    "finalUrl": "https://example.com/form-submitted",
    "screenshot": "base64-encoded-screenshot"
  }
}
```

### Vector Storage

Store and retrieve vector embeddings.

**Store Request:**
```json
{
  "id": "unique-request-id",
  "name": "vector_storage",
  "parameters": {
    "operation": "store",
    "collection": "my-embeddings",
    "ids": ["doc1", "doc2"],
    "embeddings": [
      [0.1, 0.2, 0.3, 0.4],
      [0.2, 0.3, 0.4, 0.5]
    ],
    "metadata": [
      {"text": "Document 1 content", "source": "example.com"},
      {"text": "Document 2 content", "source": "example.org"}
    ]
  }
}
```

**Retrieve Request:**
```json
{
  "id": "unique-request-id",
  "name": "vector_storage",
  "parameters": {
    "operation": "retrieve",
    "collection": "my-embeddings",
    "query": [0.15, 0.25, 0.35, 0.45],
    "topK": 3
  }
}
```

**Response:**
```json
{
  "id": "unique-request-id",
  "results": {
    "matches": [
      {
        "id": "doc1",
        "score": 0.95,
        "metadata": {"text": "Document 1 content", "source": "example.com"}
      },
      {
        "id": "doc2",
        "score": 0.87,
        "metadata": {"text": "Document 2 content", "source": "example.org"}
      }
    ]
  }
}
```

### Data Scraper

Scrape data from web pages.

**Request:**
```json
{
  "id": "unique-request-id",
  "name": "data_scraper",
  "parameters": {
    "url": "https://example.com/products",
    "selectors": [".product-card", ".product-title", ".product-price"],
    "waitForSelector": ".product-grid",
    "transform": "json",
    "javascript": "document.querySelectorAll('.load-more').forEach(btn => btn.click())",
    "pagination": {
      "enabled": true,
      "nextSelector": ".pagination .next",
      "maxPages": 3,
      "delay": 1000
    },
    "cookies": [
      {
        "name": "session",
        "value": "abc123",
        "domain": "example.com",
        "path": "/"
      }
    ],
    "headers": {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    },
    "timeout": 30000
  }
}
```

**Response:**
```json
{
  "id": "unique-request-id",
  "results": {
    "data": [
      {
        "title": "Product 1",
        "price": "$19.99",
        "url": "https://example.com/product1"
      },
      {
        "title": "Product 2",
        "price": "$29.99",
        "url": "https://example.com/product2"
      }
    ],
    "pagesScraped": 3,
    "totalItems": 24
  }
}
```

### Status

Get system or tool status.

**Request:**
```json
{
  "id": "unique-request-id",
  "name": "status",
  "parameters": {
    "toolName": "web_search"
  }
}
```

**Response:**
```json
{
  "id": "unique-request-id",
  "results": {
    "name": "web_search",
    "available": true,
    "latency": 245,
    "lastUsed": "2023-04-15T18:30:22Z",
    "providers": ["tavily", "perplexity", "openai"]
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `auth_required` | Authentication is required for this operation |
| `invalid_auth` | Invalid authentication credentials |
| `tool_not_found` | The requested tool was not found |
| `invalid_parameters` | The provided parameters are invalid |
| `tool_error` | An error occurred while executing the tool |
| `rate_limit_exceeded` | Rate limit has been exceeded |
| `permission_denied` | User does not have permission for this operation |
| `server_error` | Internal server error |
