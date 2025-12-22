import { TaskManager } from '../components/TaskManager'

export const TasksPage = () => {
  return (
    <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4 flex flex-col">
      <TaskManager />
    </div>
  )
}

