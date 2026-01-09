import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import { Search, Sparkles } from 'lucide-react'
import { AnalyticsRow } from './AnalyticsRow'
import { BottomRow } from './BottomRow'
import { Header } from './Header'
import { PRDParserModal } from './forms/PRDParserModal'

type DashboardContext = {
  activeTeam: string | null
}

export const Dashboard = () => {
  const { activeTeam } = useOutletContext<DashboardContext>()
  const { currentProject, triggerTaskRefresh } = useProject()
  const navigate = useNavigate()
  const location = useLocation()
  
  useEffect(() => {
    if (!currentProject) {
      navigate('/projects')
    }
  }, [currentProject, navigate])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSearchQuery, setCurrentSearchQuery] = useState('')
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false)

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCurrentSearchQuery(searchQuery.trim())
  }

  const handlePRDImported = () => {
    setIsPRDModalOpen(false)
    triggerTaskRefresh()
  }

  return (
    <div className="flex-1 flex flex-col px-8 py-7 gap-12">
      <Header pagePath={location.pathname} />
      <div className="mb-2 flex items-center gap-3">
        <form className="flex items-center gap-2 flex-1" onSubmit={handleSearchSubmit}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-white/4 border border-gray-200 dark:border-white/[0.06] text-[11px] text-gray-500 dark:text-muted flex-1 shadow-sm dark:shadow-none transition-all focus-within:ring-2 focus-within:ring-primary/20">
            <Search className="w-3.5 h-3.5" />
            <input
              aria-label="Search tasks and messages"
              placeholder="Search tasks and team messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full text-sm text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-400 dark:placeholder:text-muted"
            />
          </div>
          <button
            type="submit"
            disabled={!searchQuery.trim()}
            className="px-3 py-2 rounded-lg bg-primary text-[11px] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm"
          >
            Search
          </button>
        </form>
        <button 
          onClick={() => setIsPRDModalOpen(true)}
          disabled={!currentProject}
          className="h-[38px] px-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-[11px] text-purple-300 flex items-center gap-1 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50 active:scale-95 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Tasks from Project Docs</span>
        </button>
      </div>
      <AnalyticsRow activeTeam={activeTeam} />
      <BottomRow searchQuery={currentSearchQuery} activeTeam={activeTeam} />
      
      <PRDParserModal
        isOpen={isPRDModalOpen}
        onClose={() => setIsPRDModalOpen(false)}
        onSuccess={handlePRDImported}
      />
    </div>
  )
}
