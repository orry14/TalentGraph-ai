import React, { useState, useEffect } from 'react';
import { GlassCard as Card } from '../components/GlassCard';
import { SkeletonCard, SkeletonList } from '../components/LoadingSkeleton';
import { SuccessionSimulator } from '../components/SuccessionSimulator';
import { SemanticSearch } from '../components/SemanticSearch';
import { GitConnectModal } from '../components/GitConnectModal';
import { EmailComposerModal } from '../components/EmailComposerModal';
import { Employee, api, LearningRecommendation, PromotionEvaluation } from '../utils/api';
import {
  Search,
  UploadCloud,
  Briefcase,
  Compass,
  Star,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  ChevronRight,
  RefreshCw,
  Plus,
  FileText,
  Github,
  Gitlab,
  BadgeCheck,
  Mail
} from 'lucide-react';

interface EmployeesProps {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  refreshStats: () => void;
}

export const Employees: React.FC<EmployeesProps> = ({
  employees,
  setEmployees,
  refreshStats
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [isUploading, setIsUploading] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [uploadStage, setUploadStage] = useState('');
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUpdatingRecs, setIsUpdatingRecs] = useState(false);
  const [isUpdatingPromotion, setIsUpdatingPromotion] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [gitConnectPlatform, setGitConnectPlatform] = useState<'github' | 'gitlab' | null>(null);

  const handleOpenGitConnect = (platform: 'github' | 'gitlab') => {
    setGitConnectPlatform(platform);
  };

  const handleConnectGit = async (username: string) => {
    if (!selectedEmployee) return;
    try {
      const updatedEmp = await api.connectGit(selectedEmployee.id, gitConnectPlatform!, username);
      setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
      setSelectedEmployee(updatedEmp);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    if (employees.length > 0 && !selectedId) {
      setSelectedId(employees[0].id);
    }
  }, [employees]);

  useEffect(() => {
    if (!selectedId) return;

    const fetchDetails = async () => {
      setIsLoadingProfile(true);
      try {
        const fullProfile = await api.getEmployeeById(selectedId);
        setSelectedEmployee(fullProfile);
      } catch (err) {
        console.error('Error fetching employee details:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchDetails();
  }, [selectedId, employees]);

  const processResumeFiles = async (files: FileList | File[]) => {
    const selectedFiles = Array.from(files).filter(Boolean);
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    setUploadStage(`Uploading ${selectedFiles.length} resume${selectedFiles.length > 1 ? 's' : ''}`);

    try {
      setTimeout(() => setUploadStage('Extracting text'), 250);
      setTimeout(() => setUploadStage('Parsing resume JSON'), 650);
      setTimeout(() => setUploadStage('Generating AI profile'), 1000);
      if (selectedFiles.length === 1) {
        const newEmp = await api.uploadResume(selectedFiles[0]);
        setEmployees(prev => [newEmp, ...prev]);
        setSelectedId(newEmp.id);
      } else {
        const result = await api.uploadResumes(selectedFiles);
        setEmployees(prev => [...result.employees, ...prev]);
        if (result.employees[0]) setSelectedId(result.employees[0].id);
        if (result.failures.length) {
          setUploadError(`${result.failures.length} file(s) failed. ${result.failures[0].error}`);
        }
      }
      refreshStats();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to process resume');
    } finally {
      setIsUploading(false);
      setUploadStage('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await processResumeFiles(e.target.files);
    e.target.value = '';
  };

  const handleRegenRecs = async () => {
    if (!selectedEmployee) return;
    setIsUpdatingRecs(true);
    try {
      const newRecs = await api.regenerateRecommendations(selectedEmployee.id);
      setSelectedEmployee(prev => prev ? { ...prev, learningRecommendations: newRecs } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingRecs(false);
    }
  };

  const handleRegenPromotion = async () => {
    if (!selectedEmployee) return;
    setIsUpdatingPromotion(true);
    try {
      const newEval = await api.regeneratePromotion(selectedEmployee.id);
      setSelectedEmployee(prev => prev ? { ...prev, promotionEvaluation: newEval } : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingPromotion(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.technicalSkills.some(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const departments = ['All', 'Engineering', 'Data Science', 'Product', 'Design'];

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      await api.exportReport('employees', { searchQuery, selectedDept }, format);
    } catch (err) {
      console.error(err);
      alert('Export failed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)] overflow-hidden">
      {/* Left panel: Employee list & upload */}
      <div className="lg:col-span-4 flex flex-col h-full space-y-6 overflow-hidden">
        {/* Resume Upload Box */}
        <Card className="p-4 shrink-0 shadow-xs border-[var(--border-subtle)]">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-[14px] text-[var(--text-primary)]">Resume Intelligence</h4>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleExport('csv')}
                className="px-2 py-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded text-[12px] font-medium transition-all"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-2 py-1 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-alt)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded text-[12px] font-medium transition-all"
              >
                PDF
              </button>
            </div>
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] mb-3">Upload resumes to parse structured JSON and generate candidate profiles automatically</p>

          <label
            onDragOver={e => {
              e.preventDefault();
              setIsDraggingResume(true);
            }}
            onDragLeave={() => setIsDraggingResume(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDraggingResume(false);
              processResumeFiles(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isUploading || isDraggingResume
              ? 'border-[var(--blue)] bg-[var(--blue-soft)]' 
              : 'border-[var(--border-default)] hover:border-[var(--blue)] hover:bg-[var(--bg-surface-alt)]'
          }`}>
            <input
              type="file"
              accept=".pdf,.txt,.docx,.zip,.png,.jpg,.jpeg,.webp"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2 py-2">
                <RefreshCw className="w-5 h-5 text-[var(--blue)] animate-spin" />
                <span className="text-[12px] font-medium text-[var(--blue)]">{uploadStage || 'AI Parsing Resume...'}</span>
                <div className="h-1.5 w-40 bg-[var(--border-subtle)] rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-[var(--blue)] animate-pulse rounded-full" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1.5 py-1">
                <UploadCloud className="w-5 h-5 text-[var(--text-tertiary)] group-hover:text-[var(--blue)]" />
                <span className="text-[13px] font-medium text-[var(--text-secondary)]">Upload or Drop Resumes</span>
                <span className="text-[12px] text-[var(--text-tertiary)]">PDF, DOCX, TXT, ZIP, image | multiple files</span>
              </div>
            )}
          </label>
          {uploadError && (
            <p className="text-[12px] text-[var(--red)] mt-2 font-medium">{uploadError}</p>
          )}
        </Card>

        {/* Filter controls */}
        <div className="space-y-3 shrink-0 z-40 bg-[var(--bg-canvas)]">
          <SemanticSearch onSelectEmployee={setSelectedId} />

          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                  selectedDept === dept
                    ? 'bg-[var(--blue-soft)] text-[var(--blue)] border-[var(--blue)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-surface-alt)]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map(emp => (
              <button
                key={emp.id}
                onClick={() => setSelectedId(emp.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-200 flex items-center justify-between border ${
                  selectedId === emp.id
                    ? 'bg-[var(--bg-surface)] border-[var(--blue)] shadow-sm'
                    : 'bg-[var(--bg-canvas)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-default)]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-[var(--blue)] text-[14px] bg-[var(--blue-soft)] shrink-0`}>
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="text-[14px] font-semibold text-[var(--text-primary)]">{emp.name}</h5>
                    <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{emp.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[12px] font-medium text-[var(--text-secondary)] bg-[var(--bg-surface-alt)] py-1 px-2 rounded">
                    {emp.department}
                  </span>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1.5 font-medium">{emp.experienceYears} yrs exp</p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10 border border-dashed border-[var(--border-default)] rounded-xl bg-[var(--bg-surface)]">
              <span className="text-[13px] text-[var(--text-tertiary)] font-medium block mb-3">No workforce match found.</span>
              <button 
                onClick={() => window.location.hash = 'settings-import'} 
                className="text-[12px] font-medium text-[var(--accent)] hover:underline"
              >
                Import from CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Details Workspace */}
      <div className="lg:col-span-8 h-full overflow-hidden flex flex-col">
        {isLoadingProfile ? (
          <SkeletonCard />
        ) : selectedEmployee ? (
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-8">
            {/* Header profile summary card */}
            <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border-[var(--border-subtle)] shadow-xs">
              <div className="flex items-center space-x-5">
                <div className="w-16 h-16 rounded-full bg-[var(--blue-soft)] flex items-center justify-center font-semibold text-[var(--blue)] text-xl shrink-0">
                  {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-[22px] text-[var(--text-primary)]">{selectedEmployee.name}</h3>
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-[var(--blue-soft)] text-[12px] font-semibold text-[var(--blue)] uppercase tracking-wide">
                      {selectedEmployee.department}
                    </span>
                  </div>
                  <p className="text-[14px] text-[var(--text-secondary)] font-medium mt-1">{selectedEmployee.role}</p>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{selectedEmployee.email}</p>
                  
                  <div className="flex gap-2 mt-3">
                    {selectedEmployee.github_username ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] bg-[var(--purple-soft)] text-[var(--purple)] px-2.5 py-1 rounded-md font-medium">
                        <Github className="w-3.5 h-3.5" /> @{selectedEmployee.github_username}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenGitConnect('github')}
                        className="inline-flex items-center gap-1.5 text-[12px] bg-[var(--bg-surface-alt)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] px-2.5 py-1 rounded-md font-medium transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" /> Connect GitHub
                      </button>
                    )}

                    {selectedEmployee.gitlab_username ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] bg-[var(--amber-soft)] text-[var(--amber)] px-2.5 py-1 rounded-md font-medium">
                        <Gitlab className="w-3.5 h-3.5" /> @{selectedEmployee.gitlab_username}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenGitConnect('gitlab')}
                        className="inline-flex items-center gap-1.5 text-[12px] bg-[var(--bg-surface-alt)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] border border-[var(--border-default)] px-2.5 py-1 rounded-md font-medium transition-colors"
                      >
                        <Gitlab className="w-3.5 h-3.5" /> Connect GitLab
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex items-center space-x-6 bg-[var(--bg-surface-alt)] border border-[var(--border-subtle)] p-4 rounded-xl">
                  <div className="text-center">
                    <span className="block text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Experience</span>
                    <span className="text-[18px] font-semibold text-[var(--text-primary)] mt-0.5 block">{selectedEmployee.experienceYears} yrs</span>
                  </div>
                  <div className="h-8 w-px bg-[var(--border-default)]" />
                  <div className="text-center">
                    <span className="block text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">Performance</span>
                    <span className="text-[18px] font-semibold text-[var(--text-primary)] mt-0.5 block">{selectedEmployee.performanceRating} / 5.0</span>
                  </div>
                </div>
                <button 
                  onClick={() => setComposerOpen(true)}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  Email Candidate
                </button>
              </div>
            </Card>

            <EmailComposerModal
              isOpen={composerOpen}
              onClose={() => setComposerOpen(false)}
              recipientEmail={selectedEmployee.email}
              recipientName={selectedEmployee.name}
              contextData={selectedEmployee}
            />

            {/* Bio Profile summary */}
            <Card className="p-5 border-[var(--border-subtle)]">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h5 className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">AI Profile Insights</h5>
                  <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed italic">
                    "{selectedEmployee.profileSummary}"
                  </p>
                </div>
                <button
                  onClick={() => setShowSimulator(true)}
                  className="shrink-0 px-4 py-2 bg-[var(--blue-soft)] hover:bg-[var(--blue-soft)]/80 text-[var(--blue)] font-medium text-[13px] rounded-lg transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Career Simulator
                </button>
              </div>
            </Card>

            {showSimulator && (
              <SuccessionSimulator
                employee={selectedEmployee}
                onClose={() => setShowSimulator(false)}
              />
            )}

            {/* Middle: Skills & Experience Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical skills */}
              <Card className="p-5">
                <h4 className="font-semibold text-[15px] text-[var(--text-primary)] mb-4 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-[var(--blue)]" />
                  <span>Technical Expertise Mapping</span>
                </h4>
                <div className="space-y-4">
                  {selectedEmployee.technicalSkills.map((skill, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between text-[13px] font-medium">
                        <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                          {skill.name}
                          {skill.source === 'github_verified' && (
                            <span className="inline-flex items-center text-[var(--green)]" title="GitHub Verified Skill">
                              <BadgeCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </span>
                        <span className="text-[var(--blue)] font-semibold">{skill.proficiency} / 5</span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--bg-surface-alt)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--blue)] rounded-full transition-all duration-300"
                          style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Soft Skills & Certs */}
              <div className="space-y-6">
                {/* Soft Skills */}
                <Card className="p-5">
                  <h4 className="font-semibold text-[15px] text-[var(--text-primary)] mb-3 flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-[var(--purple)]" />
                    <span>Behavioral Competencies</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.softSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-[12px] font-medium px-2.5 py-1 bg-[var(--bg-surface-alt)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>

                {/* Certifications & Projects */}
                <Card className="p-5">
                  <h4 className="font-semibold text-[15px] text-[var(--text-primary)] mb-3 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[var(--green)]" />
                    <span>Certifications & active workloads</span>
                  </h4>
                  <div className="space-y-4">
                    {selectedEmployee.certifications.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Accreditations</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployee.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="text-[12px] font-medium px-2 py-0.5 bg-[var(--green-soft)] text-[var(--green)] rounded"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Assigned Workstreams</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.currentProjects.length > 0 ? (
                          selectedEmployee.currentProjects.map((proj, index) => (
                            <span
                              key={index}
                              className="text-[12px] font-medium px-2 py-0.5 bg-[var(--bg-surface-alt)] border border-[var(--border-default)] text-[var(--text-secondary)] rounded"
                            >
                              {proj}
                            </span>
                          ))
                        ) : (
                          <span className="text-[12px] text-[var(--text-tertiary)]">Unassigned (Available)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Row 3: AI Career Roadmap (Learning recommendations) */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-[16px] text-[var(--text-primary)] flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-[var(--blue)]" />
                  <span>AI Upskilling Recommendation & Roadmap</span>
                </h4>
                <button
                  onClick={handleRegenRecs}
                  disabled={isUpdatingRecs}
                  className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center space-x-1.5 bg-[var(--bg-surface-alt)] border border-[var(--border-default)] py-1.5 px-3 rounded-md transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingRecs ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              {selectedEmployee.learningRecommendations && selectedEmployee.learningRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEmployee.learningRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-xl space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h5 className="text-[14px] font-semibold text-[var(--text-primary)] leading-snug">{rec.courseName}</h5>
                          <span className={`text-[12px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                            rec.type === 'certification'
                              ? 'bg-[var(--green-soft)] text-[var(--green)]'
                              : rec.type === 'project'
                              ? 'bg-[var(--purple-soft)] text-[var(--purple)]'
                              : 'bg-[var(--blue-soft)] text-[var(--blue)]'
                          }`}>
                            {rec.type}
                          </span>
                        </div>
                        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{rec.description}</p>
                      </div>

                      <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2.5">
                        <div className="flex items-center text-[12px] text-[var(--text-secondary)] font-medium">
                          <Calendar className="w-3.5 h-3.5 mr-1.5 text-[var(--text-tertiary)]" />
                          <span>Timeline: {rec.timeline}</span>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Roadmap Path</span>
                          <ul className="space-y-1 text-[12px] text-[var(--text-secondary)]">
                            {rec.roadmap.map((step, idx) => (
                              <li key={idx} className="flex items-start space-x-1.5">
                                <ChevronRight className="w-3.5 h-3.5 text-[var(--blue)] shrink-0 mt-0.5" />
                                <span className="leading-snug">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[13px] text-[var(--text-tertiary)] border border-dashed border-[var(--border-default)] rounded-xl bg-[var(--bg-canvas)]">
                  Click regenerate to run AI and draft a custom career training roadmap.
                </div>
              )}
            </Card>

            {/* Row 4: AI Promotion Readiness Evaluation */}
            <Card className="p-6 bg-[var(--purple-soft)] border-[var(--purple)]/20">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-[16px] text-[var(--text-primary)] flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[var(--purple)]" />
                  <span>AI Promotion Readiness Index</span>
                </h4>
                <button
                  onClick={handleRegenPromotion}
                  disabled={isUpdatingPromotion}
                  className="text-[12px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center space-x-1.5 bg-[var(--bg-surface)] border border-[var(--border-default)] py-1.5 px-3 rounded-md transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingPromotion ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              {selectedEmployee.promotionEvaluation ? (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Gauge */}
                  <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl relative overflow-hidden">
                    <span className="text-[12px] uppercase font-semibold text-[var(--text-tertiary)] tracking-wider mb-4">Readiness Score</span>
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          stroke="var(--border-subtle)"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r="48"
                          stroke="var(--purple)"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - selectedEmployee.promotionEvaluation.promotionScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-bold text-[var(--text-primary)]">{selectedEmployee.promotionEvaluation.promotionScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Text & Improvement recommendations */}
                  <div className="md:w-2/3 space-y-5">
                    <div className="space-y-1.5">
                      <span className="text-[12px] font-semibold text-[var(--purple)] uppercase tracking-wide">Analysis & Reasoning</span>
                      <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                        {selectedEmployee.promotionEvaluation.reasoning}
                      </p>
                    </div>

                    {selectedEmployee.promotionEvaluation.areasToImprove.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Identified Growth Areas</span>
                        <ul className="space-y-1.5 text-[13px] text-[var(--text-secondary)]">
                          {selectedEmployee.promotionEvaluation.areasToImprove.map((area, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--purple)] shrink-0 mt-1.5" />
                              <span className="leading-relaxed">{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-[13px] text-[var(--text-tertiary)] border border-dashed border-[var(--purple)]/20 rounded-xl bg-[var(--bg-surface)]">
                  Click regenerate to trigger AI promotion readiness metrics.
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
            <span className="text-[var(--text-tertiary)] text-[14px]">Select an employee to open their profile.</span>
          </div>
        )}
      </div>

      {gitConnectPlatform && (
        <GitConnectModal
          platform={gitConnectPlatform}
          onConnect={handleConnectGit}
          onClose={() => setGitConnectPlatform(null)}
        />
      )}
    </div>
  );
};
