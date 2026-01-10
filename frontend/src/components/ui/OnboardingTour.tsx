import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, FileText, CheckSquare, Activity, ShieldCheck } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  {
    title: "Welcome to PM AI Agent",
    description: "I am your intelligent project companion. I help you transform chaotic project documents into actionable plans and real-time insights.",
    icon: Sparkles,
  },
  {
    title: "AI Hub: Your Knowledge Base",
    description: "Upload PRDs, specs, or meeting notes here. I ingest these documents to understand the full context of your project.",
    icon: FileText,
  },
  {
    title: "Automated Task Extraction",
    description: "Save hours of planning. I can analyze your project docs and auto-generate structured tasks with priorities and team assignments.",
    icon: CheckSquare,
  },
  {
    title: "Real-time Health Intelligence",
    description: "Monitor your Project Health Score. I'll automatically flag risks and overdue items so you can focus on what matters most.",
    icon: Activity,
  },
  {
    title: "Ready to Lead?",
    description: "You're all set. Select or create a project to begin your journey toward automated project management perfection.",
    icon: ShieldCheck,
  }
];

export const OnboardingTour: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // We use a versioned key so you can force-reset it for all users if you update the tour later
    const hasSeenTour = localStorage.getItem('pm_ai_onboarding_v1');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('pm_ai_onboarding_v1', 'true');
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
      <div className="w-full max-w-lg bg-[#0F111A]/90 border border-white/10 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
        
        {/* Progress Bar at the very top */}
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
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
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
