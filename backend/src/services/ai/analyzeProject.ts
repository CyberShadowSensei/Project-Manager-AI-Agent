import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ANALYZE_PROMPT, DOC_TO_TASKS_PROMPT, CHAT_PROMPT, CHAT_SYSTEM_PROMPT } from "./prompts.js";
import { callLLM } from "./llm.js";

// ----- Types ----- 

export interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  priority?: "Low" | "Medium" | "High";
  dueDate?: string; // ISO date
  assignee?: string;
  dependencies?: string[];
}

export interface Project {
  id: string;
  name: string;
  context?: string;
}

export interface AnalyzeInput {
  project: Project;
  tasks: Task[];
}

export interface AIInsights {
  summary: string;
  riskLevel: "Low" | "Medium" | "High";
  deadlines: {
    overdue: { id: string; title: string }[];
    dueSoon: { id: string; title: string }[];
    onTrack: { id: string; title: string }[];
  };
  standupUpdate: string;
  suggestedActions: {
    taskId: string | null;
    action: string;
    reason: string;
  }[];
}

export interface ExtractedTask {
  id: number;
  title: string;
  description: string;
  status: "todo";
  dueDate: string | null;
  assignee: string | null;
  team: string | null;
  priority: "Low" | "Medium" | "High" | "Critical";
  dependencies: number[];
}

export interface ExtractedTasksResult {
  summary: string;
  tasks: ExtractedTask[];
}

// ----- Prompt templates ----- 

const analyzeTemplate = ChatPromptTemplate.fromTemplate(`
${ANALYZE_PROMPT}

Project name: {projectName}

Tasks:
{tasksBlock}
`);

const docToTasksTemplate = ChatPromptTemplate.fromMessages([
  ["system", DOC_TO_TASKS_PROMPT],
  ["human", "Document:\n{document}"]
]);

// ----- Helpers ----- 

function buildTasksBlock(tasks: Task[]): string {
  if (!tasks.length) return "No tasks found in the database.";
  
  const today = new Date();
  const criticalItems: string[] = [];
  const byStatus: Record<string, string[]> = {};
  
  tasks.forEach(t => {
      const status = t.status || 'unknown';
      const isOverdue = t.dueDate && new Date(t.dueDate) < today && status !== 'done';
      const isHighPriority = t.priority === 'High';
      
      const deps = t.dependencies?.length ? `(Blocked by: ${t.dependencies.join(", ")})` : "";
      const due = t.dueDate ? `[Due: ${t.dueDate.split('T')[0]}]` : "";
      const assignee = t.assignee ? `@{${t.assignee}}` : "Unassigned";
      const taskLine = `- ${t.title} ${assignee} ${due} ${deps}`;

      if (isOverdue || isHighPriority) {
          criticalItems.push(`${taskLine} ${isOverdue ? "!! OVERDUE !!" : ""} ${isHighPriority ? "[HIGH PRIORITY]" : ""}`);
      }

      if (!byStatus[status]) byStatus[status] = [];
      byStatus[status].push(taskLine);
  });

  let block = "";
  if (criticalItems.length > 0) {
      block += `### CRITICAL ALERTS (Prioritize these!)\n${criticalItems.join("\n")}\n\n`;
  }

  block += Object.entries(byStatus).map(([status, items]) => {
      return `STATUS: ${status.toUpperCase()}\n${items.join("\n")}`;
  }).join("\n\n");

  return block;
}

function isTaskArray(arr: any): arr is { id: string; title: string }[] {
  if (!Array.isArray(arr)) return false;
  return arr.every(
    (t) => t && typeof t.id === "string" && typeof t.title === "string"
  );
}

function isAIInsights(obj: any): obj is AIInsights {
  if (!obj || typeof obj !== "object") return false;

  if (typeof obj.summary !== "string") return false;
  if (!["Low", "Medium", "High"].includes(obj.riskLevel)) return false;

  const d = obj.deadlines;
  if (!d || typeof d !== "object") return false;
  if (!isTaskArray(d.overdue)) return false;
  if (!isTaskArray(d.dueSoon)) return false;
  if (!isTaskArray(d.onTrack)) return false;

  if (typeof obj.standupUpdate !== "string") return false;

  if (!Array.isArray(obj.suggestedActions)) return false;
  const okActions = obj.suggestedActions.every((a: any) => {
    return (
      a &&
      (a.taskId === null || typeof a.taskId === "string") &&
      typeof a.action === "string" &&
      typeof a.reason === "string"
    );
  });
  if (!okActions) return false;

  return true;
}

function isExtractedTask(obj: any): obj is ExtractedTask {
  if (!obj || typeof obj !== "object") return false;
  
  // Relaxed ID check
  if (typeof obj.id === "string") {
      obj.id = parseInt(obj.id, 10);
      if (isNaN(obj.id)) obj.id = Math.floor(Math.random() * 10000); // Fallback
  }
  if (typeof obj.id !== "number") return false;

  if (typeof obj.title !== "string") return false;
  // Allow missing description
  if (!obj.description) obj.description = "";
  
  // Loose check for status
  if (!obj.status) obj.status = "todo";
  
  // Ensure string fields
  if (typeof obj.dueDate !== "string") obj.dueDate = null;
  if (typeof obj.assignee !== "string") obj.assignee = null;
  if (typeof obj.team !== "string") obj.team = "Product";
  if (typeof obj.priority !== "string") obj.priority = "Medium";

  // Ensure dependencies is array of numbers
  if (!Array.isArray(obj.dependencies)) {
      obj.dependencies = [];
  } else {
      // Filter out non-numbers or convert strings
      obj.dependencies = obj.dependencies.map((d: any) => typeof d === 'string' ? parseInt(d, 10) : d).filter((d: any) => !isNaN(d));
  }
  return true;
}

function isExtractedTasksResult(obj: any): obj is ExtractedTasksResult {
  if (!obj || typeof obj !== "object") return false;
  // Allow missing summary
  if (!obj.summary) obj.summary = "No summary provided.";
  if (!Array.isArray(obj.tasks)) return false;
  return obj.tasks.every(isExtractedTask);
}

// cleaner for JSON object outputs
function cleanLLMText(textRaw: string): string {
  let cleaned = textRaw
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned;
}

// ----- Main Exported Functions ----- 

/**
 * Generates project status analysis and risk assessment
 */
export async function analyzeProject(
  input: AnalyzeInput
): Promise<AIInsights | { error: string; raw: string; cleaned: string }> {
  const { project, tasks } = input;

  const messages = await analyzeTemplate.formatMessages({
    projectName: project.name,
    tasksBlock: buildTasksBlock(tasks),
  });

  try {
    const res = await callLLM(messages);
    const textRaw =
      typeof (res as any).content === "string"
        ? (res as any).content
        : ((res as any).content as any[])
            .map((c: any) => c.text ?? "")
            .join("");

    const cleaned = cleanLLMText(textRaw);

    try {
      const parsed = JSON.parse(cleaned);

      if (!isAIInsights(parsed)) {
        console.error("AI Validation Failed. Parsed object:", parsed);
        return {
          error: "AI output validation failed",
          raw: textRaw,
          cleaned,
        };
      }

      return parsed as AIInsights;
    } catch (parseErr) {
      return {
        error: "Failed to parse AI JSON",
        raw: textRaw,
        cleaned,
      };
    }
  } catch (llmErr: any) {
    return {
      error: llmErr.message || "LLM invocation failed",
      raw: "",
      cleaned: "",
    };
  }
}

/**
 * Chat over project data with history buffer
 */
export async function chatOverProject(
  project: Project,
  tasks: Task[],
  question: string,
  history: { role: 'user' | 'assistant', content: string }[] = []
): Promise<string> {
  // Truncate context to avoid blowing up the LLM context window
  const safeContext = (project.context || "No additional documents uploaded.").slice(0, 25000);

  // 1. Format the System Prompt
  const systemPromptTemplate = ChatPromptTemplate.fromTemplate(CHAT_SYSTEM_PROMPT);
  const systemMessages = await systemPromptTemplate.formatMessages({
    projectName: project.name,
    context: safeContext,
    tasksBlock: buildTasksBlock(tasks),
  });

  // 2. Build History Messages
  const historyMessages = history.map(msg => {
      if (msg.role === 'user') return new HumanMessage(msg.content);
      return new AIMessage(msg.content);
  });

  // 3. Current Question
  const currentMessage = new HumanMessage(question);

  // 4. Combine
  const messages = [
      ...systemMessages,
      ...historyMessages,
      currentMessage
  ];

  try {
    const res = await callLLM(messages);
    const text = typeof (res as any).content === "string"
      ? (res as any).content
      : ((res as any).content as any[]).map((c: any) => c.text ?? "").join("");

    return text;
  } catch (err: any) {
    return "I'm sorry, the AI is currently unavailable. Please try again later.";
  }
}

/**
 * Extracts tasks from a PRD or document (God Mode)
 */
export async function extractTasksFromText(
  document: string
): Promise<ExtractedTasksResult | { error: string; raw: string; cleaned: string }> {
  const messages = await docToTasksTemplate.formatMessages({ document });

  try {
    const res = await callLLM(messages);
    const textRaw =
      typeof (res as any).content === "string"
        ? (res as any).content
        : ((res as any).content as any[])
            .map((c: any) => c.text ?? "")
            .join("");

    const cleaned = cleanLLMText(textRaw); // reuse cleaner

    try {
      const parsed = JSON.parse(cleaned);
      const wrapped: any = Array.isArray(parsed) ? { tasks: parsed } : parsed;

      if (!isExtractedTasksResult(wrapped)) {
        console.error("Doc-to-task Validation Failed.", { raw: textRaw, parsed: wrapped });
        return {
          error: "Doc-to-task AI output validation failed",
          raw: textRaw,
          cleaned,
        };
      }

      return wrapped as ExtractedTasksResult;
    } catch {
      console.error("Doc-to-task JSON Parse Failed.", { raw: textRaw, cleaned });
      return {
        error: "Failed to parse doc-to-task AI JSON",
        raw: textRaw,
        cleaned,
      };
    }
  } catch (err: any) {
    return {
      error: err.message || "LLM invocation failed",
      raw: "",
      cleaned: "",
    };
  }
}