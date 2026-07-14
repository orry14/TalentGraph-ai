import React, { useState, useEffect } from 'react';
import { GlassCard as Card } from '../components/GlassCard';
import { CapabilityRiskWidget } from '../components/CapabilityRiskWidget';
import { DashboardStats, api } from '../utils/api';
import {
  Users,
  Compass,
  Star,
  Award,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  Search,
  Activity,
  MapPin,
  TrendingUp,
  BrainCircuit,
  MessageSquareCode,
  FolderGit,
  Calendar,
  ArrowDownRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

interface DashboardProps {
  stats: DashboardStats;
  setActiveTab?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, setActiveTab }) => {
  const [predictiveReport, setPredictiveReport] = useState<any | null>(null);
  const [loadingPredictive, setLoadingPredictive] = useState(false);
  const [searchVal, setSearchVal] = useState('');

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
    fetchPredictive();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-3 rounded-lg shadow-md">
          <p className="text-[12px] font-bold text-[var(--text-primary)] mb-1">{label}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-[12px] font-semibold" style={{ color: item.color || item.fill }}>
              {item.name}: {item.value}%
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

  return (
    <div className="space-y-8">
      {/* Search Header / Executive Assist */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-[20px] text-[var(--text-primary)] flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[var(--blue)]" />
            Executive Command Center
          </h3>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1">TalentGraph workforce intelligence operating system control hub.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Query department capabilities..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md text-[14px] py-1.5 pl-9 pr-4 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-[3px] focus:ring-[var(--accent-soft)] transition-all focus:outline-none"
            />
          </div>
          <button
            onClick={() => {
              if (setActiveTab) setActiveTab('employees');
            }}
            className="px-4 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-alt)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-md text-[14px] font-medium transition-all shrink-0 shadow-xs"
          >
            Skill Search
          </button>
        </div>
      </div>

      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex flex-col p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[var(--blue-soft)] text-[var(--blue)] rounded-md">
              <Users className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[12px] font-medium text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-pill">
              +12% <ArrowUpRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-[28px] text-[var(--text-primary)] leading-none">{stats.totalEmployees}</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)] mt-1">Total Headcount</p>
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[var(--purple-soft)] text-[var(--purple)] rounded-md">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-[28px] text-[var(--text-primary)] leading-none">{stats.avgExperience} yrs</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)] mt-1">Avg Experience</p>
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[var(--amber-soft)] text-[var(--amber)] rounded-md">
              <Star className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[12px] font-medium text-[var(--amber)] bg-[var(--amber-soft)] px-2 py-0.5 rounded-pill">
              -0.1 <ArrowDownRight className="w-3 h-3 ml-1" />
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-[28px] text-[var(--text-primary)] leading-none">{stats.avgPerformance}/5.0</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)] mt-1">Avg Performance</p>
          </div>
        </Card>

        <Card className="flex flex-col p-5 bg-[var(--accent-soft)] border-[var(--accent)]/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[var(--accent)] text-white rounded-md">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-[28px] text-[var(--accent)] leading-none">{stats.capabilityScore}%</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)] mt-1">Workforce Capability</p>
          </div>
        </Card>
      </div>

      {/* Predictive & Trend Row */}
      {predictiveReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[32px]">
          <Card className="flex flex-col min-h-[350px]">
            <div className="mb-4">
              <h2 className="font-semibold text-[16px] text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[var(--red)]" />
                Attrition Risk Forecast
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)]">Predicted disengagement trends (6-month outlook)</p>
            </div>
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveReport.attrition.attritionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="period" stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} axisLine={{ stroke: 'var(--border-subtle)' }} tickLine={false} />
                  <YAxis stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="Risk Score" stroke="var(--red)" fill="var(--red-soft)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="flex flex-col min-h-[350px]">
            <div className="mb-4">
              <h2 className="font-semibold text-[16px] text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[var(--blue)]" />
                Bench & Utilization Forecast
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)]">Utilization calculated against active workstreams</p>
            </div>
            <div className="h-64 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={predictiveReport.benchUtilization.sixMonthForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="period" stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} axisLine={{ stroke: 'var(--border-subtle)' }} tickLine={false} />
                  <YAxis stroke="var(--text-tertiary)" tick={{ fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" name="Utilization" stroke="var(--blue)" fill="var(--blue-soft)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Row: Portfolio Health & Action Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[32px]">
        {/* Portfolio Health */}
        <Card className="flex flex-col min-h-[350px]">
          <div className="mb-6">
            <h2 className="font-semibold text-[16px] text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
              <FolderGit className="w-4 h-4 text-[var(--blue)]" />
              Portfolio Health & Distribution
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)]">Aggregate execution health index across active projects.</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-around flex-1 mb-4">
            <div className="flex flex-col items-center mb-6 md:mb-0">
              <div className="w-24 h-24 border-[6px] border-[var(--border-subtle)] border-t-[var(--accent)] rounded-full flex flex-col items-center justify-center font-bold text-2xl text-[var(--text-primary)] relative">
                {stats.portfolioHealth}%
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mt-3 text-center">Health Index</span>
            </div>

            <div className="space-y-3 text-[13px] text-[var(--text-secondary)] min-w-[180px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--accent)] shrink-0" />
                  <span>Excellent</span>
                </div>
                <strong className="text-[var(--text-primary)]">{stats.healthDistribution?.excellent || 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--blue)] shrink-0" />
                  <span>Healthy</span>
                </div>
                <strong className="text-[var(--text-primary)]">{stats.healthDistribution?.healthy || 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--amber)] shrink-0" />
                  <span>Warning</span>
                </div>
                <strong className="text-[var(--text-primary)]">{stats.healthDistribution?.warning || 0}</strong>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[var(--red)] shrink-0" />
                  <span>Critical</span>
                </div>
                <strong className="text-[var(--text-primary)]">{stats.healthDistribution?.critical || 0}</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-[13px] text-[var(--text-secondary)]">
            <span>Active: <strong className="text-[var(--text-primary)]">{stats.projectStats?.activeProjects || 0}</strong></span>
            <span>Total Budget: <strong className="text-[var(--text-primary)]">${stats.projectStats?.totalBudget?.toLocaleString() || 0}</strong></span>
          </div>
        </Card>

        {/* Executive Alerts */}
        <Card className="flex flex-col min-h-[350px]">
          <div className="mb-4">
            <h2 className="font-semibold text-[16px] text-[var(--text-primary)] mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[var(--amber)]" />
              Executive Action Alerts
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)]">Live capability alerts and mitigation strategies</p>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {predictiveReport?.recommendations.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-md flex gap-3 hover:bg-[var(--bg-surface-alt)] transition-colors"
              >
                <div className="mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--amber)] block shrink-0" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] font-semibold text-[var(--text-primary)]">{rec.title}</span>
                    <span className="text-[12px] font-bold uppercase text-[var(--amber)] bg-[var(--amber-soft)] px-2 py-0.5 rounded-pill">{rec.impact} Impact</span>
                  </div>
                  <p className="text-[13px] text-[var(--text-secondary)]">{rec.description}</p>
                </div>
              </div>
            ))}
            {(!predictiveReport?.recommendations || predictiveReport.recommendations.length === 0) && (
              <div className="text-[13px] text-[var(--text-tertiary)] text-center py-8">
                No active executive alerts.
              </div>
            )}
          </div>
        </Card>
      </div>


    </div>
  );
};


