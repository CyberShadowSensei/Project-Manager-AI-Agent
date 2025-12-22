import { useState, useEffect } from 'react';
import { useProject } from '../../context/ProjectContext';
import { taskService, type Task } from '../../services/api'; // Use type import

interface AddTaskFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddTaskForm = ({ onSuccess, onCancel }: AddTaskFormProps) => {
  const { currentProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [existingTasks, setExistingTasks] = useState<Task[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    description: '',
    dependsOn: ''
  });

  // Fetch existing tasks for dependency dropdown
  useEffect(() => {
    const fetchTasks = async () => {
      if (currentProject) {
        try {
          const res = await taskService.getByProject(currentProject._id);
          setExistingTasks(res.data);
        } catch (err) {
          console.error("Failed to load tasks for dependencies", err);
        }
      }
    };
    fetchTasks();
  }, [currentProject]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;

    setLoading(true);
    try {
      await taskService.create({
        ...formData,
        project: currentProject._id,
        status: formData.status as any, // Cast to any to match string literal
        priority: formData.priority as any, // Cast to any
        dependsOn: formData.dependsOn || undefined
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create task:', error);
      // Optionally show an error message to the user
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "block text-xs font-medium text-muted mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Task Name</label>
        <input 
          type="text" 
          required
          className={inputClass}
          placeholder="e.g. Design Homepage"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Owner</label>
          <input 
            type="text" 
            required
            className={inputClass}
            placeholder="Name"
            value={formData.owner}
            onChange={e => setFormData({...formData, owner: e.target.value})}
          />
        </div>
        <div>
          <label className={labelClass}>Due Date</label>
          <input 
            type="date" 
            required
            className={inputClass}
            value={formData.dueDate}
            onChange={e => setFormData({...formData, dueDate: e.target.value})}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Status</label>
          <select 
            className={inputClass}
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select 
            className={inputClass}
            value={formData.priority}
            onChange={e => setFormData({...formData, priority: e.target.value})}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Dependency (Optional)</label>
        <select 
          className={inputClass}
          value={formData.dependsOn}
          onChange={e => setFormData({...formData, dependsOn: e.target.value})}
        >
          <option value="">No Dependency</option>
          {existingTasks.map(t => (
            <option key={t._id} value={t._id}>{t.name} ({t.status})</option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea 
          className={inputClass}
          rows={3}
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};
