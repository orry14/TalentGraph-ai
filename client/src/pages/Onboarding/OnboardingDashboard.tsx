import React, { useState } from 'react';
import { OnboardingRecord } from '../../utils/api';
import { GlassCard } from '../../components/GlassCard';
import { Clock, CheckCircle2, AlertTriangle, Users, Search, Filter, ListChecks } from 'lucide-react';

interface OnboardingDashboardProps {
  records: OnboardingRecord[];
  onSelectRecord: (record: OnboardingRecord) => void;
}

export const OnboardingDashboard: React.FC<OnboardingDashboardProps> = ({ records, onSelectRecord }) => {
  const [search, setSearch] = useState('');
  
  const activeCount = records.filter(r => r.status !== 'Completed').length;
  const atRiskCount = records.filter(r => r.status === 'At Risk').length;
  
  const filtered = records.filter(r => 
    r.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Onboarding Command Center</h2>
        <p className="text-[var(--text-secondary)] mt-1">Track every new hire's first 90 days.</p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[var(--blue-soft)] text-[var(--blue)] rounded-md"><Users className="w-5 h-5"/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">{activeCount}</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">Active Onboardings</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[var(--green-soft)] text-[var(--green)] rounded-md"><CheckCircle2 className="w-5 h-5"/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">12</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">Completed this month</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col justify-between h-32 border-[var(--border-default)] hover:border-[var(--red)] transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[var(--red-soft)] text-[var(--red)] rounded-md"><AlertTriangle className="w-5 h-5"/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--red)]">{atRiskCount}</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">At Risk / Overdue</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[var(--purple-soft)] text-[var(--purple)] rounded-md"><Clock className="w-5 h-5"/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">42 days</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">Avg time-to-productive</p>
          </div>
        </GlassCard>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-default)]">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search new hires..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-transparent border-none py-1.5 pl-9 pr-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] rounded-md transition-colors border border-transparent hover:border-[var(--border-subtle)]">
            <Filter className="w-3.5 h-3.5" /> Department
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] rounded-md transition-colors border border-transparent hover:border-[var(--border-subtle)]">
            <Filter className="w-3.5 h-3.5" /> Status
          </button>
        </div>
      </div>

      {/* List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(record => (
          <GlassCard 
            key={record.id} 
            className={`p-5 cursor-pointer hover:border-[var(--accent)] transition-all flex flex-col ${record.status === 'At Risk' ? 'border-l-4 border-l-[var(--red)]' : ''}`}
            onClick={() => onSelectRecord(record)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center font-bold text-sm">
                  {record.employeeName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-[15px] text-[var(--text-primary)] leading-tight">{record.employeeName}</h4>
                  <p className="text-[12px] text-[var(--text-secondary)]">{record.role}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                record.status === 'On Track' ? 'bg-[var(--green-soft)] text-[var(--green)]' : 
                record.status === 'At Risk' ? 'bg-[var(--red-soft)] text-[var(--red)]' : 
                'bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]'
              }`}>
                {record.status}
              </span>
            </div>

            <div className="mt-auto space-y-3">
              <div className="flex justify-between text-[12px] text-[var(--text-secondary)]">
                <span>Start: {new Date(record.startDate).toLocaleDateString()}</span>
                <span>{Math.floor((Date.now() - new Date(record.startDate).getTime()) / 86400000)} days in</span>
              </div>
              
              <div className="w-full bg-[var(--bg-canvas)] rounded-full h-2 overflow-hidden border border-[var(--border-subtle)]">
                <div 
                  className={`h-full ${record.status === 'At Risk' ? 'bg-[var(--red)]' : 'bg-[var(--accent)]'} transition-all`} 
                  style={{ width: `${record.progress}%` }}
                ></div>
              </div>
              <p className="text-[11px] font-medium text-right text-[var(--text-secondary)]">{record.progress}% Complete</p>
            </div>
          </GlassCard>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-[var(--border-strong)] rounded-xl">
            <ListChecks className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-3" />
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">No active onboardings</h3>
            <p className="text-[13px] text-[var(--text-secondary)] mt-1">When new hires are added, their checklists will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
