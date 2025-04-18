import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Copy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ClineIntegration() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [configUrl, setConfigUrl] = useState<string>("");
  const { toast } = useToast();
  
  // Get the current hostname from window and ensure no double slashes
  useEffect(() => {
    try {
      const protocol = window.location.protocol;
      const host = window.location.host;
      // Create a clean URL without double slashes
      const baseUrl = `${protocol}//${host}`;
      // Normalize the path to ensure no double slashes
      const path = '/api/cline-config';
      setConfigUrl(baseUrl + path);
      
      // Log the URL for debugging purposes
      console.log(`Cline config URL set to: ${baseUrl + path}`);
    } catch (error) {
      console.error("Error setting config URL:", error);
      // Fallback to a simple URL construction
      setConfigUrl(window.location.origin + '/api/cline-config');
    }
  }, []);

  useEffect(() => {
    async function fetchClineIntegrationGuide() {
      try {
        const response = await fetch("/api/cline-integration");
        if (!response.ok) {
          throw new Error("Failed to load Cline integration guide");
        }
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error loading Cline integration guide:", error);
        toast({
          title: "Error",
          description: "Failed to load Cline integration guide. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchClineIntegrationGuide();
  }, [toast]);

  const copyConfigUrl = () => {
    navigator.clipboard.writeText(configUrl);
    toast({
      title: "URL Copied",
      description: "Configuration URL copied to clipboard",
    });
  };

  const downloadConfig = async () => {
    try {
      const response = await fetch("/api/cline-config");
      if (!response.ok) {
        throw new Error("Failed to fetch configuration");
      }
      const config = await response.json();
      const configBlob = new Blob([JSON.stringify(config, null, 2)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(configBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mcp-config.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading configuration:", error);
      toast({
        title: "Error",
        description: "Failed to download configuration file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cline Integration Guide</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Automated Configuration</CardTitle>
          <CardDescription>
            Use our automated configuration endpoint to quickly set up Cline with your current server URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            <strong>Configuration URL:</strong> 
            <code className="ml-2 p-1 bg-muted rounded">{configUrl}</code>
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            You can use this URL directly in the Cline VS Code extension to automatically configure the MCP Integration Platform connection.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={copyConfigUrl}>
            <Copy className="mr-2 h-4 w-4" />
            Copy URL
          </Button>
          <Button onClick={downloadConfig}>
            <Download className="mr-2 h-4 w-4" />
            Download Config
          </Button>
        </CardFooter>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="prose prose-lg max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}