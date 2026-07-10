import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node as FlowNode,
  Edge as FlowEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GlassCard } from './GlassCard';
import { api, Employee, Project } from '../utils/api';
import { 
  Sparkles, 
  GitBranch, 
  Users, 
  Play, 
  Trash2, 
  UserPlus, 
  Shuffle, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Activity, 
  Info,
  DollarSign,
  PieChart
} from 'lucide-react';

interface OrgTwinWorkspaceProps {
  employees: Employee[];
  projects: Project[];
}

export const OrgTwinWorkspace: React.FC<OrgTwinWorkspaceProps> = ({ employees: initialEmployees, projects: initialProjects }) => {
  const [activeSubTab, setActiveSubTab] = useState<'twin' | 'knowledge' | 'skills'>('twin');

  // Simulation State
  const [simulatedEmployees, setSimulatedEmployees] = useState<Employee[]>(initialEmployees);
  const [simulatedProjects, setSimulatedProjects] = useState<Project[]>(initialProjects);
  const [isSimulating, setIsSimulating] = useState(false);

  // Quick Action form states
  const [layoffDept, setLayoffDept] = useState('Engineering');
  const [transferEmpId, setTransferEmpId] = useState('');
  const [transferTargetId, setTransferTargetId] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [mergeSourceDept, setMergeSourceDept] = useState('Data Science');
  const [mergeTargetDept, setMergeTargetDept] = useState('Engineering');
  const [resignationId, setResignationId] = useState('');
  const [budgetReductionPct, setBudgetReductionPct] = useState(10);

  // Knowledge Graph Search State
  const [kgQuery, setKgQuery] = useState('');
  const [kgResults, setKgResults] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [kgLoading, setKgLoading] = useState(false);

  // Selection state
  const [selectedNodeData, setSelectedNodeData] = useState<any | null>(null);

  // Recalculate metrics in memory
  const metrics = useMemo(() => {
    const totalEmps = simulatedEmployees.length;
    if (totalEmps === 0) {
      return {
        capabilityScore: 0,
        skillCoverage: 0,
        projectHealth: 0,
        benchStrength: 0,
        budget: 0,
        utilization: 0,
        recommendations: []
      };
    }

    const totalExp = simulatedEmployees.reduce((sum, e) => sum + e.experienceYears, 0);
    const avgExp = totalExp / totalEmps;
    const totalPerf = simulatedEmployees.reduce((sum, e) => sum + e.performanceRating, 0);
    const avgPerf = totalPerf / totalEmps;

    // Avg Skill level
    let totalSkillsCount = 0;
    let totalSkillsSum = 0;
    simulatedEmployees.forEach(e => {
      e.technicalSkills.forEach(s => {
        totalSkillsCount++;
        totalSkillsSum += s.proficiency;
      });
    });
    const avgSkillProf = totalSkillsCount > 0 ? totalSkillsSum / totalSkillsCount : 0;

    const capabilityScore = Math.round((avgPerf / 5.0) * 40 + (avgSkillProf / 5.0) * 40 + Math.min((avgExp / 10.0) * 20, 20));

    // Skill Coverage
    const targetSkills = ['LLMs', 'Kubernetes', 'TypeScript', 'React', 'GraphQL', 'Docker', 'Terraform', 'Python'];
    const coveredCount = targetSkills.filter(ts =>
      simulatedEmployees.some(e => e.technicalSkills.some(s => s.name.toLowerCase() === ts.toLowerCase() && s.proficiency >= 3))
    ).length;
    const skillCoverage = Math.round((coveredCount / targetSkills.length) * 100);

    // Project Health
    let healthyCount = 0;
    simulatedProjects.forEach(p => {
      const assigned = simulatedEmployees.filter(e => e.currentProjects.includes(p.name));
      const hasReqSkills = p.requiredSkills.every(rs =>
        assigned.some(e => e.technicalSkills.some(s => s.name.toLowerCase() === rs.toLowerCase() && s.proficiency >= 3))
      );
      if (assigned.length >= p.teamSize && hasReqSkills) healthyCount++;
    });
    const projectHealth = simulatedProjects.length > 0 ? Math.round((healthyCount / simulatedProjects.length) * 100) : 100;

    // Bench strength (employees on 0 projects)
    const benchCount = simulatedEmployees.filter(e => e.currentProjects.length === 0).length;
    const benchStrength = Math.round((benchCount / totalEmps) * 100);

    // Total active budgets
    const totalBudget = simulatedProjects.reduce((sum, p) => sum + (p.budget || 80000), 0);

    // Resource utilization
    const activeStaff = simulatedEmployees.filter(e => e.currentProjects.length > 0).length;
    const utilization = Math.round((activeStaff / totalEmps) * 100);

    // Dynamic simulation recommendations
    const recommendations: string[] = [];
    if (skillCoverage < 70) recommendations.push('Skill Coverage is low. Recommend upskilling campaigns for AI/ML domains.');
    if (projectHealth < 80) recommendations.push('Understaffed projects detected. Run AI Staffing Optimizer to assign backups.');
    if (benchStrength > 30) recommendations.push('High bench strength detected. Assign unutilized talent to backlog projects.');
    if (utilization > 90) recommendations.push('Resource burnout risk detected. Shift junior tasks to benches.');

    return {
      capabilityScore,
      skillCoverage,
      projectHealth,
      benchStrength,
      budget: totalBudget,
      utilization,
      recommendations
    };
  }, [simulatedEmployees, simulatedProjects]);

  // Sync back if user changes initial data
  useEffect(() => {
    if (!isSimulating) {
      setSimulatedEmployees(initialEmployees);
      setSimulatedProjects(initialProjects);
    }
  }, [initialEmployees, initialProjects]);

  // Simulation Actions
  const simulateResignation = (id: string) => {
    if (!id) return;
    setIsSimulating(true);
    setSimulatedEmployees(prev => prev.filter(e => e.id !== id));
  };

  const simulatePromotion = (id: string) => {
    if (!id) return;
    setIsSimulating(true);
    setSimulatedEmployees(prev => prev.map(e => {
      if (e.id === id) {
        return {
          ...e,
          role: e.role.includes('Senior') ? `Lead ${e.role.replace('Senior ', '')}` : `Senior ${e.role}`,
          performanceRating: Math.min(5.0, e.performanceRating + 0.2)
        };
      }
      return e;
    }));
  };

  const simulateHiring = () => {
    setIsSimulating(true);
    const newEmp: Employee = {
      id: `sim-${Math.random().toString(36).substr(2, 4)}`,
      name: 'Simulated AI Hire',
      email: 'new.hire@simulation.workforce.ai',
      department: 'Engineering',
      role: 'Staff Engineer (AI)',
      experienceYears: 7,
      performanceRating: 4.5,
      technicalSkills: [
        { name: 'React', proficiency: 4 },
        { name: 'TypeScript', proficiency: 4 },
        { name: 'Python', proficiency: 4 },
        { name: 'LLMs', proficiency: 4 }
      ],
      softSkills: ['Mentorship', 'Agile'],
      certifications: [],
      currentProjects: [],
      profileSummary: 'Simulated profile for org capacity testing.',
      managerId: 'emp-01'
    };
    setSimulatedEmployees(prev => [...prev, newEmp]);
  };

  const simulateTransfer = (empId: string, targetId: string) => {
    if (!empId || !targetId) return;
    setIsSimulating(true);
    setSimulatedEmployees(prev => prev.map(e => {
      if (e.id === empId) {
        return { ...e, managerId: targetId };
      }
      return e;
    }));
  };

  const simulateDeptMerge = (source: string, target: string) => {
    setIsSimulating(true);
    setSimulatedEmployees(prev => prev.map(e => {
      if (e.department === source) {
        return { ...e, department: target };
      }
      return e;
    }));
  };

  const simulateLayoffs = (dept: string) => {
    setIsSimulating(true);
    setSimulatedEmployees(prev => prev.filter(e => e.department !== dept));
  };

  const simulateBudgetReduction = (pct: number) => {
    setIsSimulating(true);
    setSimulatedProjects(prev => prev.map(p => ({
      ...p,
      budget: Math.round((p.budget || 80000) * (1 - pct / 100))
    })));
  };

  const resetSimulation = () => {
    setSimulatedEmployees(initialEmployees);
    setSimulatedProjects(initialProjects);
    setIsSimulating(false);
    setSelectedNodeData(null);
  };

  // Traversal & React Flow Node/Edge Generation for Twin view
  const twinGraph = useMemo(() => {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    
    // Position settings
    let yPos = 30;
    
    // 1. Root manager Alex Rivera (has no managerId)
    const root = simulatedEmployees.find(e => !e.managerId);
    
    // Sort employees to place reports under managers recursively
    const placeNodes = (manager: Employee, x: number, y: number, level: number) => {
      const reports = simulatedEmployees.filter(e => e.managerId === manager.id);
      
      const isBroken = manager.managerId && !simulatedEmployees.some(e => e.id === manager.managerId);
      
      nodes.push({
        id: manager.id,
        type: 'default',
        data: {
          label: (
            <div className="text-left">
              <div className="font-extrabold text-[11px] text-slate-100 flex items-center justify-between">
                <span>{manager.name}</span>
                {isBroken && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">{manager.role}</div>
              <div className="text-[8px] text-blue-400 font-bold uppercase mt-1">{manager.department}</div>
            </div>
          )
        },
        position: { x, y },
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          border: isBroken ? '2px solid rgba(239, 68, 68, 0.8)' : '1.5px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '12px',
          boxShadow: isBroken ? '0 0 15px rgba(239, 68, 68, 0.25)' : '0 4px 15px rgba(59, 130, 246, 0.08)',
          width: 170
        }
      });

      if (manager.managerId) {
        edges.push({
          id: `edge-${manager.managerId}-${manager.id}`,
          source: manager.managerId,
          target: manager.id,
          animated: isBroken,
          style: { stroke: isBroken ? '#ef4444' : 'rgba(59, 130, 246, 0.4)', strokeWidth: isBroken ? 2.5 : 1.5 }
        });
      }

      // Render reports side-by-side
      reports.forEach((rep, idx) => {
        const xOffset = (idx - (reports.length - 1) / 2) * 220;
        placeNodes(rep, x + xOffset, y + 160, level + 1);
      });
    };

    if (root) {
      placeNodes(root, 400, 30, 0);
    } else if (simulatedEmployees.length > 0) {
      // If root resigned, render others linearly
      simulatedEmployees.forEach((emp, idx) => {
        placeNodes(emp, 200 + idx * 220, 30, 0);
      });
    }

    return { nodes, edges };
  }, [simulatedEmployees]);

  // Knowledge Graph visual search endpoint handler
  const handleKgSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kgQuery.trim()) return;

    setKgLoading(true);
    try {
      const data = await api.searchKnowledgeGraph(kgQuery);
      setKgResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setKgLoading(false);
    }
  };

  // Convert KG results to React Flow format
  const kgGraph = useMemo(() => {
    if (!kgResults) return { nodes: [], edges: [] };
    
    const flowNodes: FlowNode[] = [];
    const flowEdges: FlowEdge[] = [];

    kgResults.nodes.forEach((n, idx) => {
      let border = 'rgba(59, 130, 246, 0.4)';
      let shadow = 'rgba(59, 130, 246, 0.05)';
      let bgLabel = 'Employee';

      if (n.type === 'skill') {
        border = 'rgba(139, 92, 246, 0.4)';
        shadow = 'rgba(139, 92, 246, 0.05)';
        bgLabel = 'Skill';
      } else if (n.type === 'project') {
        border = 'rgba(16, 185, 129, 0.4)';
        shadow = 'rgba(16, 185, 129, 0.05)';
        bgLabel = 'Project';
      } else if (n.type === 'client') {
        border = 'rgba(245, 158, 11, 0.4)';
        shadow = 'rgba(245, 158, 11, 0.05)';
        bgLabel = 'Client';
      }

      // Calculate grid coordinate position
      const row = Math.floor(idx / 3);
      const col = idx % 3;

      flowNodes.push({
        id: n.id,
        type: 'default',
        data: {
          label: (
            <div className="text-left">
              <div className="font-extrabold text-[11px] text-slate-100">{n.label}</div>
              {n.role && <div className="text-[9px] text-slate-400 mt-0.5">{n.role}</div>}
              <div className="text-[7px] uppercase font-black text-slate-500 mt-1 block">{bgLabel}</div>
            </div>
          )
        },
        position: { x: 100 + col * 260, y: 50 + row * 180 },
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          border: `1.5px solid ${border}`,
          borderRadius: '12px',
          boxShadow: `0 4px 15px ${shadow}`,
          width: 180
        }
      });
    });

    kgResults.edges.forEach(e => {
      flowEdges.push({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        label: e.label,
        labelStyle: { fill: '#94a3b8', fontSize: 7, fontWeight: 700, background: 'transparent' },
        style: { stroke: 'rgba(255, 255, 255, 0.15)' }
      });
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [kgResults]);

  // Skill Graph View computation (original view fallback)
  const skillsGraph = useMemo(() => {
    const nodes: FlowNode[] = [];
    const edges: FlowEdge[] = [];
    const allSkills = Array.from(new Set(initialEmployees.flatMap(e => e.technicalSkills.map(s => s.name))));
    const allTechs = Array.from(new Set(initialProjects.flatMap(p => p.requiredSkills)));

    initialEmployees.forEach((emp, idx) => {
      nodes.push({
        id: `sg-emp-${emp.id}`,
        type: 'default',
        data: {
          label: (
            <div>
              <div className="font-extrabold text-[10px] text-slate-100">{emp.name}</div>
              <div className="text-[8px] text-slate-400">{emp.role}</div>
            </div>
          )
        },
        position: { x: 50, y: 30 + idx * 100 },
        style: { background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '10px', width: 140 }
      });
    });

    allSkills.forEach((skill, idx) => {
      nodes.push({
        id: `sg-skill-${skill.toLowerCase()}`,
        type: 'default',
        data: {
          label: (
            <div>
              <div className="font-bold text-[9px] text-slate-200">{skill}</div>
            </div>
          )
        },
        position: { x: 300, y: 30 + idx * 70 },
        style: { background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(139, 92, 246, 0.4)', borderRadius: '10px', width: 100 }
      });
    });

    // Connect them
    initialEmployees.forEach(emp => {
      emp.technicalSkills.forEach(skill => {
        if (skill.proficiency >= 3) {
          edges.push({
            id: `sg-edge-${emp.id}-${skill.name.toLowerCase()}`,
            source: `sg-emp-${emp.id}`,
            target: `sg-skill-${skill.name.toLowerCase()}`,
            style: { stroke: 'rgba(255, 255, 255, 0.1)' }
          });
        }
      });
    });

    return { nodes, edges };
  }, [initialEmployees, initialProjects]);

  // Click handler on nodes to display details
  const onNodeClick = (_: any, node: FlowNode) => {
    // Determine the object type
    const emp = simulatedEmployees.find(e => e.id === node.id);
    const proj = simulatedProjects.find(p => p.id === node.id);
    
    if (emp) {
      setSelectedNodeData({ type: 'employee', data: emp });
    } else if (proj) {
      setSelectedNodeData({ type: 'project', data: proj });
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 overflow-hidden">
      {/* Legend & Navigation Tab Bar */}
      <GlassCard glow className="bg-slate-950/80 border-blue-500/10 flex items-center justify-between shrink-0 p-4 gap-4">
        <div className="flex items-center space-x-6">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => { setActiveSubTab('twin'); resetSimulation(); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeSubTab === 'twin' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              AI Organization Digital Twin
            </button>
            <button
              onClick={() => setActiveSubTab('knowledge')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeSubTab === 'knowledge' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Workforce Knowledge Graph
            </button>
            <button
              onClick={() => setActiveSubTab('skills')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
                activeSubTab === 'skills' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              AI Skill Graph
            </button>
          </div>
        </div>

        {/* Real-time simulation status alert */}
        {activeSubTab === 'twin' && (
          <div className="flex items-center gap-3">
            {isSimulating ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                Simulation Active (In Memory)
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                Linked to Live Data
              </div>
            )}
          </div>
        )}
      </GlassCard>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left Side: Dynamic Visualization Viewport */}
        <div className="flex-1 glass-panel rounded-3xl overflow-hidden relative border border-slate-900">
          <ReactFlow
            nodes={
              activeSubTab === 'twin' ? twinGraph.nodes : 
              activeSubTab === 'knowledge' ? kgGraph.nodes : 
              skillsGraph.nodes
            }
            edges={
              activeSubTab === 'twin' ? twinGraph.edges : 
              activeSubTab === 'knowledge' ? kgGraph.edges : 
              skillsGraph.edges
            }
            fitView
            minZoom={0.1}
            maxZoom={1.8}
            onNodeClick={onNodeClick}
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls showInteractive={false} />
            <MiniMap
              nodeColor={(node) => {
                if (node.id.startsWith('sim')) return '#ea580c';
                if (node.id.startsWith('skill')) return '#8b5cf6';
                if (node.id.startsWith('proj')) return '#10b981';
                return '#3b82f6';
              }}
              maskColor="rgba(3, 7, 18, 0.7)"
              style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px'
              }}
            />
          </ReactFlow>
        </div>

        {/* Right Side: Interactive Panel (Width 360px) */}
        <div className="w-96 shrink-0 flex flex-col gap-6 overflow-y-auto pr-1">
          
          {/* Sub-tab view panel */}
          {activeSubTab === 'twin' && (
            <>
              {/* Simulation Playground Controls */}
              <GlassCard className="space-y-4">
                <div>
                  <h4 className="font-outfit font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-400" />
                    Sandbox Simulation Panel
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Model workforce transformations without production impact.</p>
                </div>

                <div className="space-y-3.5 border-t border-slate-900 pt-3">
                  {/* Resignation */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Simulate Resignation</label>
                    <div className="flex gap-2">
                      <select
                        value={resignationId}
                        onChange={e => setResignationId(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 text-slate-300"
                      >
                        <option value="">Select Employee</option>
                        {simulatedEmployees.map(e => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => simulateResignation(resignationId)}
                        disabled={!resignationId}
                        className="p-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 text-xs rounded-lg transition-colors font-bold disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Transfer / Manager Assignment */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Transfer Employee</label>
                    <div className="flex gap-2">
                      <select
                        value={transferEmpId}
                        onChange={e => setTransferEmpId(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 text-slate-300"
                      >
                        <option value="">Select Employee</option>
                        {simulatedEmployees.map(e => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                      <select
                        value={transferTargetId}
                        onChange={e => setTransferTargetId(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 text-slate-300"
                      >
                        <option value="">Target Manager</option>
                        {simulatedEmployees.filter(e => e.id !== transferEmpId).map(e => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => simulateTransfer(transferEmpId, transferTargetId)}
                        disabled={!transferEmpId || !transferTargetId}
                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 text-xs rounded-lg transition-colors font-bold disabled:opacity-50"
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Layoffs by Dept */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Layoff Department</label>
                    <div className="flex gap-2">
                      <select
                        value={layoffDept}
                        onChange={e => setLayoffDept(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs p-1.5 text-slate-300"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Design">Design</option>
                        <option value="Product">Product</option>
                      </select>
                      <button
                        onClick={() => simulateLayoffs(layoffDept)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-400 text-xs rounded-lg transition-colors font-bold"
                      >
                        Execute
                      </button>
                    </div>
                  </div>

                  {/* Budget Reduction */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Cut Budgets</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={budgetReductionPct}
                        onChange={e => setBudgetReductionPct(parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-xs text-slate-300 font-bold w-8">{budgetReductionPct}%</span>
                      <button
                        onClick={() => simulateBudgetReduction(budgetReductionPct)}
                        className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 text-orange-400 text-xs rounded-lg transition-colors font-bold"
                      >
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Hire & Reset buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={simulateHiring}
                      className="py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Add Mock Hire
                    </button>
                    <button
                      onClick={resetSimulation}
                      disabled={!isSimulating}
                      className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                    >
                      Reset Twin
                    </button>
                  </div>
                </div>
              </GlassCard>

              {/* Dynamic Simulation Metrics */}
              <GlassCard>
                <h4 className="font-outfit font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Recalculated Org Metrics</h4>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Capability Index</span>
                    <span className="font-bold text-slate-200">{metrics.capabilityScore}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Skill Coverage</span>
                    <span className="font-bold text-slate-200">{metrics.skillCoverage}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Project Health</span>
                    <span className="font-bold text-emerald-400">{metrics.projectHealth}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Bench Strength</span>
                    <span className="font-bold text-violet-400">{metrics.benchStrength}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Workstream Budgets</span>
                    <span className="font-bold text-slate-200">${metrics.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Resource Utilization</span>
                    <span className="font-bold text-blue-400">{metrics.utilization}%</span>
                  </div>
                </div>

                {/* Recommendations */}
                {metrics.recommendations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-900 space-y-2">
                    <span className="text-[9px] uppercase font-bold text-orange-400 block tracking-wider">AI Mitigation Actions</span>
                    <div className="space-y-1">
                      {metrics.recommendations.map((r, i) => (
                        <div key={i} className="text-[10px] text-slate-400 flex items-start gap-1">
                          <span className="text-orange-400 shrink-0 mt-0.5">•</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </>
          )}

          {activeSubTab === 'knowledge' && (
            <GlassCard className="space-y-4">
              <div>
                <h4 className="font-outfit font-bold text-sm text-slate-200 flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-400" />
                  Semantic Graph Search
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Explore relations semantically across standard entities.</p>
              </div>

              <form onSubmit={handleKgSearch} className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. 'Who knows React?' or 'Banking'"
                  value={kgQuery}
                  onChange={e => setKgQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs p-2.5 text-slate-300 placeholder:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={kgLoading || !kgQuery.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {kgLoading ? 'Searching...' : <>Query Knowledge Graph <Sparkles className="w-3.5 h-3.5" /></>}
                </button>
              </form>

              {/* Sample queries helper */}
              <div className="space-y-1.5 pt-2 border-t border-slate-900">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Try Queries</span>
                <div className="flex flex-wrap gap-1.5">
                  {['React', 'AWS', 'Banking', 'Sarah'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setKgQuery(`Who knows ${q} / has worked with ${q}`); }}
                      className="text-[9px] font-semibold px-2 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:border-indigo-500/20 hover:text-slate-300"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Node detail display card (if selected) */}
          {selectedNodeData && (
            <GlassCard className="border-blue-500/20 bg-blue-500/5">
              <h4 className="font-outfit font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Selected Node Details</h4>
              {selectedNodeData.type === 'employee' ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Name:</span>
                    <span className="font-bold text-slate-200">{selectedNodeData.data.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Role:</span>
                    <span className="font-medium text-slate-300">{selectedNodeData.data.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Rating:</span>
                    <span className="font-bold text-slate-200">{selectedNodeData.data.performanceRating}/5.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Projects:</span>
                    <span className="font-medium text-slate-300 truncate max-w-[200px]">
                      {selectedNodeData.data.currentProjects.join(', ') || 'Bench'}
                    </span>
                  </div>
                  {/* Actions for employee */}
                  <div className="pt-2 border-t border-slate-900 flex justify-end gap-2">
                    <button
                      onClick={() => simulateResignation(selectedNodeData.data.id)}
                      className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 transition-colors"
                    >
                      Resign
                    </button>
                    <button
                      onClick={() => simulatePromotion(selectedNodeData.data.id)}
                      className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/20 transition-colors"
                    >
                      Promote
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Project Name:</span>
                    <span className="font-bold text-slate-200">{selectedNodeData.data.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Budget:</span>
                    <span className="font-bold text-slate-200">${(selectedNodeData.data.budget || 80000).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic">"{selectedNodeData.data.description}"</p>
                </div>
              )}
            </GlassCard>
          )}

        </div>

      </div>

    </div>
  );
};
