# Getting Started with MCP Integration Platform

## Introduction

The MCP Integration Platform provides a standardized interface for AI applications to leverage web search, form automation, vector storage, and data scraping capabilities. This guide will help you get started with using the platform quickly.

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js v18+** installed on your system
- A **PostgreSQL database** for production deployments
- Basic knowledge of **RESTful APIs**
- An **API key** (obtained through registration)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mcp-integration-platform.git
cd mcp-integration-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file to include:

```
DATABASE_URL=postgresql://user:password@localhost:5432/mcp_platform
API_KEY_SECRET=your-secret-key-for-encryption
PORT=3000
```

### 4. Start the Server

```bash
npm run dev
```

The API should now be running at `http://localhost:3000`.

## Your First API Call

Let's make a simple web search using the API:

### 1. Get an API Key

Register for an account on the platform and generate an API key from the Settings page.

### 2. Make a Web Search Request

```bash
curl -X POST "http://localhost:3000/api/mcp" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "id": "request-123",
    "name": "web_search",
    "parameters": {
      "query": "Latest developments in AI",
      "provider": "tavily",
      "max_results": 3
    }
  }'
```

### 3. Parse the Response

You'll receive a JSON response with search results, which should look something like this:

```json
{
  "id": "request-123",
  "status": "success",
  "result": {
    "search_results": [
      {
        "title": "Latest AI Developments in 2025",
        "url": "https://example.com/ai-news-2025",
        "snippet": "The latest developments in AI technology include advancements in..."
      },
      {
        "title": "AI Research Breakthroughs",
        "url": "https://example.com/ai-research",
        "snippet": "Recent research has led to significant breakthroughs in..."
      },
      {
        "title": "The Future of Artificial Intelligence",
        "url": "https://example.com/future-ai",
        "snippet": "Experts predict the following trends in AI development..."
      }
    ]
  }
}
```

## Next Steps

- Explore the [API Documentation](/api-docs.yaml) for more endpoints and features
- Check out the [Cline Integration Guide](/cline-integration) for VS Code integration
- Try out other features like Form Automation, Vector Storage, and Data Scraping

## Troubleshooting

### Common Issues

#### Authentication Errors

If you receive a `401 Unauthorized` response, check that:
- Your API key is correct
- You're including it in the `X-API-Key` header

#### Rate Limiting

If you receive a `429 Too Many Requests` response, you've exceeded the rate limits:
- Global limit: 100 requests per minute
- Tool-specific limit: 20 requests per minute per tool

Wait a minute before trying again or optimize your request patterns.

## Getting Help

If you encounter issues not covered in this guide, please:

1. Check the [FAQ](/docs/faq.md) for common questions
2. Review the [Troubleshooting Guide](/docs/troubleshooting.md) for solutions
3. Contact the maintainers of this project for additional support
