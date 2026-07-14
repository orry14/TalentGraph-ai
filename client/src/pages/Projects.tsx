import React, { useState, useEffect, useMemo } from 'react';
import { GlassCard } from '../components/GlassCard';
import { SkeletonTable } from '../components/LoadingSkeleton';
import { api, Project, Employee, API_BASE } from '../utils/api';
import {
  FolderGit,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  Archive,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Check,
  ChevronRight,
  Shield,
  Layers,
  Flame,
  Brain,
  Gauge,
  Briefcase
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

export const Projects: React.FC = () => {
  // Page States
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<any | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [managerFilter, setManagerFilter] = useState('');
  const [healthFilter, setHealthFilter] = useState('');

  // Sort & Paginate states
  const [sortField, setSortField] = useState<keyof Project>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // CRUD Dialog States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formProject, setFormProject] = useState<Partial<Project>>({});
  const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'team' | 'timeline' | 'budget' | 'skills' | 'documents' | 'risks' | 'insights'>('overview');
  
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Sub-resource Modal / Add forms
  const [newMember, setNewMember] = useState({ employeeId: '', role: 'Backend' as any, allocation: 100 });
  const [newMilestone, setNewMilestone] = useState({ name: '', ownerId: '', dueDate: '', status: 'Planning' as any });
  const [newDoc, setNewDoc] = useState({ name: '', url: '#', type: 'Overview' as any });
  const [newTask, setNewTask] = useState({ name: '', assigneeId: '', dueDate: '', status: 'Pending' as any, priority: 'Medium' as any });

  // Initial Data Loading
  const loadData = async () => {
    setIsLoading(true);
    try {
      const projs = await api.getProjects();
      setProjectsList(projs);
      
      const emps = await api.getEmployees();
      setEmployees(emps);

      const stats = await api.getDashboardStats();
      setDashboardStats(stats);
      
      // Auto-select first project if none selected
      if (projs.length > 0 && !selectedProject) {
        handleSelectProject(projs[0].id);
      }
    } catch (err) {
      console.error('Failed to load project database:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectProject = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const details = await api.getProjectDetails(id);
      setSelectedProject(details);
    } catch (err) {
      console.error('Failed to load project detail:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // Sorting Handler
  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Projects
  const processedProjects = useMemo(() => {
    let result = [...projectsList];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.projectCode || '').toLowerCase().includes(q)
      );
    }

    // Filters
    if (statusFilter) result = result.filter(p => p.status === statusFilter);
    if (priorityFilter) result = result.filter(p => p.priority === priorityFilter);
    if (industryFilter) result = result.filter(p => p.industry === industryFilter);
    if (clientFilter) result = result.filter(p => p.client === clientFilter);
    if (managerFilter) result = result.filter(p => p.projectManager === managerFilter);
    if (healthFilter) {
      result = result.filter(p => {
        const score = p.healthScore || 100;
        if (healthFilter === 'Excellent') return score >= 90;
        if (healthFilter === 'Healthy') return score >= 75 && score < 90;
        if (healthFilter === 'Warning') return score >= 60 && score < 75;
        if (healthFilter === 'High Risk') return score >= 40 && score < 60;
        return score < 40;
      });
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      const numA = (aVal as number) || 0;
      const numB = (bVal as number) || 0;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });

    return result;
  }, [projectsList, searchQuery, statusFilter, priorityFilter, industryFilter, clientFilter, managerFilter, healthFilter, sortField, sortDirection]);

  // Pagination Helper
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedProjects.slice(start, start + itemsPerPage);
  }, [processedProjects, currentPage]);

  const totalPages = Math.ceil(processedProjects.length / itemsPerPage);

  // CRUD Actions
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProject.name) return;

    try {
      const nextId = `proj-${Date.now()}`;
      const payload = {
        ...formProject,
        id: nextId,
        status: formProject.status || 'Planning',
        priority: formProject.priority || 'Medium',
        requiredSkills: formProject.requiredSkills || ['React'],
        teamSize: Number(formProject.teamSize) || 3,
        durationMonths: Number(formProject.durationMonths) || 6,
        budget: Number(formProject.budget) || 100000,
        currency: 'USD',
        tags: formProject.tags || [],
        healthScore: 100,
        healthLevel: 'Excellent'
      };

      await api.createProject(payload);
      
      // Seed default milestone
      await api.addProjectMilestone(nextId, {
        name: 'Project Kickoff',
        dueDate: payload.startDate || new Date().toISOString().split('T')[0],
        status: 'Planning',
        dependencies: []
      });

      // Seeding initial activity log
      await api.addProjectActivity(nextId, {
        description: `Created new project ${payload.name}`,
        userId: 'Workspace Administrator'
      });

      setIsCreateOpen(false);
      setFormProject({});
      loadData();
      handleSelectProject(nextId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProject.id || !formProject.name) return;

    try {
      const payload = {
        ...formProject,
        teamSize: Number(formProject.teamSize),
        durationMonths: Number(formProject.durationMonths),
        budget: Number(formProject.budget)
      };
      await api.updateProject(formProject.id, payload);
      
      await api.addProjectActivity(formProject.id, {
        description: `Updated project configuration parameters.`,
        userId: 'Workspace Administrator'
      });

      setIsEditOpen(false);
      setFormProject({});
      loadData();
      handleSelectProject(formProject.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this project? All tasks, milestones and members will be lost.')) return;
    try {
      await api.deleteProject(id);
      setSelectedProject(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateProject = async (proj: Project) => {
    try {
      const nextId = `proj-${Date.now()}`;
      const payload = {
        ...proj,
        id: nextId,
        name: `${proj.name} (Copy)`,
        projectCode: proj.projectCode ? `${proj.projectCode}-COPY` : `PRJ-COPY-${Date.now()}`
      };
      await api.createProject(payload);
      
      await api.addProjectActivity(nextId, {
        description: `Duplicated project configuration from ${proj.name}.`,
        userId: 'Workspace Administrator'
      });

      loadData();
      handleSelectProject(nextId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveProject = async (proj: Project) => {
    try {
      await api.updateProject(proj.id, { ...proj, status: 'Archived' });
      loadData();
      handleSelectProject(proj.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Sub-resource operations
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newMember.employeeId) return;
    try {
      const emp = employees.find(emp => emp.id === newMember.employeeId);
      if (!emp) return;
      
      // Calculate skill match
      const reqSkills = selectedProject.project.requiredSkills || [];
      const empSkills = emp.technicalSkills.map(s => s.name.toLowerCase());
      const matches = reqSkills.filter((s: string) => empSkills.includes(s.toLowerCase())).length;
      const skillMatch = reqSkills.length > 0 ? Math.round((matches / reqSkills.length) * 100) : 100;

      await api.addProjectMember(selectedProject.project.id, {
        employeeId: newMember.employeeId,
        role: newMember.role,
        allocation: Number(newMember.allocation),
        skillMatch,
        performance: emp.performanceRating,
        availability: Number(newMember.allocation) > 100 ? 'Overallocated' : 'Available'
      });

      await api.addProjectActivity(selectedProject.project.id, {
        description: `Assigned member ${emp.name} to the team as ${newMember.role}`,
        userId: 'Workspace Administrator'
      });

      setNewMember({ employeeId: '', role: 'Backend', allocation: 100 });
      handleSelectProject(selectedProject.project.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAutoAssignAI = async () => {
    if (!selectedProject) return;
    setIsAutoAssigning(true);
    try {
      const reqSkills = selectedProject.project.requiredSkills || [];
      const prompt = `Based on the skills required for the project "${selectedProject.project.name}" (Required Skills: ${reqSkills.join(', ')}), suggest the 2 optimal team members from the workforce to assign. Return the exact JSON action block of type "assign_team" containing the projectId "${selectedProject.project.id}" and the array of members with employeeId, role, and allocation. Do not output anything else but the JSON inside a markdown action block.`;
      
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }]
        })
      });
      const data = await res.json();
      
      const actionMatch = data.response.match(/```(?:action)?\s*(\{[\s\S]*?\})\s*```/);
      let actionStr = data.response;
      if (actionMatch) {
         actionStr = actionMatch[1];
      }
      
      const action = JSON.parse(actionStr);
      if (action.type === 'assign_team' && action.members) {
        let assignedCount = 0;
        for (const newM of action.members) {
          const emp = employees.find(e => e.id === newM.employeeId || e.name === newM.employeeId);
          if (!emp) continue;
          
          if (!selectedProject.members.some((existing: any) => existing.employeeId === emp.id)) {
            // calculate match
            const empSkills = emp.technicalSkills.map((s: any) => s.name.toLowerCase());
            const matches = reqSkills.filter((s: string) => empSkills.includes(s.toLowerCase())).length;
            const skillMatch = reqSkills.length > 0 ? Math.round((matches / reqSkills.length) * 100) : 100;
            
            await api.addProjectMember(selectedProject.project.id, {
              ...newM,
              employeeId: emp.id,
              skillMatch,
              performance: emp.performanceRating,
              availability: newM.allocation > 100 ? 'Overallocated' : 'Available'
            });
            await api.addProjectActivity(selectedProject.project.id, {
              description: `AI assigned member ${emp.name} to the team as ${newM.role}`,
              userId: 'AI Copilot'
            });
            assignedCount++;
          }
        }
        if (assignedCount > 0) {
          alert(`AI successfully auto-assigned ${assignedCount} new members to the project!`);
          handleSelectProject(selectedProject.project.id);
        } else {
          alert(`AI suggested members who are already assigned to the project or not found.`);
        }
      } else {
        throw new Error('Invalid AI response block');
      }
    } catch (err: any) {
      alert("AI Auto-assign failed: " + err.message);
      console.error(err);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleRemoveMember = async (memberId: string, name: string) => {
    if (!selectedProject || !window.confirm(`Remove ${name} from project assignments?`)) return;
    try {
      await api.deleteProjectMember(selectedProject.project.id, memberId);
      
      await api.addProjectActivity(selectedProject.project.id, {
        description: `Removed member ${name} from project team allocation.`,
        userId: 'Workspace Administrator'
      });

      handleSelectProject(selectedProject.project.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newMilestone.name || !newMilestone.dueDate) return;
    try {
      await api.addProjectMilestone(selectedProject.project.id, {
        name: newMilestone.name,
        dueDate: newMilestone.dueDate,
        ownerId: newMilestone.ownerId || null,
        status: newMilestone.status,
        dependencies: []
      });

      await api.addProjectActivity(selectedProject.project.id, {
        description: `Added milestone target: ${newMilestone.name}`,
        userId: 'Workspace Administrator'
      });

      setNewMilestone({ name: '', ownerId: '', dueDate: '', status: 'Planning' });
      handleSelectProject(selectedProject.project.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMilestone = async (milestoneId: string, name: string) => {
    if (!selectedProject || !window.confirm(`Delete milestone: ${name}?`)) return;
    try {
      await api.deleteProjectMilestone(selectedProject.project.id, milestoneId);
      
      await api.addProjectActivity(selectedProject.project.id, {
        description: `Deleted milestone target: ${name}`,
        userId: 'Workspace Administrator'
      });

      handleSelectProject(selectedProject.project.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTask.name || !newTask.dueDate) return;
    try {
      await api.addProjectTask(selectedProject.project.id, {
        name: newTask.name,
        description: '',
        status: newTask.status,
        assigneeId: newTask.assigneeId || null,
        dueDate: newTask.dueDate,
        priority: newTask.priority
      });

      await api.addProjectActivity(selectedProject.project.id, {
        description: `Added project task workflow: ${newTask.name}`,
        userId: 'Workspace Administrator'
      });

      setNewTask({ name: '', assigneeId: '', dueDate: '', status: 'Pending', priority: 'Medium' });
      handleSelectProject(selectedProject.project.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveTask = async (taskId: string, name: string) => {
    if (!selectedProject || !window.confirm(`Delete task: ${name}?`)) return;
    try {
      await api.deleteProjectTask(selectedProject.project.id, taskId);
      handleSelectProject(selectedProject.project.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newDoc.name) return;
    try {
      await api.addProjectDocument(selectedProject.project.id, {
        name: newDoc.name,
        url: newDoc.url,
        type: newDoc.type,
        uploadedBy: 'Workspace Administrator'
      });

      await api.addProjectActivity(selectedProject.project.id, {
        description: `Uploaded new document: ${newDoc.name}`,
        userId: 'Workspace Administrator'
      });

      setNewDoc({ name: '', url: '#', type: 'Overview' });
      handleSelectProject(selectedProject.project.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveDoc = async (docId: string, name: string) => {
    if (!selectedProject || !window.confirm(`Delete document: ${name}?`)) return;
    try {
      await api.deleteProjectDocument(selectedProject.project.id, docId);
      handleSelectProject(selectedProject.project.id);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper lists for selects
  const distinctClients = useMemo(() => Array.from(new Set(projectsList.map(p => p.client).filter(Boolean))), [projectsList]);
  const distinctIndustries = useMemo(() => Array.from(new Set(projectsList.map(p => p.industry).filter(Boolean))), [projectsList]);
  const distinctManagers = useMemo(() => Array.from(new Set(projectsList.map(p => p.projectManager).filter(Boolean))), [projectsList]);

  // Circular progress helper for health score
  const getHealthColorClass = (score: number) => {
    if (score >= 90) return 'text-emerald-500 border-emerald-500/20';
    if (score >= 75) return 'text-[var(--accent)] border-[var(--accent)]/20';
    if (score >= 60) return 'text-yellow-500 border-yellow-500/20';
    if (score >= 40) return 'text-[var(--red)] border-[var(--red)]/20';
    return 'text-[var(--red)] border-[var(--red)]/20';
  };

  const getHealthBGClass = (score: number) => {
    if (score >= 90) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (score >= 75) return 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20';
    if (score >= 60) return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    if (score >= 40) return 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/20';
    return 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/20';
  };

  // Recharts calculations
  const radarData = useMemo(() => {
    if (!selectedProject) return [];
    
    const req = selectedProject.project.requiredSkills || [];
    const mems = selectedProject.members || [];
    const assignedEmps = employees.filter(e => mems.some((m: any) => m.employeeId === e.id));

    return req.map((skillName: string) => {
      // Find highest proficiency among members
      let maxProf = 0;
      assignedEmps.forEach(emp => {
        const matching = emp.technicalSkills.find(s => s.name.toLowerCase() === skillName.toLowerCase());
        if (matching && matching.proficiency > maxProf) {
          maxProf = matching.proficiency;
        }
      });

      return {
        subject: skillName,
        required: 4, // standard enterprise benchmark target
        current: maxProf
      };
    });
  }, [selectedProject, employees]);

  const stats = dashboardStats?.projectStats || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    delayedProjects: 0,
    onHoldProjects: 0,
    totalBudget: 0,
    budgetUsed: 0,
    averageDeliveryHealth: 0,
    averageTeamUtilization: 0
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Project Command Dashboard KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Total / Active</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-outfit font-bold text-[var(--text-primary)]">{stats.totalProjects}</span>
            <span className="text-xs text-[var(--text-tertiary)]">/</span>
            <span className="text-sm font-semibold text-[var(--accent)]">{stats.activeProjects} Active</span>
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Enterprise projects registry</p>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Delayed / On Hold</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-outfit font-bold text-rose-500">{stats.delayedProjects}</span>
            <span className="text-xs text-[var(--text-tertiary)]">/</span>
            <span className="text-sm font-semibold text-[var(--text-secondary)]">{stats.onHoldProjects} On Hold</span>
          </div>
          <p className="text-[12px] text-rose-500/80 mt-1">Attention required alerts</p>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Average Portfolio Health</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className={`text-2xl font-outfit font-bold ${stats.averageDeliveryHealth >= 75 ? 'text-emerald-400' : 'text-yellow-500'}`}>
              {stats.averageDeliveryHealth}%
            </span>
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Weighted KPI scoring index</p>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Budget Utilization</span>
          <div className="flex flex-col mt-2">
            <span className="text-sm font-bold text-[var(--text-primary)]">${stats.budgetUsed.toLocaleString()} Used</span>
            <span className="text-[12px] text-[var(--text-secondary)] mt-0.5">Total: ${stats.totalBudget.toLocaleString()}</span>
          </div>
          <div className="w-full bg-[var(--bg-surface)] rounded-full h-1 mt-2.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{ width: `${Math.min(100, Math.round((stats.budgetUsed / Math.max(1, stats.totalBudget)) * 100))}%` }} />
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col justify-between">
          <span className="text-[12px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Team Utilization</span>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-2xl font-outfit font-bold text-indigo-400">{stats.averageTeamUtilization}%</span>
          </div>
          <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Allocated active bench strength</p>
        </GlassCard>
      </div>

      {/* 2. Main Row: Projects Table Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Data Table List */}
        <div className="xl:col-span-8 space-y-6">
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="font-outfit font-semibold text-base text-[var(--text-primary)]">Company Project Directory</h3>
                <p className="text-xs text-[var(--text-secondary)]">Search, filter, and execute operational CRUD tasks on portfolio projects.</p>
              </div>
              <button
                onClick={() => {
                  setFormProject({ tags: [], requiredSkills: ['React', 'TypeScript'] });
                  setIsCreateOpen(true);
                }}
                className="py-2.5 px-4 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search project name..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs py-2.5 pl-9 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2.5 text-[var(--text-secondary)]"
              >
                <option value="">All Statuses</option>
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Delayed">Delayed</option>
                <option value="On Hold">On Hold</option>
                <option value="Archived">Archived</option>
              </select>

              <select
                value={priorityFilter}
                onChange={e => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2.5 text-[var(--text-secondary)]"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={healthFilter}
                onChange={e => { setHealthFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2.5 text-[var(--text-secondary)]"
              >
                <option value="">All Health Scores</option>
                <option value="Excellent">Excellent (&ge;90)</option>
                <option value="Healthy">Healthy (75-89)</option>
                <option value="Warning">Warning (60-74)</option>
                <option value="High Risk">High Risk (40-59)</option>
                <option value="Critical">Critical (&lt;40)</option>
              </select>
            </div>

            {/* Additional Advanced Row Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <select
                value={clientFilter}
                onChange={e => { setClientFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg text-[12px] p-2 text-[var(--text-secondary)]"
              >
                <option value="">All Clients</option>
                {distinctClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={industryFilter}
                onChange={e => { setIndustryFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg text-[12px] p-2 text-[var(--text-secondary)]"
              >
                <option value="">All Industries</option>
                {distinctIndustries.map(i => <option key={i} value={i}>{i}</option>)}
              </select>

              <select
                value={managerFilter}
                onChange={e => { setManagerFilter(e.target.value); setCurrentPage(1); }}
                className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg text-[12px] p-2 text-[var(--text-secondary)]"
              >
                <option value="">All Managers</option>
                {distinctManagers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              {(statusFilter || priorityFilter || clientFilter || industryFilter || managerFilter || searchQuery || healthFilter) && (
                <button
                  onClick={() => {
                    setStatusFilter('');
                    setPriorityFilter('');
                    setClientFilter('');
                    setIndustryFilter('');
                    setManagerFilter('');
                    setHealthFilter('');
                    setSearchQuery('');
                    setCurrentPage(1);
                  }}
                  className="px-3 text-[12px] font-bold text-[var(--accent)] bg-[var(--accent-soft)] border border-[var(--accent)]/20 rounded-lg hover:bg-[var(--accent-hover)]/20 transition-colors"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* 3. Enterprise Table */}
            {isLoading ? (
              <SkeletonTable />
            ) : processedProjects.length === 0 ? (
              <div className="py-20 text-center text-[var(--text-tertiary)] text-xs border border-dashed border-[var(--border-default)] rounded-xl mt-4 bg-[var(--bg-surface)]">
                <span className="block mb-3">No projects match the current filtering parameters.</span>
                <button 
                  onClick={() => window.location.hash = 'settings-import'} 
                  className="font-medium text-[var(--accent)] hover:underline"
                >
                  Import from CSV
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-md overflow-hidden shadow-sm">
                  <thead className="bg-[var(--bg-canvas)]">
                    <tr className="border-b border-[var(--border-default)] text-[12px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">
                      <th className="p-3 text-[var(--text-secondary)] cursor-pointer" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-1">Project Name <ArrowUpDown className="w-3 h-3" /></div>
                      </th>
                      <th className="p-3 text-[var(--text-secondary)] cursor-pointer" onClick={() => handleSort('client')}>
                        <div className="flex items-center gap-1">Client / BU <ArrowUpDown className="w-3 h-3" /></div>
                      </th>
                      <th className="p-3 text-[var(--text-secondary)] cursor-pointer" onClick={() => handleSort('priority')}>
                        <div className="flex items-center gap-1">Priority <ArrowUpDown className="w-3 h-3" /></div>
                      </th>
                      <th className="p-3 text-[var(--text-secondary)] cursor-pointer" onClick={() => handleSort('status')}>
                        <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
                      </th>
                      <th className="p-3 text-[var(--text-secondary)] cursor-pointer" onClick={() => handleSort('budget')}>
                        <div className="flex items-center gap-1">Budget <ArrowUpDown className="w-3 h-3" /></div>
                      </th>
                      <th className="p-3 text-[var(--text-secondary)] cursor-pointer" onClick={() => handleSort('healthScore')}>
                        <div className="flex items-center gap-1">Health Score <ArrowUpDown className="w-3 h-3" /></div>
                      </th>
                      <th className="p-3 text-[var(--text-secondary)] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedProjects.map(proj => {
                      const score = proj.healthScore || 100;
                      const isSelected = selectedProject?.project.id === proj.id;
                      return (
                        <tr
                          key={proj.id}
                          onClick={() => handleSelectProject(proj.id)}
                          className={`group cursor-pointer transition-colors ${isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)]'}`}
                        >
                          <td className="p-3 pr-3">
                            <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{proj.name}</div>
                            <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">{proj.projectCode || 'No Code'}</div>
                          </td>
                          <td className="p-3 px-1 text-xs">
                            <div className="font-semibold text-[var(--text-primary)]">{proj.client || 'Internal'}</div>
                            <div className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{proj.businessUnit || 'General'}</div>
                          </td>
                          <td className="p-3 px-1 text-xs">
                            <span className={`px-2 py-0.5 text-[12px] font-bold border rounded-md ${
                              proj.priority === 'High' ? 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/20' :
                              proj.priority === 'Medium' ? 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/20' :
                              'bg-slate-500/10 text-[var(--text-secondary)] border-[var(--border-default)]'
                            }`}>
                              {proj.priority}
                            </span>
                          </td>
                          <td className="p-3 px-1 text-xs">
                            <span className={`px-2 py-0.5 text-[12px] font-bold border rounded-md ${
                              proj.status === 'Active' ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20' :
                              proj.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              proj.status === 'Delayed' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              proj.status === 'On Hold' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-slate-500/10 text-[var(--text-secondary)] border-[var(--border-default)]'
                            }`}>
                              {proj.status}
                            </span>
                          </td>
                          <td className="p-3 px-1 text-xs font-bold text-[var(--text-primary)]">
                            ${(proj.budget || 0).toLocaleString()}
                          </td>
                          <td className="p-3 px-1 text-xs">
                            <span className={`px-2 py-1 rounded-lg text-[12px] font-semibold border ${getHealthBGClass(score)}`}>
                              {score}% {proj.healthLevel || 'Excellent'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setFormProject(proj);
                                  setIsEditOpen(true);
                                }}
                                className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
                                title="Edit Project"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDuplicateProject(proj)}
                                className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
                                title="Duplicate Project"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleArchiveProject(proj)}
                                className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
                                title="Archive Project"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id)}
                                className="p-1.5 bg-rose-950/20 hover:bg-rose-900/30 border border-rose-900/20 hover:border-rose-900/40 text-rose-400 rounded-lg transition-colors"
                                title="Delete Project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--border-default)]">
                <span className="text-[12px] text-[var(--text-secondary)]">Showing page {currentPage} of {totalPages}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-xs bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface)] disabled:opacity-50 text-[var(--text-secondary)] border border-[var(--border-default)] rounded-lg"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-xs bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface)] disabled:opacity-50 text-[var(--text-secondary)] border border-[var(--border-default)] rounded-lg"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Project Detail Panel (Tabs Overview/AI Insights/Timeline) */}
        <div className="xl:col-span-4 h-full">
          {isDetailLoading ? (
            <GlassCard className="p-8 text-center"><RefreshCw className="w-6 h-6 text-[var(--accent)] animate-spin mx-auto mb-2" /><span className="text-xs text-[var(--text-secondary)]">Loading project analytics...</span></GlassCard>
          ) : !selectedProject ? (
            <GlassCard className="p-8 text-center text-xs text-[var(--text-tertiary)] flex flex-col items-center justify-center h-80">
              <FolderGit className="w-10 h-10 text-[var(--text-tertiary)] mb-2" />
              <span>Select a project from the directory list to load the executive cockpit and AI insights.</span>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              
              {/* Project Header details & Health Score circle */}
              <GlassCard glow className="p-5 border-[var(--accent)]/20">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="px-2 py-0.5 bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--accent)] font-semibold text-[12px] tracking-widest uppercase rounded">
                      {selectedProject.project.projectCode || 'GENERAL'}
                    </span>
                    <h3 className="font-outfit font-bold text-[var(--text-primary)] mt-2 text-base leading-tight">
                      {selectedProject.project.name}
                    </h3>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-1 line-clamp-2">{selectedProject.project.description}</p>
                  </div>
                  
                  {/* Health Score Circular indicator */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-14 h-14 border-[3px] rounded-full flex flex-col items-center justify-center font-outfit font-bold text-sm relative ${getHealthColorClass(selectedProject.healthScore)}`}>
                      {selectedProject.healthScore}%
                    </div>
                    <span className="text-[12px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mt-1">Health Score</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--border-default)] flex justify-between items-center text-[12px] text-[var(--text-secondary)]">
                  <span>Manager: <strong className="text-[var(--text-primary)]">{selectedProject.project.projectManager || 'Unassigned'}</strong></span>
                  <span>End Date: <strong className="text-[var(--text-primary)]">{selectedProject.project.endDate || 'N/A'}</strong></span>
                </div>
              </GlassCard>

              {/* Sub-tabs selector */}
              <div className="flex overflow-x-auto gap-1 bg-[var(--bg-canvas)] p-1 border border-[var(--border-default)] rounded-xl">
                {(['overview', 'health', 'team', 'timeline', 'skills', 'documents', 'risks'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all ${activeTab === tab ? 'bg-[var(--accent)] text-white text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* TAB CONTENT: OVERVIEW */}
              {activeTab === 'overview' && (
                <GlassCard className="p-5 space-y-4">
                  <h4 className="font-outfit font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-[var(--accent)]" /> Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)] block">Client</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedProject.project.client || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)] block">Industry</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedProject.project.industry || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)] block">Business Unit</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedProject.project.businessUnit || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)] block">Start Date</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedProject.project.startDate || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)] block">Technical Lead</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedProject.project.technicalLead || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[12px] text-[var(--text-tertiary)] block">Delivery Lead</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedProject.project.deliveryLead || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
                    <span className="text-[12px] text-[var(--text-tertiary)] block mb-1.5">Project Tags</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedProject.project.tags || []).map((t: string) => (
                        <span key={t} className="text-[12px] bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-secondary)] px-2 py-0.5 rounded-lg">{t}</span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* TAB CONTENT: HEALTH */}
              {activeTab === 'health' && (
                <GlassCard className="p-5 space-y-4">
                  <h4 className="font-outfit font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5"><Gauge className="w-4 h-4 text-[var(--accent)]" /> AI Project Health Engine</h4>
                  
                  {/* Health Trends */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-[var(--bg-surface)]/30 border border-[var(--border-default)] rounded-xl">
                      <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase block">Weekly Trend</span>
                      <span className={`text-sm font-bold mt-1 block ${selectedProject.healthTrendWeek >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {selectedProject.healthTrendWeek >= 0 ? `+${selectedProject.healthTrendWeek}` : selectedProject.healthTrendWeek}%
                      </span>
                    </div>
                    <div className="p-3 bg-[var(--bg-surface)]/30 border border-[var(--border-default)] rounded-xl">
                      <span className="text-[12px] font-bold text-[var(--text-secondary)] uppercase block">Monthly Trend</span>
                      <span className={`text-sm font-bold mt-1 block ${selectedProject.healthTrendMonth >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {selectedProject.healthTrendMonth >= 0 ? `+${selectedProject.healthTrendMonth}` : selectedProject.healthTrendMonth}%
                      </span>
                    </div>
                  </div>

                  {/* AI Explanation reasoning */}
                  <div className="p-4 bg-[var(--bg-surface)]/20 border border-[var(--border-default)] rounded-2xl">
                    <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase text-[var(--accent)]"><Brain className="w-3.5 h-3.5" /> AI Diagnostic Reasoning</div>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-2 leading-relaxed">{selectedProject.healthExplanation}</p>
                  </div>

                  {/* Forecast Panel dials */}
                  <div className="space-y-3 pt-3 border-t border-[var(--border-default)]">
                    <div className="flex justify-between text-[12px] font-medium text-[var(--text-secondary)]">
                      <span>Chance of On-Time Delivery</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedProject.forecast.chanceOfOnTimeDelivery}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedProject.forecast.chanceOfOnTimeDelivery}%` }} />
                    </div>

                    <div className="flex justify-between text-[12px] font-medium text-[var(--text-secondary)]">
                      <span>Chance of Budget Overrun</span>
                      <span className="font-bold text-[var(--text-primary)]">{selectedProject.forecast.chanceOfBudgetOverrun}%</span>
                    </div>
                    <div className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${selectedProject.forecast.chanceOfBudgetOverrun}%` }} />
                    </div>

                    <div className="flex justify-between items-center text-[12px] text-[var(--text-secondary)] pt-2">
                      <span>Est. Completion: <strong className="text-[var(--text-primary)]">{selectedProject.forecast.estimatedCompletionDate}</strong></span>
                      <span>Delivery Confidence: <strong className="text-indigo-400">{selectedProject.deliveryConfidence}%</strong></span>
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* TAB CONTENT: TEAM ASSIGNMENT */}
              {activeTab === 'team' && (
                <GlassCard className="p-5 space-y-4">
                  <h4 className="font-outfit font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5"><Users className="w-4 h-4 text-[var(--accent)]" /> Team Allocation</h4>
                  
                  {/* Members list */}
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedProject.members.length === 0 ? (
                      <div className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No team members assigned to this project yet.</div>
                    ) : (
                      selectedProject.members.map((m: any) => {
                        const emp = employees.find(e => e.id === m.employeeId);
                        if (!emp) return null;
                        return (
                          <div key={m.id} className="flex justify-between items-center p-2.5 bg-[var(--bg-surface)]/30 border border-[var(--border-default)] rounded-xl hover:border-[var(--border-default)]/80 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 bg-[var(--bg-canvas)] border border-[var(--border-default)] text-[12px] font-bold text-[var(--accent)] rounded-lg flex items-center justify-center uppercase">
                                {emp.name.split(' ').map((n: string) => n[0]).join('')}
                              </div>
                              <div>
                                <h5 className="text-[12px] font-bold text-[var(--text-primary)]">{emp.name}</h5>
                                <p className="text-[12px] text-[var(--text-tertiary)] leading-none mt-0.5">{m.role} | {m.allocation}% allocation</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-right">
                              <div className="text-[12px]">
                                <div className="font-semibold text-[var(--accent)]">{m.skillMatch !== undefined ? m.skillMatch : 100}% match</div>
                                <div className="text-[var(--text-tertiary)] text-[12px]">Perf: {m.performance ? m.performance.toFixed(1) : (emp?.performanceRating || 0).toFixed(1)}/5</div>
                              </div>
                              <button
                                onClick={() => handleRemoveMember(m.id, emp.name)}
                                className="p-1 hover:bg-rose-950/20 text-[var(--text-tertiary)] hover:text-rose-500 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Member Form */}
                  <form onSubmit={handleAddMember} className="space-y-3 pt-3 border-t border-[var(--border-default)]">
                    <div className="flex justify-between items-center">
                      <span className="text-[12px] text-[var(--text-secondary)] font-bold uppercase block">Assign Employee</span>
                      <button 
                        type="button" 
                        onClick={handleAutoAssignAI} 
                        disabled={isAutoAssigning}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        <Brain className={`w-3.5 h-3.5 ${isAutoAssigning ? 'animate-pulse' : ''}`} />
                        {isAutoAssigning ? 'Analyzing...' : 'Auto Assign (AI)'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newMember.employeeId}
                        onChange={e => setNewMember(prev => ({ ...prev, employeeId: e.target.value }))}
                        className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                        required
                      >
                        <option value="">Select Talent...</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>

                      <select
                        value={newMember.role}
                        onChange={e => setNewMember(prev => ({ ...prev, role: e.target.value as any }))}
                        className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                      >
                        <option value="Technical Lead">Technical Lead</option>
                        <option value="Backend">Backend</option>
                        <option value="Frontend">Frontend</option>
                        <option value="QA">QA</option>
                        <option value="DevOps">DevOps</option>
                        <option value="Designer">Designer</option>
                        <option value="Business Analyst">Business Analyst</option>
                        <option value="Project Manager">Project Manager</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Allocation % (e.g., 50)"
                        value={newMember.allocation}
                        onChange={e => setNewMember(prev => ({ ...prev, allocation: Number(e.target.value) }))}
                        className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                        min="10" max="100" required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-semibold"
                      >
                        Assign
                      </button>
                    </div>
                  </form>
                </GlassCard>
              )}

              {/* TAB CONTENT: TIMELINE & MILESTONES */}
              {activeTab === 'timeline' && (
                <GlassCard className="p-5 space-y-4">
                  <h4 className="font-outfit font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[var(--accent)]" /> Milestones & Timeline</h4>
                  
                  {/* Milestones list */}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {selectedProject.milestones.length === 0 ? (
                      <div className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No milestones scheduled yet.</div>
                    ) : (
                      selectedProject.milestones.map((m: any) => {
                        const owner = employees.find(e => e.id === m.ownerId);
                        return (
                          <div key={m.id} className="flex justify-between items-center p-2.5 bg-[var(--bg-surface)]/30 border border-[var(--border-default)] rounded-xl hover:border-[var(--border-default)]/80 transition-colors">
                            <div>
                              <h5 className="text-[12px] font-bold text-[var(--text-primary)]">{m.name}</h5>
                              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Due: {m.dueDate} | Owner: {owner ? owner.name : 'Unassigned'}</p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[12px] font-bold border rounded ${
                                m.status === 'Planning' ? 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)]' :
                                m.status === 'Development' ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20' :
                                m.status === 'Testing' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}>
                                {m.status}
                              </span>
                              <button
                                onClick={() => handleRemoveMilestone(m.id, m.name)}
                                className="p-1 hover:bg-rose-950/20 text-[var(--text-tertiary)] hover:text-rose-500 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Milestone form */}
                  <form onSubmit={handleAddMilestone} className="space-y-3 pt-3 border-t border-[var(--border-default)]">
                    <span className="text-[12px] text-[var(--text-secondary)] font-bold uppercase block">Add Milestone</span>
                    <input
                      type="text"
                      placeholder="Milestone target name..."
                      value={newMilestone.name}
                      onChange={e => setNewMilestone(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                      required
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        value={newMilestone.dueDate}
                        onChange={e => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                        required
                      />

                      <select
                        value={newMilestone.ownerId}
                        onChange={e => setNewMilestone(prev => ({ ...prev, ownerId: e.target.value }))}
                        className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                      >
                        <option value="">Owner...</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={newMilestone.status}
                        onChange={e => setNewMilestone(prev => ({ ...prev, status: e.target.value as any }))}
                        className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                      >
                        <option value="Planning">Planning</option>
                        <option value="Design">Design</option>
                        <option value="Development">Development</option>
                        <option value="Testing">Testing</option>
                        <option value="Deployment">Deployment</option>
                        <option value="Maintenance">Maintenance</option>
                      </select>
                      
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-semibold"
                      >
                        Add Target
                      </button>
                    </div>
                  </form>
                </GlassCard>
              )}

              {/* TAB CONTENT: SKILLS & HEATMAP */}
              {activeTab === 'skills' && (
                <GlassCard className="p-5 space-y-4">
                  <h4 className="font-outfit font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5"><Brain className="w-4 h-4 text-[var(--accent)]" /> Project Skill Coverage</h4>

                  {radarData.length === 0 ? (
                    <div className="text-[12px] text-[var(--text-tertiary)] text-center py-4">Define skills and assign members to generate radar charts.</div>
                  ) : (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                          <PolarGrid stroke="#E6E8EB" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#8A8F98', fontSize: 8 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#64748b', fontSize: 8 }} />
                          <Radar name="Target Bench" dataKey="required" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                          <Radar name="Current Roster" dataKey="current" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                          <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E6E8EB' }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  <div className="space-y-2 pt-3 border-t border-[var(--border-default)]">
                    <span className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Coverage Percentage</span>
                    <div className="flex justify-between items-center text-xs text-[var(--text-secondary)] mt-1">
                      <span>Roster Skill Fit Score</span>
                      <strong className="text-emerald-400">{selectedProject.metrics.skillCoverage}%</strong>
                    </div>
                    <div className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedProject.metrics.skillCoverage}%` }} />
                    </div>
                  </div>
                </GlassCard>
              )}

              {/* TAB CONTENT: DOCUMENTS */}
              {activeTab === 'documents' && (
                <GlassCard className="p-5 space-y-4">
                  <h4 className="font-outfit font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5"><FileText className="w-4 h-4 text-[var(--accent)]" /> Shared Documents</h4>
                  
                  {/* Documents list */}
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {selectedProject.documents.length === 0 ? (
                      <div className="text-[12px] text-[var(--text-tertiary)] text-center py-4">No documentation uploaded yet.</div>
                    ) : (
                      selectedProject.documents.map((d: any) => (
                        <div key={d.id} className="flex justify-between items-center p-2.5 bg-[var(--bg-surface)]/30 border border-[var(--border-default)] rounded-xl hover:border-[var(--border-default)]/80 transition-colors">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                            <div>
                              <h5 className="text-[12px] font-bold text-[var(--text-primary)] truncate w-40">{d.name}</h5>
                              <p className="text-[12px] text-[var(--text-tertiary)]">Uploaded: {d.uploadedAt} | {d.type}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded text-[12px] font-bold text-[var(--accent)] hover:bg-[var(--bg-surface)] transition-colors"
                            >
                              Open
                            </a>
                            <button
                              onClick={() => handleRemoveDoc(d.id, d.name)}
                              className="p-1 hover:bg-rose-950/20 text-[var(--text-tertiary)] hover:text-rose-500 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Document upload form */}
                  <form onSubmit={handleAddDoc} className="space-y-3 pt-3 border-t border-[var(--border-default)]">
                    <span className="text-[12px] text-[var(--text-secondary)] font-bold uppercase block">Register/Upload Document</span>
                    <input
                      type="text"
                      placeholder="Document name (e.g. Kickoff Slides)..."
                      value={newDoc.name}
                      onChange={e => setNewDoc(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                      required
                    />

                    <div className="flex gap-2">
                      <select
                        value={newDoc.type}
                        onChange={e => setNewDoc(prev => ({ ...prev, type: e.target.value as any }))}
                        className="flex-1 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                      >
                        <option value="Overview">Overview</option>
                        <option value="Team">Team</option>
                        <option value="Milestones">Milestones</option>
                        <option value="Documents">Documents</option>
                        <option value="Meeting Notes">Meeting Notes</option>
                        <option value="Architecture">Architecture</option>
                        <option value="Risks">Risks</option>
                        <option value="Activity">Activity</option>
                      </select>
                      
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-semibold animate-pulse"
                      >
                        Register
                      </button>
                    </div>
                  </form>
                </GlassCard>
              )}

              {/* TAB CONTENT: ACTIVE RISKS */}
              {activeTab === 'risks' && (
                <GlassCard className="p-5 space-y-4">
                  <h4 className="font-outfit font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-[var(--accent)]" /> Flagged Risks & Mitigations</h4>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {selectedProject.risks.length === 0 ? (
                      <div className="text-[12px] text-[var(--text-tertiary)] text-center py-4 flex flex-col items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <span>No risks flagged on delivery channels.</span>
                      </div>
                    ) : (
                      selectedProject.risks.map((r: any) => (
                        <div key={r.id} className="p-3 bg-[var(--bg-surface)]/30 border border-[var(--border-default)] rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-wider">{r.type}</span>
                            <span className={`px-2 py-0.5 text-[12px] font-bold border rounded-md uppercase tracking-wider ${
                              r.severity === 'Critical' ? 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/20' :
                              r.severity === 'High' ? 'bg-[var(--red-soft)] text-[var(--red)] border-[var(--red)]/20' :
                              r.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                              'bg-slate-500/10 text-[var(--text-secondary)] border-[var(--border-default)]'
                            }`}>
                              {r.severity}
                            </span>
                          </div>
                          
                          <p className="text-[12px] text-[var(--text-secondary)] leading-normal">{r.description}</p>
                          
                          <div className="pt-2 border-t border-[var(--border-default)] text-[12px]">
                            <div className="font-semibold text-[var(--accent)] flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> AI Recommendation:</div>
                            <p className="text-[12px] text-[var(--text-secondary)] mt-1 leading-normal italic">{r.recommendation}</p>
                            <p className="text-[12px] text-emerald-400 font-semibold mt-1">{r.expectedImprovement}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </GlassCard>
              )}

            </div>
          )}
        </div>

      </div>

      {/* 4. CRUD Modals: Create Project */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-[var(--bg-canvas)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-6 space-y-4">
            <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">Create New Project</h3>
            <form onSubmit={handleSaveCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Name</label>
                  <input
                    type="text"
                    value={formProject.name || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Project Code</label>
                  <input
                    type="text"
                    placeholder="PRJ-ABC-01"
                    value={formProject.projectCode || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, projectCode: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Description</label>
                <textarea
                  value={formProject.description || ''}
                  onChange={e => setFormProject(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)] h-16"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Client</label>
                  <input
                    type="text"
                    value={formProject.client || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Industry</label>
                  <input
                    type="text"
                    value={formProject.industry || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Business Unit</label>
                  <input
                    type="text"
                    value={formProject.businessUnit || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, businessUnit: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Project Manager</label>
                  <input
                    type="text"
                    value={formProject.projectManager || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, projectManager: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Status</label>
                  <select
                    value={formProject.status || 'Planning'}
                    onChange={e => setFormProject(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Priority</label>
                  <select
                    value={formProject.priority || 'Medium'}
                    onChange={e => setFormProject(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Budget ($)</label>
                  <input
                    type="number"
                    value={formProject.budget || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Start Date</label>
                  <input
                    type="date"
                    value={formProject.startDate || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">End Date</label>
                  <input
                    type="date"
                    value={formProject.endDate || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-semibold"
                >
                  Create
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* CRUD Modals: Edit Project */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-[var(--bg-canvas)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full p-6 space-y-4">
            <h3 className="font-outfit font-bold text-base text-[var(--text-primary)]">Edit Project</h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Name</label>
                  <input
                    type="text"
                    value={formProject.name || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Project Code</label>
                  <input
                    type="text"
                    value={formProject.projectCode || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, projectCode: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Description</label>
                <textarea
                  value={formProject.description || ''}
                  onChange={e => setFormProject(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)] h-16"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Client</label>
                  <input
                    type="text"
                    value={formProject.client || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, client: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Industry</label>
                  <input
                    type="text"
                    value={formProject.industry || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Business Unit</label>
                  <input
                    type="text"
                    value={formProject.businessUnit || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, businessUnit: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Project Manager</label>
                  <input
                    type="text"
                    value={formProject.projectManager || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, projectManager: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Status</label>
                  <select
                    value={formProject.status || 'Planning'}
                    onChange={e => setFormProject(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Priority</label>
                  <select
                    value={formProject.priority || 'Medium'}
                    onChange={e => setFormProject(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Budget ($)</label>
                  <input
                    type="number"
                    value={formProject.budget || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">Start Date</label>
                  <input
                    type="date"
                    value={formProject.startDate || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-bold uppercase text-[var(--text-secondary)]">End Date</label>
                  <input
                    type="date"
                    value={formProject.endDate || ''}
                    onChange={e => setFormProject(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs p-2 text-[var(--text-secondary)]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl text-xs font-semibold text-[var(--text-secondary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] text-white rounded-xl text-xs font-semibold animate-pulse"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

    </div>
  );
};
