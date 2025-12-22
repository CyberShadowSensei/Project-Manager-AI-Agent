import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useProject } from '../context/ProjectContext'
import { Modal } from '../components/ui/Modal'
import { CreateProjectForm } from '../components/forms/CreateProjectForm'
import { type Project } from '../services/api' // Use type import

export const ProjectsPage = () => {
  const navigate = useNavigate()
  const { projects, loadingProjects, setCurrentProject, refreshProjects } = useProject()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase() || '')
  )

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project)
    navigate('/dashboard')
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(filteredProjects.length - 1, prev + 1))
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (carouselRef.current) {
      const cardWidth = 320 + 24
      const scrollLeft = carouselRef.current.scrollLeft
      const newIndex = Math.round(scrollLeft / cardWidth)
      setCurrentIndex(Math.max(0, Math.min(newIndex, filteredProjects.length - 1)))
    }
  }

  useEffect(() => {
    if (carouselRef.current && filteredProjects.length > 0) {
      const cardWidth = 320 + 24
      carouselRef.current.scrollTo({
        left: currentIndex * cardWidth,
        behavior: 'smooth'
      })
    }
  }, [currentIndex, filteredProjects.length])

  if (loadingProjects) {
    return (
      <div className="min-h-screen w-full bg-[#050017] text-white flex items-center justify-center">
        <div className="text-lg text-muted animate-pulse">Loading projects...</div>
      </div>
    )
  }

  return (
    <div 
      ref={carouselRef}
      className="min-h-screen w-full bg-[#050017] text-white flex flex-col items-center justify-center gap-8 px-8 py-12"
    >
      <div className="w-full max-w-6xl rounded-2xl bg-[rgba(0,0,0,0.55)] backdrop-blur-2xl border border-white/[0.06] px-12 py-16 flex flex-col gap-6 animate-[fadeInUp_0.4s_ease-out]">
        <div className="animate-[fadeInUp_0.5s_ease-out_0.1s_both] flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-semibold mb-2">Projects</h1>
            <p className="text-muted text-lg">Select a project to continue</p>
          </div>
          <button 
            onClick={() => setIsCreateProjectModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 transition-all duration-300 ease-out flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </button>
        </div>
        
        <div className="mb-4 animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/[0.06] text-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-white/20 transition-all duration-200"
          />
        </div>

        {filteredProjects.length > 0 ? (
          <div className="relative">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center hover:bg-white/8 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 ease-out"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div
                ref={carouselRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`flex-1 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
                  {filteredProjects.map((project, _index) => (
                    <div
                      key={project._id}
                      className={`w-80 flex-shrink-0 rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-300 ease-out snap-center animate-[fadeInUp_0.5s_ease-out_calc(0.3s_+_${_index * 0.1}s)_both]`}
                    >
                      <button
                        onClick={() => handleProjectClick(project)}
                        className="w-full text-left"
                      >
                        <div 
                          className="w-full h-48"
                          style={{ background: project.image || 'linear-gradient(135deg, #A855F7 0%, #EC4899 100%)' }}
                        />
                        <div className="p-5">
                          <div className="text-xl font-semibold mb-2">{project.name}</div>
                          <div className="text-xs text-muted mb-3">Created on {new Date(project.createdAt || '').toLocaleDateString()}</div>
                          <div className="text-sm text-muted mb-3 line-clamp-2">
                            Starts: {new Date(project.startDate).toLocaleDateString()} / Ends: {new Date(project.endDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-primary">
                              {new Date(project.endDate) < new Date() ? 'Completed' : 'Active'}
                            </span>
                          </div>
                        </div>
                      </button>
                      <div className="px-5 pb-5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // TODO: Implement Edit Project Modal
                            console.log('Edit project', project._id)
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/[0.06] text-sm text-muted hover:bg-white/8 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 transition-all duration-200 ease-in-out"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleNext}
                disabled={currentIndex === filteredProjects.length - 1}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/[0.06] flex items-center justify-center hover:bg-white/8 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 ease-out"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted">
            No projects found. Click "Create Project" to get started!
          </div>
        )}
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Create Project Modal */}
      {isCreateProjectModalOpen && (
        <Modal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          title="Create New Project"
        >
          <CreateProjectForm
            onSuccess={() => {
              setIsCreateProjectModalOpen(false);
              refreshProjects(); // Refresh project list after creation
            }}
            onCancel={() => setIsCreateProjectModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  )
}
