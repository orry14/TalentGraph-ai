import React, { useState, useEffect } from 'react';
import { api, StaffingConflict } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, CheckCircle2, AlertTriangle, ArrowRight, X } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ConflictResolverModalProps {
  onClose: () => void;
}

export const ConflictResolverModal: React.FC<ConflictResolverModalProps> = ({ onClose }) => {
  const [conflicts, setConflicts] = useState<StaffingConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const data = await api.getStaffingConflicts();
        setConflicts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchConflicts();
  }, []);

  const handleResolve = (action: string) => {
    // In a real app, this would send an API request to apply the resolution
    alert(`Applied resolution: ${action}`);
    
    // Remove the resolved conflict
    setConflicts(prev => prev.filter((_, i) => i !== activeIndex));
    if (activeIndex >= conflicts.length - 1) {
      setActiveIndex(Math.max(0, conflicts.length - 2));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[var(--bg-surface-alt)] backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--bg-surface-alt)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-3xl w-full max-w-5xl overflow-hidden shadow-md flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-[var(--border-default)] flex justify-between items-center bg-[var(--bg-surface-alt)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-outfit font-bold text-[var(--text-primary)]">Cross-Project Conflict Resolver</h2>
              <p className="text-sm text-[var(--text-tertiary)]">AI detecting and resolving overallocated resources</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {conflicts.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Resource Conflicts Detected</h3>
              <p className="text-[var(--text-tertiary)]">All employees are currently operating within their allocation limits.</p>
              <button onClick={onClose} className="mt-6 px-6 py-2 bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-alt)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-xl transition-colors">
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Left sidebar: Conflict List */}
              <div className="w-1/3 border-r border-[var(--border-default)] bg-[var(--bg-surface-alt)] overflow-y-auto">
                <div className="p-4 border-b border-[var(--border-default)]">
                  <h3 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">{conflicts.length} Overallocations</h3>
                </div>
                <div className="p-2 space-y-2">
                  {conflicts.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        activeIndex === i 
                          ? 'bg-[var(--bg-surface-alt)] border-slate-600' 
                          : 'bg-transparent border-transparent hover:bg-[var(--bg-surface)] hover:border-[var(--border-default)]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-[var(--text-primary)] text-sm">{c.employee.name}</span>
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                          {c.allocationPercentage}%
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--text-tertiary)] truncate">{c.employee.role}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right area: Resolution details */}
              <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-surface)]">
                {conflicts[activeIndex] && (
                  <div className="space-y-6">
                    {/* Conflict Header */}
                    <GlassCard className="border-red-500/20 bg-red-500/5">
                      <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                        <div>
                          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                            {conflicts[activeIndex].employee.name} is double-booked
                          </h3>
                          <p className="text-sm text-[var(--text-tertiary)]">
                            Currently assigned to {conflicts[activeIndex].conflictingProjects.length} projects simultaneously, resulting in a {conflicts[activeIndex].allocationPercentage}% allocation.
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col gap-2">
                        {conflicts[activeIndex].conflictingProjects.map((cp, j) => (
                          <div key={j} className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-surface-alt)] border border-[var(--border-default)]">
                            <div>
                              <span className="font-bold text-[var(--text-secondary)] text-sm">{cp.project.name}</span>
                              <p className="text-xs text-[var(--text-tertiary)]">Duration: {cp.project.durationMonths}mo | Priority Score: {cp.priorityScore}</p>
                            </div>
                            {j === 0 ? (
                              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Primary (Keep)</span>
                            ) : (
                              <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded">Secondary (Resolve)</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* AI Resolution Options */}
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-secondary)] mb-4">AI Suggested Resolutions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {conflicts[activeIndex].resolutionOptions.map((opt, k) => (
                          <div key={k} className="bg-[var(--bg-surface-alt)]/50 rounded-xl p-4 border border-[var(--border-strong)] flex flex-col">
                            <div className="mb-2">
                              <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 text-[12px] font-bold rounded uppercase tracking-wider mb-2">
                                Option {String.fromCharCode(65 + k)}: {opt.optionType}
                              </span>
                              <p className="text-sm text-[var(--text-secondary)] font-medium">{opt.description}</p>
                            </div>
                            
                            <div className="mt-auto pt-3 border-t border-[var(--border-strong)]/50 grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-[var(--text-tertiary)] block">Biz Impact</span>
                                <span className={opt.businessImpact === 'Low' ? 'text-emerald-400' : opt.businessImpact === 'High' ? 'text-orange-400' : 'text-[var(--text-secondary)]'}>{opt.businessImpact}</span>
                              </div>
                              <div>
                                <span className="text-[var(--text-tertiary)] block">Delivery Risk</span>
                                <span className={opt.deliveryRisk === 'Low' ? 'text-emerald-400' : opt.deliveryRisk === 'High' ? 'text-red-400' : 'text-[var(--text-secondary)]'}>{opt.deliveryRisk}</span>
                              </div>
                              <div>
                                <span className="text-[var(--text-tertiary)] block">Skill Match</span>
                                <span className="text-blue-400">{opt.skillMatchScore}%</span>
                              </div>
                              <div>
                                <span className="text-[var(--text-tertiary)] block">Cost</span>
                                <span className={opt.cost === 'Low' ? 'text-emerald-400' : opt.cost === 'High' ? 'text-red-400' : 'text-[var(--text-secondary)]'}>{opt.cost}</span>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleResolve(opt.optionType)}
                              className="mt-4 w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold text-xs rounded-lg transition-colors border border-blue-500/30 flex items-center justify-center gap-2"
                            >
                              Accept Solution <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
