import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { DashboardStats } from '../utils/api';
import {
  Users,
  Compass,
  Star,
  Award,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardProps {
  stats: DashboardStats;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899'];

  // Custom tooltips for nice styling
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-800 p-3 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-xs font-bold text-slate-200 mb-1">{label || payload[0].name}</p>
          {payload.map((item: any, idx: number) => (
            <p key={idx} className="text-xs font-semibold" style={{ color: item.color || item.fill }}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <GlassCard hoverGlow className="flex items-center space-x-5">
          <div className="p-3.5 bg-blue-600/10 text-blue-400 rounded-2xl border border-blue-500/10">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</p>
            <h3 className="font-outfit font-extrabold text-2xl text-slate-100 mt-1">{stats.totalEmployees}</h3>
          </div>
        </GlassCard>

        <GlassCard hoverGlow className="flex items-center space-x-5">
          <div className="p-3.5 bg-violet-600/10 text-violet-400 rounded-2xl border border-violet-500/10">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Experience</p>
            <h3 className="font-outfit font-extrabold text-2xl text-slate-100 mt-1">{stats.avgExperience} yrs</h3>
          </div>
        </GlassCard>

        <GlassCard hoverGlow className="flex items-center space-x-5">
          <div className="p-3.5 bg-emerald-600/10 text-emerald-400 rounded-2xl border border-emerald-500/10">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Performance</p>
            <h3 className="font-outfit font-extrabold text-2xl text-slate-100 mt-1">{stats.avgPerformance}/5.0</h3>
          </div>
        </GlassCard>

        <GlassCard glow className="bg-gradient-to-br from-blue-900/20 to-indigo-900/15 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Workforce Capability</p>
              <h3 className="font-outfit font-extrabold text-3xl text-white mt-1.5">{stats.capabilityScore}%</h3>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-dashed border-blue-500/30 flex items-center justify-center font-bold text-white text-xs animate-spin-slow">
              AI
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Row 2: Skill Radar + Tech Adoption */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 flex flex-col justify-between min-h-[400px]">
          <div>
            <h4 className="font-outfit font-bold text-base text-slate-200 mb-1">Organization Skill Map</h4>
            <p className="text-xs text-slate-500">Average proficiency ratings computed across top technical capabilities</p>
          </div>
          <div className="h-72 w-full mt-4 flex items-center justify-center">
            {stats.skillDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={stats.skillDistribution}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} stroke="#475569" tick={{ fontSize: 9 }} />
                  <Radar
                    name="Avg Proficiency"
                    dataKey="avgProficiency"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.25}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">No skill distribution records</span>
            )}
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-between min-h-[400px]">
          <div>
            <h4 className="font-outfit font-bold text-base text-slate-200 mb-1">Technology Adoption</h4>
            <p className="text-xs text-slate-500">Workforce distribution by category clusters</p>
          </div>
          <div className="h-64 w-full mt-4 relative flex items-center justify-center">
            {stats.techAdoption.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.techAdoption}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {stats.techAdoption.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">No tech adoption stats</span>
            )}
            {/* Center aggregate number */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-100">{stats.totalEmployees}</span>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Engineers</span>
            </div>
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {stats.techAdoption.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] font-medium text-slate-400 truncate">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row 3: Department Comparison + Top Experts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 min-h-[380px] flex flex-col justify-between">
          <div>
            <h4 className="font-outfit font-bold text-base text-slate-200 mb-1">Department Comparison</h4>
            <p className="text-xs text-slate-500">Comparing talent density, experience, and capability metrics</p>
          </div>
          <div className="h-64 w-full mt-4">
            {stats.departmentExpertise.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.departmentExpertise} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <XAxis dataKey="department" stroke="#475569" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                  <Bar dataKey="avgExperience" name="Avg Experience" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgSkillProficiency" name="Avg Skill Level" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-slate-500">No department statistics</span>
            )}
          </div>
        </GlassCard>

        {/* Top Experts Grid */}
        <GlassCard className="flex flex-col justify-between">
          <div>
            <h4 className="font-outfit font-bold text-base text-slate-200 mb-1">Talent Spotlight</h4>
            <p className="text-xs text-slate-500">Top-rated capability experts inside the organization</p>
          </div>
          <div className="space-y-4 my-4">
            {stats.topExperts.map((expert, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-slate-900/30 hover:bg-slate-900/50 border border-slate-900 hover:border-slate-800 rounded-xl transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 flex items-center justify-center font-bold text-blue-400 text-xs shadow-inner">
                    {expert.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{expert.name}</h5>
                    <p className="text-[10px] text-slate-500">{expert.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 text-[9px] font-bold text-blue-400 uppercase tracking-wide">
                    {expert.expertSkill} (Level {expert.proficiency})
                  </span>
                  <div className="text-[9px] text-slate-500 mt-1 font-semibold">Perf: {expert.rating}/5.0</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row 4: AI Strategic Insight */}
      <GlassCard glow className="bg-gradient-to-r from-blue-950/20 to-slate-950/80 border-blue-500/10 flex items-center justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-600/15 text-blue-400 rounded-xl shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-outfit font-bold text-sm text-slate-200">AI Strategic Insights</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-4xl leading-relaxed">
              Based on the capability mapping of **{stats.totalEmployees} employees**, the organization demonstrates a robust capability core in **Frontend Development** (Average React level: 4.5/5.0) and **Machine Learning**. However, a key capability bottleneck exists in deployment pipelines, with **Kubernetes** showing a significant skills gap. Upskilling junior frontend staff in Docker and Cloud Fundamentals will lift the overall workforce capability index by an estimated **8%**.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
