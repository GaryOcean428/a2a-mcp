import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";

export default function ClineIntegration() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Sample MCP server configuration that matches the user's format
  const sampleConfig = `{
  "mcpServers": {
    "mcp-platform": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/mcp-platform-client",
        "--url",
        "https://your-mcp-platform-deployment.replit.app"
      ],
      "autoApprove": [
        "web_search",
        "form_automation",
        "vector_storage",
        "data_scraper",
        "status",
        "sandbox"
      ]
    }
  }
}`;

  // Documentation content with updated format
  const markdownContent = `# Cline Integration
  
## Quick Start

To connect with this MCP Integration Platform using Cline, add the following configuration to your Cline config (typically at \`~/.cline/config.json\`):

\`\`\`json
${sampleConfig}
\`\`\`

Replace \`https://your-mcp-platform-deployment.replit.app\` with the actual URL of your deployed instance.

## Available Tools

This platform provides the following MCP tools:

1. **Web Search**: Search the web for information with multiple provider options
   - Supports OpenAI, Tavily, and Perplexity integrations
   - Example: \`web_search({ query: "latest developments in AI" })\`

2. **Form Automation**: Fill and submit web forms with validation
   - Supports form field detection and submission
   - Example: \`form_automation({ url: "https://example.com/form", fields: { name: "John", email: "john@example.com" } })\`

3. **Vector Storage**: Connect to vector databases for semantic search
   - Supports Pinecone and Weaviate integrations
   - Example: \`vector_storage({ operation: "search", query: "machine learning", collection: "articles" })\`

4. **Data Scraper**: Extract structured data from websites
   - Supports sophisticated scraping policies
   - Example: \`data_scraper({ url: "https://example.com/products", selectors: { title: ".product-title", price: ".product-price" } })\`

5. **Status**: Check platform and tool health
   - Example: \`status({})\`

6. **Sandbox**: Execute code in a secure environment
   - Supports JavaScript, Python, and more
   - Example: \`sandbox({ language: "javascript", code: "console.log('Hello, world!');" })\`

## Authentication

API keys are required to access most functionalities. You can generate an API key in the Settings page after registering and logging in.

## Transport Types

The platform supports both WebSocket and HTTP transport mechanisms:

- **WebSocket**: Primary connection method for real-time tools (recommended)
- **HTTP**: Alternative for environments where WebSockets aren't available

## Configuration Options

The MCP server configuration supports several options:

\`\`\`json
{
  "mcpServers": {
    "mcp-platform": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/mcp-platform-client",
        "--url",
        "https://your-deployment-url.replit.app",
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
\`\`\`

## Development Notes

For local development, you can use:

\`\`\`json
{
  "mcpServers": {
    "mcp-platform-local": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/mcp-platform-client",
        "--url",
        "http://localhost:5000"
      ],
      "autoApprove": [
        "web_search",
        "form_automation",
        "vector_storage",
        "data_scraper",
        "status",
        "sandbox"
      ]
    }
  }
}
\`\`\`

## Troubleshooting

If you encounter connection issues:

1. Verify your API key is valid
2. Check that the deployment URL is correct
3. Ensure the tools you're trying to use are in the \`autoApprove\` list
4. Verify network connectivity to the MCP platform server
`;

  useEffect(() => {
    // Simulate loading the content
    setTimeout(() => {
      setContent(markdownContent);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cline Integration Guide</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <Card className="p-6 mb-8 border-indigo-200 bg-gradient-to-r from-indigo-50 to-white shadow-sm">
            <h2 className="text-xl font-semibold mb-2 text-indigo-700">Quick Configuration</h2>
            <p className="mb-4 text-gray-700">
              Connect to this platform from Cline by adding this configuration to your <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">~/.cline/config.json</code> file:
            </p>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <pre>{sampleConfig}</pre>
            </div>
          </Card>
          
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </>
      )}
    </div>
  );
}