import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { api, Employee, Project } from '../utils/api';
import { Search, User, FolderGit, LayoutDashboard, Briefcase, Network, Settings as SettingsIcon } from 'lucide-react';
import '../styles/cmdk.css';

interface CommandPaletteProps {
  setActiveTab: (tab: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ setActiveTab, open, setOpen }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  useEffect(() => {
    if (open && employees.length === 0) {
      setLoading(true);
      Promise.all([api.getEmployees(), api.getProjects()])
        .then(([empRes, projRes]) => {
          const empArray: any[] = Array.isArray(empRes) ? empRes : (empRes as any).employees || [];
          setEmployees(empArray);
          setProjects(projRes);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <Command label="Global Command Menu" className="w-full flex flex-col h-[400px]">
          <div className="flex items-center border-b border-[var(--border-default)] px-4">
            <Search className="w-5 h-5 text-[var(--text-tertiary)] mr-2 shrink-0" />
            <Command.Input 
              placeholder="Search employees, projects, or pages..." 
              className="flex-1 h-14 bg-transparent outline-none text-[var(--text-primary)] placeholder-[var(--text-tertiary)] font-outfit"
              autoFocus
            />
            <div className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-canvas)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] font-mono">
              ESC
            </div>
          </div>

          <Command.List className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            <Command.Empty className="py-6 text-center text-sm text-[var(--text-tertiary)]">
              {loading ? 'Loading...' : 'No results found.'}
            </Command.Empty>

            <Command.Group heading="Navigation" className="text-xs font-semibold text-[var(--text-tertiary)] px-2 py-2 uppercase tracking-wider">
              <Command.Item onSelect={() => runCommand(() => setActiveTab('dashboard'))} className="cmdk-item">
                <LayoutDashboard className="w-4 h-4 mr-2 text-[var(--text-secondary)]" /> Dashboard
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => setActiveTab('employees'))} className="cmdk-item">
                <User className="w-4 h-4 mr-2 text-[var(--text-secondary)]" /> Employee Workspace
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => setActiveTab('projects'))} className="cmdk-item">
                <FolderGit className="w-4 h-4 mr-2 text-[var(--text-secondary)]" /> Projects
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => setActiveTab('staffing'))} className="cmdk-item">
                <Briefcase className="w-4 h-4 mr-2 text-[var(--text-secondary)]" /> Project Staffing Engine
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => setActiveTab('talent-network'))} className="cmdk-item">
                <Network className="w-4 h-4 mr-2 text-[var(--text-secondary)]" /> Digital Twin
              </Command.Item>
              <Command.Item onSelect={() => runCommand(() => setActiveTab('settings'))} className="cmdk-item">
                <SettingsIcon className="w-4 h-4 mr-2 text-[var(--text-secondary)]" /> Settings
              </Command.Item>
            </Command.Group>

            {employees.length > 0 && (
              <Command.Group heading="Employees" className="text-xs font-semibold text-[var(--text-tertiary)] px-2 py-2 uppercase tracking-wider mt-2">
                {employees.map(emp => (
                  <Command.Item 
                    key={emp.id} 
                    onSelect={() => runCommand(() => setActiveTab('employees'))} // In a real app we'd set active employee id too
                    className="cmdk-item"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] mr-3 font-bold">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{emp.name}</span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">{emp.role} • {emp.department}</span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {projects.length > 0 && (
              <Command.Group heading="Projects" className="text-xs font-semibold text-[var(--text-tertiary)] px-2 py-2 uppercase tracking-wider mt-2">
                {projects.map(proj => (
                  <Command.Item 
                    key={proj.id} 
                    onSelect={() => runCommand(() => setActiveTab('projects'))} // Set active project id
                    className="cmdk-item"
                  >
                    <FolderGit className="w-4 h-4 mr-3 text-orange-500" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--text-primary)]">{proj.name}</span>
                      <span className="text-[11px] text-[var(--text-tertiary)]">Status: {proj.status} • Health: {proj.healthScore}%</span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
      
      {/* Click outside to close */}
      <div className="absolute inset-0 z-[-1]" onClick={() => setOpen(false)} />
    </div>
  );
};
