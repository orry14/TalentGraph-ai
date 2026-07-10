import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { GlassCard } from '../components/GlassCard';
import { Employee, Project } from '../utils/api';
import { Sparkles, Info, HelpCircle } from 'lucide-react';

interface SkillGraphProps {
  employees: Employee[];
  projects: Project[];
}

export const SkillGraph: React.FC<SkillGraphProps> = ({ employees, projects }) => {
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

  // Generate nodes and edges dynamically based on data
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // 1. Extract unique skills
    const allSkills = Array.from(
      new Set(employees.flatMap(e => e.technicalSkills.map(s => s.name)))
    );

    // 2. Extract unique technologies (represented as key target tech fields)
    const allTechs = Array.from(
      new Set(projects.flatMap(p => p.requiredSkills))
    );

    let yOffset = 20;

    // --- Create Employee Nodes ---
    // Column 1: x = 50
    employees.forEach((emp, idx) => {
      nodes.push({
        id: emp.id,
        type: 'default',
        data: {
          label: (
            <div className="text-left py-1">
              <div className="font-extrabold text-[11px] text-slate-100">{emp.name}</div>
              <div className="text-[9px] text-slate-400 font-semibold">{emp.role}</div>
              <div className="text-[8px] text-blue-400 font-bold mt-0.5 uppercase">{emp.department}</div>
            </div>
          )
        },
        position: { x: 50, y: yOffset + idx * 130 },
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          border: '1.5px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(59, 130, 246, 0.08)',
          width: 170
        }
      });
    });

    // --- Create Skill Nodes ---
    // Column 2: x = 350
    allSkills.forEach((skill, idx) => {
      nodes.push({
        id: `skill-${skill.toLowerCase()}`,
        type: 'default',
        data: {
          label: (
            <div className="py-0.5">
              <div className="font-bold text-[10px] text-slate-200">{skill}</div>
              <span className="text-[7px] text-violet-400 font-bold uppercase tracking-wider">Skill Node</span>
            </div>
          )
        },
        position: { x: 350, y: yOffset + idx * 90 },
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          border: '1.5px solid rgba(139, 92, 246, 0.4)',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(139, 92, 246, 0.06)',
          width: 120
        }
      });
    });

    // --- Create Project Nodes ---
    // Column 3: x = 650
    projects.forEach((proj, idx) => {
      nodes.push({
        id: proj.id,
        type: 'default',
        data: {
          label: (
            <div className="text-left py-0.5">
              <div className="font-extrabold text-[10px] text-slate-100">{proj.name}</div>
              <p className="text-[7px] text-slate-500 font-medium leading-relaxed truncate max-w-[130px]">{proj.description}</p>
              <span className="text-[7px] text-emerald-400 font-bold uppercase mt-1 block">Project Node</span>
            </div>
          )
        },
        position: { x: 620, y: yOffset + idx * 160 + 60 },
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(16, 185, 129, 0.06)',
          width: 150
        }
      });
    });

    // --- Create Technology Nodes ---
    // Column 4: x = 900
    allTechs.forEach((tech, idx) => {
      nodes.push({
        id: `tech-${tech.toLowerCase()}`,
        type: 'default',
        data: {
          label: (
            <div className="py-0.5">
              <div className="font-bold text-[10px] text-slate-200">{tech}</div>
              <span className="text-[7px] text-orange-400 font-bold uppercase tracking-wider">Technology</span>
            </div>
          )
        },
        position: { x: 880, y: yOffset + idx * 80 },
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          border: '1.5px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(245, 158, 11, 0.06)',
          width: 110
        }
      });
    });

    // ==========================================
    // --- Create Edges ---
    // ==========================================

    // 1. Connect Employees to their Skills (proficiency >= 3)
    employees.forEach(emp => {
      emp.technicalSkills.forEach(skill => {
        if (skill.proficiency >= 3) {
          edges.push({
            id: `edge-${emp.id}-${skill.name.toLowerCase()}`,
            source: emp.id,
            target: `skill-${skill.name.toLowerCase()}`,
            animated: true,
            style: { stroke: 'rgba(59, 130, 246, 0.35)' }
          });
        }
      });
    });

    // 2. Connect Skills to Projects that require them
    projects.forEach(proj => {
      proj.requiredSkills.forEach(reqSkill => {
        edges.push({
          id: `edge-skill-${reqSkill.toLowerCase()}-${proj.id}`,
          source: `skill-${reqSkill.toLowerCase()}`,
          target: proj.id,
          style: { stroke: 'rgba(139, 92, 246, 0.35)' }
        });
      });
    });

    // 3. Connect Projects to Technology Nodes
    projects.forEach(proj => {
      proj.requiredSkills.forEach(reqSkill => {
        edges.push({
          id: `edge-proj-${proj.id}-tech-${reqSkill.toLowerCase()}`,
          source: proj.id,
          target: `tech-${reqSkill.toLowerCase()}`,
          style: { stroke: 'rgba(16, 185, 129, 0.35)' }
        });
      });
    });

    // 4. Connect Employees with similar skills (share >= 3 skills)
    for (let i = 0; i < employees.length; i++) {
      for (let j = i + 1; j < employees.length; j++) {
        const empA = employees[i];
        const empB = employees[j];
        
        const skillsA = new Set(empA.technicalSkills.map(s => s.name.toLowerCase()));
        const skillsB = empB.technicalSkills.map(s => s.name.toLowerCase());
        const sharedSkills = skillsB.filter(s => skillsA.has(s));

        if (sharedSkills.length >= 3) {
          edges.push({
            id: `edge-similar-${empA.id}-${empB.id}`,
            source: empA.id,
            target: empB.id,
            animated: false,
            label: `${sharedSkills.length} Shared`,
            labelStyle: { fill: '#64748b', fontSize: 7, fontWeight: 600, background: 'transparent' },
            style: { stroke: 'rgba(59, 130, 246, 0.3)', strokeDasharray: '4 4' }
          });
        }
      }
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [employees, projects]);

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Apply visual highlights when a node is hovered or clicked
  useEffect(() => {
    if (!highlightedNode) {
      // Reset all opacities
      setNodes(initialNodes);
      setEdges(initialEdges);
      return;
    }

    // Trace connections
    const connectedNodeIds = new Set<string>([highlightedNode]);
    
    // Find edges containing the highlightedNode
    initialEdges.forEach(e => {
      if (e.source === highlightedNode) {
        connectedNodeIds.add(e.target);
      }
      if (e.target === highlightedNode) {
        connectedNodeIds.add(e.source);
      }
    });

    // For secondary links: if highlighted is employee, find skills, and then find projects connected to those skills
    if (employees.some(e => e.id === highlightedNode)) {
      const skills = initialEdges
        .filter(e => e.source === highlightedNode)
        .map(e => e.target);
      
      initialEdges.forEach(e => {
        if (skills.includes(e.source)) {
          connectedNodeIds.add(e.target); // Project nodes
        }
      });
    }

    // Set Node Styles
    setNodes(
      initialNodes.map(n => {
        const isConnected = connectedNodeIds.has(n.id);
        return {
          ...n,
          style: {
            ...n.style,
            opacity: isConnected ? 1 : 0.2,
            transition: 'opacity 0.2s ease-in-out'
          }
        };
      })
    );

    // Set Edge Styles
    setEdges(
      initialEdges.map(e => {
        const isSourceHighlight = e.source === highlightedNode;
        const isTargetHighlight = e.target === highlightedNode;
        const isConnected = isSourceHighlight || isTargetHighlight;

        return {
          ...e,
          style: {
            ...e.style,
            stroke: isConnected 
              ? (isSourceHighlight ? '#3b82f6' : '#8b5cf6')
              : 'rgba(51, 65, 85, 0.1)',
            strokeWidth: isConnected ? 2 : 1,
            opacity: isConnected ? 1 : 0.1
          }
        };
      })
    );
  }, [highlightedNode, initialNodes, initialEdges]);

  const onNodeMouseEnter = (_: React.MouseEvent, node: Node) => {
    setHighlightedNode(node.id);
  };

  const onNodeMouseLeave = () => {
    setHighlightedNode(null);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-6 overflow-hidden">
      {/* Legend Banner */}
      <GlassCard glow className="bg-slate-950/80 border-blue-500/10 flex flex-col md:flex-row md:items-center justify-between shrink-0 p-4 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/10 text-blue-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Interactive AI Skill Graph Mapping</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Hover on any node to trace capabilities, project requirements, and organizational skill clusters</p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Employee</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            <span>Skill</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Project</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-400">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span>Technology</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-1.5 text-[9px] font-bold text-slate-400">
            <span className="border-t border-dashed border-blue-500 w-5 h-0" />
            <span>Talent Cluster (Shared Tech)</span>
          </div>
        </div>
      </GlassCard>

      {/* React Flow Board */}
      <div className="flex-1 glass-panel rounded-3xl overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          onNodeMouseEnter={onNodeMouseEnter}
          onNodeMouseLeave={onNodeMouseLeave}
          minZoom={0.2}
          maxZoom={1.5}
        >
          <Background color="#334155" gap={20} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              if (node.id.startsWith('emp')) return '#3b82f6';
              if (node.id.startsWith('skill')) return '#8b5cf6';
              if (node.id.startsWith('proj')) return '#10b981';
              return '#f59e0b';
            }}
            maskColor="rgba(3, 7, 18, 0.6)"
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px'
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};
