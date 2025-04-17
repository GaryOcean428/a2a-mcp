import { OpenAI } from 'openai';

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  try {
    // Try with web search
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a web search assistant. Use the web search tool to find information."
        },
        {
          role: "user",
          content: "Who won the most recent Super Bowl?"
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "web_search",
            description: "Search the web for information",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The search query to use"
                }
              },
              required: ["query"]
            }
          }
        }
      ]
    });
    
    console.log("Web Search Response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
