import React, { useState, useEffect } from 'react';
import { Opportunity, OpportunityApplication, api } from '../utils/api';
import { useRole } from '../context/RoleContext';
import { EmployeeMarketplace } from './Marketplace/EmployeeMarketplace';
import { ManagerMarketplace } from './Marketplace/ManagerMarketplace';
import { PostOpportunityModal } from './Marketplace/PostOpportunityModal';
import { ApplicantReview } from './Marketplace/ApplicantReview';

export const Marketplace: React.FC = () => {
  const { role } = useRole();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<OpportunityApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Manager State
  const [showPostModal, setShowPostModal] = useState(false);
  const [reviewOpp, setReviewOpp] = useState<Opportunity | null>(null);

  const isManagerOrAdmin = role === 'admin' || role === 'manager';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [opps, apps] = await Promise.all([
        api.getOpportunities(),
        api.getMyApplications()
      ]);
      setOpportunities(opps);
      setApplications(apps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (opp: Opportunity) => {
    await api.applyToOpportunity(opp.id, '');
    alert(`Successfully applied to ${opp.title}!`);
    fetchData(); // Refresh state
  };

  const handleWithdraw = async (appId: string) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      await api.withdrawApplication(appId);
      fetchData();
    }
  };

  const handlePostSubmit = () => {
    setShowPostModal(false);
    alert('Opportunity posted successfully!');
    fetchData();
  };

  if (loading && opportunities.length === 0) {
    return (
      <div className="p-8 flex justify-center">
        <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Opportunity Marketplace</h2>
        <p className="text-[var(--text-secondary)] mt-1">Find your next project. Grow beyond your current role.</p>
      </div>

      {isManagerOrAdmin && reviewOpp ? (
        <ApplicantReview 
          opportunity={reviewOpp} 
          onBack={() => setReviewOpp(null)} 
        />
      ) : isManagerOrAdmin ? (
        <div className="space-y-12">
          {/* We show BOTH for managers: what they posted, and what they can browse */}
          <ManagerMarketplace 
            postings={opportunities} 
            onNewPosting={() => setShowPostModal(true)} 
            onViewApplicants={setReviewOpp}
          />
          <div className="pt-12 border-t border-[var(--border-strong)]">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6">Browse Opportunities as Employee</h3>
            <EmployeeMarketplace 
              opportunities={opportunities}
              applications={applications}
              onApply={handleApply}
              onWithdraw={handleWithdraw}
            />
          </div>
        </div>
      ) : (
        <EmployeeMarketplace 
          opportunities={opportunities}
          applications={applications}
          onApply={handleApply}
          onWithdraw={handleWithdraw}
        />
      )}

      {showPostModal && (
        <PostOpportunityModal 
          onClose={() => setShowPostModal(false)}
          onSubmit={handlePostSubmit}
        />
      )}
    </div>
  );
};
