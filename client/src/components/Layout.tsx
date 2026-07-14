import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  GitMerge,
  Sparkles,
  Database,
  FolderGit,
  UserSearch,
  ShieldAlert,
  Settings as SettingsIcon,
  LogOut,
  Network,
  MonitorPlay,
  Radar,
  Menu,
  Search,
  Bell,
  X,
  FileBarChart,
  ListChecks,
  MessageCircleQuestion
} from 'lucide-react';
import { useRole, AppRole } from '../context/RoleContext';
import { RequireRole } from './RequireRole';
import { CommandPalette } from './CommandPalette';
import { NotificationDropdown } from './NotificationDropdown';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orgCapabilityScore: number | null;
  onResetDB: () => void;
  resetLoading: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
  orgCapabilityScore,
  onResetDB,
  resetLoading
}) => {
  const { user } = useAuth();
  const { role, setRole } = useRole();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(false);
      } else if (window.innerWidth < 1024) {
        setIsCollapsed(true);
        setIsMobileOpen(false);
      } else {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Init on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] as AppRole[] },
    { id: 'employees', name: 'Employee Workspace', icon: Users, roles: ['admin', 'manager', 'employee'] as AppRole[] },
    { id: 'recruitment', name: 'Recruitment', icon: UserSearch, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'onboarding', name: 'Onboarding', icon: ListChecks, roles: ['admin', 'manager', 'employee'] as AppRole[] },
    { id: 'marketplace', name: 'Opportunity Marketplace', icon: Sparkles, roles: ['admin', 'manager', 'employee'] as AppRole[] },
    { id: 'projects', name: 'Projects', icon: FolderGit, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'staffing', name: 'Project Staffing Engine', icon: Briefcase, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'gap-analysis', name: 'Skill Gap Analysis', icon: TrendingUp, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'reports', name: 'Reports', icon: FileBarChart, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'talent-network', name: 'Digital Twin', icon: Network, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'skill-connect', name: 'Skill Connect', icon: MessageCircleQuestion, roles: ['admin', 'manager', 'employee'] as AppRole[] },
    { id: 'audit-logs', name: 'Audit Logs', icon: ShieldAlert, roles: ['admin'] as AppRole[] },
    { id: 'settings', name: 'Settings', icon: SettingsIcon, roles: ['admin', 'manager'] as AppRole[] },
  ];

  const SidebarContent = () => (
    <>
      <div className={`p-4 border-b border-[var(--border-subtle)] flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} min-h-[56px] shrink-0 border-opacity-10`}>
        <div className="bg-[var(--accent)] p-1.5 rounded-md flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden pl-1">
            <h1 className="font-semibold text-lg text-white truncate">TalentGraph</h1>
          </div>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <RequireRole key={item.id} roles={item.roles}>
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 768) setIsMobileOpen(false);
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-3 space-x-2'} py-2 rounded-md font-medium text-[14px] transition-colors duration-150 ${
                  isActive
                    ? 'bg-[var(--bg-sidebar-active)] text-[var(--accent)]'
                    : 'text-[var(--text-on-dark-muted)] hover:bg-[var(--bg-sidebar-hover)] hover:text-white'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-on-dark-muted)]'}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </button>
            </RequireRole>
          );
        })}
      </nav>

      {/* Database reset helper */}
      <RequireRole roles={['admin']}>
        <div className="px-4 py-3 border-t border-[var(--bg-sidebar-hover)]">
          <button
            onClick={onResetDB}
            disabled={resetLoading}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-center space-x-2'} text-[12px] py-1.5 bg-[var(--bg-sidebar-hover)] text-white hover:bg-[var(--bg-sidebar-active)] hover:text-[var(--accent-soft)] rounded-md transition-colors duration-200 disabled:opacity-50`}
            title={isCollapsed ? 'Reset Database' : undefined}
          >
            <Database className="w-3.5 h-3.5 flex-shrink-0" />
            {!isCollapsed && <span>{resetLoading ? 'Resetting...' : 'Reset Seed DB'}</span>}
          </button>
        </div>
      </RequireRole>

      <div className={`p-4 border-t border-[var(--bg-sidebar-hover)] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center font-semibold text-sm uppercase flex-shrink-0">
            {user?.name.slice(0, 2) || 'US'}
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Mock User'}</p>
              <p className="text-xs text-gray-500 font-medium">Logged in as: {role}</p>
            </div>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="px-4 pb-4">
           <select
              value={role}
              onChange={(e) => setRole(e.target.value as AppRole)}
              className="w-full bg-[var(--bg-sidebar-hover)] border border-[var(--bg-sidebar-active)] rounded-md text-[13px] text-white py-1.5 px-2 focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
        </div>
      )}
      <CommandPalette open={cmdOpen} setOpen={setCmdOpen} setActiveTab={setActiveTab} />
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex relative overflow-hidden font-sans text-[var(--text-primary)]">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-[var(--bg-sidebar)] z-30 shrink-0 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-[240px]'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/35" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-[240px] bg-[var(--bg-sidebar)] flex flex-col h-full z-50">
            <button className="absolute top-4 right-4 text-[var(--text-on-dark-muted)] hover:text-white" onClick={() => setIsMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-[56px] border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between px-6 z-20 shrink-0">
          <div className="flex items-center space-x-4">
            <button className="md:hidden text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] p-1.5 rounded-md" onClick={() => setIsMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-[20px] text-[var(--text-primary)] hidden sm:block">
              {navigation.find(n => n.id === activeTab)?.name}
            </h2>
          </div>

          {/* Center search bar */}
          <div className="flex-1 max-w-md mx-6 hidden lg:block">
            <div 
              className="relative cursor-text flex items-center w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-full py-1.5 pl-9 pr-4 text-[14px] hover:border-[var(--accent)] transition-all"
              onClick={() => setCmdOpen(true)}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
              <span className="text-[var(--text-tertiary)]">Search... (⌘K)</span>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center space-x-4">
            {orgCapabilityScore !== null && (
              <div className="hidden sm:flex items-center space-x-1.5 py-1 px-2.5 bg-[var(--blue-soft)] text-[var(--blue)] rounded-full">
                <span className="text-[12px] font-medium uppercase tracking-wide">Org Capability Index</span>
                <span className="text-[12px] font-semibold">{orgCapabilityScore}%</span>
              </div>
            )}
            <NotificationDropdown />
          </div>
        </header>

        {/* Content Page wrapper */}
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg-canvas)]">
          {children}
        </main>
      </div>
    </div>
  );
};
