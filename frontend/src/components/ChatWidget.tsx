import React, { useState, useEffect } from "react";
import { aiService, taskService, getErrorMessage } from "../services/api";
import { useProject } from "../context/ProjectContext";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, X, ListPlus } from 'lucide-react';

interface Message {
  id: string;
  from: "user" | "ai" | "system";
  text: string;
  tasks?: any[]; 
  summary?: string; // For document summary
}

interface ChatWidgetProps {
  projectId: string;
  inline?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  projectId,
  inline = false,
}) => {
  const { currentProject, triggerTaskRefresh } = useProject();
  const [isOpen, setIsOpen] = useState(inline);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Listen for new asset uploads
  useEffect(() => {
    const handleNewAsset = (e: any) => {
      const { fileName } = e.detail;
      if (inline) {
        // Automatically prompt the AI about the new file
        handleSend(`I've uploaded a new file: ${fileName}. Please check if this is a PRD or technical spec and if so, offer to generate tasks from it.`);
      }
    };

    window.addEventListener('new-asset-uploaded' as any, handleNewAsset);
    return () => window.removeEventListener('new-asset-uploaded' as any, handleNewAsset);
  }, [inline, currentProject]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || !projectId) return;

    if (!overrideInput) {
        const userMsg: Message = {
          id: crypto.randomUUID(),
          from: "user",
          text: textToSend.trim(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
    }
    
    setLoading(true);

    try {
      const responsePromise = aiService.chatWithAI(projectId, textToSend);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), 120000)
      );

      const res: any = await Promise.race([responsePromise, timeoutPromise]);
      
      let aiText = res.data?.answer ?? "Sorry, I could not generate a reply right now.";

      // Check for Action Tag (more robust check)
      if (aiText.includes('[ACTION:GENERATE_TASKS]')) {
        // Hide the tag from the user
        const cleanText = aiText.replace('[ACTION:GENERATE_TASKS]', '').trim();
        
        if (cleanText) {
             const aiMsg: Message = {
                id: crypto.randomUUID(),
                from: "ai",
                text: cleanText,
            };
            setMessages((prev) => [...prev, aiMsg]);
        }

        // Trigger Task Extraction
        setLoading(true);
        try {
            const extractRes = await aiService.extractTasks(currentProject?.context || "");
            const data = extractRes.data as any;
            const tasks = data.tasks || [];
            const summary = data.summary || "";
            
            if (tasks.length > 0) {
                const systemMsg: Message = {
                    id: crypto.randomUUID(),
                    from: "system",
                    text: `I've analyzed the document.`,
                    summary: summary,
                    tasks: tasks
                };
                setMessages((prev) => [...prev, systemMsg]);
            } else {
                setMessages((prev) => [...prev, {
                    id: crypto.randomUUID(),
                    from: "ai",
                    text: "I analyzed the document but couldn't find any concrete tasks to extract."
                }]);
            }
        } catch (err) {
            console.error("Extraction failed", err);
        }
      } else {
        const aiMsg: Message = {
          id: crypto.randomUUID(),
          from: "ai",
          text: aiText,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error(err);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        from: "ai",
        text: "The AI is taking too long to respond. Please try again.",
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTasks = async (tasksToApprove: any[]) => {
    setLoading(true);
    let successCount = 0;
    try {
        for (const t of tasksToApprove) {
            await taskService.create({
                project: projectId,
                name: t.title,
                description: t.description,
                status: 'To Do',
                priority: 'Medium',
                team: 'Development', // Default
                owner: 'AI Agent',
                dueDate: t.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            });
            successCount++;
        }
        
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            from: "ai",
            text: `Successfully created ${successCount} tasks in the project!`
        }]);
        triggerTaskRefresh();
    } catch (err) {
        alert(getErrorMessage(err));
    } finally {
        setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDeleteTask = (msgId: string, taskIndex: number) => {
    setMessages(prev => prev.map(msg => {
        if (msg.id !== msgId || !msg.tasks) return msg;
        const newTasks = msg.tasks.filter((_, idx) => idx !== taskIndex);
        return { ...msg, tasks: newTasks };
    }));
  };

  const renderMessage = (m: Message) => {
    if (m.from === 'system' && m.tasks) {
        return (
            <div className="mr-auto w-full max-w-[95%] bg-slate-900 border border-slate-700/50 rounded-lg p-3 space-y-3 shadow-lg">
                
                {/* Summary Section */}
                {m.summary && (
                    <div className="bg-slate-800/60 p-3 rounded-md border-l-2 border-indigo-500 mb-3">
                        <div className="text-[10px] uppercase font-bold text-indigo-400 mb-1">Document Overview</div>
                        <div className="text-xs text-slate-300 leading-relaxed italic">"{m.summary}"</div>
                    </div>
                )}

                <div className="flex items-center justify-between text-indigo-400 border-b border-slate-800 pb-2 mb-2">
                    <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
                        <ListPlus className="w-3.5 h-3.5" />
                        <span>Review Tasks ({m.tasks.length})</span>
                    </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                    {m.tasks.map((task, idx) => (
                        <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-2.5 rounded-md relative group hover:bg-slate-800/60 transition-colors">
                            <button 
                                onClick={() => handleDeleteTask(m.id, idx)}
                                className="absolute top-2 right-2 p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded transition-all"
                                title="Remove Task"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            
                            <div className="pr-6">
                                <div className="font-semibold text-slate-200 text-xs mb-0.5">{task.title}</div>
                                <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{task.description}</div>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                                <div className="bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700/50 text-slate-400 flex items-center gap-1">
                                    <span className="opacity-50">Pr:</span>
                                    <span className={task.priority === 'High' || task.priority === 'Critical' ? 'text-orange-400 font-medium' : 'text-slate-300'}>{task.priority}</span>
                                </div>
                                <div className="bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700/50 text-slate-400 flex items-center gap-1">
                                    <span className="opacity-50">Tm:</span>
                                    <span className="text-slate-300">{task.team}</span>
                                </div>
                                <div className="bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700/50 text-slate-400 flex items-center gap-1 truncate">
                                    <span className="opacity-50">Own:</span>
                                    <span className="text-slate-300 truncate">@{task.assignee || 'AI'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {m.tasks.length > 0 && (
                    <div className="flex gap-2 pt-2">
                        <button 
                            onClick={() => handleApproveTasks(m.tasks || [])}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            <Check className="w-3.5 h-3.5" /> Approve & Create All
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            className={`max-w-[85%] px-3 py-2 rounded-lg whitespace-pre-wrap break-words ${
            m.from === "user"
                ? "ml-auto bg-indigo-600 text-white"
                : "mr-auto bg-slate-800 text-slate-50"
            }`}
        >
            {m.from === 'ai' ? (
            <div className="prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {m.text}
                </ReactMarkdown>
            </div>
            ) : (
            m.text
            )}
        </div>
    );
  };

  // INLINE MODE (For Assets/Full Page view)
  if (inline) {
    return (
      <div className="w-full h-full flex flex-col rounded-2xl bg-slate-900 border border-slate-700">
        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-50">
            Project AI Assistant
          </span>
          <span className="text-[11px] text-slate-400">
            Project: {currentProject?.name || "none selected"}
          </span>
        </div>

        <div className="flex-1 px-4 py-3 overflow-y-auto space-y-4 text-xs">
          {messages.length === 0 && !loading && (
            <div className="text-slate-400 text-xs">
              Ask anything about your current project, tasks, deadlines, or risks.
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id}>
                {renderMessage(m)}
            </div>
          ))}
          {loading && (
            <div className="mr-auto max-w-[70%] px-3 py-2 rounded-lg bg-slate-800 italic text-slate-300">
              Thinking...
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-700 flex items-center gap-2">
          <input
            className="flex-1 text-xs px-3 py-2 rounded-md bg-slate-800 text-slate-50 outline-none border border-slate-700 focus:border-indigo-500"
            placeholder="Ask about project, tasks, assets..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !projectId}
            className="text-xs px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white"
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  // FLOATING WIDGET MODE (For Sidebar/Overlay)
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-80 h-96 rounded-xl bg-slate-900 text-slate-50 shadow-2xl flex flex-col border border-slate-700 animate-in fade-in slide-in-from-bottom-10 duration-200">
          <div className="px-4 py-3 flex items-center justify-between border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
            <span className="text-sm font-semibold">AI Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 px-3 py-2 overflow-y-auto space-y-3 text-xs">
            {messages.length === 0 && !loading && (
              <div className="text-slate-400 text-center mt-4">
                <p>👋 Hi! I'm your Project Assistant.</p>
                <p className="mt-1">Ask me about overdue tasks, risks, or to summarize the project.</p>
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id}>
                  {renderMessage(m)}
              </div>
            ))}
            {loading && (
              <div className="mr-auto max-w-[70%] px-3 py-2 rounded-lg bg-slate-800 italic text-slate-400 text-[10px] animate-pulse">
                Thinking...
              </div>
            )}
          </div>
          <div className="p-3 border-t border-slate-700 bg-slate-800/30 rounded-b-xl flex gap-2">
            <input
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-slate-800 text-slate-50 outline-none border border-slate-700 focus:border-primary/50 transition-colors"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !projectId}
              className="p-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 text-white transition-colors"
            >
              🚀
            </button>
          </div>
        </div>
      )}

      <button
        id="tour-chat"
        onClick={() => setIsOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-secondary shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-200 flex items-center justify-center text-white text-2xl"
      >
        💬
      </button>
    </div>
  );
};
