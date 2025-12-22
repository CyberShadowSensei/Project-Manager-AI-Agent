import { Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useProject } from '../context/ProjectContext'
import { taskService, type Task } from '../services/api'
import { Modal } from './ui/Modal' // Assuming Modal.tsx is in components/ui
import { AddTaskForm } from './forms/AddTaskForm' // Assuming AddTaskForm.tsx is in components/forms

const columns = ['To Do', 'In Progress', 'Done']

type TaskManagerProps = {
  searchQuery?: string
  activeTeam?: string | null
}

export const TaskManager = ({ searchQuery = '', activeTeam }: TaskManagerProps) => {
  const { currentProject } = useProject()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchTasks = async () => {
    if (!currentProject) {
      setTasks([]);
      return;
    }
    setLoading(true)
    try {
      const response = await taskService.getByProject(currentProject._id)
      
      let filteredTasks = response.data;

      // Apply search and team filters here
      if (activeTeam) {
        filteredTasks = filteredTasks.filter(task => task.owner === activeTeam) // Assuming owner maps to team
      }
      if (searchQuery) {
        filteredTasks = filteredTasks.filter(
          (task) =>
            task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchQuery.toLowerCase() || '')
        )
      }
      setTasks(filteredTasks)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      setTasks([]);
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [currentProject, searchQuery, activeTeam]) // Re-fetch when project, search, or team changes

  const handleTaskAdded = () => {
    setIsModalOpen(false)
    fetchTasks() // Refresh tasks after adding one
  }

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'Done': return 100
      case 'In Progress': return 50
      default: return 0
    }
  }

  const tasksByStatus = (status: string) => tasks.filter(t => t.status === status)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[11px] text-muted mb-1">Task Manager</div>
          <div className="text-[17px] font-semibold">
            {currentProject ? `${currentProject.name} Tasks` : 'Task Manager'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={!currentProject}
            className="h-8 px-3 rounded-lg bg-primary text-[11px] flex items-center gap-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted text-sm italic">
          Loading tasks...
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 grid grid-cols-3 gap-3">
            {columns.map((statusColumn) => (
              <div key={statusColumn} className="space-y-3">
                <div className="text-[10px] uppercase tracking-wider text-muted mb-2 px-1">
                  {statusColumn} ({tasksByStatus(statusColumn).length})
                </div>
                {tasksByStatus(statusColumn).length === 0 && (
                     <div className="text-center text-muted text-xs italic">No tasks here</div>
                )}
                {tasksByStatus(statusColumn).map((task) => (
                  <TaskCard
                    key={task._id}
                    title={task.name}
                    subtitle={task.owner}
                    description={task.description || 'No description provided.'}
                    time={new Date(task.dueDate).toLocaleDateString()}
                    progress={getStatusProgress(task.status)}
                    priority={task.priority}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {!currentProject && !loading && (
        <div className="flex-1 flex items-center justify-center text-muted text-sm italic">
          Select a project to view and manage tasks.
        </div>
      )}


      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Task"
      >
        <AddTaskForm 
          onSuccess={handleTaskAdded} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  )
}

type TaskCardProps = {
  title: string
  subtitle: string
  description: string
  time: string
  progress: number
  priority: 'Low' | 'Medium' | 'High'
}

const TaskCard = ({ title, subtitle, description, time, progress, priority }: TaskCardProps) => {
  const getPriorityColor = (p: 'Low' | 'Medium' | 'High') => {
    switch (p) {
      case 'High': return 'text-red-400'
      case 'Medium': return 'text-yellow-400'
      case 'Low': return 'text-green-400'
      default: return 'text-muted'
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] px-3.5 py-3 text-[11px] flex flex-col gap-1.5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out cursor-pointer">
      <div className="flex justify-between items-center text-[10px] text-muted">
        <span>{time}</span>
        <span className={`font-medium ${getPriorityColor(priority)}`}>{priority}</span>
      </div>
      <div className="text-[12px] font-semibold text-white truncate">{title}</div>
      <div className="text-[10px] text-muted mb-1">Owner: {subtitle}</div>
      <div className="text-[10px] text-muted line-clamp-2 leading-relaxed">{description}</div>
      <div className="mt-2">
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
        <div className="flex -space-x-1">
          <AvatarCircle />
        </div>
        <div className="flex items-center gap-3">
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  )
}

const AvatarCircle = () => (
  <div className="w-5 h-5 rounded-full border border-black/40 bg-[radial-gradient(circle_at_30%_20%,#FACC15,#F97316_40%,#A855F7_75%)]" />
)


