import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ClineIntegration() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cline Integration Guide</h1>
      
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