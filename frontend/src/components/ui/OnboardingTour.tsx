import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles, FileText, CheckSquare, Activity, ShieldCheck, X } from 'lucide-react';
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

// Using a stable key that is cleared by the Reset button in SettingsPage
const ONBOARDING_KEY = 'pm_ai_onboarding_v3';

export const OnboardingTour: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [pointerPos, setPointerPos] = useState({ top: 0, left: 0, opacity: 0 });
  const [hasTriggered, setHasTriggered] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProject } = useProject();
  const requestRef = useRef<number>(null);

  // 1. Trigger Logic
  useEffect(() => {
    // Only check if we haven't triggered in this session mount
    if (!currentProject?._id || hasTriggered || isVisible) return;

    const isCompleted = localStorage.getItem(ONBOARDING_KEY);
    
    if (!isCompleted) {
      console.log(`[Onboarding] Conditions met for project ${currentProject.name}. Triggering in 2s...`);
      
      const timer = setTimeout(() => {
        // Double check completion state right before opening
        if (!localStorage.getItem(ONBOARDING_KEY)) {
            console.log("[Onboarding] Opening tour now.");
            setIsVisible(true);
            setHasTriggered(true);
        }
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [currentProject?._id, hasTriggered, isVisible]);

  // 2. Navigation Logic: Sync step with route
  useEffect(() => {
    if (isVisible) {
      const targetRoute = steps[currentStep].route;
      if (location.pathname !== targetRoute) {
        console.log(`[Onboarding] Step ${currentStep}: Navigating to ${targetRoute}`);
        navigate(targetRoute);
      }
    }
  }, [currentStep, isVisible, navigate, location.pathname]);

  // 3. Spotlight Tracking: High-frequency position sync
  const updatePointer = useCallback(() => {
    if (!isVisible) return;

    const targetId = steps[currentStep].targetId;
    const element = document.getElementById(targetId);

    if (element) {
      const rect = element.getBoundingClientRect();
      setPointerPos({
        top: rect.top + rect.height / 2,
        left: rect.left + rect.width / 2,
        opacity: 1
      });
    } else {
      // If target is missing (e.g. during navigation), hide spotlight
      setPointerPos(prev => ({ ...prev, opacity: 0 }));
    }

    requestRef.current = requestAnimationFrame(updatePointer);
  }, [currentStep, isVisible]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePointer);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updatePointer]);

  const handleClose = () => {
    console.log("[Onboarding] Tour closed/finished. Saving state.");
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsVisible(false);
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

  if (!isVisible) return null;

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-8 pointer-events-none font-sans">
      {/* Fully Transparent Overlay as requested */}
      <div className="absolute inset-0 bg-transparent" />

      {/* High-Fidelity Spotlight */}
      <div 
        className="fixed transition-all duration-500 ease-out pointer-events-none z-[110]"
        style={{ 
            top: pointerPos.top, 
            left: pointerPos.left, 
            opacity: pointerPos.opacity,
            transform: 'translate(-50%, -50%)' 
        }}
      >
        <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full border-2 border-primary animate-ping opacity-50" />
        <div className="w-5 h-5 rounded-full bg-primary shadow-[0_0_30px_rgba(168,85,247,1)] border-2 border-white" />
      </div>

      {/* Tour Card */}
      <div className="w-full max-w-lg bg-[#0F111A]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_0_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-12 fade-in duration-700 pointer-events-auto">
        
        {/* Progress Line */}
        <div className="absolute top-0 left-0 w-full h-1 flex gap-0.5">
          {steps.map((_, idx) => (
            <div 
              key={idx}
              className={`h-full flex-1 transition-all duration-1000 ${
                idx <= currentStep ? 'bg-primary shadow-[0_0_15px_rgba(168,85,247,0.8)]' : 'bg-white/5'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-0">
          <div className="text-[10px] uppercase font-black tracking-[0.2em] text-primary/80">
            Guided Onboarding • Module {currentStep + 1}
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-white/5 text-muted hover:text-white transition-all"
            title="Skip Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-10 py-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary/30 to-secondary/30 border border-white/10 flex items-center justify-center mb-8 shadow-inner transform rotate-3">
            <CurrentIcon className="w-12 h-12 text-white animate-pulse" />
          </div>
          
          <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
            {steps[currentStep].title}
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Footer */}
        <div className="p-8 pt-0 flex items-center justify-between">
          <button
            onClick={handlePrev}
            className={`flex items-center gap-2 text-sm font-bold transition-all px-4 py-2 rounded-xl hover:bg-white/5 ${
              currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-muted hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            className="group relative px-10 py-4 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(168,85,247,0.4)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            <span className="relative flex items-center gap-2">
              {currentStep === steps.length - 1 ? "Finish" : "Next Module"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
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
