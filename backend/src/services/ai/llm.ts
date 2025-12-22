// llm.ts
import { ChatGroq } from "@langchain/groq";
import "dotenv/config";

export const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.3,
});
