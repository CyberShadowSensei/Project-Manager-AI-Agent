import { llm } from "./llm.js";
import { ANALYZE_PROMPT, CHAT_PROMPT } from "./prompts.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done" | "blocked";
  dueDate?: string;        // ISO date
  assignee?: string;
  dependencies?: string[];
}

export interface Project {
  id: string;
  name: string;
}

export interface AnalyzeInput {
  project: Project;
  tasks: Task[];
}

const analyzeTemplate = ChatPromptTemplate.fromTemplate(`
${ANALYZE_PROMPT}

Project name: {projectName}

Tasks:
{tasksBlock}
`);

function buildTasksBlock(tasks: Task[]): string {
  if (!tasks.length) return "No tasks.";
  return tasks
    .map((t) => {
      const deps = t.dependencies?.length ? t.dependencies.join(",") : "none";
      return `- [${t.status}] (${t.id}) "${t.title}" assignee=${t.assignee || "unassigned"} due=${t.dueDate || "none"} deps=${deps}`;
    })
    .join("\n");
}

export async function analyzeProject(input: AnalyzeInput) {
  const { project, tasks } = input;

  const messages = await analyzeTemplate.formatMessages({
    projectName: project.name,
    tasksBlock: buildTasksBlock(tasks),
  });

  const res = await llm.invoke(messages);
  const textRaw =
    typeof res.content === "string"
      ? res.content
      : (res.content as any[]).map((c) => (c as any).text ?? "").join("");

  // Clean possible markdown fences and extra text
   // Clean possible markdown fences and extra text
  let cleaned = textRaw
    .replace(/```json/gi, "") // remove ```json or ```JSON
    .replace(/```/g, "")      // remove any remaining ```
    .trim();


  // Extract the JSON substring between first '{' and last '}'
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      error: "Failed to parse AI JSON",
      raw: textRaw,
      cleaned,
    };
  }
}

const chatTemplate = ChatPromptTemplate.fromTemplate(CHAT_PROMPT);

export async function chatOverProject(
  project: Project,
  tasks: Task[],
  question: string
) {
  const messages = await chatTemplate.formatMessages({
    projectName: project.name,
    tasksBlock: buildTasksBlock(tasks),
    question,
  });

  const res = await llm.invoke(messages);
  return typeof res.content === "string"
    ? res.content
    : (res.content as any[]).map((c) => (c as any).text ?? "").join("");
}
