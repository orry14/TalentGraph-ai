import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { SkeletonTable } from '../components/LoadingSkeleton';
import { StaffingRecommendation, api } from '../utils/api';
import {
  Briefcase,
  Layers,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';

export const Staffing: React.FC = () => {
  const [projectName, setProjectName] = useState('');
  const [requiredSkillsInput, setRequiredSkillsInput] = useState('');
  const [teamSize, setTeamSize] = useState(3);
  const [durationMonths, setDurationMonths] = useState(6);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<StaffingRecommendation | null>(null);

  // Common tags for convenience
  const skillTags = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'Terraform', 'SQL', 'LLMs', 'Figma', 'UX/UI Design', 'Next.js', 'Redis', 'GraphQL'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !requiredSkillsInput) return;

    setIsLoading(true);
    const requiredSkills = requiredSkillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    try {
      const data = await api.getStaffingRecommendations({
        projectName,
        requiredSkills,
        teamSize,
        durationMonths
      });
      setRecommendation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    if (requiredSkillsInput.includes(tag)) {
      // Remove it
      setRequiredSkillsInput(prev => 
        prev.split(',').map(s => s.trim()).filter(s => s !== tag).join(', ')
      );
    } else {
      // Add it
      setRequiredSkillsInput(prev => {
        const cleaned = prev.trim();
        return cleaned ? `${cleaned}, ${tag}` : tag;
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-[calc(100vh-140px)] overflow-hidden">
      {/* Left panel: Form */}
      <GlassCard className="lg:col-span-4 h-full overflow-y-auto shrink-0 flex flex-col justify-between p-6">
        <form onSubmit={handleSubmit} className="space-y-5 flex-1">
          <div>
            <h3 className="font-outfit font-extrabold text-base text-slate-200 mb-1">Project Staffing Engine</h3>
            <p className="text-xs text-slate-500">Configure parameters to calculate optimal teams via skill matching heuristics</p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. NextGen Core API"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs text-slate-100 placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
              Required Technical Skills (Comma-Separated)
            </label>
            <input
              type="text"
              required
              placeholder="React, TypeScript, AWS..."
              value={requiredSkillsInput}
              onChange={e => setRequiredSkillsInput(e.target.value)}
              className="w-full glass-input px-4 py-2.5 rounded-xl text-xs text-slate-100 placeholder:text-slate-600"
            />
          </div>

          {/* Quick Skill Tags helper */}
          <div>
            <span className="block text-[9px] font-bold text-slate-600 uppercase tracking-wide mb-2">Quick Add Skills</span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {skillTags.map(tag => {
                const isSelected = requiredSkillsInput.toLowerCase().includes(tag.toLowerCase());
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`text-[9px] font-semibold px-2 py-1 rounded transition-all border ${
                      isSelected
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.05)]'
                        : 'bg-slate-900/40 border-slate-900 hover:border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizing and duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Target Team Size</label>
              <input
                type="number"
                min="1"
                max="8"
                value={teamSize}
                onChange={e => setTeamSize(parseInt(e.target.value, 10))}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Duration (Months)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={durationMonths}
                onChange={e => setDurationMonths(parseInt(e.target.value, 10))}
                className="w-full glass-input px-4 py-2.5 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !projectName || !requiredSkillsInput}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-[0_4px_15px_rgba(59,130,246,0.25)] active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Assembling Team...' : 'Assemble AI Optimal Team'}</span>
          </button>
        </form>
      </GlassCard>

      {/* Right panel: Matching Results */}
      <div className="lg:col-span-8 h-full overflow-y-auto space-y-6 pb-8 pr-1">
        {isLoading ? (
          <SkeletonTable />
        ) : recommendation ? (
          <div className="space-y-6">
            {/* Top aggregate score */}
            <GlassCard glow className="bg-gradient-to-r from-blue-950/20 to-indigo-950/20 border-blue-500/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                  {recommendation.overallMatchScore}%
                </div>
                <div>
                  <h4 className="font-outfit font-extrabold text-sm text-slate-200">Recommended Team Match</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Calculated overall competency fit index matching required skills</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Project Allocation</span>
                <span className="text-xs font-bold text-slate-200 mt-1 block">{recommendation.projectName} ({recommendation.durationMonths} Months)</span>
              </div>
            </GlassCard>

            {/* Recommended Team List */}
            <GlassCard>
              <h4 className="font-outfit font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Primary Nominated Candidates</span>
              </h4>
              <div className="space-y-3.5">
                {recommendation.recommendedTeam.map((cand, idx) => (
                  <div
                    key={cand.employee.id}
                    className="p-4 bg-slate-900/30 border border-slate-900 hover:border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-blue-400 text-sm">
                        {cand.employee.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2.5">
                          <h5 className="text-xs font-bold text-slate-200">{cand.employee.name}</h5>
                          <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/10">
                            {cand.roleInProject}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{cand.employee.role} | {cand.employee.department}</p>
                      </div>
                    </div>

                    {/* Skill matching tags */}
                    <div className="flex-1 max-w-md md:px-6">
                      <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Matching Capabilities</span>
                      <div className="flex flex-wrap gap-1">
                        {cand.matchingSkills.map(skill => (
                          <span
                            key={skill}
                            className="text-[9px] font-semibold px-2 py-0.5 bg-slate-900 text-slate-400 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-right flex flex-row md:flex-col justify-between items-center md:items-end">
                      <span className="text-xs font-black text-slate-200">{cand.matchPercentage}% fit</span>
                      <span className="text-[9px] text-slate-500 font-medium">Rating: {cand.employee.performanceRating}/5.0</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Overlap & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skill Overlap Matrix */}
              <GlassCard>
                <h4 className="font-outfit font-bold text-xs text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Competency Coverage Mapping</span>
                </h4>
                <div className="space-y-3">
                  {recommendation.skillOverlap.map(overlap => (
                    <div key={overlap.skill} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-300">{overlap.skill}</span>
                        <span className="text-slate-500 text-[10px]">
                          {overlap.employeesCovering.length} covered
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {overlap.employeesCovering.length > 0 ? (
                          overlap.employeesCovering.map(name => (
                            <span
                              key={name}
                              className="text-[9px] font-medium px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/5"
                            >
                              {name.split(' ')[0]}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] font-semibold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/10">
                            Uncovered Gap
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Warnings / Missing Skills & Backup candidates */}
              <div className="space-y-6">
                {/* Missing Skills Warning */}
                {recommendation.missingSkills.length > 0 && (
                  <GlassCard className="border-red-500/10 bg-red-950/5">
                    <h4 className="font-outfit font-bold text-xs text-red-400 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
                      <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                      <span>Critical Team Gaps Detected</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
                      The recommended primary team does not cover the following skills required for this project:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {recommendation.missingSkills.map(skill => (
                        <span
                          key={skill}
                          className="text-[9px] font-extrabold px-2 py-1 bg-red-500/15 border border-red-500/20 text-red-400 rounded-lg uppercase tracking-wider"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Backup Candidates */}
                <GlassCard>
                  <h4 className="font-outfit font-bold text-xs text-slate-400 uppercase tracking-wider mb-3.5">
                    Suggested Backups
                  </h4>
                  <div className="space-y-3">
                    {recommendation.backupCandidates.map(backup => (
                      <div
                        key={backup.employee.id}
                        className="flex items-center justify-between p-2.5 bg-slate-900/20 border border-slate-900 rounded-xl hover:border-slate-800/80 transition-colors"
                      >
                        <div>
                          <h5 className="text-xs font-bold text-slate-300">{backup.employee.name}</h5>
                          <p className="text-[9px] text-slate-500">{backup.employee.role} | {backup.employee.department}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-900 py-1 px-2 border border-slate-800 rounded">
                          {backup.matchPercentage}% fit
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center glass-panel rounded-2xl p-10 text-center">
            <div>
              <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <span className="text-slate-500 text-xs font-medium block">Enter details on the left to calculate project staffing layout.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
