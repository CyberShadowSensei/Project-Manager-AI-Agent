import { useState, useEffect, useCallback } from 'react'
import { useProject } from '../context/ProjectContext'
import { aiService, integrationService, type AIInsights } from '../services/api'
import { AlertTriangle, Lightbulb, RefreshCw, Radio, Send, Zap, ShieldAlert, CheckCircle2 } from 'lucide-react'

export const ReportsPage = () => {
  const { currentProject, riskLevel, refreshRisk } = useProject()
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [sendingSlack, setSendingSlack] = useState(false)

  const fetchInsights = useCallback(async () => {
    if (!currentProject) {
      setInsights(null);
      return;
    }
    setLoading(true)
    try {
      const response = await aiService.getInsights(currentProject._id)
      setInsights(response.data)
      await refreshRisk() // Sync global risk level
    } catch (error) {
      console.error('Failed to fetch AI insights:', error)
      setInsights(null);
    } finally {
      setLoading(false)
    }
  }, [currentProject, refreshRisk]);

  useEffect(() => {
    fetchInsights()
  }, [currentProject, fetchInsights])

  const handleSlackAlert = async () => {
    if (!currentProject || !insights) return;
    setSendingSlack(true);
    try {
        await integrationService.sendSlackAlert({
            project: currentProject.name,
            riskLevel: riskLevel,
            message: insights.summary
        });
        alert("Emergency Alert Blasted to Slack!");
    } catch (err) {
        console.error(err);
        alert("Failed to send Slack alert. Check your configuration.");
    } finally {
        setSendingSlack(false);
    }
  };

  if (!currentProject) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
                <ShieldAlert className="w-16 h-16 text-muted mx-auto opacity-20" />
                <p className="text-muted italic">Select a project to activate the War Room.</p>
            </div>
        </div>
    )
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
      case 'Medium': return 'text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
      case 'Low': return 'text-green-500'
      default: return 'text-muted'
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Top Section: Radar & Emergency Header */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/50 border border-white/10 p-8 flex flex-col md:flex-row items-center gap-12">
        {/* The Radar UI */}
        <div className="relative w-48 h-48 flex-shrink-0">
            {/* Outer rings */}
            <div className="absolute inset-0 rounded-full border border-indigo-500/20" />
            <div className="absolute inset-4 rounded-full border border-indigo-500/10" />
            <div className="absolute inset-12 rounded-full border border-indigo-500/5" />
            
            {/* The Beam */}
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(99,102,241,0.2)_90deg,transparent_100deg)] animate-[spin_4s_linear_infinite]" />
            
            {/* Center Point */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${riskLevel === 'High' ? 'bg-red-500 animate-pulse' : 'bg-indigo-500'}`} />
            
            {/* Grid Lines */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-indigo-500/10" />
            <div className="absolute left-1/2 top-0 w-[1px] h-full bg-indigo-500/10" />

            {/* Scanning Label */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-900 border border-indigo-500/30 text-[8px] uppercase tracking-widest text-indigo-400 font-bold whitespace-nowrap">
                {loading ? 'Scanning Context...' : 'System Active'}
            </div>
        </div>

        <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
                <Radio className={`w-5 h-5 ${riskLevel === 'High' ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} />
                <h2 className="text-2xl font-bold tracking-tight uppercase">AI Threat Analysis</h2>
            </div>
            
            <div className="flex flex-wrap gap-4">
                <div className={`px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1 min-w-[140px] ${getRiskColor(riskLevel)}`}>
                    <span className="text-[10px] uppercase font-bold text-muted opacity-70">Threat Level</span>
                    <span className="text-lg font-black tracking-widest">{riskLevel.toUpperCase()}</span>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-1 min-w-[140px]">
                    <span className="text-[10px] uppercase font-bold text-muted opacity-70">Active Hazards</span>
                    <span className="text-lg font-black text-white">{(insights?.deadlines?.overdue?.length || 0) + (insights?.deadlines?.dueSoon?.length || 0)}</span>
                </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                {insights?.summary || "Initializing deep scan of project parameters, task dependencies, and documentation context..."}
            </p>

            <div className="flex gap-3 pt-2">
                <button 
                    onClick={handleSlackAlert}
                    disabled={sendingSlack || !insights}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-red-600/20 active:scale-95 disabled:opacity-50"
                >
                    <Send className="w-3.5 h-3.5" />
                    Blast Alert to Slack
                </button>
                <button 
                    onClick={fetchInsights}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Scan
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Identified Hazards Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-red-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-xs">Identified Hazards</h3>
          </div>
          
          <div className="grid gap-4">
            {loading ? (
              <div className="p-12 text-center text-muted animate-pulse italic border border-white/5 rounded-3xl">Analyzing hazards...</div>
            ) : (insights?.deadlines?.overdue || []).length === 0 && (insights?.deadlines?.dueSoon || []).length === 0 ? (
              <div className="p-12 text-center text-green-400 font-medium border border-dashed border-green-500/20 bg-green-500/5 rounded-3xl flex flex-col items-center gap-3">
                <CheckCircle2 className="w-8 h-8" />
                <span>No Critical Threats Detected</span>
              </div>
            ) : (
              <>
                {(insights?.deadlines?.overdue || []).map((item, idx) => (
                  <div key={idx} className="rounded-3xl bg-red-500/5 border border-red-500/20 p-6 space-y-3 relative overflow-hidden group hover:bg-red-500/10 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="flex items-center justify-between relative z-10">
                      <div className="font-bold text-red-400 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        CRITICAL: {item.title}
                      </div>
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-red-500 text-white uppercase">Overdue</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed relative z-10">This task is currently blocking project flow. Immediate team intervention required to prevent schedule slippage.</p>
                  </div>
                ))}
                {(insights?.deadlines?.dueSoon || []).map((item, idx) => (
                  <div key={idx} className="rounded-3xl bg-yellow-500/5 border border-yellow-500/20 p-6 space-y-3 hover:bg-yellow-500/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-yellow-500 flex items-center gap-2">
                        <Radio className="w-4 h-4" />
                        WARNING: {item.title}
                      </div>
                      <span className="px-3 py-1 rounded-lg text-[9px] font-black bg-yellow-500 text-black uppercase">Due Soon</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Incoming deadline. Ensure assignee is notified and capacity is verified.</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Countermeasures Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-indigo-400">
            <Zap className="w-5 h-5" />
            <h3 className="font-bold uppercase tracking-widest text-xs">AI Countermeasures</h3>
          </div>
          
          <div className="grid gap-4">
            {loading ? (
              <div className="p-12 text-center text-muted animate-pulse italic border border-white/5 rounded-3xl">Calculating countermeasures...</div>
            ) : (insights?.suggestedActions || []).length === 0 ? (
              <div className="p-12 text-center text-muted italic border border-dashed border-white/10 rounded-3xl">
                Scan complete. No specific actions required at this time.
              </div>
            ) : (
              (insights?.suggestedActions || []).map((rec, idx) => (
                <div key={idx} className="rounded-3xl bg-indigo-500/5 border border-indigo-500/20 p-6 space-y-3 hover:bg-indigo-500/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="font-bold text-white flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-indigo-400" />
                        {rec.action}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{rec.reason}</p>
                  <button className="text-[10px] text-indigo-400 font-bold hover:text-indigo-300 uppercase tracking-widest flex items-center gap-1 transition-colors">
                    Implement Strategy <Radio className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

