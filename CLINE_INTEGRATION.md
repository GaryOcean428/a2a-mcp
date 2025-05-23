# Connecting Cline VSCode Extension to the MCP Integration Platform

This document explains how to connect [Cline VSCode Extension](https://docs.cline.bot/) to your MCP Integration Platform, enabling you to use capabilities like web search, form automation, vector storage, and data scraping directly from your IDE.

## Finding Your Replit URL

The MCP Integration Platform is hosted on Replit, and you'll need to use your specific Replit URL to connect the Cline extension to your deployed platform.

1. **Get the Replit URL**: This is the URL of your running Replit application shown in your browser's address bar when viewing the MCP Integration Platform.
2. **Replace placeholder with your URL**: In the configuration examples below, replace `[YOUR-REPLIT-URL]` with your actual Replit URL (without the brackets).

For example, if your Replit URL is `https://mcp-integration-platform.username.repl.co`, then your MCP server URL in the configuration should be:
```
https://mcp-integration-platform.username.repl.co/api/mcp
```

## Prerequisites

1. You must have registered an account on the MCP Integration Platform
2. You must have generated an API key from the API Keys section
3. The MCP Integration Platform server must be running and accessible

## Configuring MCP

MCP (Model Context Protocol) enables LLMs to access custom tools and services. 

### Configure Cline with your MCP Integration Platform

Add the following configuration to your `~/.cline/config.json` file:

```json
{
  "mcpServers": {
    "mcp-platform": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/mcp-platform-client",
        "--url",
        "https://[YOUR-REPLIT-URL]",
        "--apiKey",
        "your-api-key-here"
      ],
      "autoApprove": [
        "web_search",
        "form_automation", 
        "vector_storage", 
        "data_scraper",
        "status",
        "sandbox"
      ],
      "disabled": false,
      "timeout": 60,
      "transportType": "websocket"
    }
  }
}
```

### Alternative Configuration Methods

#### Using NPX Command Only (No API Key)

```json
{
  "mcpServers": {
    "mcp-platform": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/mcp-platform-client",
        "--url",
        "https://[YOUR-REPLIT-URL]"
      ],
      "autoApprove": ["web_search", "vector_storage", "form_automation", "data_scraper", "status", "sandbox"]
    }
  }
}
```

#### Using with Other MCP Servers

You can connect to other popular MCP services alongside the MCP Integration Platform:

```json
{
  "mcpServers": {
    "mcp-platform": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/mcp-platform-client",
        "--url",
        "https://[YOUR-REPLIT-URL]",
        "--apiKey",
        "your-api-key-here"
      ],
      "autoApprove": ["web_search", "form_automation", "vector_storage", "data_scraper", "status", "sandbox"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/files"],
      "autoApprove": ["list_directory", "read_file", "search_files"]
    },
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "autoApprove": ["read_graph", "create_entities", "search_nodes"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>"
      },
      "autoApprove": ["search_repositories", "get_file_contents", "create_issue"]
    }
  }
}
```

3. Save the configuration

### 3. Test the Connection

1. Use Cline's `/mcp` command to test the connection to the MCP Integration Platform
2. Try a simple web search query to test if it's working correctly:
   ```
   /mcp web_search
   ```

## Available Tools

The MCP Integration Platform provides the following tools:

### 1. Web Search (`web_search`)

Search the web for information with multiple provider options.

Example:
```
/mcp web_search --query "What is Model Context Protocol" --provider tavily --max_results 5
```

Parameters:
- `query`: Search query (string, required)
- `provider`: Search provider to use (string, optional, default: "tavily")
- `max_results`: Maximum number of results to return (number, optional, default: 5)

### 2. Vector Storage (`vector_storage`)

Connect to vector databases for semantic search and retrieval. The platform currently uses an in-memory vector storage system for development purposes, which means stored data will not persist between server restarts.

#### Vector Storage Operations:

**Store Operation**:
Store data in a vector collection (creates embeddings automatically).

Example:
```
/mcp vector_storage --operation store --collection my_docs --query "This is some content to vectorize" --data {"title": "My Document", "author": "John Doe"}
```

**Search Operation**:
Search for vectors in a collection using semantic similarity.

Example:
```
/mcp vector_storage --operation search --collection my_docs --query "Find similar content" --limit 5
```

**Retrieve Operation**:
Retrieve specific documents by their IDs.

Example:
```
/mcp vector_storage --operation retrieve --collection my_docs --ids ["doc1", "doc2"]
```

**Delete Operation**:
Delete documents from a collection by their IDs.

Example:
```
/mcp vector_storage --operation delete --collection my_docs --ids ["doc1"]
```

Parameters:
- `operation`: Operation to perform (string, required, one of: "search", "retrieve", "store", "delete")
- `collection`: Vector collection to operate on (string, required)
- `query`: Query text for semantic search or text to vectorize (string, optional)
- `filters`: Metadata filters for search (object, optional)
- `limit`: Maximum number of results (number, optional, default: 10)
- `data`: Data to store (object, optional, for store operations)
- `ids`: Document IDs (array of strings, optional, for retrieve/delete operations)

### 3. Form Automation (`form_automation`)

Fill and submit web forms programmatically with validation.

Example:
```
/mcp form_automation --url "https://example.com/form" --fields {"username": "testuser", "password": "testpass"} --submit true
```

Parameters:
- `url`: Form URL (string, required)
- `fields`: Form fields to fill (object, required)
- `submit`: Whether to submit the form (boolean, optional, default: true)
- `wait_for_navigation`: Whether to wait for navigation after submission (boolean, optional, default: true)

### 4. Data Scraping (`data_scraper`)

Extract structured data from websites with configurable policies.

Example:
```
/mcp data_scraper --url "https://example.com/products" --selectors {"title": ".product-title", "price": ".product-price"}
```

Parameters:
- `url`: URL to scrape (string, required)
- `selectors`: Named CSS selectors to extract data (object, optional)
- `format`: Output format (string, optional, one of: "json", "csv", "text", default: "json")
- `pagination`: Pagination configuration (object, optional)
- `javascript`: Whether to execute JavaScript on the page (boolean, optional, default: true)

## Using Vector Storage for Documentation Management

The Vector Storage tool can be particularly useful for storing and retrieving documentation and code snippets within Cline. Here's a practical workflow for using this feature:

### Storing Documentation

1. Store documentation with metadata:
   ```
   /mcp vector_storage --operation store --collection code_docs --query "The useEffect hook runs after every completed render, but you can choose to fire it only when certain values have changed." --data {"title": "React useEffect Hook", "category": "React", "type": "hook"}
   ```

2. Store code snippets with metadata:
   ```
   /mcp vector_storage --operation store --collection code_snippets --query "function Counter() { const [count, setCount] = useState(0); useEffect(() => { document.title = `You clicked ${count} times`; }); return <div>You clicked {count} times<button onClick={() => setCount(count + 1)}>Click me</button></div>; }" --data {"title": "React Counter with useEffect", "language": "javascript", "framework": "react"}
   ```

### Searching Documentation

1. Semantic search for relevant documentation:
   ```
   /mcp vector_storage --operation search --collection code_docs --query "How does React handle side effects?" --limit 3
   ```

2. Search with filters to narrow down results:
   ```
   /mcp vector_storage --operation search --collection code_snippets --query "state management examples" --filters {"framework": "react"} --limit 5
   ```

### Tips for Documentation Management

1. **Consistent Collections**: Organize your documentation into consistent collections (e.g., `code_docs`, `code_snippets`, `api_docs`)
2. **Rich Metadata**: Add detailed metadata to make filtering more effective
3. **Descriptive Queries**: When storing content, make the `query` field as descriptive as possible for better semantic search results
4. **Regular Updates**: Update your documentation by storing new versions with the same ID

## Troubleshooting

1. **Authentication Error**: Make sure your API key is correctly set in the Cline settings
2. **Connection Error**: Ensure the MCP Integration Platform server is running and accessible
3. **Tool Error**: Check that you're using the correct tool name and parameters

For further assistance, please refer to the [Cline documentation](https://docs.cline.bot/mcp-servers/connecting-to-a-remote-server).