import { ParsedResumeProfile } from './resumeProcessor.js';

export type HiringStatus = 'Draft' | 'Open' | 'Paused' | 'Closed';
export type CandidateStatus = 'Applied' | 'Strong Match' | 'Good Match' | 'Average' | 'Weak Match' | 'Rejected' | 'Interview Scheduled' | 'Offer Sent' | 'Offer Accepted';

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
  status: HiringStatus;
  createdAt: string;
}

export interface AIScore {
  skillMatch: number;
  cgpaMatch: number;
  projectMatch: number;
  experienceMatch: number;
  educationMatch: number;
  keywordMatch: number;
  certificationMatch: number;
  communicationScore: number;
  overallMatchScore: number;
  classification: Exclude<CandidateStatus, 'Applied' | 'Rejected' | 'Interview Scheduled' | 'Offer Sent' | 'Offer Accepted'>;
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
}

export interface RecruitmentCandidate {
  id: string;
  driveId: string;
  fileName: string;
  status: CandidateStatus;
  parsedProfile: ParsedResumeProfile;
  aiScore: AIScore;
  interviewNotes: string[];
  appliedAt: string;
}

function scoreRatio(matches: number, total: number) {
  if (total <= 0) return 100;
  return Math.round((matches / total) * 100);
}

function includesAny(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.filter(word => lower.includes(word.toLowerCase()));
}

function classify(overall: number): AIScore['classification'] {
  if (overall >= 80) return 'Strong Match';
  if (overall >= 65) return 'Good Match';
  if (overall >= 50) return 'Average';
  return 'Weak Match';
}

export function analyzeCandidateForDrive(parsed: ParsedResumeProfile, drive: HiringDrive): AIScore {
  const allSkills = parsed.skills.all.map(s => s.toLowerCase());
  const matchingRequired = drive.requiredSkills.filter(skill => allSkills.includes(skill.toLowerCase()));
  const matchingPreferred = drive.preferredSkills.filter(skill => allSkills.includes(skill.toLowerCase()));
  const missingSkills = drive.requiredSkills.filter(skill => !allSkills.includes(skill.toLowerCase()));
  const projectText = parsed.projects.join(' ');
  const keywordMatches = includesAny(`${projectText} ${parsed.rawText}`, drive.projectKeywords);
  const certMatches = includesAny(parsed.certifications.join(' '), drive.requiredCertifications);
  const collegeMatch = drive.preferredColleges.length === 0 || drive.preferredColleges.some(college =>
    `${parsed.education.college} ${parsed.education.university}`.toLowerCase().includes(college.toLowerCase())
  );
  const degreeMatch = !drive.degree || parsed.education.degree.toLowerCase().includes(drive.degree.toLowerCase());
  const cgpa = parsed.education.cgpa || 0;
  const communication = parsed.skills.all.some(s => s.toLowerCase() === 'communication') || /communication|presentation|lead/i.test(parsed.rawText);
  const portfolioOk = !drive.portfolioRequired || Boolean(parsed.portfolio);
  const githubOk = !drive.githubRequired || Boolean(parsed.github);

  const skillMatch = Math.round((scoreRatio(matchingRequired.length, drive.requiredSkills.length) * 0.75) + (scoreRatio(matchingPreferred.length, drive.preferredSkills.length) * 0.25));
  const cgpaMatch = drive.minimumCgpa ? Math.min(100, Math.round((cgpa / drive.minimumCgpa) * 100)) : 100;
  const projectMatch = scoreRatio(keywordMatches.length, drive.projectKeywords.length);
  const experienceMatch = parsed.experience.length > 0 || parsed.internships.length > 0 ? 85 : 55;
  const educationMatch = collegeMatch && degreeMatch ? 100 : collegeMatch || degreeMatch ? 70 : 45;
  const keywordMatch = projectMatch;
  const certificationMatch = scoreRatio(certMatches.length, drive.requiredCertifications.length);
  const communicationScore = communication ? 90 : 65;
  const accessScore = portfolioOk && githubOk ? 100 : portfolioOk || githubOk ? 75 : 45;

  const overallMatchScore = Math.round(
    (skillMatch * 0.28) +
    (cgpaMatch * 0.12) +
    (projectMatch * 0.16) +
    (experienceMatch * 0.1) +
    (educationMatch * 0.1) +
    (keywordMatch * 0.08) +
    (certificationMatch * 0.06) +
    (communicationScore * 0.06) +
    (accessScore * 0.04)
  );

  const classification = classify(overallMatchScore);
  const strengths = [
    ...matchingRequired.map(skill => `Required skill: ${skill}`),
    ...matchingPreferred.map(skill => `Preferred skill: ${skill}`),
    ...keywordMatches.map(keyword => `Relevant project keyword: ${keyword}`),
    cgpa >= drive.minimumCgpa && drive.minimumCgpa > 0 ? `CGPA meets threshold (${cgpa})` : '',
    parsed.github ? 'GitHub profile available' : '',
    parsed.portfolio ? 'Portfolio available' : '',
  ].filter(Boolean);

  const weaknesses = [
    ...missingSkills.map(skill => `Missing required skill: ${skill}`),
    cgpa > 0 && drive.minimumCgpa > 0 && cgpa < drive.minimumCgpa ? `CGPA below threshold (${cgpa})` : '',
    drive.githubRequired && !parsed.github ? 'GitHub required but not found' : '',
    drive.portfolioRequired && !parsed.portfolio ? 'Portfolio required but not found' : '',
  ].filter(Boolean);

  const reasons = strengths.slice(0, 6);
  if (reasons.length === 0) reasons.push('Candidate has a readable resume profile but limited direct matching signals.');

  return {
    skillMatch,
    cgpaMatch,
    projectMatch,
    experienceMatch,
    educationMatch,
    keywordMatch,
    certificationMatch,
    communicationScore,
    overallMatchScore,
    classification,
    reasons,
    matchingSkills: [...matchingRequired, ...matchingPreferred],
    missingSkills,
    recommendedInterviewQuestions: generateInterviewQuestions(parsed, drive),
    strengths: strengths.slice(0, 8),
    weaknesses: weaknesses.slice(0, 8),
    improvementAreas: missingSkills.length ? missingSkills.map(skill => `Build stronger evidence around ${skill}.`) : ['Prepare project walkthroughs with clear business impact.'],
    careerPotential: overallMatchScore >= 80 ? 'High potential for fast ramp-up and ownership.' : overallMatchScore >= 65 ? 'Good potential with focused onboarding.' : 'Potential depends on skill development and project evidence.',
    hiringRecommendation: overallMatchScore >= 80 ? 'Shortlist for priority interview.' : overallMatchScore >= 65 ? 'Shortlist after HR screening.' : overallMatchScore >= 50 ? 'Keep warm for secondary pipeline.' : 'Do not shortlist for this drive.',
    overallRating: Math.round((overallMatchScore / 20) * 10) / 10,
  };
}

export function generateInterviewQuestions(parsed: ParsedResumeProfile, drive: HiringDrive) {
  const primarySkills = [...drive.requiredSkills, ...parsed.skills.all].slice(0, 5);
  return [
    `Walk us through one ${drive.projectKeywords[0] || 'technical'} project from your resume and the decisions you owned.`,
    `How would you design a small ${drive.role} feature using ${primarySkills[0] || 'your strongest technology'}?`,
    `Which part of ${primarySkills[1] || 'software delivery'} do you find most challenging, and how do you handle it?`,
    'Describe a time you had to communicate a technical issue to a non-technical person.',
    `What would you learn first to become productive in our ${drive.department} team?`,
  ];
}

export function createDefaultDrive(): HiringDrive {
  return {
    id: `drive-${Date.now()}`,
    hiringName: 'Software Engineer Trainee',
    description: 'Campus hiring campaign for software engineering trainees.',
    company: 'TalentGraph',
    department: 'Engineering',
    role: 'Software Engineer Trainee',
    source: 'Campus Placement',
    employmentType: 'Full-time',
    location: 'Hybrid',
    salary: 'As per campus band',
    experience: '0-1 years',
    hiringDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    maximumCandidates: 100,
    requiredSkills: ['React', 'Node.js', 'Python', 'SQL', 'Git', 'Communication'],
    preferredSkills: ['Machine Learning', 'AI', 'ERP', 'CRM'],
    minimumCgpa: 7,
    degree: 'B.Tech',
    branches: ['Computer Science', 'Information Technology', 'Electronics'],
    graduationYear: '2026',
    preferredColleges: ['Mar Baselios College', 'MBCET'],
    requiredCertifications: [],
    projectKeywords: ['AI', 'ERP', 'CRM', 'Machine Learning', 'Web Development'],
    portfolioRequired: false,
    githubRequired: false,
    languages: ['English'],
    interviewRounds: ['Resume Screen', 'Technical Interview', 'HR Interview'],
    priority: 'High',
    status: 'Open',
    createdAt: new Date().toISOString(),
  };
}
