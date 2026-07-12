import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { api, CapabilityRisk } from '../utils/api';
import { AlertTriangle, TrendingDown, UserX, Github, BadgeCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CapabilityRiskWidget: React.FC = () => {
  const [risks, setRisks] = useState<CapabilityRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<CapabilityRisk | null>(null);

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const data = await api.getCapabilityRisks();
        setRisks(data);
      } catch (err) {
        console.error('Failed to load capability risks', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRisks();
  }, []);

  if (loading) {
    return (
      <GlassCard className="h-64 flex items-center justify-center bg-surface-card border border-border">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col justify-between min-h-[380px] relative p-4 bg-surface-card border border-border">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-semibold text-sm text-text-primary mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-ai-accent" />
              Capability Risks (SPOF)
            </h4>
            <p className="text-xs text-text-secondary">Single Points of Failure & Flight Risks</p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-surface-sunken rounded border border-border text-text-secondary uppercase tracking-wider">
            {risks.length} Detected
          </span>
        </div>

        {risks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-muted">
            <span className="text-sm font-medium">No critical risks detected.</span>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
            {risks.map((risk, idx) => {
              const isCritical = risk.riskLevel === 'Critical';
              const isHigh = risk.riskLevel === 'High';
              
              const bgClass = isCritical ? 'bg-danger-tint border-danger/20 hover:bg-danger-tint/80' 
                : isHigh ? 'bg-ai-tint border-ai-accent/20 hover:bg-ai-tint/80' 
                : 'bg-surface-sunken border-border hover:border-border-strong';
                
              const textClass = isCritical ? 'text-danger' : isHigh ? 'text-ai-accent' : 'text-text-secondary';
              
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedRisk(risk)}
                  className={`p-3 rounded-md border transition-colors cursor-pointer ${bgClass}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs bg-surface-card border ${isCritical ? 'border-danger/30 text-danger' : isHigh ? 'border-ai-accent/30 text-ai-accent' : 'border-border text-text-secondary'}`}>
                        {risk.employee.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                          {risk.employee.name}
                          {risk.isGitVerified && (
                            <span className="inline-flex text-brand" title="Verified by Git log analysis (code-maat)">
                              <Github className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </h5>
                        <p className="text-xs text-text-secondary flex items-center gap-1">
                          {risk.skill} Expert
                          {risk.isGitVerified && (
                            <span className="text-[9px] bg-brand-tint text-brand px-1 py-0.5 rounded font-bold uppercase tracking-wider border border-brand/20">git-verified</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider bg-surface-card border ${isCritical ? 'border-danger/30 text-danger' : 'border-ai-accent/30 text-ai-accent'}`}>
                        {risk.riskLevel}
                      </span>
                      <p className="text-[9px] mt-1 text-text-muted flex items-center justify-end gap-1 font-semibold">
                        <TrendingDown className="w-3 h-3" /> Flight Score: {risk.flightRiskScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRisk && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute inset-0 bg-surface-card/95 backdrop-blur-sm border border-border rounded-lg p-5 z-10 flex flex-col shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                Risk Profile: {selectedRisk.employee.name}
                {selectedRisk.isGitVerified && (
                  <span className="inline-flex items-center gap-1 text-[9px] bg-brand-tint text-brand border border-brand/20 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
                    <Github className="w-3 h-3" /> git-verified
                  </span>
                )}
              </h3>
              <button
                onClick={() => setSelectedRisk(null)}
                className="text-text-muted hover:text-text-primary transition-colors bg-surface-sunken p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 space-y-4 text-xs">
              <div>
                <strong className="text-text-secondary block text-[11px] uppercase tracking-wider mb-1">Vulnerable Capability</strong>
                <span className="text-text-primary font-medium">{selectedRisk.skill} (Only Expert)</span>
              </div>
              
              <div>
                <strong className="text-text-secondary block text-[11px] uppercase tracking-wider mb-1">Impact Assessment</strong>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-sm ${i < selectedRisk.capabilityImpact ? 'bg-ai-accent' : 'bg-surface-sunken border border-border'}`} />
                  ))}
                </div>
              </div>

              <div className="p-3 bg-ai-tint border border-ai-accent/20 rounded-md">
                <strong className="text-ai-accent block text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> AI Recommendation
                </strong>
                <p className="text-text-primary leading-relaxed">{selectedRisk.recommendedAction}</p>
              </div>

              <div>
                <strong className="text-text-secondary block text-[11px] uppercase tracking-wider mb-2">Potential Successors (Knowledge Transfer)</strong>
                <ul className="space-y-1.5">
                  {selectedRisk.alternativeCandidates.map((alt, i) => (
                    <li key={i} className="text-text-primary flex items-center gap-2 bg-surface-sunken border border-border px-2 py-1.5 rounded-md">
                      <UserX className="w-3 h-3 text-brand shrink-0" /> {alt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
