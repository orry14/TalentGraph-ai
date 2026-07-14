import React, { useState } from 'react';
import { Opportunity, OpportunityApplication } from '../../utils/api';
import { GlassCard } from '../../components/GlassCard';
import { Sparkles, Briefcase, Clock, Calendar, CheckCircle, Search, Filter, X } from 'lucide-react';

interface EmployeeMarketplaceProps {
  opportunities: Opportunity[];
  applications: OpportunityApplication[];
  onApply: (opp: Opportunity) => void;
  onWithdraw: (appId: string) => void;
}

export const EmployeeMarketplace: React.FC<EmployeeMarketplaceProps> = ({ opportunities, applications, onApply, onWithdraw }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'applications'>('browse');
  const [search, setSearch] = useState('');

  const matchedOpps = opportunities.filter(o => (o.matchScore || 0) > 80);
  const filteredOpps = opportunities.filter(o => o.title.toLowerCase().includes(search.toLowerCase()) || o.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Header Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] gap-6">
        <button 
          onClick={() => setActiveTab('browse')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${activeTab === 'browse' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Browse Opportunities
        </button>
        <button 
          onClick={() => setActiveTab('applications')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${activeTab === 'applications' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} flex items-center gap-2`}
        >
          My Applications
          {applications.length > 0 && (
            <span className="bg-[var(--bg-surface-alt)] text-[var(--text-primary)] text-[11px] py-0.5 px-2 rounded-full font-bold">
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="space-y-8">
          {/* Matched For You Section */}
          {matchedOpps.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent)]" /> Matched For You
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {matchedOpps.map(opp => (
                  <GlassCard key={opp.id} className="p-5 border-[var(--accent)]/30 bg-[var(--accent)]/5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-[16px] text-[var(--text-primary)]">{opp.title}</h4>
                          <p className="text-[13px] text-[var(--text-secondary)] flex items-center gap-1.5 mt-1">
                            <Briefcase className="w-3.5 h-3.5" /> {opp.projectName || 'Internal Team'}
                          </p>
                        </div>
                        <div className="bg-[var(--accent)] text-white font-bold text-[12px] px-2 py-1 rounded-md shadow-sm">
                          {opp.matchScore}% Match
                        </div>
                      </div>
                      
                      <div className="my-3 p-3 bg-white/50 rounded-md border border-[var(--border-subtle)]">
                        <p className="text-[13px] text-[var(--text-primary)] font-medium flex gap-2">
                          <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                          {opp.matchReason}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {opp.requiredSkills.map(skill => (
                          <span key={skill} className="px-2 py-1 rounded-md text-[11px] font-medium bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[var(--text-secondary)]">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-subtle)]">
                      <div className="text-[12px] font-medium text-[var(--text-secondary)] flex gap-4">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> {opp.timeCommitment}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {opp.priorityTag}</span>
                      </div>
                      <button 
                        onClick={() => onApply(opp)}
                        disabled={opp.hasApplied}
                        className={`px-4 py-1.5 rounded-md text-[13px] font-medium transition-colors ${opp.hasApplied ? 'bg-[var(--green-soft)] text-[var(--green)] cursor-default' : 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]'}`}
                      >
                        {opp.hasApplied ? 'Applied' : 'View & Apply'}
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Browse All Section */}
          <div className="space-y-4">
            <h3 className="text-[16px] font-bold text-[var(--text-primary)]">All Open Opportunities</h3>
            
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[var(--bg-surface)] p-2 rounded-lg border border-[var(--border-default)]">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search titles, skills, or descriptions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-transparent border-none py-1.5 pl-9 pr-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] rounded-md transition-colors border border-transparent hover:border-[var(--border-subtle)]">
                  <Filter className="w-3.5 h-3.5" /> Dept
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] rounded-md transition-colors border border-transparent hover:border-[var(--border-subtle)]">
                  <Filter className="w-3.5 h-3.5" /> Time
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOpps.map(opp => (
                <GlassCard key={opp.id} className="p-5 flex flex-col justify-between hover:border-[var(--border-strong)] transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-[15px] text-[var(--text-primary)] leading-tight">{opp.title}</h4>
                      {opp.hasApplied && (
                         <span className="bg-[var(--green-soft)] text-[var(--green)] font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                           Applied
                         </span>
                      )}
                    </div>
                    <p className="text-[12px] text-[var(--text-secondary)] mb-3">{opp.departmentScope} • {opp.priorityTag}</p>
                    
                    <p className="text-[13px] text-[var(--text-primary)] line-clamp-2 mb-4">{opp.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {opp.requiredSkills.map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-subtle)]">
                    <span className="text-[12px] font-medium text-[var(--text-tertiary)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5"/> {opp.timeCommitment}
                    </span>
                    <button 
                      onClick={() => onApply(opp)}
                      className="text-[13px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                    >
                      Details & Apply
                    </button>
                  </div>
                </GlassCard>
              ))}
              {filteredOpps.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-[var(--border-strong)] rounded-xl text-[var(--text-secondary)]">
                  No opportunities found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-4">
          <h3 className="text-[16px] font-bold text-[var(--text-primary)]">My Applications</h3>
          <div className="space-y-4">
            {applications.map(app => {
              const opp = opportunities.find(o => o.id === app.opportunityId);
              if (!opp) return null;
              
              return (
                <GlassCard key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-[var(--border-default)]">
                  <div>
                    <h4 className="font-semibold text-[15px] text-[var(--text-primary)]">{opp.title}</h4>
                    <p className="text-[13px] text-[var(--text-secondary)] mt-1">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider ${
                      app.status === 'Accepted' ? 'bg-[var(--green-soft)] text-[var(--green)]' :
                      app.status === 'Under Review' ? 'bg-[var(--blue-soft)] text-[var(--blue)]' :
                      app.status === 'Not Selected' ? 'bg-[var(--red-soft)] text-[var(--red)]' :
                      'bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]'
                    }`}>
                      {app.status}
                    </span>
                    {(app.status === 'Submitted' || app.status === 'Under Review') && (
                      <button 
                        onClick={() => onWithdraw(app.id)}
                        className="p-1.5 text-[var(--text-tertiary)] hover:text-[var(--red)] hover:bg-[var(--red-soft)] rounded transition-colors"
                        title="Withdraw Application"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
            {applications.length === 0 && (
              <div className="py-12 text-center border border-dashed border-[var(--border-strong)] rounded-xl text-[var(--text-secondary)]">
                You haven't applied to any opportunities yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
