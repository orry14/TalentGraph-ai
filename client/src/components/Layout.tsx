import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  TrendingUp,
  FolderGit,
  UserSearch,
  ShieldAlert,
  Settings as SettingsIcon,
  Network,
  MonitorPlay,
  Database,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useRole, AppRole } from '../context/RoleContext';
import { RequireRole } from './RequireRole';
import { clsx } from 'clsx';

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

  const navigation = [
    { id: 'command-center', name: 'Command Center', icon: MonitorPlay, roles: ['admin', 'manager', 'employee'] as AppRole[] },
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] as AppRole[] },
    { id: 'employees', name: 'Employee Workspace', icon: Users, roles: ['admin', 'manager', 'employee'] as AppRole[] },
    { id: 'recruitment', name: 'Recruitment', icon: UserSearch, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'projects', name: 'Projects', icon: FolderGit, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'staffing', name: 'Project Staffing Engine', icon: Briefcase, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'gap-analysis', name: 'Skill Gap Analysis', icon: TrendingUp, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'talent-network', name: 'Talent Network', icon: Network, roles: ['admin', 'manager'] as AppRole[] },
    { id: 'audit-logs', name: 'Audit Logs', icon: ShieldAlert, roles: ['admin'] as AppRole[] },
    { id: 'settings', name: 'Settings', icon: SettingsIcon, roles: ['admin', 'manager'] as AppRole[] },
  ];

  return (
    <div className="min-h-screen bg-surface-page flex relative overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={clsx(
          "bg-surface-sidebar border-r border-border flex flex-col z-30 shrink-0 transition-all duration-300",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <div className="h-16 border-b border-border flex items-center px-4 shrink-0 overflow-hidden">
          <div className="flex items-center space-x-3 w-full">
            <div className="p-2 shrink-0">
              <Sparkles className="w-6 h-6 text-brand" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-lg text-text-primary truncate">TalentGraph</h1>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <RequireRole key={item.id} roles={item.roles}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  title={isCollapsed ? item.name : undefined}
                  className={clsx(
                    "w-full flex items-center px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 relative group",
                    isActive
                      ? "bg-brand-tint text-brand"
                      : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand rounded-r-full" />
                  )}
                  <Icon className={clsx("w-5 h-5 shrink-0", isActive ? "text-brand" : "text-text-muted group-hover:text-text-primary")} />
                  {!isCollapsed && <span className="ml-3 truncate">{item.name}</span>}
                </button>
              </RequireRole>
            );
          })}
        </nav>

        {/* Database reset helper */}
        <RequireRole roles={['admin']}>
          <div className="px-4 py-3 border-t border-border">
            <button
              onClick={onResetDB}
              disabled={resetLoading}
              title={isCollapsed ? 'Reset Seed Database' : undefined}
              className="w-full flex items-center justify-center space-x-2 text-xs py-2 bg-surface-sunken hover:bg-border text-text-secondary hover:text-text-primary border border-border rounded-md transition-all duration-200 disabled:opacity-50"
            >
              <Database className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>{resetLoading ? 'Resetting...' : 'Reset DB'}</span>}
            </button>
          </div>
        </RequireRole>

        {/* Footer profile info & Collapse Toggle */}
        <div className="p-4 border-t border-border bg-surface-sidebar">
          {!isCollapsed && (
            <>
              <div className="flex items-center space-x-2.5 mb-3">
                <div className="w-9 h-9 rounded-md bg-surface-sunken border border-border flex items-center justify-center font-bold text-text-primary text-sm uppercase shrink-0">
                  {user?.name.slice(0, 2) || 'US'}
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{user?.name || 'Mock User'}</p>
                  <p className="text-[11px] text-text-muted font-medium uppercase truncate">{role}</p>
                </div>
              </div>
              <div className="mb-4">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AppRole)}
                  className="w-full bg-surface-sunken border border-border rounded-md text-xs text-text-primary py-1.5 px-2 focus:outline-none focus:border-brand"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
            </>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center py-2 text-text-muted hover:text-text-primary hover:bg-surface-sunken rounded-md transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-surface-page">
        {/* Top Navbar */}
        <header className="h-16 border-b border-border bg-surface-card flex items-center justify-between px-8 z-20 shrink-0">
          <div>
            <h2 className="font-semibold text-lg text-text-primary">
              {navigation.find(n => n.id === activeTab)?.name}
            </h2>
          </div>

          {/* Org score badge */}
          <div className="flex items-center space-x-6">
            {orgCapabilityScore !== null && (
              <div className="flex items-center space-x-2.5 py-1 px-3 bg-surface-sunken border border-border rounded-full">
                <span className="text-[11px] font-medium text-text-secondary">Org Capability</span>
                <div className="h-4 w-px bg-border" />
                <span className="font-mono font-bold text-sm text-text-primary">
                  {orgCapabilityScore}%
                </span>
              </div>
            )}
            <div className="text-xs font-medium text-text-muted flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-success animate-[pulse_2s_ease-in-out_infinite]" />
              <span>Platform Core Online</span>
            </div>
          </div>
        </header>

        {/* Content Page wrapper */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
