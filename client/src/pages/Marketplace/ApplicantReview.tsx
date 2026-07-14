import React, { useState, useEffect } from 'react';
import { Opportunity, OpportunityApplication, api } from '../../utils/api';
import { ChevronLeft, AlertCircle, FileText, CheckCircle2, User, Building } from 'lucide-react';
import { GlassCard } from '../../components/GlassCard';

interface ApplicantReviewProps {
  opportunity: Opportunity;
  onBack: () => void;
}

export const ApplicantReview: React.FC<ApplicantReviewProps> = ({ opportunity, onBack }) => {
  const [applicants, setApplicants] = useState<OpportunityApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchApplicants = async () => {
      try {
        const data = await api.getApplicantsForOpportunity(opportunity.id);
        if (isMounted) setApplicants(data);
      } catch (err) {
        console.error('Failed to fetch applicants', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchApplicants();
    return () => { isMounted = false; };
  }, [opportunity.id]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    // Mock state update
    setApplicants(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus as any } : app));
    await api.updateApplicationStatus(appId, newStatus);
    
    if (newStatus === 'Accepted') {
      alert('Applicant accepted! In a real environment, this would prompt to update their project allocation in the Staffing Engine.');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      {/* Header / Back */}
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Postings
      </button>

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">{opportunity.title}</h2>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1 flex gap-4">
            <span className="flex items-center gap-1.5"><Building className="w-4 h-4"/> {opportunity.departmentScope}</span>
            <span className="flex items-center gap-1.5"><FileText className="w-4 h-4"/> {opportunity.projectId ? opportunity.projectName : 'General Opportunity'}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[13px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Status</p>
          <span className={`px-2 py-0.5 rounded-full text-[12px] font-bold uppercase ${
            opportunity.status === 'Open' ? 'bg-[var(--green-soft)] text-[var(--green)]' : 'bg-[var(--amber-soft)] text-[var(--amber)]'
          }`}>
            {opportunity.status}
          </span>
        </div>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg overflow-hidden mt-6">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
           <h3 className="text-[15px] font-bold text-[var(--text-primary)]">Applicant Pipeline ({applicants.length})</h3>
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {applicants.map(app => (
              <div key={app.id} className="p-5 flex flex-col lg:flex-row gap-6 hover:bg-[var(--bg-canvas)] transition-colors">
                
                {/* Applicant Info */}
                <div className="flex-1">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center font-bold text-lg shrink-0">
                      {app.employeeName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-[16px] text-[var(--text-primary)]">{app.employeeName}</h4>
                      <p className="text-[13px] text-[var(--text-secondary)]">{app.role} • {app.department}</p>
                      
                      <div className="mt-3 bg-white p-3 border border-[var(--border-default)] rounded-md">
                        <p className="text-[12px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> Why they are interested</p>
                        <p className="text-[14px] text-[var(--text-primary)] italic">"{app.note}"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match & Availability */}
                <div className="w-64 shrink-0 space-y-4 border-l border-[var(--border-subtle)] pl-6">
                  <div>
                    <p className="text-[12px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider mb-1">Match Score</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-[var(--accent)]">{app.matchScore}%</span>
                      <div className="flex-1 h-1.5 bg-[var(--bg-surface-alt)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent)]" style={{ width: `${app.matchScore}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-[12px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider mb-1">Current Allocation</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-[14px] font-bold ${app.currentAllocation > 80 ? 'text-[var(--red)]' : 'text-[var(--text-primary)]'}`}>
                        {app.currentAllocation}%
                      </span>
                    </div>
                    {app.currentAllocation > 80 && (
                      <p className="text-[11px] text-[var(--red)] flex items-start gap-1 mt-1 font-medium bg-[var(--red-soft)] p-1.5 rounded">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> High allocation warning. Check availability before accepting.
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Action */}
                <div className="w-48 shrink-0 flex flex-col justify-between items-end border-l border-[var(--border-subtle)] pl-6">
                  <span className="text-[12px] text-[var(--text-secondary)]">Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                  
                  <div className="w-full mt-4">
                    <p className="text-[12px] text-[var(--text-tertiary)] font-medium uppercase tracking-wider mb-1">Move to...</p>
                    <select 
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`w-full border rounded-md text-[13px] font-medium py-1.5 px-3 focus:outline-none focus:ring-1 ${
                        app.status === 'Accepted' ? 'bg-[var(--green-soft)] border-[var(--green)] text-[var(--green)]' :
                        app.status === 'Not Selected' ? 'bg-[var(--red-soft)] border-[var(--red)] text-[var(--red)]' :
                        'bg-white border-[var(--border-strong)] text-[var(--text-primary)] focus:border-[var(--accent)]'
                      }`}
                    >
                      <option value="Submitted">Submitted</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Not Selected">Not Selected</option>
                    </select>
                  </div>
                </div>

              </div>
            ))}
            {applicants.length === 0 && (
              <div className="p-8 text-center text-[var(--text-secondary)]">
                No applicants yet for this opportunity.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
