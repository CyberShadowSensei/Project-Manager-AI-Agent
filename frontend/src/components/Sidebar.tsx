import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Settings, Image, Users, CheckSquare, Mail, BarChart3, Plus, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useProject } from '../context/ProjectContext' // Import the ProjectContext
import { Modal } from './ui/Modal'
import { CreateProjectForm } from './forms/CreateProjectForm'

type SidebarProps = {
  activeTeam?: string | null
  onTeamChange?: (team: string | null) => void
}

export const Sidebar = ({ activeTeam, onTeamChange }: SidebarProps) => {
  const location = useLocation()
  const { projects, currentProject, setCurrentProject, loadingProjects, refreshProjects } = useProject()
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isProjectListOpen, setIsProjectListOpen] = useState(false)

  const handleProjectCreated = () => {
    setIsProjectModalOpen(false)
    refreshProjects() // Refresh the project list after a new project is created
  }

  return (
    <div className="flex flex-col h-full px-5 py-6 text-xs text-muted">
      <div className="relative mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={() => setIsProjectListOpen(!isProjectListOpen)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border border-white/50" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-white group-hover:text-primary transition-colors">
                {currentProject ? currentProject.name : (loadingProjects ? 'Loading...' : 'No Project Selected')}
              </div>
              <div className="text-[10px] text-muted">Free Plan</div>
            </div>
          </div>
          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[10px] hover:bg-white/10 transition-colors">
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>

        {/* Project Dropdown */}
        {isProjectListOpen && (
          <div className="absolute top-12 left-0 w-full bg-[#1A1D2D] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
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
                    className={`px-4 py-2 hover:bg-white/5 cursor-pointer text-white truncate ${currentProject?._id === p._id ? 'bg-white/5 text-primary' : ''}`}
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
              className="px-4 py-2 border-t border-white/10 flex items-center gap-2 text-primary hover:bg-white/5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Create Project</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-hidden flex flex-col gap-5">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted mb-1.5">Main Menu</div>
          <SidebarItem icon={<Home className="w-3.5 h-3.5" />} label="Dashboard" to="/dashboard" pathname={location.pathname} />
          <SidebarItem icon={<CheckSquare className="w-3.5 h-3.5" />} label="Tasks" to="/tasks" pathname={location.pathname} />
          <SidebarItem icon={<Mail className="w-3.5 h-3.5" />} label="Inbox" to="/inbox" pathname={location.pathname} />
          <SidebarItem icon={<BarChart3 className="w-3.5 h-3.5" />} label="Reports" to="/reports" pathname={location.pathname} />
        </div>

        {/* Settings */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted mb-1.5">Settings</div>
          <SidebarItem icon={<Settings className="w-3.5 h-3.5" />} label="Settings" to="/settings" pathname={location.pathname} />
        </div>

        {/* Teams (mocked for now, will integrate with actual team data later) */}
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-[0.18em] text-muted mb-1.5">Teams</div>
          <TeamItem icon={<Users className="w-3.5 h-3.5" />} label="Marketing" team="Marketing" activeTeam={activeTeam} onTeamChange={onTeamChange} />
          <TeamItem icon={<Users className="w-3.5 h-3.5" />} label="Development" team="Development" activeTeam={activeTeam} onTeamChange={onTeamChange} />
          <TeamItem icon={<Users className="w-3.5 h-3.5" />} label="Design" team="Design" activeTeam={activeTeam} onTeamChange={onTeamChange} />
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5">
        <SidebarItem icon={<Image className="w-3.5 h-3.5" />} label="Assets" to="/assets" pathname={location.pathname} />
      </div>

      {/* Create Project Modal */}
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

type SidebarItemProps = {
  icon: ReactNode
  label: string
  to: string
  pathname: string
}

const SidebarItem = ({ icon, label, to, pathname }: SidebarItemProps) => {
  const navigate = useNavigate()
  const isActive = pathname === to
  return (
    <button
      onClick={() => navigate(to)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] transition-all duration-200 ease-out text-left relative group ${
        isActive ? 'bg-white/10 text-white' : 'text-muted hover:bg-white/5 hover:translate-x-1'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary transition-all duration-200" />
      )}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/80 group-hover:bg-white/[0.08] transition-colors">{icon}</div>
      <span className="truncate">{label}</span>
    </button>
  )
}

type TeamItemProps = {
  icon: ReactNode
  label: string
  team: string
  activeTeam?: string | null
  onTeamChange?: (team: string | null) => void
}

const TeamItem = ({ icon, label, team, activeTeam, onTeamChange }: TeamItemProps) => {
  const navigate = useNavigate()
  const isActive = activeTeam === team
  
  const handleClick = () => {
    if (onTeamChange) {
      onTeamChange(isActive ? null : team)
    }
    navigate('/dashboard')
  }
  
  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] transition-all duration-200 ease-out text-left relative group ${
        isActive ? 'bg-white/10 text-white' : 'text-muted hover:bg-white/5 hover:translate-x-1'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary transition-all duration-200" />
      )}
      <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] text-white/80 group-hover:bg-white/[0.08] transition-colors">{icon}</div>
      <span className="truncate">{label}</span>
    </button>
  )
}


