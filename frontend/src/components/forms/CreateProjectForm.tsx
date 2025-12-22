import { useState } from 'react';
import { projectService } from '../../services/api';
import { useProject } from '../../context/ProjectContext'; // Ensure this path is correct

interface CreateProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateProjectForm = ({ onSuccess, onCancel }: CreateProjectFormProps) => {
  const { refreshProjects } = useProject();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Default 1 week
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await projectService.create(formData);
      await refreshProjects(); // Refresh context list
      onSuccess();
    } catch (error) {
      console.error('Failed to create project:', error);
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
        <label className={labelClass}>Project Name</label>
        <input 
          type="text" 
          required
          className={inputClass}
          placeholder="e.g. Mobile App Launch"
          value={formData.name}
          onChange={e => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input 
            type="date" 
            required
            className={inputClass}
            value={formData.startDate}
            onChange={e => setFormData({...formData, startDate: e.target.value})}
          />
        </div>
        <div>
          <label className={labelClass}>End Date</label>
          <input 
            type="date" 
            required
            className={inputClass}
            value={formData.endDate}
            onChange={e => setFormData({...formData, endDate: e.target.value})}
          />
        </div>
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
          {loading ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};
