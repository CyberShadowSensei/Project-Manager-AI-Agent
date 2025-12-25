import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { ANALYZE_PROMPT, DOC_TO_TASKS_PROMPT, CHAT_PROMPT, CHAT_SYSTEM_PROMPT } from "./prompts.js";
import { callLLM } from "./llm.js";

// ----- Types ----- 

export interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "blocked";
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
  assignee: null;
  dependencies: number[];
}

export interface ExtractedTasksResult {
  tasks: ExtractedTask[];
}

// ----- Prompt templates ----- 

const analyzeTemplate = ChatPromptTemplate.fromTemplate(`
${ANALYZE_PROMPT}

Project name: {projectName}

Tasks:
{tasksBlock}
`);

const docToTasksTemplate = ChatPromptTemplate.fromTemplate(`
${DOC_TO_TASKS_PROMPT}

Document:
{document}
`);

// ----- Helpers ----- 

function buildTasksBlock(tasks: Task[]): string {
  if (!tasks.length) return "No tasks.";
  return tasks
    .map((t) => {
      const deps = t.dependencies?.length ? t.dependencies.join(",") : "none";
      return `- [${t.status}] (${t.id}) "${t.title}" assignee=${t.assignee || "unassigned"} due=${t.dueDate || "none"} deps=${deps}`;
    })
    .join("\n");
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
  if (typeof obj.id !== "number") return false;
  if (typeof obj.title !== "string") return false;
  if (typeof obj.description !== "string") return false;
  if (obj.status !== "todo") return false;
  if (!(obj.dueDate === null || typeof obj.dueDate === "string")) return false;
  if (obj.assignee !== null) return false;
  if (!Array.isArray(obj.dependencies)) return false;
  if (!obj.dependencies.every((d: any) => typeof d === "number")) return false;
  return true;
}

function isExtractedTasksResult(obj: any): obj is ExtractedTasksResult {
  if (!obj || typeof obj !== "object") return false;
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

