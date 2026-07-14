import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { ArrowUpRight } from 'lucide-react';

export function TalentNetwork({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-outfit text-[var(--text-primary)]">Digital Twin</h1>
        <p className="text-[var(--text-secondary)] mt-1">Hierarchical representation of current talent allocation.</p>
      </div>

      <GlassCard className="min-h-[500px] flex flex-col p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-semibold text-[18px] text-[var(--text-primary)]">Digital Twin Map</h2>
            <p className="text-[14px] text-[var(--text-secondary)] mt-1">Live organizational structure snapshot.</p>
          </div>
          <button
            onClick={() => {
              if (setActiveTab) setActiveTab('skill-graph');
            }}
            className="text-[14px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] flex items-center gap-1 transition-colors"
          >
            Open Full Twin View <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 mt-2 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl p-10 flex items-center justify-center relative overflow-hidden">
          <div className="flex flex-col items-center gap-12 z-10 w-full max-w-4xl">
            <div 
              className="px-6 py-4 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg text-[var(--text-primary)] text-[16px] font-medium shadow-sm hover:shadow-md transition-shadow cursor-pointer w-72 text-center"
              onClick={() => { if (setActiveTab) setActiveTab('skill-graph'); }}
            >
              Alex Rivera (Staff Engineer)
            </div>
            
            {/* Lines */}
            <div className="relative w-full h-12 flex justify-center">
               <div className="absolute top-0 bottom-0 w-px bg-[var(--border-strong)]"></div>
               <div className="absolute top-1/2 left-[16%] right-[16%] h-px bg-[var(--border-strong)]"></div>
               <div className="absolute top-1/2 bottom-0 left-[16%] w-px bg-[var(--border-strong)]"></div>
               <div className="absolute top-1/2 bottom-0 right-[16%] w-px bg-[var(--border-strong)]"></div>
            </div>

            <div className="flex w-full justify-between px-12">
              <div className="px-5 py-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-[14px] text-[var(--text-secondary)] w-48 text-center hover:bg-[var(--bg-surface-alt)] cursor-pointer">
                Sarah Chen (ML)
              </div>
              <div className="px-5 py-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-[14px] text-[var(--text-secondary)] w-48 text-center hover:bg-[var(--bg-surface-alt)] cursor-pointer">
                Elena Rostova (FE)
              </div>
              <div className="px-5 py-3 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg text-[14px] text-[var(--text-secondary)] w-48 text-center hover:bg-[var(--bg-surface-alt)] cursor-pointer">
                Aisha Rahman (DevOps)
              </div>
            </div>
          </div>
          {/* Grid line patterns */}
          <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        </div>
      </GlassCard>
    </div>
  );
}
