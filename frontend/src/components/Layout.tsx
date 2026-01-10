import { useState, useMemo, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useProject } from '../context/ProjectContext'

export const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentProject, loadingProjects } = useProject()
  const [activeView, setActiveView] = useState('dashboard') // 'dashboard' or team name
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    // Protect layout routes - require an active project
    if (!loadingProjects && !currentProject) {
      navigate('/projects');
    }
  }, [currentProject, loadingProjects, navigate]);

  useEffect(() => {
    const savedProfilePicture = localStorage.getItem('profilePicture')
    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture)
    }
  }, []) // Run once on mount to get initial profile picture
  
  // Also listen for changes in localStorage from other components (like SettingsPage)
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedProfilePicture = localStorage.getItem('profilePicture')
      setProfilePicture(updatedProfilePicture)
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const activeTeam = useMemo(() => {
    if (activeView === 'dashboard' || location.pathname !== '/dashboard') {
      return null
    }
    return activeView
  }, [activeView, location.pathname])
  
  return (
    <div className="flex w-full h-screen">
      <div className="w-[240px] border-r border-white/5">
        <Sidebar activeView={activeView} onTeamChange={setActiveView} profilePicture={profilePicture} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 px-8 py-7 gap-6 overflow-auto">
        <Header pagePath={location.pathname} />
        <Outlet context={{ activeTeam }} />
      </div>
    </div>
  )
}
