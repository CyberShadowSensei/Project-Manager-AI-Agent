import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { AnalyticsRow } from './AnalyticsRow'
import { BottomRow } from './BottomRow'

export const Dashboard = () => {
  const [searchQuery] = useState('')
  const location = useLocation()

  return (
    <div className="flex w-full h-full">
      <div className="w-[240px] border-r border-white/5">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col px-8 py-7 gap-6">
        <Header pagePath={location.pathname} />
        <AnalyticsRow />
        <BottomRow searchQuery={searchQuery} />
      </div>
    </div>
  )
}


