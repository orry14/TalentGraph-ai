import React, { useState, useEffect } from 'react';
import { OnboardingRecord, api } from '../utils/api';
import { OnboardingDashboard } from './Onboarding/OnboardingDashboard';
import { OnboardingTimeline } from './Onboarding/OnboardingTimeline';

export const Onboarding: React.FC = () => {
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<OnboardingRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRecords = async () => {
      try {
        const data = await api.getOnboardingRecords();
        if (isMounted) setRecords(data);
      } catch (err) {
        console.error('Failed to fetch onboarding records:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchRecords();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-[var(--border-subtle)] rounded w-3/4"></div>
            <div className="h-4 bg-[var(--border-subtle)] rounded"></div>
            <div className="h-4 bg-[var(--border-subtle)] rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {selectedRecord ? (
        <OnboardingTimeline 
          record={selectedRecord} 
          onBack={() => setSelectedRecord(null)} 
        />
      ) : (
        <OnboardingDashboard 
          records={records} 
          onSelectRecord={setSelectedRecord} 
        />
      )}
    </div>
  );
};
