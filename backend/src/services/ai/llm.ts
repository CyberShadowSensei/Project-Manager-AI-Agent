// llm.ts - FIXED FALLBACK
import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import "dotenv/config";

let groqModel: any = null;
try {
  if (process.env.GROQ_API_KEY) {
    groqModel = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });
  }
} catch (e) {
  console.log("[LLM] Groq unavailable");
}

const hasOpenAI = !!process.env.OPENAI_API_KEY;
const openAIModel = hasOpenAI
  ? new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0.3,
    })
  : null;

/**
 * Invokes the LLM with fallback logic: Groq -> OpenAI -> Error
 */
export async function callLLM(messages: any[]) {
  try {
    if (groqModel) return await groqModel.invoke(messages);
  } catch (err: any) {
    console.error("[LLM] Groq failed:", err.message);
  }

  if (openAIModel) {
    try {
      console.log("[LLM] OpenAI fallback");
      return await openAIModel.invoke(messages);
    } catch (err: any) {
      console.error("[LLM] OpenAI fallback failed:", err.message);
      throw new Error("AI Temporarily Unavailable");
    }
  }

  throw new Error("AI Temporarily Unavailable");
}

// Keep the default export for backward compatibility if needed, 
// though we should switch to using callLLM
export const llm = groqModel || openAIModel;