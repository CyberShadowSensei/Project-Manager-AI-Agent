import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { WelcomePage } from './pages/WelcomePage'
import { ProjectsPage } from './pages/ProjectsPage' // Ensure this is imported
import { DashboardPage } from './pages/DashboardPage'
import { AssetsPage } from './pages/AssetsPage'
import { TasksPage } from './pages/TasksPage'
import { InboxPage } from './pages/InboxPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProjectProvider } from './context/ProjectContext'
import GlassmorphismCard from './components/ui/GlassmorphismCard'
import LandingPage from './pages/LandingPage' // Import LandingPage

function App() {
  return (
    <ProjectProvider> {/* Wrap the entire app with ProjectProvider */}
      <BrowserRouter>
        <div className="min-h-screen w-full bg-[#050017] text-white">
          <Routes>
            <Route path="/" element={<Navigate to="/welcome" replace />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/glassmorphism" element={<GlassmorphismCard />} />
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="assets" element={<AssetsPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/projects" element={<ProjectsPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ProjectProvider>
  )
}

export default App