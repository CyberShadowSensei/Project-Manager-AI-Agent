import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export const WelcomePage = () => {
  const navigate = useNavigate()
  const [, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const [imagePositions, setImagePositions] = useState([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = (e.clientX - centerX) / rect.width
      const deltaY = (e.clientY - centerY) / rect.height
      
      setMousePos({ x: deltaX, y: deltaY })
      
      setImagePositions([
        { x: deltaX * 30, y: deltaY * 30 },
        { x: deltaX * 20, y: deltaY * 20 },
        { x: deltaX * 15, y: deltaY * 15 },
      ])
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleContinue = () => {
    navigate('/projects')
  }

  return (
    <div 
      ref={containerRef}
      className="min-h-screen w-full bg-[#050017] text-white flex flex-col items-center justify-center gap-8 px-8 py-12 relative overflow-hidden"
    >
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${imagePositions[0].x}px, ${imagePositions[0].y}px)`,
        }}
      >
        <div className="absolute top-20 left-20 w-64 h-64 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 opacity-40" />
      </div>
      
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${imagePositions[1].x}px, ${imagePositions[1].y}px)`,
        }}
      >
        <div className="absolute top-40 right-32 w-48 h-48 rounded-3xl bg-gradient-to-br from-secondary/20 to-indigo-500/20 opacity-30" />
      </div>
      
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-600 ease-out"
        style={{
          transform: `translate(${imagePositions[2].x}px, ${imagePositions[2].y}px)`,
        }}
      >
        <div className="absolute bottom-32 left-1/3 w-56 h-56 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-primary/20 opacity-35" />
      </div>

      <div className="w-full max-w-2xl rounded-2xl bg-[rgba(0,0,0,0.55)] backdrop-blur-2xl border border-white/[0.06] px-12 py-16 flex flex-col items-center text-center gap-6 animate-[fadeInUp_0.4s_ease-out] relative z-10">
        <h1 className="text-4xl font-semibold animate-[fadeInUp_0.5s_ease-out_0.1s_both]">Welcome</h1>
        <p className="text-muted text-lg animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
          Set up and manage your projects
        </p>
        <button
          onClick={handleContinue}
          className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium hover:scale-105 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] focus:outline-none focus:ring-2 focus:ring-primary/50 active:scale-95 transition-all duration-300 ease-out animate-[fadeInUp_0.5s_ease-out_0.3s_both]"
        >
          Continue
        </button>
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
      `}</style>
    </div>
  )
}

