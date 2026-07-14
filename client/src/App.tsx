import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import { Layout } from './components/Layout';
import { ChatBot } from './components/ChatBot';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Staffing } from './pages/Staffing';
import { GapAnalysis } from './pages/GapAnalysis';
import { SkillGraph } from './pages/SkillGraph';
import { TalentNetwork } from './pages/TalentNetwork';
import { Projects } from './pages/Projects';
import { Recruitment } from './pages/Recruitment';
import { Onboarding } from './pages/Onboarding';
import { Marketplace } from './pages/Marketplace';
import { Reports } from './pages/Reports';
import { AuditLogs } from './pages/AuditLogs';
import { Settings } from './pages/Settings';
import { ImportWizard } from './pages/Settings/ImportWizard';
import { SkillConnect } from './pages/SkillConnect';
import { api, Employee, Project, DashboardStats, SkillGapReport } from './utils/api';
import { SkeletonTable } from './components/LoadingSkeleton';
import { SnippingTool } from './components/SnippingTool';

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Snipping Tool State
  const [pendingScreenshot, setPendingScreenshot] = useState<string | null>(null);
  
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

  // Listen to hash changes to update activeTab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveTab(hash);
      }
    };
    
    // Check initial hash
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
      <div className="min-h-screen bg-[var(--bg-surface)] flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-[var(--border-strong)] border-t-blue-500 animate-spin" />
      </div>
    );
  }

  // Removed Login rendering
  // Active view routing
  const renderContent = () => {
    if (isLoading && !stats) {
      return (
        <div className="space-y-6">
          <SkeletonTable />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return stats ? <Dashboard stats={stats} setActiveTab={setActiveTab} /> : null;
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
      case 'onboarding':
        return <Onboarding />;
      case 'marketplace':
        return <Marketplace />;
      case 'gap-analysis':
        return gapReport ? <GapAnalysis report={gapReport} /> : null;
      case 'reports':
        return <Reports />;
      case 'skill-graph':
        return <SkillGraph employees={employees} projects={projects} />;
      case 'talent-network':
        return <TalentNetwork setActiveTab={setActiveTab} />;
      case 'skill-connect':
        return <SkillConnect />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'settings':
        return <Settings />;
      case 'settings-import':
        return <ImportWizard />;
      default:
        return stats ? <Dashboard stats={stats} /> : null;
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
      <ChatBot 
        setActiveTab={setActiveTab} 
        pendingScreenshot={pendingScreenshot}
        clearPendingScreenshot={() => setPendingScreenshot(null)}
      />
      
      {/* Global Snipping Tool for AI Vision */}
      <SnippingTool onCapture={setPendingScreenshot} />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
