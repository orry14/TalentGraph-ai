import React, { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { api, HiringDrive, RecruitmentCandidate, RecruitmentDashboard } from '../utils/api';
import {
  UploadCloud,
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  Search,
  Download,
  Sparkles,
  FileText,
  Plus,
  Filter,
  Brain,
  MessageSquare,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const splitList = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean);

const emptyForm = {
  hiringName: 'Software Engineer Trainee',
  description: 'Campus hiring for high-potential engineering graduates.',
  company: 'TalentGraph',
  department: 'Engineering',
  role: 'Software Engineer Trainee',
  source: 'Campus Placement',
  employmentType: 'Full-time',
  location: 'Hybrid',
  salary: 'Campus band',
  experience: '0-1 years',
  hiringDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
  maximumCandidates: 100,
  requiredSkills: 'React, Node.js, Python, SQL, Git, Communication',
  preferredSkills: 'AI, ERP, CRM, Machine Learning, Web Development',
  minimumCgpa: 7,
  degree: 'B.Tech',
  branches: 'Computer Science, Information Technology, Electronics',
  graduationYear: '2026',
  preferredColleges: 'Mar Baselios College, MBCET',
  requiredCertifications: '',
  projectKeywords: 'AI, ERP, CRM, Machine Learning, Web Development',
  portfolioRequired: false,
  githubRequired: false,
  languages: 'English',
  interviewRounds: 'Resume Screen, Technical Interview, HR Interview',
  priority: 'High' as const,
  status: 'Open' as const,
};

export const Recruitment: React.FC = () => {
  const [dashboard, setDashboard] = useState<RecruitmentDashboard | null>(null);
  const [drives, setDrives] = useState<HiringDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState('');
  const [candidates, setCandidates] = useState<RecruitmentCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<RecruitmentCandidate | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeAccordion, setActiveAccordion] = useState<'details' | 'criteria' | 'workflow'>('details');

  const loadRecruitment = async (driveId?: string) => {
    setIsLoading(true);
    try {
      const [dash, loadedDrives] = await Promise.all([
        api.getRecruitmentDashboard(),
        api.getHiringDrives(),
      ]);
      const activeDriveId = driveId || selectedDriveId || loadedDrives[0]?.id || '';
      const loadedCandidates = await api.getRecruitmentCandidates(activeDriveId || undefined);
      setDashboard(dash);
      setDrives(loadedDrives);
      setSelectedDriveId(activeDriveId);
      setCandidates(loadedCandidates);
      setSelectedCandidate(loadedCandidates[0] || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load recruitment data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecruitment();
  }, []);

  const selectedDrive = drives.find(d => d.id === selectedDriveId);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(candidate => {
      const statusOk = statusFilter === 'All' || candidate.status === statusFilter || candidate.aiScore.classification === statusFilter;
      return statusOk;
    });
  }, [candidates, statusFilter]);

  const createDrive = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const drive = await api.createHiringDrive({
        ...form,
        requiredSkills: splitList(form.requiredSkills),
        preferredSkills: splitList(form.preferredSkills),
        branches: splitList(form.branches),
        preferredColleges: splitList(form.preferredColleges),
        requiredCertifications: splitList(form.requiredCertifications),
        projectKeywords: splitList(form.projectKeywords),
        languages: splitList(form.languages),
        interviewRounds: splitList(form.interviewRounds),
      });
      setDrives(prev => [drive, ...prev.filter(d => d.id !== drive.id)]);
      setSelectedDriveId(drive.id);
      await loadRecruitment(drive.id);
      setForm(emptyForm);
      setActiveAccordion('details');
    } catch (err: any) {
      setError(err.message || 'Failed to create hiring drive');
    } finally {
      setIsCreating(false);
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const selected = Array.from(files).filter(file => file);
    if (!selected.length || !selectedDriveId) return;
    setIsUploading(true);
    setError(null);
    setUploadStage(`Uploading ${selected.length} resume${selected.length > 1 ? 's' : ''}`);
    try {
      setTimeout(() => setUploadStage('Extracting resume text'), 250);
      setTimeout(() => setUploadStage('Parsing candidate profiles'), 650);
      setTimeout(() => setUploadStage('Running AI match analysis'), 1000);
      const result = await api.uploadRecruitmentResumes(selectedDriveId, selected);
      setCandidates(prev => [...result.candidates, ...prev].sort((a, b) => b.aiScore.overallMatchScore - a.aiScore.overallMatchScore));
      setSelectedCandidate(result.candidates[0] || selectedCandidate);
      if (result.failures.length) {
        setError(`${result.failures.length} file(s) could not be processed. ${result.failures[0].error}`);
      }
      const dash = await api.getRecruitmentDashboard();
      setDashboard(dash);
    } catch (err: any) {
      setError(err.message || 'Failed to upload resumes');
    } finally {
      setIsUploading(false);
      setUploadStage('');
    }
  };

  const searchCandidates = async () => {
    if (!query.trim()) {
      await loadRecruitment(selectedDriveId);
      return;
    }
    setIsLoading(true);
    try {
      const results = await api.searchRecruitmentCandidates(query, selectedDriveId);
      setCandidates(results);
      setSelectedCandidate(results[0] || null);
    } catch (err: any) {
      setError(err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedCandidate) return;
    const updated = await api.updateCandidateStatus(selectedCandidate.id, status);
    setSelectedCandidate(updated);
    setCandidates(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const kpis: [string, string | number, LucideIcon][] = [
    ['Active Hiring Drives', dashboard?.activeHiringDrives || 0, Briefcase],
    ['Candidates Applied', dashboard?.candidatesApplied || 0, Users],
    ['Shortlisted', dashboard?.shortlisted || 0, CheckCircle],
    ['Rejected', dashboard?.rejected || 0, XCircle],
    ['Interview Scheduled', dashboard?.interviewScheduled || 0, Calendar],
    ['Offer Sent', dashboard?.offerSent || 0, Award],
    ['Offer Accepted', dashboard?.offerAccepted || 0, Sparkles],
    ['Avg Match Score', `${dashboard?.averageMatchScore || 0}%`, Brain],
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-md border border-danger/20 bg-danger-tint text-danger text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(([label, value, KpiIcon]) => {
          return (
            <GlassCard key={String(label)} className="p-4 flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-surface-sunken flex items-center justify-center shrink-0">
                <KpiIcon className="w-5 h-5 text-text-secondary" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">{label}</p>
                <h3 className="font-mono font-bold text-2xl text-text-primary mt-1">{value}</h3>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-6">
          <GlassCard className="p-4 flex flex-col h-[400px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-text-primary">Hiring Drives</h3>
              <Plus className="w-4 h-4 text-brand" />
            </div>
            <div className="space-y-2 overflow-y-auto pr-1 flex-1">
              {drives.map(drive => (
                <button
                  key={drive.id}
                  onClick={() => loadRecruitment(drive.id)}
                  className={`w-full text-left p-3 rounded-md border transition-colors flex items-center justify-between ${selectedDriveId === drive.id ? 'bg-brand-tint border-brand/20' : 'bg-surface-card border-border hover:border-border-strong hover:bg-surface-sunken'}`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="text-sm font-semibold text-text-primary block truncate">{drive.hiringName}</span>
                    <p className="text-[10px] text-text-secondary mt-1 truncate">{drive.source} | {drive.role}</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-success-tint text-success border border-success/20 shrink-0 font-bold uppercase">{drive.status}</span>
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="font-semibold text-sm text-text-primary mb-4">Create Hiring Campaign</h3>
            <div className="space-y-3">
              
              {/* Accordion 1: Job Details */}
              <div className="border border-border rounded-md overflow-hidden bg-surface-card">
                <button
                  onClick={() => setActiveAccordion('details')}
                  className="w-full p-3 flex items-center justify-between bg-surface-sunken hover:bg-border/30 transition-colors text-xs font-semibold text-text-primary"
                >
                  Job Details
                  {activeAccordion === 'details' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {activeAccordion === 'details' && (
                  <div className="p-3 grid grid-cols-1 gap-2.5 bg-surface-card">
                    {(['hiringName', 'company', 'department', 'role', 'source', 'location', 'salary', 'experience'] as const).map(key => (
                      <input
                        key={key}
                        value={String(form[key])}
                        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                        className="bg-surface-sunken border border-border rounded-md px-3 py-2 text-[11px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-brand outline-none"
                        placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                      />
                    ))}
                    <textarea
                      value={form.description}
                      onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-surface-sunken border border-border rounded-md px-3 py-2 text-[11px] text-text-primary placeholder:text-text-muted min-h-16 focus:ring-1 focus:ring-brand outline-none"
                      placeholder="Description"
                    />
                  </div>
                )}
              </div>

              {/* Accordion 2: Candidate Criteria */}
              <div className="border border-border rounded-md overflow-hidden bg-surface-card">
                <button
                  onClick={() => setActiveAccordion('criteria')}
                  className="w-full p-3 flex items-center justify-between bg-surface-sunken hover:bg-border/30 transition-colors text-xs font-semibold text-text-primary"
                >
                  Candidate Criteria
                  {activeAccordion === 'criteria' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {activeAccordion === 'criteria' && (
                  <div className="p-3 grid grid-cols-1 gap-2.5 bg-surface-card">
                    {(['requiredSkills', 'preferredSkills', 'branches', 'preferredColleges', 'requiredCertifications', 'projectKeywords'] as const).map(key => (
                      <input
                        key={key}
                        value={String(form[key])}
                        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                        className="bg-surface-sunken border border-border rounded-md px-3 py-2 text-[11px] text-text-primary placeholder:text-text-muted focus:ring-1 focus:ring-brand outline-none"
                        placeholder={`${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()} (comma separated)`}
                      />
                    ))}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={form.minimumCgpa}
                        onChange={e => setForm(prev => ({ ...prev, minimumCgpa: Number(e.target.value) }))}
                        className="bg-surface-sunken border border-border rounded-md px-3 py-2 text-[11px] text-text-primary focus:ring-1 focus:ring-brand outline-none"
                        placeholder="Minimum CGPA"
                      />
                      <input
                        type="text"
                        value={form.degree}
                        onChange={e => setForm(prev => ({ ...prev, degree: e.target.value }))}
                        className="bg-surface-sunken border border-border rounded-md px-3 py-2 text-[11px] text-text-primary focus:ring-1 focus:ring-brand outline-none"
                        placeholder="Degree"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: Workflow */}
              <div className="border border-border rounded-md overflow-hidden bg-surface-card">
                <button
                  onClick={() => setActiveAccordion('workflow')}
                  className="w-full p-3 flex items-center justify-between bg-surface-sunken hover:bg-border/30 transition-colors text-xs font-semibold text-text-primary"
                >
                  Workflow & Compliance
                  {activeAccordion === 'workflow' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {activeAccordion === 'workflow' && (
                  <div className="p-3 grid grid-cols-1 gap-2.5 bg-surface-card">
                    <input
                      type="number"
                      value={form.maximumCandidates}
                      onChange={e => setForm(prev => ({ ...prev, maximumCandidates: Number(e.target.value) }))}
                      className="bg-surface-sunken border border-border rounded-md px-3 py-2 text-[11px] text-text-primary focus:ring-1 focus:ring-brand outline-none"
                      placeholder="Maximum Candidates"
                    />
                    <input
                      type="text"
                      value={form.interviewRounds}
                      onChange={e => setForm(prev => ({ ...prev, interviewRounds: e.target.value }))}
                      className="bg-surface-sunken border border-border rounded-md px-3 py-2 text-[11px] text-text-primary focus:ring-1 focus:ring-brand outline-none"
                      placeholder="Interview Rounds (comma separated)"
                    />
                    <div className="flex flex-col gap-2 mt-1">
                      <label className="flex items-center gap-2 text-[11px] text-text-secondary">
                        <input type="checkbox" checked={form.portfolioRequired} onChange={e => setForm(prev => ({ ...prev, portfolioRequired: e.target.checked }))} className="rounded border-border text-brand focus:ring-brand" />
                        Portfolio required
                      </label>
                      <label className="flex items-center gap-2 text-[11px] text-text-secondary">
                        <input type="checkbox" checked={form.githubRequired} onChange={e => setForm(prev => ({ ...prev, githubRequired: e.target.checked }))} className="rounded border-border text-brand focus:ring-brand" />
                        GitHub required
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={createDrive}
                disabled={isCreating}
                className="w-full mt-2 px-4 py-2.5 rounded-md bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-bold transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Hiring Drive'}
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <GlassCard className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg text-text-primary">{selectedDrive?.hiringName || 'Recruitment Pipeline'}</h3>
                <p className="text-xs text-text-secondary mt-1">{selectedDrive?.description || 'Create a drive or import resumes to start ranking candidates.'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {}}
                  className="px-3 py-2 rounded-md border border-border bg-surface-card hover:bg-surface-sunken text-text-secondary hover:text-text-primary text-[11px] font-semibold flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </button>
              </div>
            </div>

            <label
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                uploadFiles(e.dataTransfer.files);
              }}
              className={`mt-6 border border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-card ${isUploading ? 'border-brand bg-brand-tint' : 'border-border hover:border-border-strong hover:bg-surface-sunken'}`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.zip,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={e => e.target.files && uploadFiles(e.target.files)}
                disabled={isUploading || !selectedDriveId}
              />
              <UploadCloud className={`w-8 h-8 mb-2 ${isUploading ? 'text-brand animate-pulse' : 'text-text-muted'}`} />
              <span className="text-sm font-semibold text-text-primary">{isUploading ? uploadStage : 'Bulk Resume Import'}</span>
              <span className="text-xs text-text-secondary mt-1">Drag and drop 100+ resumes, ZIP files, or select multiple files</span>
            </label>
          </GlassCard>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <GlassCard className="xl:col-span-2 p-4 flex flex-col h-[800px]">
              <div className="flex flex-col gap-3 mb-4 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') searchCandidates(); }}
                    placeholder="Search candidates..."
                    className="w-full bg-surface-sunken border border-border rounded-md pl-9 pr-3 py-2 text-xs text-text-primary focus:ring-1 focus:ring-brand outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="flex-1 bg-surface-sunken border border-border rounded-md px-2 py-2 text-xs text-text-primary outline-none focus:ring-1 focus:ring-brand">
                    {['All', 'Strong Match', 'Good Match', 'Average', 'Weak Match', 'Rejected', 'Interview Scheduled', 'Offer Sent', 'Offer Accepted'].map(status => <option key={status}>{status}</option>)}
                  </select>
                  <button onClick={searchCandidates} className="px-3 py-2 rounded-md bg-brand text-white text-xs font-semibold hover:bg-brand-hover">Search</button>
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                {isLoading ? (
                  <div className="text-sm text-text-muted py-8 text-center font-medium">Loading candidates...</div>
                ) : filteredCandidates.length ? filteredCandidates.map(candidate => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`w-full p-3 rounded-md border text-left transition-colors flex flex-col gap-2 ${selectedCandidate?.id === candidate.id ? 'bg-brand-tint border-brand/20' : 'bg-surface-card border-border hover:bg-surface-sunken'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className={`text-sm font-semibold truncate ${selectedCandidate?.id === candidate.id ? 'text-brand' : 'text-text-primary'}`}>{candidate.parsedProfile.fullName}</h4>
                        <p className="text-[10px] text-text-secondary mt-0.5 truncate">{candidate.parsedProfile.education.college || candidate.parsedProfile.education.degree || candidate.fileName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-mono font-bold text-ai-accent">{candidate.aiScore.overallMatchScore}%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex flex-wrap gap-1">
                        {candidate.parsedProfile.skills.all.slice(0, 3).map(skill => (
                          <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-sunken border border-border text-text-secondary">{skill}</span>
                        ))}
                        {candidate.parsedProfile.skills.all.length > 3 && <span className="text-[9px] text-text-muted">+{candidate.parsedProfile.skills.all.length - 3}</span>}
                      </div>
                      <span className="text-[9px] font-bold uppercase text-text-muted">{candidate.status}</span>
                    </div>
                  </button>
                )) : (
                  <div className="text-sm text-text-muted py-8 text-center font-medium">No candidates found.</div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="xl:col-span-3 p-6 h-[800px] overflow-y-auto">
              {selectedCandidate ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-xl text-text-primary">{selectedCandidate.parsedProfile.fullName}</h3>
                        <p className="text-xs text-text-secondary mt-1">{selectedCandidate.parsedProfile.email || 'No email'} | {selectedCandidate.parsedProfile.phone || 'No phone'}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-4xl font-mono font-bold text-ai-accent">{selectedCandidate.aiScore.overallMatchScore}%</p>
                        <span className="px-1.5 py-0.5 rounded-sm bg-ai-tint text-ai-accent text-[9px] font-bold uppercase tracking-wider border border-ai-accent/20 flex items-center gap-1 mt-1">
                          <Sparkles className="w-2.5 h-2.5" /> AI Match
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-text-primary mt-4 leading-relaxed">{selectedCandidate.parsedProfile.profileSummary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {[
                      ['Skill', selectedCandidate.aiScore.skillMatch],
                      ['CGPA', selectedCandidate.aiScore.cgpaMatch],
                      ['Project', selectedCandidate.aiScore.projectMatch],
                      ['Education', selectedCandidate.aiScore.educationMatch],
                    ].map(([label, score]) => (
                      <div key={String(label)} className="p-3 rounded-md bg-surface-sunken border border-border flex justify-between items-center">
                        <span className="text-text-secondary font-semibold uppercase tracking-wide text-[10px]">{label}</span>
                        <span className="text-text-primary font-mono font-bold text-sm">{score}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-ai-tint/50 border border-ai-accent/20 rounded-md">
                    <h4 className="text-xs font-semibold text-ai-accent mb-3 flex items-center gap-2"><Brain className="w-4 h-4" /> AI Analysis</h4>
                    <ul className="space-y-2">
                      {selectedCandidate.aiScore.reasons.map(reason => (
                        <li key={reason} className="text-xs text-text-primary flex gap-2"><span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-ai-accent shrink-0" />{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[11px] font-semibold text-success uppercase tracking-wide mb-2">Matching Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.aiScore.matchingSkills.map(skill => <span key={skill} className="text-[10px] px-2 py-1 rounded-sm bg-success-tint text-success border border-success/20 font-medium">{skill}</span>)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] font-semibold text-danger uppercase tracking-wide mb-2">Missing Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.aiScore.missingSkills.map(skill => <span key={skill} className="text-[10px] px-2 py-1 rounded-sm bg-danger-tint text-danger border border-danger/20 font-medium">{skill}</span>)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-brand" /> Suggested Interview Questions</h4>
                    <ul className="space-y-2">
                      {selectedCandidate.aiScore.recommendedInterviewQuestions.map(question => (
                        <li key={question} className="text-xs text-text-secondary leading-relaxed p-2 bg-surface-sunken rounded border border-border">{question}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-brand" /> Detected Projects</h4>
                    <div className="space-y-2">
                      {(selectedCandidate.parsedProfile.projects.length ? selectedCandidate.parsedProfile.projects : ['No explicit project section detected.']).slice(0, 5).map((project, i) => (
                        <p key={i} className="text-xs text-text-secondary leading-relaxed p-2 bg-surface-sunken rounded border border-border">{project}</p>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {['Interview Scheduled', 'Offer Sent', 'Offer Accepted', 'Rejected'].map(status => (
                      <button key={status} onClick={() => updateStatus(status)} className="px-4 py-2 rounded-md bg-surface-card hover:bg-surface-sunken border border-border text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors">
                        Mark as {status}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm font-medium text-text-muted">
                  Select a candidate to open the AI profile.
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};
