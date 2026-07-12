import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { api } from '../../utils/api';

export const LiveGraph: React.FC<{ updateTrigger: number }> = ({ updateTrigger }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const graphRef = useRef<any>();

  useEffect(() => {
    // Generate dummy/live graph data from API
    const loadData = async () => {
      try {
        const employees = await api.getEmployees();
        const nodes = employees.map(e => ({ id: e.id, name: e.name, group: 1 }));
        const links = [];
        
        // Connect employees in the same department for visual complexity
        for(let i=0; i<employees.length; i++) {
          for(let j=i+1; j<employees.length; j++) {
            if (employees[i].department === employees[j].department) {
              links.push({ source: employees[i].id, target: employees[j].id });
            }
          }
        }
        
        setGraphData({ nodes: nodes as any, links: links as any });
      } catch (e) {
        console.error("Failed to load graph data", e);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (updateTrigger > 0 && graphRef.current) {
      // Pulse animation logic when new alerts arrive
      // e.g. graphRef.current.d3Force('charge').strength(-200);
      setTimeout(() => {
        if(graphRef.current) {
           graphRef.current.zoom(1.2, 500);
           setTimeout(() => {
             if(graphRef.current) graphRef.current.zoomToFit(500);
           }, 800);
        }
      }, 100);
    }
  }, [updateTrigger]);

  if (!graphData.nodes.length) return <div className="text-slate-500">Loading Network...</div>;

  return (
    <div className="w-full h-full relative" style={{ minHeight: '500px' }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: any) => node.group === 1 ? '#3b82f6' : '#10b981'}
        nodeRelSize={4}
        linkColor={() => 'rgba(148, 163, 184, 0.2)'}
        backgroundColor="rgba(0,0,0,0)"
        width={800} // Would ideally be responsive
        height={600}
        d3VelocityDecay={0.3}
      />
    </div>
  );
};
