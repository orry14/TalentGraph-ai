import React, { useEffect, useMemo, useState } from 'react';
import { GlassCard as Card } from '../components/GlassCard';
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
        <div className="px-4 py-3 rounded-xl border border-[var(--red)]/20 bg-[var(--red-soft)] text-[var(--red)] text-[12px] font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(([label, value, KpiIcon]) => {
          return (
            <Card key={String(label)} className="p-4 shadow-sm border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">{label}</span>
                <KpiIcon className="w-4 h-4 text-[var(--blue)]" />
              </div>
              <p className="text-2xl font-bold text-[var(--text-primary)] mt-2">{value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-4 space-y-6">
          <Card className="p-4 shadow-sm border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[15px] text-[var(--text-primary)]">Hiring Drives</h3>
              <Plus className="w-4 h-4 text-[var(--blue)]" />
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {drives.map(drive => (
                <button
                  key={drive.id}
                  onClick={() => loadRecruitment(drive.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${selectedDriveId === drive.id ? 'bg-[var(--blue-soft)] border-[var(--blue)]' : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">{drive.hiringName}</span>
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/20">{drive.status}</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">{drive.source} | {drive.role}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4 shadow-sm border-[var(--border-subtle)]">
            <h3 className="font-semibold text-[15px] text-[var(--text-primary)] mb-4">Create Hiring Campaign</h3>
            <div className="grid grid-cols-1 gap-3">
              {(['hiringName', 'company', 'department', 'role', 'source', 'location', 'salary', 'experience', 'degree', 'graduationYear'] as const).map(key => (
                <input
                  key={key}
                  value={String(form[key])}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--blue)] transition-colors"
                  placeholder={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                />
              ))}
              <textarea
                value={form.description}
                onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[12px] text-[var(--text-primary)] min-h-16 placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--blue)] transition-colors"
                placeholder="Description"
              />
              {(['requiredSkills', 'preferredSkills', 'branches', 'preferredColleges', 'requiredCertifications', 'projectKeywords', 'languages', 'interviewRounds'] as const).map(key => (
                <input
                  key={key}
                  value={String(form[key])}
                  onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                  className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--blue)] transition-colors"
                  placeholder={`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} comma separated`}
                />
              ))}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={form.minimumCgpa}
                  onChange={e => setForm(prev => ({ ...prev, minimumCgpa: Number(e.target.value) }))}
                  className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--blue)] transition-colors"
                  placeholder="Minimum CGPA"
                />
                <input
                  type="number"
                  value={form.maximumCandidates}
                  onChange={e => setForm(prev => ({ ...prev, maximumCandidates: Number(e.target.value) }))}
                  className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg px-3 py-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--blue)] transition-colors"
                  placeholder="Maximum Candidates"
                />
              </div>
              <div className="flex items-center gap-4 text-[12px] text-[var(--text-secondary)] py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.portfolioRequired} onChange={e => setForm(prev => ({ ...prev, portfolioRequired: e.target.checked }))} className="rounded border-[var(--border-default)] text-[var(--blue)] focus:ring-[var(--blue)]" />
                  Portfolio required
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.githubRequired} onChange={e => setForm(prev => ({ ...prev, githubRequired: e.target.checked }))} className="rounded border-[var(--border-default)] text-[var(--blue)] focus:ring-[var(--blue)]" />
                  GitHub required
                </label>
              </div>
              <button
                onClick={createDrive}
                disabled={isCreating}
                className="mt-2 px-4 py-2.5 rounded-xl bg-[var(--blue)] hover:bg-blue-600 disabled:opacity-50 text-white text-[13px] font-semibold transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create Hiring Drive'}
              </button>
            </div>
          </Card>
        </div>

        <div className="xl:col-span-8 space-y-6">
          <Card className="p-5 shadow-sm border-[var(--border-subtle)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-[18px] text-[var(--text-primary)]">{selectedDrive?.hiringName || 'Recruitment Pipeline'}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">{selectedDrive?.description || 'Create a drive or import resumes to start ranking candidates.'}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/api/recruitment/export.csv"
                  className="px-3 py-2 rounded-lg border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] hover:border-[var(--border-subtle)] text-[12px] font-semibold flex items-center gap-2 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  CSV
                </a>
              </div>
            </div>

            <label
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                uploadFiles(e.dataTransfer.files);
              }}
              className={`mt-5 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isUploading ? 'border-[var(--blue)] bg-[var(--blue-soft)]' : 'border-[var(--border-default)] hover:border-[var(--blue)] hover:bg-[var(--bg-surface-alt)]'}`}
            >
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt,.zip,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={e => e.target.files && uploadFiles(e.target.files)}
                disabled={isUploading || !selectedDriveId}
              />
              <UploadCloud className={`w-8 h-8 ${isUploading ? 'text-[var(--blue)] animate-pulse' : 'text-[var(--text-tertiary)]'}`} />
              <span className="text-[14px] font-semibold text-[var(--text-primary)] mt-3">{isUploading ? uploadStage : 'Bulk Resume Import'}</span>
              <span className="text-[12px] text-[var(--text-secondary)] mt-1">Drag and drop 100+ resumes, ZIP files, or select multiple files</span>
              {isUploading && <div className="mt-4 h-1.5 w-64 bg-[var(--border-subtle)] rounded-full overflow-hidden"><div className="h-full w-2/3 bg-[var(--blue)] rounded-full animate-pulse" /></div>}
            </label>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <Card className="xl:col-span-3 p-4 shadow-sm border-[var(--border-subtle)]">
              <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-tertiary)]" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') searchCandidates(); }}
                    placeholder="Find React developers with AI projects"
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl pl-9 pr-3 py-2 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--blue)] transition-colors"
                  />
                </div>
                <button onClick={searchCandidates} className="px-4 py-2 rounded-xl bg-[var(--blue)] text-white text-[12px] font-semibold hover:bg-blue-600 transition-colors">Search</button>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl px-2 py-2 text-[12px] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--blue)] transition-colors">
                    {['All', 'Strong Match', 'Good Match', 'Average', 'Weak Match', 'Rejected', 'Interview Scheduled', 'Offer Sent', 'Offer Accepted'].map(status => <option key={status}>{status}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {isLoading ? (
                  <div className="text-[13px] text-[var(--text-tertiary)] py-8 text-center font-medium">Loading candidates...</div>
                ) : filteredCandidates.length ? filteredCandidates.map(candidate => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`w-full p-4 rounded-xl border text-left transition-colors ${selectedCandidate?.id === candidate.id ? 'bg-[var(--blue-soft)] border-[var(--blue)] shadow-sm' : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-surface)]'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-[14px] font-semibold text-[var(--text-primary)]">{candidate.parsedProfile.fullName}</h4>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{candidate.parsedProfile.education.college || candidate.parsedProfile.education.degree || candidate.fileName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-[var(--blue)]">{candidate.aiScore.overallMatchScore}%</p>
                        <p className="text-[12px] text-[var(--text-tertiary)] font-medium">{candidate.status}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {candidate.parsedProfile.skills.all.slice(0, 5).map(skill => (
                        <span key={skill} className="text-[12px] px-2 py-0.5 rounded bg-[var(--bg-surface-alt)] border border-[var(--border-default)] text-[var(--text-secondary)] font-medium">{skill}</span>
                      ))}
                    </div>
                  </button>
                )) : (
                  <div className="text-[13px] text-[var(--text-tertiary)] py-8 text-center border border-dashed border-[var(--border-default)] rounded-xl mt-2 font-medium bg-[var(--bg-surface)]">
                    <span className="block mb-3">No candidates found for this drive.</span>
                    <button 
                      onClick={() => window.location.hash = 'settings-import'} 
                      className="font-medium text-[var(--accent)] hover:underline"
                    >
                      Import from CSV
                    </button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="xl:col-span-2 p-5 shadow-sm border-[var(--border-subtle)]">
              {selectedCandidate ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[18px] text-[var(--text-primary)]">{selectedCandidate.parsedProfile.fullName}</h3>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-1">{selectedCandidate.parsedProfile.email || 'No email'} | {selectedCandidate.parsedProfile.phone || 'No phone'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-[var(--blue)]">{selectedCandidate.aiScore.overallMatchScore}%</p>
                        <p className="text-[12px] text-[var(--text-tertiary)] font-medium">Match</p>
                      </div>
                    </div>
                    <p className="text-[13px] text-[var(--text-secondary)] mt-4 leading-relaxed">{selectedCandidate.parsedProfile.profileSummary}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[12px]">
                    {[
                      ['Skill', selectedCandidate.aiScore.skillMatch],
                      ['CGPA', selectedCandidate.aiScore.cgpaMatch],
                      ['Project', selectedCandidate.aiScore.projectMatch],
                      ['Education', selectedCandidate.aiScore.educationMatch],
                    ].map(([label, score]) => (
                      <div key={String(label)} className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-default)]">
                        <span className="text-[var(--text-tertiary)] font-semibold uppercase tracking-wide">{label}</span>
                        <p className="text-[var(--text-primary)] font-bold text-[16px] mt-1">{score}%</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-[13px] font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Brain className="w-4 h-4 text-[var(--blue)]" /> AI Explanation</h4>
                    <ul className="space-y-2">
                      {selectedCandidate.aiScore.reasons.map(reason => (
                        <li key={reason} className="text-[12px] text-[var(--text-secondary)] flex gap-2"><span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[var(--blue)] shrink-0" />{reason}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[12px] font-semibold text-[var(--green)] uppercase mb-2 tracking-wide">Matching Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.aiScore.matchingSkills.map(skill => <span key={skill} className="text-[12px] px-2 py-1 rounded bg-[var(--green-soft)] text-[var(--green)] border border-[var(--green)]/20 font-medium">{skill}</span>)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[12px] font-semibold text-[var(--red)] uppercase mb-2 tracking-wide">Missing Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedCandidate.aiScore.missingSkills.map(skill => <span key={skill} className="text-[12px] px-2 py-1 rounded bg-[var(--red-soft)] text-[var(--red)] border border-[var(--red)]/20 font-medium">{skill}</span>)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[13px] font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[var(--purple)]" /> Interview Questions</h4>
                    <ul className="space-y-2">
                      {selectedCandidate.aiScore.recommendedInterviewQuestions.map(question => (
                        <li key={question} className="text-[12px] text-[var(--text-secondary)] leading-relaxed">- {question}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-[13px] font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-[var(--blue)]" /> Projects</h4>
                    <div className="space-y-2">
                      {(selectedCandidate.parsedProfile.projects.length ? selectedCandidate.parsedProfile.projects : ['No explicit project section detected.']).slice(0, 5).map(project => (
                        <p key={project} className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{project}</p>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border-subtle)]">
                    {['Interview Scheduled', 'Offer Sent', 'Offer Accepted', 'Rejected'].map(status => (
                      <button key={status} onClick={() => updateStatus(status)} className="px-3 py-1.5 rounded-lg bg-[var(--bg-surface-alt)] hover:bg-[var(--border-subtle)] border border-[var(--border-default)] text-[12px] font-semibold text-[var(--text-secondary)] transition-colors">
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[420px] flex items-center justify-center text-[13px] font-medium text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)] rounded-xl">
                  Select a candidate to open the AI profile.
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
