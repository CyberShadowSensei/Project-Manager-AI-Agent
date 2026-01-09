import { useState } from 'react';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { aiService, taskService, type TaskUpdateData } from '../../services/api';
import { useProject } from '../../context/ProjectContext';

interface PRDParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ExtractedTask {
  id: number;
  title: string;
  description: string;
  status: string;
  dueDate: string | null;
  assignee: string | null;
  team: string | null;
  priority: string;
  dependencies: number[];
}

export const PRDParserModal = ({ isOpen, onClose, onSuccess }: PRDParserModalProps) => {
  const { currentProject } = useProject();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const response = await aiService.extractTasksFromFile(file);
      const tasks = response.data.tasks || [];
      setExtractedTasks(tasks);
      // Select all by default
      setSelectedIds(new Set(tasks.map(t => t.id)));
      setStep('review');
    } catch (error) {
      console.error("Failed to analyze PRD:", error);
      alert("Failed to analyze document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeContext = async () => {
    if (!currentProject?.context) {
        alert("No project documents found. Please upload a PRD first.");
        return;
    }
    setLoading(true);
    try {
      const response = await aiService.extractTasks(currentProject.context);
      const tasks = response.data.tasks || [];
      setExtractedTasks(tasks);
      setSelectedIds(new Set(tasks.map(t => t.id)));
      setStep('review');
    } catch (error) {
      console.error("Failed to analyze context:", error);
      alert("Failed to extract tasks from project documents.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const mapTeam = (team: string | null): TaskUpdateData['team'] => {
    const valid = ['Marketing', 'Development', 'Design', 'Product', 'Operations'];
    if (team && valid.includes(team)) return team as TaskUpdateData['team'];
    // Try to fuzzy match
    if (team) {
      const lower = team.toLowerCase();
      if (lower.includes('dev') || lower.includes('eng')) return 'Development';
      if (lower.includes('mark')) return 'Marketing';
      if (lower.includes('des') || lower.includes('ui')) return 'Design';
      if (lower.includes('prod')) return 'Product';
      if (lower.includes('ops')) return 'Operations';
    }
    return 'Product'; // Default
  };

  const mapPriority = (p: string | null): TaskUpdateData['priority'] => {
    const lower = p?.toLowerCase() || '';
    if (lower === 'critical' || lower === 'high') return 'High';
    if (lower === 'medium') return 'Medium';
    return 'Low';
  };

  const handleImport = async () => {
    if (!currentProject) return;
    setImporting(true);
    try {
      const tasksToImport = extractedTasks.filter(t => selectedIds.has(t.id));
      
      // Execute in parallel or sequence? Parallel is faster.
      await Promise.all(tasksToImport.map(t => {
        const payload: TaskUpdateData = {
          project: currentProject._id,
          name: t.title,
          description: t.description,
          owner: t.assignee || 'Unassigned',
          team: mapTeam(t.team),
          status: 'To Do',
          priority: mapPriority(t.priority),
          dueDate: t.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
          dependsOn: undefined // Dependency linking is complex (requires IDs of created tasks), skipping for MVP
        };
        return taskService.create(payload);
      }));

      onSuccess();
      onClose();
      // Reset state
      setFile(null);
      setStep('upload');
      setExtractedTasks([]);
    } catch (error) {
      console.error("Failed to import tasks:", error);
      alert("Failed to create some tasks.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={step === 'upload' ? "Auto-Generate Tasks" : "Review Extracted Tasks"}
      maxWidth={step === 'review' ? 'max-w-4xl' : 'max-w-md'}
    >
      {step === 'upload' ? (
        <div className="flex flex-col gap-6 py-4">
          <div className="text-sm text-muted">
            Analyze existing project documents or upload a new project doc to extract actionable tasks.
          </div>

          {/* Option 1: Analyze Existing Context */}
          <button
            onClick={handleAnalyzeContext}
            disabled={loading || !currentProject?.context}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-semibold hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? "Analyzing Docs..." : "Generate from Uploaded Docs"}
          </button>

          <div className="relative flex items-center justify-center">
             <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
             </div>
             <span className="relative bg-[#0F111A] px-2 text-xs text-muted">OR UPLOAD NEW</span>
          </div>
          
          <div className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/[0.02] transition-colors relative">
             <input 
                type="file" 
                accept=".pdf,.txt,.md,.markdown"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted">
                <Upload className="w-5 h-5" />
             </div>
             <div className="text-center">
                <div className="text-xs font-medium text-white">
                  {file ? file.name : "Select Project Doc"}
                </div>
             </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!file || loading}
            className="w-full h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Analyze Project Doc
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-muted">
            Found {extractedTasks.length} tasks. Select the ones you want to import.
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto border border-white/10 rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-muted sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="p-3 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size === extractedTasks.length}
                      onChange={() => {
                        if (selectedIds.size === extractedTasks.length) setSelectedIds(new Set());
                        else setSelectedIds(new Set(extractedTasks.map(t => t.id)));
                      }}
                      className="rounded border-white/20 bg-transparent focus:ring-primary"
                    />
                  </th>
                  <th className="p-3">Task</th>
                  <th className="p-3 w-32">Team</th>
                  <th className="p-3 w-24">Priority</th>
                  <th className="p-3 w-32">Owner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {extractedTasks.map(task => (
                  <tr key={task.id} className="hover:bg-white/[0.02]">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(task.id)}
                        onChange={() => toggleSelection(task.id)}
                        className="rounded border-white/20 bg-transparent focus:ring-primary"
                      />
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-white">{task.title}</div>
                      <div className="text-xs text-muted line-clamp-1">{task.description}</div>
                    </td>
                    <td className="p-3 text-xs text-white/70">
                      {mapTeam(task.team)}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        mapPriority(task.priority) === 'High' ? 'bg-red-500/20 text-red-400' :
                        mapPriority(task.priority) === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {mapPriority(task.priority)}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-muted">
                      {task.assignee || 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 rounded-lg text-sm text-muted hover:text-white"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={importing || selectedIds.size === 0}
              className="px-4 py-2 rounded-lg bg-primary text-black text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {importing && <Loader2 className="w-4 h-4 animate-spin" />}
              Import {selectedIds.size} Tasks
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
