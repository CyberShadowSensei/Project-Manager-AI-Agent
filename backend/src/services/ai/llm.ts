// llm.ts - Groq -> Groq(second key) fallback
import { ChatGroq } from "@langchain/groq";
import { CircuitBreaker } from "./CircuitBreaker.js";
import "dotenv/config";

const breaker = new CircuitBreaker(3, 30000); // 3 failures -> 30s cooldown

let groqPrimary: ChatGroq | null = null;
let groqFallback: ChatGroq | null = null;

try {
  if (process.env.GROQ_API_KEY) {
    groqPrimary = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.AI_MODEL || "llama-3.1-8b-instant",
      temperature: 0.3,
    });
  }
} catch {
  console.log("[LLM] Primary Groq unavailable at init");
}

try {
  if (process.env.GROQ_FALLBACK_KEY) {
    groqFallback = new ChatGroq({
      apiKey: process.env.GROQ_FALLBACK_KEY,
      model: process.env.AI_MODEL || "llama-3.1-8b-instant",
      temperature: 0.3,
    });
  }
} catch {
  console.log("[LLM] Fallback Groq unavailable at init");
}

/**
 * Groq(primary) -> Groq(fallback) -> Error
 * Wrapped in Circuit Breaker for resilience.
 */
export async function callLLM(messages: any[]) {
  return breaker.execute(async () => {
    // 1. Try primary Groq
    try {
      if (groqPrimary) {
        return await groqPrimary.invoke(messages);
      }
    } catch (err: any) {
      console.error("[LLM] Primary Groq failed:", err?.message || err);
    }

    // 2. Try fallback Groq
    if (groqFallback) {
      try {
        console.log("[LLM] Groq fallback key");
        return await groqFallback.invoke(messages);
      } catch (err: any) {
        console.error("[LLM] Fallback Groq failed:", err?.message || err);
        // Throwing error here triggers the Circuit Breaker failure count
        throw new Error("AI Temporarily Unavailable");
      }
    }

    // 3. Nothing worked
    throw new Error("AI Temporarily Unavailable");
  });
}

export const llm = groqPrimary || groqFallback;
