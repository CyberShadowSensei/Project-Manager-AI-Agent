import { useState, useEffect, useCallback } from 'react'
import { useProject } from '../context/ProjectContext'
import { aiService, analyticsService, integrationService, type AIInsights, type Analytics } from '../services/api'
import { AlertTriangle, Lightbulb, RefreshCw, Send, ShieldCheck, Activity, Target, TrendingUp, CheckCircle2 } from 'lucide-react'

export const ReportsPage = () => {
  const { currentProject, riskLevel, refreshRisk, markReportViewed } = useProject()
  const [insights, setInsights] = useState<AIInsights | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [sendingSlack, setSendingSlack] = useState(false)

  // Mark report as viewed when mounting this page
  useEffect(() => {
    markReportViewed();
  }, [markReportViewed]);

  const fetchData = useCallback(async (force = false) => {
    if (!currentProject) return;
    setLoading(true)
    try {
      const [insightsRes, analyticsRes] = await Promise.all([
        aiService.getInsights(currentProject._id, force),
        analyticsService.getProjectAnalytics(currentProject._id)
      ]);
      setInsights(insightsRes.data)
      setAnalytics(analyticsRes.data.analytics)
      await refreshRisk()
    } catch (error) {
      console.error('Failed to fetch report data:', error)
    } finally {
      setLoading(false)
    }
  }, [currentProject, refreshRisk]);

  useEffect(() => {
    fetchData()
  }, [currentProject, fetchData])

  const handleSlackShare = async () => {
    if (!currentProject || !insights || !analytics) return;
    setSendingSlack(true);
    try {
        const message = `*Project Health Summary*\nScore: ${analytics.healthScore}%\nStatus: ${riskLevel} Risk\n\n${insights.summary}`;
        await integrationService.sendSlackAlert({
            projectId: currentProject._id,
            riskLevel: riskLevel,
            message: message
        });
        alert("Project Status Report shared to Slack!");
    } catch (err: any) {
        console.error(err);
        const errorMsg = err.response?.data?.message || "Failed to share report.";
        const techDetail = err.response?.data?.error ? `\n\nDetail: ${err.response.data.error}` : "";
        alert(`${errorMsg}${techDetail}`);
    } finally {
        setSendingSlack(false);
    }
  };

  if (!currentProject) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
                <ShieldCheck className="w-16 h-16 text-muted mx-auto opacity-20" />
                <p className="text-muted italic">Select a project to generate intelligence reports.</p>
            </div>
        </div>
    )
  }

  const score = analytics?.healthScore ?? 0;
  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-500';
    if (s >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-6xl mx-auto w-full">
      
      {/* Executive Summary Header */}
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
        
        {/* Health Gauge */}
        <div className="relative flex-shrink-0 w-40 h-40 flex items-center justify-center group">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-white/5"
                />
                <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * score) / 100}
                    strokeLinecap="round"
                    className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black tracking-tighter ${getScoreColor(score)}`}>{score}%</span>
                <span className="text-[10px] uppercase font-bold text-muted tracking-widest">Health Score</span>
            </div>
        </div>

        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted">
                    <Activity className="w-3 h-3 text-primary" />
                    Project Status: {riskLevel} Risk
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSlackShare}
                        disabled={sendingSlack || !insights}
                        className="h-9 px-4 rounded-xl bg-white text-black text-[11px] font-bold uppercase tracking-wider hover:bg-opacity-90 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                        <Send className="w-3.5 h-3.5" />
                        Share Status Report
                    </button>
                    <button 
                        onClick={() => fetchData(true)}
                        disabled={loading}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
                        title="Refresh Report"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">Executive Intelligence Summary</h2>
            <p className="text-sm text-slate-400 leading-relaxed italic">
                "{insights?.summary || "Compiling project metrics and AI context for an updated status summary..."}"
            </p>

            <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <Target className="w-4 h-4 text-indigo-400" />
                    <div>
                        <div className="text-[10px] text-muted uppercase font-bold">Velocity</div>
                        <div className="text-sm font-semibold">{analytics?.completionPercentage || 0}%</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <div>
                        <div className="text-[10px] text-muted uppercase font-bold">Total Tasks</div>
                        <div className="text-sm font-semibold">{analytics?.totalTasks || 0}</div>
                    </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <div>
                        <div className="text-[10px] text-muted uppercase font-bold">Blockers</div>
                        <div className="text-sm font-semibold">{analytics?.blockedCount || 0}</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Risk Factors Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Primary Risk Factors
            </h3>
          </div>
          
          <div className="grid gap-3">
            {loading ? (
              <div className="p-12 text-center text-muted animate-pulse italic border border-white/5 rounded-3xl">Analyzing risks...</div>
            ) : (insights?.deadlines?.overdue || []).length === 0 && (insights?.deadlines?.dueSoon || []).length === 0 ? (
              <div className="p-12 text-center text-green-500 font-medium border border-dashed border-green-500/20 bg-green-500/5 rounded-[2rem] flex flex-col items-center gap-3">
                <CheckCircle2 className="w-8 h-8" />
                <span className="text-sm uppercase tracking-wider font-bold">Project Integrity Secured</span>
              </div>
            ) : (
              <>
                {(insights?.deadlines?.overdue || []).map((item, idx) => (
                  <div key={idx} className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-all">
                    <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold text-red-400 uppercase tracking-tight flex items-center gap-1.5">
                            Critical Blocker
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-bold uppercase">Overdue</span>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                    <div className="text-xs text-muted leading-relaxed">System has flagged this task as a high-impact delay. Intervention required.</div>
                  </div>
                ))}
                {(insights?.deadlines?.dueSoon || []).map((item, idx) => (
                  <div key={idx} className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-yellow-500/30 transition-all">
                    <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold text-yellow-500 uppercase tracking-tight flex items-center gap-1.5">
                            Performance Warning
                        </span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 font-bold uppercase">Incoming</span>
                    </div>
                    <div className="text-sm font-semibold text-white mb-1">{item.title}</div>
                    <div className="text-xs text-muted leading-relaxed">Task deadline within 72-hour window. Verify resource availability.</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Action Plan Section */}
        <div className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-muted flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            Strategic Action Plan
          </h3>
          
          <div className="grid gap-3">
            {loading ? (
              <div className="p-12 text-center text-muted animate-pulse italic border border-white/5 rounded-3xl">Calculating strategy...</div>
            ) : (insights?.suggestedActions || []).length === 0 ? (
              <div className="p-12 text-center text-muted italic border border-dashed border-white/10 rounded-[2rem]">
                No immediate corrective actions recommended.
              </div>
            ) : (
              (insights?.suggestedActions || []).map((rec, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/10 hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase mb-2">
                    Action {idx + 1}
                  </div>
                  <div className="text-sm font-semibold text-white mb-1">{rec.action}</div>
                  <p className="text-xs text-muted leading-relaxed mb-3">{rec.reason}</p>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-400 uppercase tracking-widest cursor-pointer hover:text-indigo-300">
                    Acknowledge Strategy <Activity className="w-2.5 h-2.5" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

