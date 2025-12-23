import { TaskManager } from './TaskManager'
import { Inbox } from './Inbox'

type BottomRowProps = {
  searchQuery: string
  activeTeam?: string | null
}

export const BottomRow = ({ searchQuery, activeTeam }: BottomRowProps) => {
  return (
    <div className="flex gap-6 flex-1">
      <div className="w-[66%] rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out">
        <TaskManager searchQuery={searchQuery} activeTeam={activeTeam} />
      </div>
      <div className="flex-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4 flex flex-col hover:-translate-y-1 hover:shadow-lg transition-all duration-200 ease-out">
        <Inbox searchQuery={searchQuery} activeTeam={activeTeam} />
      </div>
    </div>
  )
}


