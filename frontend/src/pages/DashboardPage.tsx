import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import { Search } from 'lucide-react'
import { AnalyticsRow } from '../components/AnalyticsRow'
import { BottomRow } from '../components/BottomRow'

type DashboardContext = {
  activeTeam: string | null
}

export const DashboardPage = () => {
  const { activeTeam } = useOutletContext<DashboardContext>()
  const { currentProject } = useProject()
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!currentProject) {
      navigate('/projects')
    }
  }, [currentProject, navigate])

  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    // Search is handled via state, filtering happens in child components
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col gap-6">
      <div className="">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search dashboard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
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
        </div>
      </div>
      <AnalyticsRow />
      <BottomRow searchQuery={searchQuery} activeTeam={activeTeam} />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}