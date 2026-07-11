import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ChatBot } from './components/ChatBot';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Staffing } from './pages/Staffing';
import { GapAnalysis } from './pages/GapAnalysis';
import { SkillGraph } from './pages/SkillGraph';
import { Projects } from './pages/Projects';
import { Recruitment } from './pages/Recruitment';
import { api, Employee, Project, DashboardStats, SkillGapReport } from './utils/api';
import { SkeletonTable } from './components/LoadingSkeleton';

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App Core Data State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [gapReport, setGapReport] = useState<SkillGapReport | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Fetch all core dataset
  const fetchAllData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [empData, projData, statsData, gapData] = await Promise.all([
        api.getEmployees(),
        api.getProjects(),
        api.getDashboardStats(),
        api.getGapAnalysis()
      ]);
      setEmployees(empData);
      setProjects(projData);
      setStats(statsData);
      setGapReport(gapData);
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  // Reset database back to seed template
  const handleResetDB = async () => {
    if (!window.confirm('Are you sure you want to reset the database to initial template values? This will wipe uploaded records.')) return;
    
    setResetLoading(true);
    try {
      await api.resetDatabase();
      await fetchAllData();
      alert('Database restored successfully.');
    } catch (err: any) {
      alert('Failed to reset database: ' + err.message);
    } finally {
      setResetLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-slate-700 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  // Authentication is disabled


  // Active view routing
  const renderContent = () => {
    if (isLoading && !stats) {
      return (
        <div className="space-y-6">
          <SkeletonTable />
        </div>
      );
    }

    const renderError = () => (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center bg-slate-900/50 rounded-2xl border border-red-900/20 p-8">
        <div className="w-16 h-16 bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-slate-200 mb-2">Backend Connection Failed</h2>
        <p className="text-slate-400 max-w-lg mb-6">
          The application could not connect to the API server. Data fetching failed because the backend is not accessible.
        </p>
        <p className="text-sm text-slate-500">
          Check your Vercel deployment logs and ensure your Express server is hosted and the API_BASE URL in <code>client/src/utils/api.ts</code> is correct.
        </p>
      </div>
    );

    switch (activeTab) {
      case 'dashboard':
        return stats ? <Dashboard stats={stats} setActiveTab={setActiveTab} /> : renderError();
      case 'employees':
        return (
          <Employees
            employees={employees}
            setEmployees={setEmployees}
            refreshStats={fetchAllData}
          />
        );
      case 'staffing':
        return <Staffing />;
      case 'projects':
        return <Projects />;
      case 'recruitment':
        return <Recruitment />;
      case 'gap-analysis':
        return gapReport ? <GapAnalysis report={gapReport} /> : renderError();
      case 'skill-graph':
        return <SkillGraph employees={employees} projects={projects} />;
      default:
        return stats ? <Dashboard stats={stats} /> : renderError();
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      orgCapabilityScore={stats ? stats.capabilityScore : null}
      onResetDB={handleResetDB}
      resetLoading={resetLoading}
    >
      {renderContent()}
      
      {/* Global Floating AI Copilot */}
      <ChatBot setActiveTab={setActiveTab} />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
