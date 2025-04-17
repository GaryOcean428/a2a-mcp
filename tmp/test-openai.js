import { OpenAI } from 'openai';

async function main() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  
  // List models to see what's available
  try {
    const models = await openai.models.list();
    console.log("Available models:", models.data.map(m => m.id));
    
    // Now let's try a simple chat completion
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Hello, can you tell me about the web_search capability?"
        }
      ]
    });
    
    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
