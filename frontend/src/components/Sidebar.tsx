import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Settings, Users, CheckSquare, Mail, BarChart3, Plus, ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useProject } from '../context/ProjectContext'
import { Modal } from './ui/Modal'
import { CreateProjectForm } from './forms/CreateProjectForm'

type SidebarProps = {
  activeView: string
  onTeamChange: (view: string) => void
  profilePicture: string | null // Added profilePicture prop
}

export const Sidebar = ({ activeView, onTeamChange, profilePicture }: SidebarProps) => {
  const { pathname } = useLocation()
  const { projects, currentProject, setCurrentProject, loadingProjects, refreshProjects, riskLevel, hasViewedReport } = useProject()
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isProjectListOpen, setIsProjectListOpen] = useState(false)

  const handleProjectCreated = () => {
    setIsProjectModalOpen(false)
    refreshProjects()
  }

  return (
    <div className="flex flex-col h-full px-5 py-6 text-xs text-muted">
      {/* Restored Project Selector Section */}
      <div className="relative mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsProjectListOpen(!isProjectListOpen)}
        >
          <div className="flex items-center gap-3">
            {/* Reactive User Avatar */}
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary to-secondary">
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/50" /> // Fallback to generic icon
              )}
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                {currentProject ? currentProject.name : (loadingProjects ? 'Loading...' : 'No Project Selected')}
              </div>
              <div className="text-[10px] text-muted">Free Plan</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-[10px] hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>

        {isProjectListOpen && (
          <div className="absolute top-12 left-0 w-full bg-white dark:bg-[#1A1D2D] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {projects.length === 0 && !loadingProjects ? (
                <div className="px-4 py-2 text-muted text-sm italic">No projects available</div>
              ) : (
                projects.map(p => (
                  <div 
                    key={p._id}
                    onClick={() => {
                      setCurrentProject(p)
                      setIsProjectListOpen(false)
                    }}
                    className={`px-4 py-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer text-gray-900 dark:text-white truncate ${currentProject?._id === p._id ? 'bg-black/5 dark:bg-white/5 text-primary' : ''}`}
                  >
                    {p.name}
                  </div>
                ))
              )}
            </div>
            <div 
              onClick={() => {
                setIsProjectModalOpen(true)
                setIsProjectListOpen(false)
              }}
              className="px-4 py-2 border-t border-gray-200 dark:border-white/10 flex items-center gap-2 text-primary hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Create Project</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Sections with Corrected Logic */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted mb-1.5 px-3">Main Menu</div>
          <DashboardItem 
            icon={<Home className="w-3.5 h-3.5" />} 
            label="Dashboard" 
            to="/dashboard" 
            isActive={activeView === 'dashboard' && location.pathname === '/dashboard'}
            onClick={() => onTeamChange('dashboard')}
          />
          <SidebarItem icon={<CheckSquare className="w-3.5 h-3.5" />} label="Tasks" to="/tasks" pathname={location.pathname} />
          <SidebarItem icon={<Mail className="w-3.5 h-3.5" />} label="Inbox" to="/inbox" pathname={location.pathname} />
          <SidebarItem 
            icon={
              <div className="relative">
                <BarChart3 className="w-3.5 h-3.5" />
                {riskLevel === 'High' && !hasViewedReport && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </div>
            } 
            label="Reports" 
            to="/reports" 
            pathname={location.pathname} 
            className={riskLevel === 'High' && !hasViewedReport ? 'animate-pulse-red border border-red-500/30 bg-red-500/5' : ''}
          />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted mb-1.5 px-3">Settings</div>
          <SidebarItem icon={<Settings className="w-3.5 h-3.5" />} label="Settings" to="/settings" pathname={location.pathname} />
        </div>

        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted mb-1.5 px-3">Teams</div>
          <TeamItem icon={<Users className="w-3.5 h-3.5" />} label="Development" team="Development" activeView={activeView} onTeamChange={onTeamChange} />
          <TeamItem icon={<Users className="w-3.5 h-3.5" />} label="Marketing" team="Marketing" activeView={activeView} onTeamChange={onTeamChange} />
          <TeamItem icon={<Users className="w-3.5 h-3.5" />} label="Design" team="Design" activeView={activeView} onTeamChange={onTeamChange} />
          <TeamItem icon={<Users className="w-3.5 h-3.5" />} label="Product" team="Product" activeView={activeView} onTeamChange={onTeamChange} />
          <TeamItem icon={<Users className="w-3.5 h-3.5" />} label="Operations" team="Operations" activeView={activeView} onTeamChange={onTeamChange} />
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-200 dark:border-white/5">
        <div className="bg-primary/5 rounded-xl shadow-glow"> {/* The contrast island */}
          <SidebarItem
            icon={
              <div className="relative w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden">
                <Sparkles className="w-3.5 h-3.5 text-primary relative z-10" />
                <div className={`absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-primary/30 to-transparent bg-shimmer-size ${pathname !== '/assets' ? 'animate-shimmer' : ''}`}></div>
              </div>
            }
            label="AI Hub"
            to="/assets"
            pathname={location.pathname}
            className="hover:bg-primary/10"
          />
        </div>
      </div>

      <Modal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        title="Create New Project"
      >
        <CreateProjectForm
          onSuccess={handleProjectCreated}
          onCancel={() => setIsProjectModalOpen(false)}
        />
      </Modal>
    </div>
  )
}

// New DashboardItem component for specific dashboard logic
type DashboardItemProps = {
  icon: ReactNode
  label: string
  to: string
  isActive: boolean
  onClick: () => void
}

const DashboardItem = ({ icon, label, to, isActive, onClick }: DashboardItemProps) => {
  const navigate = useNavigate()
  
  const handleClick = () => {
    onClick()
    navigate(to)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] transition-all duration-200 ease-out text-left relative group ${
        isActive ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:translate-x-1'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary transition-all duration-200" />
      )}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/[0.04] text-gray-700 dark:text-white/80 group-hover:bg-black/10 dark:group-hover:bg-white/[0.08] transition-colors">{icon}</div>
      <span className="truncate">{label}</span>
    </button>
  )
}

type SidebarItemProps = {
  icon: ReactNode
  label: string
  to: string
  pathname: string
  className?: string // Added className prop to allow custom styling
}

const SidebarItem = ({ icon, label, to, pathname, className = '' }: SidebarItemProps) => {
  const navigate = useNavigate()
  const isActive = pathname === to
  return (
    <button
      onClick={() => navigate(to)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] transition-all duration-200 ease-out text-left relative group ${
        isActive ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:translate-x-1'
      } ${className}`} // Applied className prop
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary transition-all duration-200" />
      )}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/[0.04] text-gray-700 dark:text-white/80 group-hover:bg-black/10 dark:group-hover:bg-white/[0.08] transition-colors">{icon}</div>
      <span className="truncate">{label}</span>
    </button>
  )
}

type TeamItemProps = {
  icon: ReactNode
  label: string
  team: string
  activeView: string
  onTeamChange: (team: string) => void
}

const TeamItem = ({ icon, label, team, activeView, onTeamChange }: TeamItemProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const isActive = activeView === team && location.pathname === '/dashboard'
  
  const handleClick = () => {
    onTeamChange(team)
    navigate('/dashboard')
  }
  
  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] transition-all duration-200 ease-out text-left relative group ${
        isActive ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white' : 'text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:translate-x-1'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary transition-all duration-200" />
      )}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/[0.04] text-gray-700 dark:text-white/80 group-hover:bg-black/10 dark:group-hover:bg-white/[0.08] transition-colors">{icon}</div>
      <span className="truncate">{label}</span>
    </button>
  )
}