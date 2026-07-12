import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { CapabilityRiskWidget } from '../components/CapabilityRiskWidget';
import { DashboardStats, api } from '../utils/api';
import { SkeletonCard } from '../components/LoadingSkeleton';
import {
  Users,
  Compass,
  Star,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Search,
  Activity,
  TrendingUp,
  BrainCircuit,
  FolderGit,
  Calendar,
  Plus
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface DashboardProps {
  stats: DashboardStats;
  setActiveTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, setActiveTab }) => {
  const [predictiveReport, setPredictiveReport] = useState<any | null>(null);
  const [loadingPredictive, setLoadingPredictive] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Fetch predictive report
  useEffect(() => {
    const fetchPredictive = async () => {
      setLoadingPredictive(true);
      try {
        const data = await api.getPredictiveReport();
        setPredictiveReport(data);
      } catch (err) {
        console.error('Failed to load predictive stats:', err);
      } finally {
        setLoadingPredictive(false);
      }
    };
    if (stats.totalEmployees > 0) {
      fetchPredictive();
    }
  }, [stats.totalEmployees]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-card border border-border p-3 rounded-md shadow-card">
          <p className="text-xs font-bold text-text-primary mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-xs font-semibold" style={{ color: item.color || item.fill }}>
              {item.name}: {item.value}{item.name.includes('Cost') || item.name.includes('₹') ? '' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await api.exportReport('dashboard', {}, format);
    } catch (err) {
      console.error(err);
      alert('Export failed');
    }
  };

  if (stats.totalEmployees === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center">
        <div className="w-20 h-20 bg-surface-sunken rounded-full flex items-center justify-center mb-6">
          <Users className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-2">No employees yet</h2>
        <p className="text-sm text-text-secondary max-w-md mb-8">
          Your organization is currently empty. Add your first team member to start generating insights, tracking costs, and analyzing workforce capability.
        </p>
        <button
          onClick={() => {
            if (setActiveTab) setActiveTab('employees');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Header / Executive Assist */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-card p-4 rounded-md border border-border shadow-card">
        <div>
          <h3 className="font-semibold text-lg text-text-primary flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-brand" />
            Executive Command Center
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">TalentGraph workforce intelligence operating system control hub.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1.5 bg-surface-card hover:bg-surface-sunken text-text-secondary hover:text-text-primary border border-border rounded-md text-xs font-medium transition-all"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-1.5 bg-surface-card hover:bg-surface-sunken text-text-secondary hover:text-text-primary border border-border rounded-md text-xs font-medium transition-all"
            >
              Export PDF
            </button>
          </div>

          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Query department capabilities..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-full bg-surface-sunken border border-border rounded-md text-xs py-2 pl-9 pr-4 text-text-primary placeholder:text-text-muted focus:border-brand focus:ring-1 focus:ring-brand outline-none"
            />
          </div>
          <button
            onClick={() => {
              if (setActiveTab) setActiveTab('employees');
            }}
            className="px-4 py-2 bg-brand-tint text-brand hover:bg-brand hover:text-white border border-brand/20 rounded-md text-xs font-medium transition-all shrink-0"
          >
            Skill Search
          </button>
        </div>
      </div>

      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-text-secondary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Total Headcount</p>
            <h3 className="font-mono font-bold text-2xl text-text-primary mt-1">{stats.totalEmployees}</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center shrink-0">
            <Compass className="w-4 h-4 text-text-secondary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Avg Experience</p>
            <h3 className="font-mono font-bold text-2xl text-text-primary mt-1">{stats.avgExperience} yrs</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center space-x-4">
          <div className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-text-secondary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Avg Performance</p>
            <h3 className="font-mono font-bold text-2xl text-text-primary mt-1">{stats.avgPerformance}/5.0</h3>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">Capability Score</p>
            <h3 className="font-mono font-bold text-2xl text-brand mt-1">{stats.capabilityScore}%</h3>
          </div>
          <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center">
            <span className="text-[10px] font-bold text-text-muted">OS</span>
          </div>
        </GlassCard>
      </div>

      {/* Financial Intelligence Row */}
      {loadingPredictive ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard />
          <div className="col-span-1 md:col-span-2">
            <SkeletonCard />
          </div>
        </div>
      ) : predictiveReport?.benchCostIntelligence && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="flex flex-col justify-between border-l-4 border-l-brand">
            <div>
              <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Current Bench Cost</p>
              <h3 className="font-mono font-bold text-3xl text-text-primary mt-2">
                ₹{predictiveReport.benchCostIntelligence.currentBenchCost.toLocaleString('en-IN')}
              </h3>
              <p className="text-[11px] text-text-muted mt-2">Monthly idle cost (Total cost rates of unallocated capacity)</p>
            </div>
            <div className="mt-6">
              <h5 className="text-xs font-semibold text-text-primary mb-2 border-b border-border pb-1">Cost by Department</h5>
              <div className="space-y-2 mt-3">
                {predictiveReport.benchCostIntelligence.costByDepartment.map((dept: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">{dept.department}</span>
                    <span className="font-mono font-semibold text-text-primary">₹{dept.cost.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          <GlassCard className="col-span-1 md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-text-primary flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand" />
                  Bench Cost Trend
                </h4>
                <span className="px-1.5 py-0.5 rounded-full bg-ai-tint text-ai-accent text-[9px] font-bold uppercase tracking-wider border border-ai-accent/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Forecast
                </span>
              </div>
              <p className="text-xs text-text-muted">Predicted financial impact of unallocated resources based on current project end dates.</p>
            </div>
            <div className="h-48 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveReport.benchCostIntelligence.benchCostTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="period" stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${(val/1000)}k`} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="Projected Cost (₹)" stroke="var(--ai-accent)" fill="var(--ai-accent)" fillOpacity={0.08} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Row 2: Attrition Forecast & Skill Decay Area Charts */}
      {loadingPredictive ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : predictiveReport && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <GlassCard className="flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-text-primary flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-danger" />
                  Attrition Risk
                </h4>
                <span className="px-1.5 py-0.5 rounded-full bg-ai-tint text-ai-accent text-[9px] font-bold uppercase tracking-wider border border-ai-accent/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Forecast
                </span>
              </div>
              <p className="text-xs text-text-muted">Predicted disengagement trends</p>
            </div>
            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveReport.attrition.attritionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="period" stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="Risk Score" stroke="var(--ai-accent)" fill="var(--ai-accent)" fillOpacity={0.08} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-text-primary flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-warning" />
                  Skill Decay Risk
                </h4>
                <span className="px-1.5 py-0.5 rounded-full bg-ai-tint text-ai-accent text-[9px] font-bold uppercase tracking-wider border border-ai-accent/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Forecast
                </span>
              </div>
              <p className="text-xs text-text-muted">Forecast of technical knowledge decay</p>
            </div>
            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveReport.skillDecay.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="period" stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="Decay Rate" stroke="var(--ai-accent)" fill="var(--ai-accent)" fillOpacity={0.08} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard className="flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-text-primary flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-brand" />
                  Bench Utilization
                </h4>
                <span className="px-1.5 py-0.5 rounded-full bg-ai-tint text-ai-accent text-[9px] font-bold uppercase tracking-wider border border-ai-accent/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Forecast
                </span>
              </div>
              <p className="text-xs text-text-muted">Utilization calculated against active workstreams</p>
            </div>
            <div className="h-60 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveReport.benchUtilization.sixMonthForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="period" stroke="var(--text-muted)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="Utilization" stroke="var(--ai-accent)" fill="var(--ai-accent)" fillOpacity={0.08} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Row 2.5: Portfolio Health & Project Activity Cockpit */}
      {stats.projectStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio Health and Health Distribution */}
          <GlassCard className="flex flex-col justify-between min-h-[350px]">
            <div>
              <h4 className="font-semibold text-sm text-text-primary mb-1 flex items-center gap-1.5">
                <FolderGit className="w-4 h-4 text-brand" />
                Portfolio Health & Distribution
              </h4>
              <p className="text-xs text-text-muted">Aggregate execution health index across all active corporate projects.</p>
            </div>
            
            <div className="flex items-center justify-around my-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-[4px] border-surface-sunken border-t-brand rounded-full flex flex-col items-center justify-center font-mono font-bold text-lg text-text-primary relative">
                  {stats.portfolioHealth}%
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mt-2 text-center">Health</span>
              </div>

              {/* Health Distribution List */}
              <div className="space-y-1.5 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                  <span>Excellent: <strong>{stats.healthDistribution?.excellent || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand shrink-0" />
                  <span>Healthy: <strong>{stats.healthDistribution?.healthy || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-warning shrink-0" />
                  <span>Warning: <strong>{stats.healthDistribution?.warning || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                  <span>High Risk: <strong>{stats.healthDistribution?.highRisk || 0}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-danger shrink-0" />
                  <span>Critical: <strong>{stats.healthDistribution?.critical || 0}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-between items-center text-[11px] text-text-secondary">
              <span>Active: <strong className="font-mono text-text-primary">{stats.projectStats?.activeProjects || 0}</strong></span>
              <span>Total Budget: <strong className="font-mono text-text-primary">${stats.projectStats?.totalBudget?.toLocaleString() || 0}</strong></span>
            </div>
          </GlassCard>

          {/* High Risk Projects Alert Desk */}
          <GlassCard className="flex flex-col justify-between min-h-[350px]">
            <div>
              <h4 className="font-semibold text-sm text-text-primary mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-danger" />
                High Risk Projects
              </h4>
              <p className="text-xs text-text-muted">Projects with health index below 60 requiring immediate attention.</p>
            </div>

            <div className="space-y-2 my-4 flex-1 overflow-y-auto max-h-[220px]">
              {!stats.projectStats?.highRiskProjects || stats.projectStats.highRiskProjects.length === 0 ? (
                <div className="text-xs text-text-muted text-center py-10">All active projects currently meet healthy baseline metrics.</div>
              ) : (
                stats.projectStats.highRiskProjects.map((proj: any) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      if (setActiveTab) setActiveTab('projects');
                    }}
                    className="p-3 bg-danger-tint border border-danger/20 hover:border-danger/40 rounded-md cursor-pointer transition-all flex justify-between items-center"
                  >
                    <div>
                      <h5 className="text-xs font-semibold text-text-primary">{proj.name}</h5>
                      <span className="text-[9px] px-1.5 py-0.5 bg-danger text-white rounded mt-1.5 inline-block uppercase font-bold tracking-wider">
                        {proj.healthLevel || 'High Risk'}
                      </span>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-danger text-sm block">{proj.healthScore}%</span>
                      <span className="text-[10px] text-text-secondary block hover:underline mt-0.5">Diagnose &rarr;</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Upcoming Project Milestones */}
          <GlassCard className="flex flex-col justify-between min-h-[350px]">
            <div>
              <h4 className="font-semibold text-sm text-text-primary mb-1 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-brand" />
                Upcoming Milestones
              </h4>
              <p className="text-xs text-text-muted">Timeline checkpoints due in the next 30 days.</p>
            </div>

            <div className="space-y-2 my-4 flex-1 overflow-y-auto max-h-[220px]">
              {!stats.upcomingMilestones || stats.upcomingMilestones.length === 0 ? (
                <div className="text-xs text-text-muted text-center py-10">No upcoming milestones due within current sprints.</div>
              ) : (
                stats.upcomingMilestones.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 bg-surface-sunken border border-border rounded-md flex justify-between items-center"
                  >
                    <div className="min-w-0">
                      <h5 className="text-xs font-semibold text-text-primary truncate">{m.name}</h5>
                      <span className="text-[10px] text-text-secondary mt-1 block truncate">
                        {m.projectName}
                      </span>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[11px] font-semibold text-text-primary block">{m.dueDate}</span>
                      <span className="text-[9px] text-text-muted block truncate mt-0.5">{m.ownerName}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Row 3: Command Layout: Digital Twin Mini Map & AI Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Digital Twin Mini Map */}
        <GlassCard className="lg:col-span-2 min-h-[350px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm text-text-primary">Digital Twin Mini Map</h4>
              <button
                onClick={() => {
                  if (setActiveTab) setActiveTab('skill-graph');
                }}
                className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1"
              >
                Open Full Twin View <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-text-muted mt-0.5">Clickable diagram representing the management hierarchy and reporting lines.</p>
          </div>

          <div className="h-64 mt-4 bg-surface-sunken border border-border rounded-md p-4 flex items-center justify-center relative overflow-hidden">
            {/* Visual representation of nodes */}
            <div className="flex flex-col items-center gap-8 z-10">
              <div className="px-4 py-2 bg-brand-tint border border-brand/20 rounded-md text-text-primary text-xs font-medium cursor-pointer" onClick={() => { if (setActiveTab) setActiveTab('skill-graph'); }}>
                Alex Rivera (Staff Engineer)
              </div>
              <div className="flex gap-4">
                <div className="px-3 py-1.5 bg-surface-card border border-border rounded-sm text-[11px] text-text-secondary">
                  Sarah Chen (ML)
                </div>
                <div className="px-3 py-1.5 bg-surface-card border border-border rounded-sm text-[11px] text-text-secondary">
                  Elena Rostova (FE)
                </div>
                <div className="px-3 py-1.5 bg-surface-card border border-border rounded-sm text-[11px] text-text-secondary">
                  Aisha Rahman (DevOps)
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* AI Action Alerts Panel */}
        <GlassCard className="flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm text-text-primary flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-warning" />
                Executive AI Alerts
              </h4>
              <span className="px-1.5 py-0.5 rounded-full bg-ai-tint text-ai-accent text-[9px] font-bold uppercase tracking-wider border border-ai-accent/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
            </div>
            <p className="text-xs text-text-muted">Live capability alerts and mitigation strategies</p>
          </div>

          <div className="space-y-3 my-4 flex-1 overflow-y-auto max-h-[250px]">
            {predictiveReport?.recommendations?.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-surface-sunken border border-border rounded-md hover:border-border-strong transition-all flex gap-3"
              >
                <div className="mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-warning block shrink-0" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-text-primary">{rec.title}</span>
                    <span className="text-[10px] font-bold uppercase text-warning">{rec.impact}</span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row 4: Capability Risk and Spotlight Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Capability Risk Widget */}
        <div className="lg:col-span-2">
          <CapabilityRiskWidget />
        </div>

        {/* Quick Actions Hub */}
        <GlassCard className="flex flex-col justify-between min-h-[350px]">
          <div>
            <h4 className="font-semibold text-sm text-text-primary flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-brand" />
              Quick Analytics Actions
            </h4>
            <p className="text-xs text-text-muted">Run quick structural and strategic updates</p>
          </div>

          <div className="space-y-3 my-4 flex-1">
            <button
              onClick={() => {
                if (setActiveTab) setActiveTab('skill-graph');
              }}
              className="w-full p-3 bg-surface-card hover:bg-surface-sunken border border-border rounded-md text-left transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-semibold text-text-primary block group-hover:text-brand transition-colors">Open Digital Twin Sandbox</span>
                <span className="text-[11px] text-text-secondary mt-0.5 block">Trigger layoffs, transfers or dept merges</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-brand transition-colors" />
            </button>

            <button
              onClick={() => {
                if (setActiveTab) setActiveTab('staffing');
              }}
              className="w-full p-3 bg-surface-card hover:bg-surface-sunken border border-border rounded-md text-left transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-semibold text-text-primary block group-hover:text-brand transition-colors">Staffing Optimizer Studio</span>
                <span className="text-[11px] text-text-secondary mt-0.5 block">Mathematically allocate and optimize teams</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-brand transition-colors" />
            </button>
          </div>
        </GlassCard>
      </div>

    </div>
  );
};
