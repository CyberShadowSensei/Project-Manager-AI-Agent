import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export const Layout = () => {
  const location = useLocation()
  const [activeTeam, setActiveTeam] = useState<string | null>(null)
  
  return (
    <div className="flex w-full h-screen">
      <div className="w-[240px] border-r border-white/5">
        <Sidebar activeTeam={activeTeam} onTeamChange={setActiveTeam} />
      </div>
      <div className="flex-1 flex flex-col px-8 py-7 gap-6 overflow-auto">
        <Header pagePath={location.pathname} />
        <Outlet context={{ activeTeam }} />
      </div>
    </div>
  )
}

