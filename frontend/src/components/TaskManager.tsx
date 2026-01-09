import { Plus, Trash2, Sparkles } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useProject } from '../context/ProjectContext'
import { taskService, type Task } from '../services/api'
import { Modal } from './ui/Modal' // Assuming Modal.tsx is in components/ui
import { AddTaskForm } from './forms/AddTaskForm' // Assuming AddTaskForm.tsx is in components/forms
import EditTaskModal from './forms/EditTaskModal'
import { PRDParserModal } from './forms/PRDParserModal'

const columns = ['To Do', 'In Progress', 'Done']

type TaskManagerProps = {
  searchQuery?: string
  activeTeam?: string | null
}

export const TaskManager = ({ searchQuery = '', activeTeam }: TaskManagerProps) => {
  const { currentProject, taskRefreshTrigger } = useProject()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [modalKey, setModalKey] = useState(0)

  const openAddModal = () => {
    setModalKey(prev => prev + 1);
    setIsModalOpen(true);
  }


  const fetchTasks = useCallback(async () => {
    // if (!currentProject) {
    //   setTasks([]);
    //   return;
    // }
    setLoading(true)
    try {
      const response = await taskService.getByProject(currentProject?._id)
      
      let filteredTasks = response.data;

      // Apply search and team filters here
      if (activeTeam) {
        filteredTasks = filteredTasks.filter(task => task.team === activeTeam)
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
  }, [currentProject, searchQuery, activeTeam])

  useEffect(() => {
    fetchTasks()
  }, [currentProject, searchQuery, activeTeam, taskRefreshTrigger, fetchTasks]) // Re-fetch when project, search, team, or refresh trigger changes

  const handleTaskAdded = () => {
    setIsModalOpen(false)
    fetchTasks() // Refresh tasks after adding one
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsEditModalOpen(true)
  }

  const handleTaskEdited = () => {
    setIsEditModalOpen(false)
    setSelectedTask(null)
    fetchTasks() // Refresh tasks after editing one
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.remove(taskId)
        fetchTasks() // Refresh tasks after deletion
      } catch (error) {
        console.error('Failed to delete task:', error)
        alert('Failed to delete task. Please try again.')
      }
    }
  }

  const handlePRDImported = () => {
    setIsPRDModalOpen(false)
    fetchTasks()
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
            onClick={() => setIsPRDModalOpen(true)}
            disabled={!currentProject}
            className="h-8 px-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-[11px] text-purple-300 flex items-center gap-1 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50 active:scale-95 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Tasks from Project Docs</span>
          </button>
          <button 
            onClick={openAddModal}
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
                    team={task.team}
                    description={task.description || 'No description provided.'}
                    time={new Date(task.dueDate).toLocaleDateString()}
                    progress={getStatusProgress(task.status)}
                    priority={task.priority}
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task._id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}




      <Modal 
        key={modalKey}
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Task"
      >
        <AddTaskForm 
          tasks={tasks}
          onSuccess={handleTaskAdded} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      {selectedTask && (
        <EditTaskModal
          task={selectedTask}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleTaskEdited}
        />
      )}

      <PRDParserModal
        isOpen={isPRDModalOpen}
        onClose={() => setIsPRDModalOpen(false)}
        onSuccess={handlePRDImported}
      />
    </div>
  )
}

type TaskCardProps = {
  title: string
  subtitle: string
  team?: string
  description: string
  time: string
  progress: number
  priority: 'Low' | 'Medium' | 'High'
  onEdit: () => void
  onDelete: () => void
}

const TaskCard = ({ title, subtitle, team, description, time, progress, priority, onEdit, onDelete }: TaskCardProps) => {
  const getPriorityColor = (p: 'Low' | 'Medium' | 'High') => {
    switch (p) {
      case 'High': return 'text-red-400'
      case 'Medium': return 'text-yellow-400'
      case 'Low': return 'text-green-400'
      default: return 'text-muted'
    }
  }

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] px-3.5 py-3 text-[11px] flex flex-col gap-1.5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out cursor-pointer group">
      <div className="flex justify-between items-center text-[10px] text-muted">
        <span>{time}</span>
        <div className="flex items-center gap-2">
          <span className={`font-medium ${getPriorityColor(priority)}`}>{priority}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
             <button 
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="px-2 py-1 rounded bg-primary/20 hover:bg-primary/40 text-xs text-primary transition-all duration-200"
            >
              Edit
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="px-2 py-1 rounded bg-red-500/20 hover:bg-red-500/40 text-xs text-red-500 transition-all duration-200"
              title="Delete Task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
      <div className="text-[12px] font-semibold text-white truncate">{title}</div>
      <div className="flex justify-between items-center text-[10px] text-muted mb-1">
        <span>Owner: {subtitle}</span>
        {team && <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70">{team}</span>}
      </div>
      <div className="text-[10px] text-muted line-clamp-2 leading-relaxed">{description}</div>
      <div className="mt-2">
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 ease-out"
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