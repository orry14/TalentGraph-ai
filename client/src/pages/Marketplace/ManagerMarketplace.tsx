import React, { useState } from 'react';
import { Opportunity } from '../../utils/api';
import { GlassCard } from '../../components/GlassCard';
import { Users, FileText, CheckCircle, Clock, Search, MoreVertical } from 'lucide-react';

interface ManagerMarketplaceProps {
  postings: Opportunity[];
  onNewPosting: () => void;
  onViewApplicants: (opp: Opportunity) => void;
}

export const ManagerMarketplace: React.FC<ManagerMarketplaceProps> = ({ postings, onNewPosting, onViewApplicants }) => {
  const [search, setSearch] = useState('');
  
  const activeCount = postings.filter(p => p.status === 'Open' || p.status === 'Closing Soon').length;
  const totalApplicants = postings.reduce((sum, p) => sum + p.applicantCount, 0);

  const filtered = postings.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[var(--blue-soft)] text-[var(--blue)] rounded-md"><FileText className="w-5 h-5"/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">{activeCount}</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">Active Postings</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[var(--green-soft)] text-[var(--green)] rounded-md"><Users className="w-5 h-5"/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">{totalApplicants}</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">Total Applicants</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[var(--purple-soft)] text-[var(--purple)] rounded-md"><CheckCircle className="w-5 h-5"/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">65%</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">Fill Rate</p>
          </div>
        </GlassCard>
        <GlassCard className="p-5 flex flex-col justify-between h-32 border-[var(--border-default)]">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-[var(--amber-soft)] text-[var(--amber)] rounded-md"><Clock className="w-5 h-5"/></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">12 days</h3>
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">Avg Time to Fill</p>
          </div>
        </GlassCard>
      </div>

      <div className="flex justify-between items-end">
        <h3 className="text-[16px] font-bold text-[var(--text-primary)]">My Postings</h3>
        <button 
          onClick={onNewPosting}
          className="bg-[var(--accent)] text-white px-4 py-2 rounded-md font-medium text-[13px] hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          + Post Opportunity
        </button>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center gap-4">
           <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search postings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-[var(--border-default)] rounded-md py-1.5 pl-9 pr-3 text-[13px] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Opportunity</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Applicants</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Posted Date</th>
              <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filtered.map(opp => (
              <tr key={opp.id} className="hover:bg-[var(--bg-canvas)] transition-colors group">
                <td className="px-4 py-4">
                  <p className="font-semibold text-[14px] text-[var(--text-primary)]">{opp.title}</p>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{opp.projectName || 'General'}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    opp.status === 'Open' ? 'bg-[var(--green-soft)] text-[var(--green)]' :
                    opp.status === 'Closing Soon' ? 'bg-[var(--amber-soft)] text-[var(--amber)]' :
                    'bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]'
                  }`}>
                    {opp.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[14px] text-[var(--text-primary)]">{opp.applicantCount}</span>
                    {opp.applicantCount === 0 && opp.status !== 'Closed' && (
                      <span className="text-[11px] text-[var(--amber)] bg-[var(--amber-soft)] px-1.5 rounded" title="No applicants yet">Flagged</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-[13px] text-[var(--text-secondary)]">
                  {new Date(opp.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-right">
                  <button 
                    onClick={() => onViewApplicants(opp)}
                    className="text-[13px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] px-3 py-1.5 border border-[var(--border-default)] bg-white rounded transition-colors mr-2 shadow-sm"
                  >
                    View Applicants
                  </button>
                  <button className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors p-1 rounded hover:bg-[var(--bg-surface-alt)]">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-secondary)] text-[13px]">
                  No postings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
