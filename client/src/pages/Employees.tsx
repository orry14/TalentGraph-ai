import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { SkeletonCard } from '../components/LoadingSkeleton';
import { SuccessionSimulator } from '../components/SuccessionSimulator';
import { SemanticSearch } from '../components/SemanticSearch';
import { GitConnectModal } from '../components/GitConnectModal';
import { Employee, api } from '../utils/api';
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
  ChevronLeft,
  RefreshCw,
  Plus,
  FileText,
  Github,
  Gitlab,
  BadgeCheck
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
  const [uploadStage, setUploadStage] = useState('');
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUpdatingRecs, setIsUpdatingRecs] = useState(false);
  const [isUpdatingPromotion, setIsUpdatingPromotion] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);
  const [gitConnectPlatform, setGitConnectPlatform] = useState<'github' | 'gitlab' | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
        setCurrentPage(1); // Reset to first page to see new employee
      } else {
        const result = await api.uploadResumes(selectedFiles);
        setEmployees(prev => [...result.employees, ...prev]);
        if (result.employees[0]) setSelectedId(result.employees[0].id);
        setCurrentPage(1);
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

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDept]);

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
      <div className="lg:col-span-4 flex flex-col h-full bg-surface-card border border-border rounded-md shadow-card overflow-hidden">
        
        {/* Header and Controls */}
        <div className="p-4 border-b border-border shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-sm text-text-primary">Employee Directory</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="px-2 py-1 bg-surface-card hover:bg-surface-sunken text-text-secondary border border-border rounded text-[10px] font-semibold transition-all"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-2 py-1 bg-surface-card hover:bg-surface-sunken text-text-secondary border border-border rounded text-[10px] font-semibold transition-all"
              >
                PDF
              </button>
            </div>
          </div>
          
          <SemanticSearch onSelectEmployee={setSelectedId} />

          <div className="flex space-x-1 overflow-x-auto pb-1 mt-3">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all shrink-0 ${
                  selectedDept === dept
                    ? 'bg-brand-tint text-brand border-brand/20'
                    : 'bg-transparent text-text-secondary border-transparent hover:bg-surface-sunken hover:text-text-primary'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto">
          {paginatedEmployees.length > 0 ? (
            paginatedEmployees.map(emp => {
              const isSelected = selectedId === emp.id;
              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedId(emp.id)}
                  className={`w-full text-left p-4 border-b border-border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-brand-tint border-l-4 border-l-brand border-b-border pl-3' // pl-3 to adjust for border-l-4
                      : 'bg-surface-card hover:bg-surface-sunken border-l-4 border-l-transparent pl-3'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-md bg-surface-sunken border border-border flex items-center justify-center font-bold text-text-secondary text-xs">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h5 className={`text-sm font-semibold ${isSelected ? 'text-brand' : 'text-text-primary'}`}>{emp.name}</h5>
                      <p className="text-[11px] text-text-secondary mt-0.5">{emp.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-medium text-text-secondary bg-surface-sunken py-1 px-2 border border-border rounded-full">
                      {emp.department}
                    </span>
                    <p className="text-[10px] text-text-muted mt-1.5 font-medium">{emp.experienceYears} yrs exp</p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="text-center py-10">
              <span className="text-sm text-text-muted font-medium">No workforce match found.</span>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border flex justify-between items-center shrink-0 bg-surface-card">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-sunken rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-medium text-text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-sunken rounded disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Resume Upload Box (Bottom) */}
        <div className="p-4 border-t border-border bg-surface-sunken shrink-0">
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
            className={`border border-dashed rounded-md p-4 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 bg-surface-card ${
            isUploading || isDraggingResume
              ? 'border-brand bg-brand-tint' 
              : 'border-border hover:border-border-strong hover:bg-surface-sunken'
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
              <div className="flex flex-col items-center space-y-2 py-1">
                <RefreshCw className="w-5 h-5 text-brand animate-spin" />
                <span className="text-[11px] font-medium text-brand">{uploadStage || 'AI Parsing Resume...'}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-1 py-1 text-center">
                <UploadCloud className="w-5 h-5 text-text-muted mb-1" />
                <span className="text-xs font-semibold text-text-primary">Upload Resumes</span>
                <span className="text-[10px] text-text-secondary">Drag & drop files to generate profiles</span>
              </div>
            )}
          </label>
          {uploadError && (
            <p className="text-[11px] text-danger mt-2 font-medium">{uploadError}</p>
          )}
        </div>
      </div>

      {/* Right panel: Details Workspace */}
      <div className="lg:col-span-8 h-full overflow-hidden flex flex-col">
        {isLoadingProfile ? (
          <SkeletonCard />
        ) : selectedEmployee ? (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-8">
            {/* Header profile summary card */}
            <GlassCard>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-md bg-surface-sunken border border-border flex items-center justify-center font-bold text-text-secondary text-xl">
                    {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-bold text-xl text-text-primary">{selectedEmployee.name}</h3>
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-surface-sunken text-[10px] font-semibold text-text-secondary uppercase tracking-wide border border-border">
                        {selectedEmployee.department}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">{selectedEmployee.role}</p>
                    <p className="text-xs text-text-muted mt-0.5">{selectedEmployee.email}</p>
                    <div className="flex gap-2 mt-2">
                      {selectedEmployee.github_username ? (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-success-tint text-success border border-success/20 px-2 py-0.5 rounded-sm font-medium">
                          <Github className="w-3 h-3" /> @{selectedEmployee.github_username}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenGitConnect('github')}
                          className="inline-flex items-center gap-1 text-[10px] bg-surface-card hover:bg-surface-sunken text-text-secondary border border-border px-2 py-0.5 rounded-sm font-medium transition-all"
                        >
                          <Github className="w-3 h-3" /> Connect GitHub
                        </button>
                      )}

                      {selectedEmployee.gitlab_username ? (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-success-tint text-success border border-success/20 px-2 py-0.5 rounded-sm font-medium">
                          <Gitlab className="w-3 h-3" /> @{selectedEmployee.gitlab_username}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenGitConnect('gitlab')}
                          className="inline-flex items-center gap-1 text-[10px] bg-surface-card hover:bg-surface-sunken text-text-secondary border border-border px-2 py-0.5 rounded-sm font-medium transition-all"
                        >
                          <Gitlab className="w-3 h-3" /> Connect GitLab
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 bg-surface-sunken border border-border p-3 rounded-md">
                  <div className="text-center">
                    <span className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Experience</span>
                    <span className="text-sm font-mono font-bold text-text-primary mt-0.5 block">{selectedEmployee.experienceYears} yrs</span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="text-center">
                    <span className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Performance</span>
                    <span className="text-sm font-mono font-bold text-text-primary mt-0.5 block">{selectedEmployee.performanceRating} / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Bio Profile summary */}
              <div className="mt-5 pt-5 border-t border-border flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="flex-1">
                  <h5 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2">AI Profile Insights</h5>
                  <p className="text-sm text-text-primary leading-relaxed">
                    {selectedEmployee.profileSummary}
                  </p>
                </div>
                <button
                  onClick={() => setShowSimulator(true)}
                  className="shrink-0 px-4 py-2 bg-ai-tint hover:bg-ai-tint/80 border border-ai-accent/20 text-ai-accent font-semibold text-xs rounded-md transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Career Simulator
                </button>
              </div>
            </GlassCard>

            {showSimulator && (
              <SuccessionSimulator
                employee={selectedEmployee}
                onClose={() => setShowSimulator(false)}
              />
            )}

            {/* Middle: Skills & Experience Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Technical skills */}
              <GlassCard>
                <h4 className="font-semibold text-sm text-text-primary mb-4 flex items-center space-x-2">
                  <Briefcase className="w-4 h-4 text-brand" />
                  <span>Technical Expertise Mapping</span>
                </h4>
                <div className="space-y-3.5">
                  {selectedEmployee.technicalSkills.map((skill, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-text-primary flex items-center gap-1.5">
                          {skill.name}
                          {skill.source === 'github_verified' && (
                            <span className="inline-flex items-center text-[9px] bg-success-tint text-success px-1.5 py-0.5 rounded border border-success/20" title="GitHub Verified Skill">
                              <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                            </span>
                          )}
                        </span>
                        <span className="font-mono font-bold text-text-secondary">{skill.proficiency} / 5</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-sunken rounded-full overflow-hidden border border-border">
                        <div
                          className="h-full bg-brand rounded-full"
                          style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Soft Skills & Certs */}
              <div className="space-y-6">
                {/* Soft Skills */}
                <GlassCard>
                  <h4 className="font-semibold text-sm text-text-primary mb-3.5 flex items-center space-x-2">
                    <Compass className="w-4 h-4 text-brand" />
                    <span>Behavioral Competencies</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.softSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="text-[11px] font-medium px-2.5 py-1 bg-surface-sunken border border-border text-text-secondary rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </GlassCard>

                {/* Certifications & Projects */}
                <GlassCard>
                  <h4 className="font-semibold text-sm text-text-primary mb-3 flex items-center space-x-2">
                    <Award className="w-4 h-4 text-brand" />
                    <span>Certifications & active workloads</span>
                  </h4>
                  <div className="space-y-4">
                    {selectedEmployee.certifications.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Accreditations</span>
                        <div className="flex flex-wrap gap-2">
                          {selectedEmployee.certifications.map((cert, index) => (
                            <span
                              key={index}
                              className="text-[11px] font-medium px-2 py-1 bg-success-tint border border-success/20 text-success rounded-sm"
                            >
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide">Assigned Workstreams</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.currentProjects.length > 0 ? (
                          selectedEmployee.currentProjects.map((proj, index) => (
                            <span
                              key={index}
                              className="text-[11px] font-medium px-2 py-1 bg-surface-sunken text-text-secondary border border-border rounded-sm"
                            >
                              {proj}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-text-muted">Unassigned (Available)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>

            {/* Row 3: AI Career Roadmap (Learning recommendations) */}
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm text-text-primary flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-ai-accent" />
                  <span>AI Upskilling Recommendation & Roadmap</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-ai-tint text-ai-accent text-[9px] font-bold uppercase tracking-wider border border-ai-accent/20 flex items-center gap-1 ml-2">
                    <Sparkles className="w-3 h-3" /> AI Suggested
                  </span>
                </h4>
                <button
                  onClick={handleRegenRecs}
                  disabled={isUpdatingRecs}
                  className="text-xs font-semibold text-text-secondary hover:text-ai-accent flex items-center space-x-1 py-1 px-2 border border-border rounded-md hover:bg-surface-sunken transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isUpdatingRecs ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              {selectedEmployee.learningRecommendations && selectedEmployee.learningRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEmployee.learningRecommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="p-4 bg-surface-card border border-border rounded-md space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h5 className="text-sm font-semibold text-text-primary leading-snug">{rec.courseName}</h5>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded shrink-0 ml-2 bg-surface-sunken text-text-secondary border border-border">
                            {rec.type}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">{rec.description}</p>
                      </div>

                      <div className="pt-3 border-t border-border space-y-3">
                        <div className="flex items-center text-xs text-text-secondary">
                          <Calendar className="w-4 h-4 mr-1.5 text-text-muted" />
                          <span>Timeline: <strong className="font-medium text-text-primary">{rec.timeline}</strong></span>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Roadmap Path</span>
                          <ul className="space-y-1.5 text-xs text-text-secondary">
                            {rec.roadmap.map((step, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <ChevronRight className="w-4 h-4 text-brand shrink-0" />
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
                <div className="text-center py-6 text-sm text-text-muted">
                  Click regenerate to run AI and draft a custom career training roadmap.
                </div>
              )}
            </GlassCard>

            {/* Row 4: AI Promotion Readiness Evaluation */}
            <GlassCard className="border-t-4 border-t-ai-accent">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm text-text-primary flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-ai-accent" />
                  <span>AI Promotion Readiness Index</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-ai-tint text-ai-accent text-[9px] font-bold uppercase tracking-wider border border-ai-accent/20 flex items-center gap-1 ml-2">
                    <Sparkles className="w-3 h-3" /> AI Suggested
                  </span>
                </h4>
                <button
                  onClick={handleRegenPromotion}
                  disabled={isUpdatingPromotion}
                  className="text-xs font-semibold text-text-secondary hover:text-ai-accent flex items-center space-x-1 py-1 px-2 border border-border hover:bg-surface-sunken rounded-md transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isUpdatingPromotion ? 'animate-spin' : ''}`} />
                  <span>Regenerate</span>
                </button>
              </div>

              {selectedEmployee.promotionEvaluation ? (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Gauge */}
                  <div className="md:w-1/3 flex flex-col items-center justify-center p-6 bg-surface-sunken border border-border rounded-md relative overflow-hidden">
                    <span className="text-[11px] font-semibold uppercase text-text-secondary tracking-wider mb-4">Readiness Score</span>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* Circle track */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          stroke="var(--border)"
                          strokeWidth="10"
                          fill="transparent"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="54"
                          stroke="var(--ai-accent)"
                          strokeWidth="10"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 54}
                          strokeDashoffset={2 * Math.PI * 54 * (1 - selectedEmployee.promotionEvaluation.promotionScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-mono font-bold text-text-primary">{selectedEmployee.promotionEvaluation.promotionScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Text & Improvement recommendations */}
                  <div className="md:w-2/3 space-y-5">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Analysis & Reasoning</span>
                      <p className="text-sm text-text-primary leading-relaxed">
                        {selectedEmployee.promotionEvaluation.reasoning}
                      </p>
                    </div>

                    {selectedEmployee.promotionEvaluation.areasToImprove.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide">Identified Growth Areas</span>
                        <ul className="space-y-1.5 text-sm text-text-primary">
                          {selectedEmployee.promotionEvaluation.areasToImprove.map((area, idx) => (
                            <li key={idx} className="flex items-start space-x-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-2" />
                              <span>{area}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-text-muted">
                  Click regenerate to trigger AI promotion readiness metrics.
                </div>
              )}
            </GlassCard>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-surface-card border border-border rounded-md shadow-card">
            <span className="text-text-muted text-sm font-medium">Select an employee to open their profile.</span>
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
