import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles, FileText, CheckSquare, Activity, ShieldCheck } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  targetId: string;
}

const steps: Step[] = [
  {
    title: "Project Command Center",
    description: "This is your Dashboard. It provides a high-level summary of your project health and recent activity.",
    icon: Sparkles,
    route: '/dashboard',
    targetId: 'tour-dashboard'
  },
  {
    title: "AI Hub: Knowledge Base",
    description: "Here in the AI Hub, you can upload project documents (PRDs, specs, notes). This gives the AI the context it needs to assist you.",
    icon: FileText,
    route: '/assets',
    targetId: 'tour-ai-hub'
  },
  {
    title: "Project Health & Intelligence",
    description: "The Reports page calculates a real-time Health Score and flags specific risk factors using AI analysis.",
    icon: Activity,
    route: '/reports',
    targetId: 'tour-reports'
  },
  {
    title: "Comprehensive Task Manager",
    description: "Manage your execution plan here. You can filter by team, track status, and even auto-generate tasks from your docs.",
    icon: CheckSquare,
    route: '/tasks',
    targetId: 'tour-tasks'
  },
  {
    title: "Ready to Execute",
    description: "You've seen the core tools. Use the AI Assistant 💬 in the corner anytime you need advice or a status update.",
    icon: ShieldCheck,
    route: '/dashboard',
    targetId: 'tour-chat'
  }
];

export const OnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pointerPos, setPointerPos] = useState({ top: 0, left: 0, opacity: 0 });
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Check if seen v7
    const hasSeenTour = localStorage.getItem('pm_ai_onboarding_v7');
    if (!hasSeenTour && currentProject) {
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentProject]);

  // Effect to navigate when step changes, skipping initial mount
  useEffect(() => {
    if (isOpen) {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        navigate(steps[currentStep].route);
    }
  }, [currentStep, isOpen, navigate]);

  // Effect to update pointer position based on target element
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
        const target = document.getElementById(steps[currentStep].targetId);
        if (target) {
            const rect = target.getBoundingClientRect();
            // Center the dot on the element
            setPointerPos({
                top: rect.top + rect.height / 2,
                left: rect.left + rect.width / 2,
                opacity: 1
            });
        } else {
            setPointerPos(prev => ({ ...prev, opacity: 0 }));
        }
    };

    // Initial position
    updatePosition();

    // Re-check after small delays to account for navigation/rendering
    const timer = setTimeout(updatePosition, 100);
    const timer2 = setTimeout(updatePosition, 600);

    window.addEventListener('resize', updatePosition);
    return () => {
        window.removeEventListener('resize', updatePosition);
        clearTimeout(timer);
        clearTimeout(timer2);
    };
  }, [currentStep, isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('pm_ai_onboarding_v7', 'true');
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-8 pointer-events-none">
      {/* Reduced darkness and removed blur to keep the background sharp */}
      <div className="absolute inset-0 bg-black/20 transition-all duration-500" />

      {/* Dynamic Spotlight Pointer (Pulsing Dot with Smooth Transition) */}
      <div 
        className="fixed transition-all duration-700 ease-in-out pointer-events-none z-[110]"
        style={{ 
            top: pointerPos.top, 
            left: pointerPos.left, 
            opacity: pointerPos.opacity,
            transform: 'translate(-50%, -50%)' 
        }}
      >
        {/* Pulsing Ring */}
        <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full border-2 border-primary animate-ping opacity-75" />
        <div className="w-4 h-4 rounded-full bg-primary shadow-[0_0_25px_rgba(168,85,247,1)] border-2 border-white/20" />
      </div>

      <div className="w-full max-w-lg bg-[#0F111A]/80 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-10 fade-in duration-500 pointer-events-auto">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 flex gap-1 px-6 pt-6">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                idx <= currentStep ? 'bg-primary shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Top Actions */}
        <div className="flex justify-end p-6 pt-10">
          <button 
            onClick={handleClose}
            className="text-[10px] font-bold uppercase tracking-widest text-muted hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-full border border-white/5"
          >
            Skip Tour
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 px-10 pb-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center mb-8 shadow-2xl">
            <CurrentIcon className="w-10 h-10 text-primary animate-pulse" />
          </div>
          
          <div className="space-y-3 mb-10">
            <div className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/80">
              Module {currentStep + 1} of {steps.length}
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              {steps[currentStep].title}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-sm mx-auto">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 text-sm font-semibold transition-all ${
              currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-muted hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="group relative px-8 py-3 rounded-2xl bg-primary text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            <span className="relative flex items-center gap-2">
              {currentStep === steps.length - 1 ? "Start Managing" : "Continue"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
            </span>
          </button>
        </div>

      </div>
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
