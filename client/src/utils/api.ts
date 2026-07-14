export interface Skill {
  name: string;
  proficiency: number;
  source?: 'self_reported' | 'github_verified' | 'admin_assigned';
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  experienceYears: number;
  performanceRating: number;
  technicalSkills: Skill[];
  softSkills: string[];
  certifications: string[];
  resumeText?: string;
  currentProjects: string[];
  profileSummary: string;
  learningRecommendations?: LearningRecommendation[];
  promotionEvaluation?: PromotionEvaluation;
  
  // Graph Extensions
  managerId?: string;
  mentorId?: string;
  clients?: string[];
  pastExperience?: string[];
  learningHistory?: string[];
  
  // Git Extensions
  github_username?: string;
  gitlab_username?: string;
  
  // Financial & Cost Intelligence
  billing_rate?: number;
  cost_rate?: number;
  allocationPercentage?: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  teamSize: number;
  durationMonths: number;
  budget?: number;
  priority?: 'High' | 'Medium' | 'Low';
  projectCode?: string;
  client?: string;
  industry?: string;
  businessUnit?: string;
  projectManager?: string;
  technicalLead?: string;
  deliveryLead?: string;
  startDate?: string;
  endDate?: string;
  status?: 'Planning' | 'Active' | 'Completed' | 'Delayed' | 'On Hold' | 'Archived';
  healthScore?: number;
  healthLevel?: 'Excellent' | 'Healthy' | 'Warning' | 'High Risk' | 'Critical';
  healthExplanation?: string;
  deliveryConfidence?: number;
  onTimeProbability?: number;
  budgetOverrunProbability?: number;
  estimatedCompletionDate?: string;
  healthTrendWeek?: number;
  healthTrendMonth?: number;
  tags?: string[];
}

export interface LearningRecommendation {
  courseName: string;
  type: 'course' | 'certification' | 'project';
  roadmap: string[];
  timeline: string;
  description: string;
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface MarketSkill {
  id: string;
  name: string;
  momentumScore: number;
  internalCoverage: number;
  emergingGap: boolean;
  lastUpdated: string;
}

export interface PromotionEvaluation {
  status: 'Ready' | 'Developing' | 'Not Ready';
  readinessScore: number;
  promotionScore: number;
  nextLevel: string;
  keyGaps: string[];
  justification: string;
  reasoning: string;
  areasToImprove: string[];
}

// --- Reports Interfaces ---
export type ReportType =
  | 'headcount_summary'
  | 'attrition_report'
  | 'skill_inventory'
  | 'bench_utilization'
  | 'hiring_funnel'
  | 'drive_performance'
  | 'source_effectiveness'
  | 'portfolio_health'
  | 'staffing_allocation'
  | 'risk_spof'
  | 'org_capability'
  | 'cost_summary'
  | 'board_snapshot';

export interface ScheduledReport {
  id: string;
  name: string;
  type: ReportType;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  nextRun: string;
  format: 'pdf' | 'csv' | 'excel';
  status: 'active' | 'paused';
}

export interface GeneratedReport {
  id: string;
  name: string;
  type: ReportType;
  filters: any;
  format: 'pdf' | 'csv' | 'excel' | 'on-screen';
  fileUrl?: string;
  generatedBy: string;
  createdAt: string;
}
// --- Onboarding Interfaces ---
export interface OnboardingTask {
  id: string;
  name: string;
  phase: 'Before Day 1' | 'Week 1' | 'Weeks 2-4' | 'Days 30/60/90';
  ownerId: string;
  dueDate: string;
  status: 'Upcoming' | 'Due today' | 'Overdue' | 'Done';
}

export interface OnboardingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  startDate: string;
  progress: number;
  status: 'On Track' | 'At Risk' | 'Completed';
  tasks: OnboardingTask[];
  buddyId?: string;
}
// --- Marketplace Interfaces ---
export interface Opportunity {
  id: string;
  title: string;
  projectId?: string;
  projectName?: string;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  timeCommitment: string;
  priorityTag: 'Low priority' | 'Stretch opportunity' | 'Short-term' | 'Backfill needed';
  departmentScope: string;
  deadline?: string;
  status: 'Open' | 'Closing Soon' | 'Closed' | 'Filled' | 'Archived';
  postedBy: string;
  createdAt: string;
  applicantCount: number;
  matchScore?: number; // Only for current user
  matchReason?: string; // AI generated one-liner
  hasApplied?: boolean;
}

export interface OpportunityApplication {
  id: string;
  opportunityId: string;
  employeeId: string;
  employeeName: string;
  role: string;
  department: string;
  note: string;
  status: 'Submitted' | 'Under Review' | 'Shortlisted' | 'Accepted' | 'Not Selected' | 'Withdrawn';
  appliedAt: string;
  matchScore: number;
  currentAllocation: number; // pulled from staffing engine
}

// --- Import Interfaces ---
export interface ImportLog {
  id: string;
  dataType: string;
  fileName: string;
  uploadedBy: string;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  failedCount: number;
  status: 'processing' | 'completed' | 'completed_with_errors' | 'failed';
  createdAt: string;
  completedAt?: string;
}

export interface ParseResult {
  headers: string[];
  rowCount: number;
  previewData: any[]; // First N rows
}

export interface ValidationResult {
  validCount: number;
  warningCount: number;
  errorCount: number;
  duplicateCount: number;
  errors: { row: number; reason: string }[];
}

// --- Skill Connect & Mentorship Interfaces ---
export interface ConnectionRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  type: 'quick_connect' | 'mentorship';
  skillId: string;
  message: string;
  urgencyTag?: 'No rush' | 'This week' | 'Blocking me now';
  goal?: string;
  cadence?: 'One-off session' | 'Few sessions' | 'Ongoing';
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'ongoing';
  createdAt: string;
  respondedAt?: string;
  
  // Flattened properties for mock
  requesterName?: string;
  requesterRole?: string;
  recipientName?: string;
  recipientRole?: string;
}

export interface MentorshipRelationship {
  id: string;
  connectionRequestId: string;
  requesterId: string;
  mentorId: string;
  skillId: string;
  status: 'ongoing' | 'completed' | 'paused';
  createdAt: string;
  completedAt?: string;
}

export interface MentorshipNote {
  id: string;
  mentorshipRelationshipId: string;
  authorId: string;
  authorName: string;
  noteText: string;
  createdAt: string;
}

export interface MentorshipRating {
  id: string;
  mentorshipRelationshipId: string;
  ratedById: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface AvailabilityPreference {
  employeeId: string;
  openToQuickQuestions: boolean;
  openToMentorship: boolean;
  skillsWillingToHelp: string[];
  capacityNote: string;
  updatedAt: string;
}

// -----------------------

export interface DashboardStats {
  capabilityScore: number;
  totalEmployees: number;
  avgExperience: number;
  avgPerformance: number;
  skillDistribution: { name: string; avgProficiency: number; count: number }[];
  departmentExpertise: {
    department: string;
    headcount: number;
    avgExperience: number;
    avgPerformance: number;
    avgSkillProficiency: number;
  }[];
  techAdoption: { name: string; value: number }[];
  topExperts: {
    id: string;
    name: string;
    role: string;
    department: string;
    expertSkill: string;
    proficiency: number;
    rating: number;
  }[];
  predictiveAnalytics?: {
    skillDecayRisk: number;
    benchUtilizationForecast: number;
    attritionRisk: number;
    projectSuccessProbability: number;
    hiringPipelineHealth: string;
  };
  portfolioHealth?: number;
  projectStats?: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
    onHoldProjects: number;
    totalBudget: number;
    budgetUsed: number;
    averageDeliveryHealth: number;
    averageTeamUtilization: number;
    highRiskProjects: { id: string; name: string; healthScore: number; healthLevel: string }[];
  };
  healthDistribution?: {
    excellent: number;
    healthy: number;
    warning: number;
    highRisk: number;
    critical: number;
  };
  upcomingMilestones?: {
    id: string;
    projectId: string;
    projectName: string;
    name: string;
    dueDate: string;
    ownerId: string;
    ownerName: string;
    status: string;
  }[];
}

export interface StaffingRecommendation {
  projectName: string;
  requiredSkills: string[];
  teamSize: number;
  durationMonths: number;
  recommendedTeam: {
    employee: Employee;
    matchPercentage: number;
    matchingSkills: string[];
    roleInProject: string;
  }[];
  overallMatchScore: number;
  skillOverlap: { skill: string; employeesCovering: string[] }[];
  missingSkills: string[];
  backupCandidates: {
    employee: Employee;
    matchPercentage: number;
    matchingSkills: string[];
  }[];
}

export interface SkillGapReport {
  currentSkills: { name: string; avgProficiency: number; count: number }[];
  targetSkills: { name: string; requiredProficiency: number }[];
  gaps: {
    skillName: string;
    status: 'critical' | 'moderate' | 'healthy';
    currentAvg: number;
    target: number;
    difference: number;
  }[];
  weaknesses: string[];
  hiringRecommendations: string[];
  upskillingSuggestions: {
    skill: string;
    suggestedCourse: string;
    candidates: string[];
  }[];
}

export interface CapabilityRisk {
  skill: string;
  employee: Employee;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  capabilityImpact: number;
  recommendedAction: string;
  alternativeCandidates: string[];
  flightRiskScore: number;
  isGitVerified?: boolean;
}

export interface SimulationResult {
  action: 'promotion' | 'departure' | 'transfer';
  targetEmployeeId: string;
  beforeStats: { capabilityScore: number; headcount: number; };
  afterStats: { capabilityScore: number; headcount: number; };
  impactedProjects: string[];
  recommendedSuccessors: {
    employee: Employee;
    matchScore: number;
    readiness: 'Ready Now' | 'Ready 1-2 Yrs' | 'Needs Upskilling';
  }[];
  deltaCapability: number;
  missingSkills: string[];
  financialImpact?: string;
}

export interface ResolutionOption {
  optionType: 'Split Allocation' | 'Alternative Employee' | 'Upskill Replacement' | 'Delay Project';
  description: string;
  businessImpact: 'High' | 'Medium' | 'Low';
  deliveryRisk: 'High' | 'Medium' | 'Low';
  skillMatchScore: number;
  cost: 'High' | 'Medium' | 'Low';
  rank: number;
  suggestedEmployee?: { id: string; name: string };
}

export interface StaffingConflict {
  employee: Employee;
  allocationPercentage: number;
  conflictingProjects: {
    project: Project;
    priorityScore: number;
  }[];
  resolutionOptions: ResolutionOption[];
}

export interface HiringDrive {
  id: string;
  hiringName: string;
  description: string;
  company: string;
  department: string;
  role: string;
  source: string;
  employmentType: string;
  location: string;
  salary: string;
  experience: string;
  hiringDeadline: string;
  maximumCandidates: number;
  requiredSkills: string[];
  preferredSkills: string[];
  minimumCgpa: number;
  degree: string;
  branches: string[];
  graduationYear: string;
  preferredColleges: string[];
  requiredCertifications: string[];
  projectKeywords: string[];
  portfolioRequired: boolean;
  githubRequired: boolean;
  languages: string[];
  interviewRounds: string[];
  priority: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Open' | 'Paused' | 'Closed';
  createdAt: string;
}

export interface RecruitmentCandidate {
  id: string;
  driveId: string;
  fileName: string;
  status: string;
  parsedProfile: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    portfolio: string;
    education: { college: string; university: string; degree: string; cgpa: number | null; graduationYear: string };
    skills: { programmingLanguages: string[]; frameworks: string[]; tools: string[]; databases: string[]; cloud: string[]; all: string[] };
    certifications: string[];
    experience: string[];
    projects: string[];
    achievements: string[];
    internships: string[];
    publications: string[];
    languages: string[];
    profileSummary: string;
    rawText: string;
  };
  aiScore: {
    skillMatch: number;
    cgpaMatch: number;
    projectMatch: number;
    experienceMatch: number;
    educationMatch: number;
    keywordMatch: number;
    certificationMatch: number;
    communicationScore: number;
    overallMatchScore: number;
    classification: string;
    reasons: string[];
    matchingSkills: string[];
    missingSkills: string[];
    recommendedInterviewQuestions: string[];
    strengths: string[];
    weaknesses: string[];
    improvementAreas: string[];
    careerPotential: string;
    hiringRecommendation: string;
    overallRating: number;
  };
  interviewNotes: string[];
  appliedAt: string;
}

export interface RecruitmentDashboard {
  activeHiringDrives: number;
  candidatesApplied: number;
  shortlisted: number;
  rejected: number;
  interviewScheduled: number;
  offerSent: number;
  offerAccepted: number;
  averageMatchScore: number;
  topColleges: { name: string; count: number }[];
  skillDistribution: { name: string; count: number }[];
  hiringFunnel: { status: string; count: number }[];
}

export interface AuditLog {
  id: string;
  actor_user_id: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id?: string;
  metadata?: any;
  created_at: string;
}

export const API_BASE = '/api';

import { mockEmployees, mockProjects, mockDashboardStats, mockGapAnalysis } from './mockData';

export const api = {
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed');
    }
    return res.json();
  },

  async getEmployees(): Promise<Employee[]> {
    try {
      const res = await fetch(`${API_BASE}/employees`);
      if (!res.ok) throw new Error('Failed to fetch employees');
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using mock employees');
      return mockEmployees;
    }
  },

  async getProjects(): Promise<Project[]> {
    try {
      const res = await fetch(`${API_BASE}/projects`);
      if (!res.ok) throw new Error('Failed to fetch projects');
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using mock projects');
      return mockProjects;
    }
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${id}`);
    if (!res.ok) throw new Error('Failed to fetch employee details');
    return res.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using mock dashboard stats');
      return mockDashboardStats;
    }
  },

  async getGapAnalysis(): Promise<SkillGapReport> {
    try {
      const res = await fetch(`${API_BASE}/gap-analysis`);
      if (!res.ok) throw new Error('Failed to fetch gap analysis');
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using mock gap analysis');
      return mockGapAnalysis;
    }
  },

  async getCapabilityRisks(): Promise<CapabilityRisk[]> {
    const res = await fetch(`${API_BASE}/analytics/capability-risks`);
    if (!res.ok) throw new Error('Failed to fetch capability risks');
    return res.json();
  },

  async getMarketRadarData(): Promise<MarketSkill[]> {
    const res = await fetch(`${API_BASE}/market-radar`);
    if (!res.ok) throw new Error('Failed to fetch market radar data');
    return res.json();
  },

  async syncMarketRadarData(): Promise<MarketSkill[]> {
    const res = await fetch(`${API_BASE}/market-radar/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to sync market radar data');
    return res.json();
  },

  async runSimulation(params: {
    action: 'promotion' | 'departure' | 'transfer';
    targetEmployeeId: string;
    newRole?: string;
    newDepartment?: string;
  }): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE}/simulation/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to run simulation');
    return res.json();
  },

  async uploadResume(file: File): Promise<Employee> {

    const formData = new FormData();
    formData.append('resume', file);

    const res = await fetch(`${API_BASE}/employees/upload-resume`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to process resume');
    }
    return res.json();
  },

  async uploadResumes(files: File[]): Promise<{ employees: Employee[]; failures: { fileName: string; error: string }[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('resumes', file));
    const res = await fetch(`${API_BASE}/employees/upload-resumes`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to process resumes');
    }
    return res.json();
  },

  async getRecruitmentDashboard(): Promise<RecruitmentDashboard> {
    const res = await fetch(`${API_BASE}/recruitment/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch recruitment dashboard');
    return res.json();
  },

  async getHiringDrives(): Promise<HiringDrive[]> {
    const res = await fetch(`${API_BASE}/recruitment/drives`);
    if (!res.ok) throw new Error('Failed to fetch hiring drives');
    return res.json();
  },

  async createHiringDrive(drive: Partial<HiringDrive>): Promise<HiringDrive> {
    const res = await fetch(`${API_BASE}/recruitment/drives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(drive),
    });
    if (!res.ok) throw new Error('Failed to create hiring drive');
    return res.json();
  },

  async getRecruitmentCandidates(driveId?: string): Promise<RecruitmentCandidate[]> {
    const url = driveId ? `${API_BASE}/recruitment/candidates?driveId=${encodeURIComponent(driveId)}` : `${API_BASE}/recruitment/candidates`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch recruitment candidates');
    return res.json();
  },

  async uploadRecruitmentResumes(driveId: string, files: File[]): Promise<{ candidates: RecruitmentCandidate[]; failures: { fileName: string; error: string }[] }> {
    const formData = new FormData();
    formData.append('driveId', driveId);
    files.forEach(file => formData.append('resumes', file));
    const res = await fetch(`${API_BASE}/recruitment/upload-resumes`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to import recruitment resumes');
    }
    return res.json();
  },

  async searchRecruitmentCandidates(query: string, driveId?: string): Promise<RecruitmentCandidate[]> {
    const res = await fetch(`${API_BASE}/recruitment/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, driveId }),
    });
    if (!res.ok) throw new Error('Failed to search candidates');
    return res.json();
  },

  async updateCandidateStatus(id: string, status: string, note?: string): Promise<RecruitmentCandidate> {
    const res = await fetch(`${API_BASE}/recruitment/candidates/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note }),
    });
    if (!res.ok) throw new Error('Failed to update candidate status');
    return res.json();
  },

  async getStaffingRecommendations(params: {
    projectName: string;
    requiredSkills: string[];
    teamSize: number;
    durationMonths: number;
  }): Promise<StaffingRecommendation> {
    const res = await fetch(`${API_BASE}/staffing/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to fetch staffing recommendations');
    return res.json();
  },

  async optimizeStaffing(params: {
    projectId: string;
    weights?: {
      skillMatchWeight: number;
      deliveryRiskWeight: number;
      costWeight: number;
      benchImpactWeight: number;
      knowledgeDistWeight: number;
    }
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/staffing/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to run staffing optimization');
    return res.json();
  },

  async getStaffingConflicts(): Promise<StaffingConflict[]> {
    const res = await fetch(`${API_BASE}/staffing/conflicts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch staffing conflicts');
    return res.json();
  },

  async getPredictiveReport(): Promise<any> {
    const res = await fetch(`${API_BASE}/predictive/workforce`);
    if (!res.ok) throw new Error('Failed to fetch predictive reports');
    return res.json();
  },

  async searchKnowledgeGraph(query: string): Promise<{ nodes: any[]; edges: any[] }> {
    const res = await fetch(`${API_BASE}/search/knowledge-graph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error('Failed to query knowledge graph');
    return res.json();
  },

  async semanticSearch(query: string): Promise<{ id: string; name: string; role: string; department: string; similarity: number }[]> {
    const res = await fetch(`${API_BASE}/search/semantic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Failed to perform semantic search');
    return res.json();
  },

  async askChatBot(message: string): Promise<string> {

    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Chat assistant failed to respond');
    const data = await res.json();
    return data.response;
  },

  async regenerateRecommendations(employeeId: string): Promise<LearningRecommendation[]> {
    const res = await fetch(`${API_BASE}/employees/${employeeId}/recommendations`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate recommendations');
    return res.json();
  },

  async regeneratePromotion(employeeId: string): Promise<PromotionEvaluation> {
    const res = await fetch(`${API_BASE}/employees/${employeeId}/promotion`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to regenerate promotion evaluation');
    return res.json();
  },

  async resetDatabase(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
    return res.json();
  },

  // --- Project Management API Wrappers ---
  async getProjectDetails(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project details');
    return res.json();
  },

  async createProject(proj: any): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proj),
    });
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
  },

  async updateProject(id: string, proj: any): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(proj),
    });
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
  },

  async deleteProject(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete project');
    return res.json();
  },

  async addProjectMember(projectId: string, member: any): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member),
    });
    if (!res.ok) throw new Error('Failed to add project member');
    return res.json();
  },

  async deleteProjectMember(projectId: string, memberId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove project member');
    return res.json();
  },

  async addProjectTask(projectId: string, task: any): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to add project task');
    return res.json();
  },

  async deleteProjectTask(projectId: string, taskId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove project task');
    return res.json();
  },

  async addProjectMilestone(projectId: string, milestone: any): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/milestones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(milestone),
    });
    if (!res.ok) throw new Error('Failed to add project milestone');
    return res.json();
  },

  async deleteProjectMilestone(projectId: string, milestoneId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove project milestone');
    return res.json();
  },

  async addProjectDocument(projectId: string, doc: any): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    if (!res.ok) throw new Error('Failed to add project document');
    return res.json();
  },

  async deleteProjectDocument(projectId: string, docId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/documents/${docId}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to remove project document');
    return res.json();
  },

  async addProjectActivity(projectId: string, activity: any): Promise<any> {
    const res = await fetch(`${API_BASE}/projects/${projectId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
    if (!res.ok) throw new Error('Failed to register project activity');
    return res.json();
  },

  // --- Audit Logs ---
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    actor?: string;
    action?: string;
    target?: string;
  }): Promise<{ total: number; page: number; limit: number; logs: AuditLog[] }> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.actor) query.append('actor', params.actor);
    if (params?.action) query.append('action', params.action);
    if (params?.target) query.append('target', params.target);

    const res = await fetch(`${API_BASE}/audit-logs?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // --- Export and Scheduled Reports ---
  async exportReport(reportType: string, filters: any, format: 'csv' | 'pdf'): Promise<void> {
    const res = await fetch(`${API_BASE}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ reportType, filters, format })
    });
    if (!res.ok) throw new Error('Failed to export report');
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_export_${Date.now()}.${format === 'csv' ? 'csv' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  async getScheduledReports(): Promise<ScheduledReport[]> {
    const res = await fetch(`${API_BASE}/scheduled-reports`);
    if (!res.ok) throw new Error('Failed to fetch scheduled reports');
    return res.json();
  },

  async createScheduledReport(report: Partial<ScheduledReport>): Promise<ScheduledReport> {
    const res = await fetch(`${API_BASE}/scheduled-reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(report)
    });
    if (!res.ok) throw new Error('Failed to create scheduled report');
    return res.json();
  },

  async deleteScheduledReport(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/scheduled-reports/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete scheduled report');
    const data = await res.json();
    return data.success;
  },

  async connectGit(employeeId: string, platform: 'github' | 'gitlab', username: string): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${employeeId}/connect-git`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ platform, username })
    });
    if (!res.ok) throw new Error(`Failed to connect ${platform}`);
    return res.json();
  },

  async getOrgRepos(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/git-org/repos`);
    if (!res.ok) throw new Error('Failed to fetch org repositories');
    return res.json();
  },

  async analyzeOrgRepo(repoName: string, primarySkill: string, repoPath?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/git-org/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ repoName, primarySkill, repoPath })
    });
    if (!res.ok) throw new Error('Failed to analyze repository');
    return res.json();
  },

  // ── Knowledge Graph APIs ──────────────────────────────────────

  async getGraphSPOFs(threshold?: number): Promise<{ spofs: any[]; isLive: boolean }> {
    const params = threshold ? `?threshold=${threshold}` : '';
    const res = await fetch(`${API_BASE}/graph/spof${params}`);
    if (!res.ok) throw new Error('Failed to fetch SPOF graph data');
    return res.json();
  },

  async getTalentNetworkGraph(filters?: { department?: string; minProficiency?: number }): Promise<{ nodes: any[]; edges: any[]; isLive: boolean }> {
    const params = new URLSearchParams();
    if (filters?.department) params.set('department', filters.department);
    if (filters?.minProficiency) params.set('minProficiency', String(filters.minProficiency));
    const query = params.toString() ? `?${params}` : '';
    const res = await fetch(`${API_BASE}/graph/talent-network${query}`);
    if (!res.ok) throw new Error('Failed to fetch talent network graph');
    return res.json();
  },

  async getPathToCoverage(skillName: string): Promise<{ paths: any[]; isLive: boolean }> {
    const res = await fetch(`${API_BASE}/graph/path-to-coverage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillName })
    });
    if (!res.ok) throw new Error('Failed to get path to coverage');
    return res.json();
  },

  async triggerGraphSync(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/graph/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger graph sync');
    return res.json();
  },


  async getGeneratedReports(): Promise<GeneratedReport[]> {
    return [
      {
        id: '101',
        name: 'Q2 Portfolio Health',
        type: 'portfolio_health',
        filters: { dateRange: 'Last Quarter' },
        format: 'pdf',
        fileUrl: '#',
        generatedBy: 'Admin User',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: '102',
        name: 'Current Bench Cost',
        type: 'bench_utilization',
        filters: { dateRange: 'YTD' },
        format: 'csv',
        fileUrl: '#',
        generatedBy: 'Admin User',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
      }
    ];
  },

  async generateReportSummary(type: ReportType, data: any): Promise<{ summary: string }> {
    // Mocking an AI-generated executive summary
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: `This report shows a steady trend over the selected period. Engineering headcount grew while attrition remained below the 5% threshold. Key areas of focus should be resolving the 3 critical single-points-of-failure in the Cloud Infrastructure team.`
        });
      }, 1000);
    });
  },

  async askReportQuestion(type: ReportType, question: string, data: any): Promise<{ answer: string }> {
    // Mocking AI response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          answer: `Based on the underlying data, the primary cause for the spike was a 15% increase in unallocated senior staff during March, coupled with two high-budget projects stalling.`
        });
      }, 1500);
    });
  },

  // ── Onboarding APIs (Mock) ──────────────────────────────────────

  async getOnboardingRecords(): Promise<OnboardingRecord[]> {
    return [
      {
        id: 'o-1',
        employeeId: 'e-101',
        employeeName: 'Sarah Chen',
        role: 'Machine Learning Engineer',
        department: 'Engineering',
        startDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        progress: 45,
        status: 'On Track',
        buddyId: 'e-102',
        tasks: [
          { id: 't-1', name: 'Provision GitHub Access', phase: 'Before Day 1', ownerId: 'sys-admin', dueDate: new Date(Date.now() - 7 * 86400000).toISOString(), status: 'Done' },
          { id: 't-2', name: 'Schedule team intro', phase: 'Week 1', ownerId: 'mgr-1', dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'Upcoming' },
          { id: 't-3', name: 'Submit code to onboarding repo', phase: 'Weeks 2-4', ownerId: 'e-101', dueDate: new Date(Date.now() + 15 * 86400000).toISOString(), status: 'Upcoming' },
        ]
      },
      {
        id: 'o-2',
        employeeId: 'e-105',
        employeeName: 'James Wilson',
        role: 'Account Executive',
        department: 'Sales',
        startDate: new Date(Date.now() - 35 * 86400000).toISOString(),
        progress: 80,
        status: 'At Risk',
        tasks: [
          { id: 't-4', name: 'Complete CRM Training', phase: 'Weeks 2-4', ownerId: 'e-105', dueDate: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'Overdue' },
          { id: 't-5', name: 'First solo pitch presentation', phase: 'Days 30/60/90', ownerId: 'e-105', dueDate: new Date(Date.now() + 25 * 86400000).toISOString(), status: 'Upcoming' },
        ]
      }
    ];
  },

  async updateOnboardingTask(recordId: string, taskId: string, status: string): Promise<void> {
    // Mock save
    console.log(`Updated task ${taskId} to ${status}`);
  },

  // ── Marketplace APIs (Mock) ──────────────────────────────────────

  async getOpportunities(): Promise<Opportunity[]> {
    return [
      {
        id: 'opp-1',
        title: 'Backend support — Client Portal Revamp',
        projectId: 'p-1',
        projectName: 'Client Portal Revamp',
        description: 'Need extra hands to help build out the new GraphQL API layer for the client portal. Good opportunity to learn our new stack.',
        requiredSkills: ['Node.js', 'GraphQL'],
        niceToHaveSkills: ['PostgreSQL', 'Redis'],
        timeCommitment: '20% for 6 weeks',
        priorityTag: 'Stretch opportunity',
        departmentScope: 'All',
        deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
        status: 'Open',
        postedBy: 'mgr-1',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        applicantCount: 3,
        matchScore: 92,
        matchReason: 'Your advanced GraphQL and Node.js skills closely match this opportunity\'s core requirements.',
        hasApplied: false
      },
      {
        id: 'opp-2',
        title: 'Data Migration Audit',
        projectId: 'p-2',
        projectName: 'Legacy Migration',
        description: 'Short-term help needed to audit the first pass of the legacy data migration. Attention to detail required.',
        requiredSkills: ['SQL', 'Data Validation'],
        niceToHaveSkills: ['Python'],
        timeCommitment: '10 hours total',
        priorityTag: 'Short-term',
        departmentScope: 'Engineering',
        status: 'Closing Soon',
        postedBy: 'mgr-2',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        applicantCount: 1,
        matchScore: 65,
        matchReason: 'You have the required SQL skills, though Python would be a bonus.',
        hasApplied: true
      },
      {
        id: 'opp-3',
        title: 'UI Component Library Maintenance',
        description: 'Looking for someone to own the ongoing maintenance of our shared React component library. Low intensity but requires consistency.',
        requiredSkills: ['React', 'TypeScript', 'CSS'],
        niceToHaveSkills: ['Storybook', 'Figma'],
        timeCommitment: 'Part-time 15%',
        priorityTag: 'Low priority',
        departmentScope: 'Design & Engineering',
        deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
        status: 'Open',
        postedBy: 'mgr-3',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        applicantCount: 0,
        matchScore: 88,
        matchReason: 'Your frontend stack aligns perfectly with this maintenance role.',
        hasApplied: false
      }
    ];
  },

  async applyToOpportunity(oppId: string, note: string): Promise<void> {
    console.log(`Applied to ${oppId} with note: ${note}`);
  },

  async withdrawApplication(appId: string): Promise<void> {
    console.log(`Withdrew app ${appId}`);
  },

  async getMyApplications(): Promise<OpportunityApplication[]> {
    return [
      {
        id: 'app-1',
        opportunityId: 'opp-2',
        employeeId: 'e-101',
        employeeName: 'Current User',
        role: 'Developer',
        department: 'Engineering',
        note: 'I helped write the original export script for the legacy DB.',
        status: 'Under Review',
        appliedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        matchScore: 65,
        currentAllocation: 85
      }
    ];
  },

  async getApplicantsForOpportunity(oppId: string): Promise<OpportunityApplication[]> {
    return [
      {
        id: 'app-2',
        opportunityId: oppId,
        employeeId: 'e-104',
        employeeName: 'Aisha Rahman',
        role: 'Backend Engineer',
        department: 'Engineering',
        note: 'Looking to get more GraphQL experience.',
        status: 'Submitted',
        appliedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        matchScore: 94,
        currentAllocation: 100 // High allocation warning trigger
      },
      {
        id: 'app-3',
        opportunityId: oppId,
        employeeId: 'e-105',
        employeeName: 'James Wilson',
        role: 'Full Stack Dev',
        department: 'Engineering',
        note: 'I worked on the old API, familiar with the domain.',
        status: 'Under Review',
        appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        matchScore: 78,
        currentAllocation: 60
      }
    ];
  },

  async updateApplicationStatus(appId: string, status: string): Promise<void> {
    console.log(`Updated app ${appId} to ${status}`);
  },

  async postOpportunity(data: Partial<Opportunity>): Promise<void> {
    console.log('Posted new opportunity:', data);
  },

  // ── Import APIs (Mock) ──────────────────────────────────────

  async getImportLogs(): Promise<ImportLog[]> {
    return [
      {
        id: 'imp-1',
        dataType: 'Employees',
        fileName: 'hris_export_q3.csv',
        uploadedBy: 'Admin User',
        totalRows: 145,
        importedCount: 142,
        skippedCount: 1,
        failedCount: 2,
        status: 'completed_with_errors',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 86400000 + 120000).toISOString()
      },
      {
        id: 'imp-2',
        dataType: 'Projects',
        fileName: 'active_projects_2026.xlsx',
        uploadedBy: 'Admin User',
        totalRows: 34,
        importedCount: 34,
        skippedCount: 0,
        failedCount: 0,
        status: 'completed',
        createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
        completedAt: new Date(Date.now() - 12 * 86400000 + 45000).toISOString()
      }
    ];
  },

  async parseImportFile(file: File, dataType: string): Promise<ParseResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          headers: ['Emp Name', 'Email Address', 'Dept', 'Job Title', 'Start Date', 'Location', 'Internal ID'],
          rowCount: 45,
          previewData: [
            { 'Emp Name': 'John Doe', 'Email Address': 'john@example.com', 'Dept': 'Engineering', 'Job Title': 'Frontend Dev', 'Start Date': '2023-01-15', 'Location': 'New York', 'Internal ID': '101' },
            { 'Emp Name': 'Jane Smith', 'Email Address': 'jane@example.com', 'Dept': 'Sales', 'Job Title': 'Account Exec', 'Start Date': '2022-11-01', 'Location': 'London', 'Internal ID': '102' },
            { 'Emp Name': 'Bob Wilson', 'Email Address': 'bob@example.com', 'Dept': 'Marketing', 'Job Title': 'Designer', 'Start Date': '2024-03-10', 'Location': 'Remote', 'Internal ID': '103' }
          ]
        });
      }, 1000);
    });
  },

  async validateImportMapping(dataType: string, mapping: Record<string, string>): Promise<ValidationResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          validCount: 40,
          warningCount: 3,
          errorCount: 2,
          duplicateCount: 1,
          errors: [
            { row: 14, reason: 'Invalid email format' },
            { row: 22, reason: 'Missing required field: Name' }
          ]
        });
      }, 1500);
    });
  },

  async executeImport(dataType: string, mapping: Record<string, string>, duplicateResolution: string): Promise<string> {
    // Return a mock job ID
    return `job-${Date.now()}`;
  },

  // ── Skill Connect & Mentorship APIs (Mock) ──────────────────────────────────────

  async getAvailabilityPreferences(employeeId: string): Promise<AvailabilityPreference> {
    // Return mock preferences or default
    return {
      employeeId,
      openToQuickQuestions: true,
      openToMentorship: false,
      skillsWillingToHelp: [],
      capacityNote: '',
      updatedAt: new Date().toISOString()
    };
  },

  async updateAvailabilityPreferences(employeeId: string, prefs: Partial<AvailabilityPreference>): Promise<AvailabilityPreference> {
    return {
      employeeId,
      openToQuickQuestions: prefs.openToQuickQuestions ?? true,
      openToMentorship: prefs.openToMentorship ?? false,
      skillsWillingToHelp: prefs.skillsWillingToHelp || [],
      capacityNote: prefs.capacityNote || '',
      updatedAt: new Date().toISOString()
    };
  },

  async searchSkillExperts(skill: string, filters: any): Promise<Employee[]> {
    const res = await this.getEmployees();
    // Filter employees who have this skill
    let experts = res.filter(e => 
      e.technicalSkills.some(s => s.name.toLowerCase().includes(skill.toLowerCase()))
    );

    if (filters.minProficiency) {
      experts = experts.filter(e => 
        e.technicalSkills.some(s => 
          s.name.toLowerCase().includes(skill.toLowerCase()) && 
          s.proficiency >= filters.minProficiency
        )
      );
    }
    
    // Additional mock filtering by availability, verification, etc. could go here
    return experts;
  },

  async getConnectionRequests(userId: string): Promise<{ sent: ConnectionRequest[], received: ConnectionRequest[] }> {
    return {
      sent: [
        {
          id: 'cr-1',
          requesterId: userId,
          recipientId: 'e-105',
          recipientName: 'David Kim',
          recipientRole: 'Senior Data Scientist',
          type: 'mentorship',
          skillId: 'Python',
          message: 'Looking to learn advanced pandas techniques',
          goal: 'Automate data cleaning pipelines',
          cadence: 'Few sessions',
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ],
      received: [
        {
          id: 'cr-2',
          requesterId: 'e-108',
          requesterName: 'Michael Chang',
          requesterRole: 'QA Engineer',
          recipientId: userId,
          type: 'quick_connect',
          skillId: 'Kubernetes',
          message: 'I am getting a CrashLoopBackOff on the new staging pod, can you help me debug?',
          urgencyTag: 'Blocking me now',
          status: 'pending',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        }
      ]
    };
  },

  async createConnectionRequest(req: Partial<ConnectionRequest>): Promise<ConnectionRequest> {
    return {
      id: `cr-${Date.now()}`,
      requesterId: req.requesterId || 'current-user',
      recipientId: req.recipientId || 'unknown',
      type: req.type || 'quick_connect',
      skillId: req.skillId || 'unknown',
      message: req.message || '',
      urgencyTag: req.urgencyTag,
      goal: req.goal,
      cadence: req.cadence,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
  },

  async updateConnectionRequestStatus(id: string, status: ConnectionRequest['status']): Promise<boolean> {
    return true; // mock success
  }
};

