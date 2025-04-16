# Connecting Cline VSCode Extension to the MCP Integration Platform

This document explains how to connect [Cline VSCode Extension](https://docs.cline.bot/) to your MCP Integration Platform, enabling you to use capabilities like web search, form automation, vector storage, and data scraping directly from your IDE.

## Prerequisites

1. You must have registered an account on the MCP Integration Platform
2. You must have generated an API key from the API Keys section
3. The MCP Integration Platform server must be running and accessible

## Connection Steps

### 1. Install Cline VSCode Extension

Install the Cline extension from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=Cline.cline).

### 2. Configure Cline to use your MCP Integration Platform

1. Open the Cline settings in VSCode:
   - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
   - Type "Cline: Settings" and select it

2. In the Cline settings, add a new MCP server with the following configuration:
   - **Name**: MCP Integration Platform (or any name you prefer)
   - **URL**: `http://your-server-url:5000/api/mcp` (replace with your actual server URL)
   - **Transport**: HTTP
   - **API Key**: Paste your API key generated from the platform

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