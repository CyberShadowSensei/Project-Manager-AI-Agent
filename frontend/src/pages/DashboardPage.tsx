import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Search, Sparkles } from 'lucide-react'
import { AnalyticsRow } from '../components/AnalyticsRow'
import { BottomRow } from '../components/BottomRow'
import { Header } from '../components/Header'
import { PRDParserModal } from '../components/forms/PRDParserModal'
import { useProject } from '../context/ProjectContext'

type DashboardContext = {
  activeTeam: string | null
}

export const DashboardPage = () => {
  const { activeTeam } = useOutletContext<DashboardContext>()
  const { currentProject, triggerTaskRefresh } = useProject()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSearchQuery, setCurrentSearchQuery] = useState('')
  const [isPRDModalOpen, setIsPRDModalOpen] = useState(false)

  const handlePRDImported = () => {
    setIsPRDModalOpen(false)
    triggerTaskRefresh()
  }

  const handleSearch = () => {
    setCurrentSearchQuery(searchQuery.trim())
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col gap-6">
      <Header pagePath="/dashboard" />
      <div className="">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search dashboard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.06] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-white/20 transition-all duration-200"
          />
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.06] text-white hover:bg-white/8 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/5 disabled:hover:shadow-none transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
          </button>
          
          <button 
            onClick={() => setIsPRDModalOpen(true)}
            disabled={!currentProject}
            className="h-[42px] px-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium flex items-center gap-2 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50 active:scale-95 transition-all duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Tasks</span>
          </button>
        </div>
      </div>
      <AnalyticsRow activeTeam={activeTeam} />
      <BottomRow searchQuery={currentSearchQuery} activeTeam={activeTeam} />
      
      <PRDParserModal
        isOpen={isPRDModalOpen}
        onClose={() => setIsPRDModalOpen(false)}
        onSuccess={handlePRDImported}
      />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}