import { Employee, Project, DashboardStats, SkillGapReport } from './api';

export const mockEmployees: Employee[] = [
  {
    id: 'emp1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    department: 'Engineering',
    role: 'Senior Frontend Engineer',
    experienceYears: 6,
    performanceRating: 4.8,
    technicalSkills: [
      { name: 'React', proficiency: 5 },
      { name: 'TypeScript', proficiency: 4 },
      { name: 'Node.js', proficiency: 3 }
    ],
    softSkills: ['Leadership', 'Communication'],
    certifications: ['AWS Certified Developer'],
    currentProjects: ['proj1'],
    profileSummary: 'Experienced frontend developer specializing in React and TypeScript.',
  },
  {
    id: 'emp2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    department: 'Data Science',
    role: 'Data Scientist',
    experienceYears: 4,
    performanceRating: 4.5,
    technicalSkills: [
      { name: 'Python', proficiency: 5 },
      { name: 'Machine Learning', proficiency: 4 },
      { name: 'SQL', proficiency: 4 }
    ],
    softSkills: ['Problem Solving', 'Analysis'],
    certifications: [],
    currentProjects: ['proj2'],
    profileSummary: 'Data scientist with a strong background in predictive modeling.',
  },
  {
    id: 'emp3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    department: 'Product',
    role: 'Product Manager',
    experienceYears: 8,
    performanceRating: 4.9,
    technicalSkills: [
      { name: 'Agile', proficiency: 5 },
      { name: 'Jira', proficiency: 5 },
      { name: 'Data Analysis', proficiency: 3 }
    ],
    softSkills: ['Strategic Planning', 'Leadership', 'Communication'],
    certifications: ['Certified Scrum Master'],
    currentProjects: ['proj1', 'proj2'],
    profileSummary: 'Product Manager with extensive experience in leading cross-functional teams.',
  }
];

export const mockProjects: Project[] = [
  {
    id: 'proj1',
    name: 'Customer Portal Revamp',
    description: 'Modernizing the customer portal using React and Tailwind.',
    requiredSkills: ['React', 'TypeScript', 'UI/UX'],
    teamSize: 4,
    durationMonths: 6,
    status: 'Active',
    healthScore: 92,
    healthLevel: 'Excellent',
    budget: 150000,
    priority: 'High'
  },
  {
    id: 'proj2',
    name: 'AI Analytics Engine',
    description: 'Building a predictive analytics engine for sales data.',
    requiredSkills: ['Python', 'Machine Learning', 'Data Analysis'],
    teamSize: 3,
    durationMonths: 8,
    status: 'Planning',
    healthScore: 78,
    healthLevel: 'Healthy',
    budget: 200000,
    priority: 'High'
  }
];

export const mockDashboardStats: DashboardStats = {
  capabilityScore: 85,
  totalEmployees: 3,
  avgExperience: 6,
  avgPerformance: 4.7,
  skillDistribution: [
    { name: 'React', avgProficiency: 5, count: 1 },
    { name: 'Python', avgProficiency: 5, count: 1 },
    { name: 'Agile', avgProficiency: 5, count: 1 }
  ],
  departmentExpertise: [
    { department: 'Engineering', headcount: 1, avgExperience: 6, avgPerformance: 4.8, avgSkillProficiency: 4 },
    { department: 'Data Science', headcount: 1, avgExperience: 4, avgPerformance: 4.5, avgSkillProficiency: 4.3 },
    { department: 'Product', headcount: 1, avgExperience: 8, avgPerformance: 4.9, avgSkillProficiency: 4.3 }
  ],
  techAdoption: [
    { name: 'React', value: 80 },
    { name: 'TypeScript', value: 60 }
  ],
  topExperts: [
    { id: 'emp1', name: 'Alice Johnson', role: 'Senior Frontend Engineer', department: 'Engineering', expertSkill: 'React', proficiency: 5, rating: 4.8 }
  ],
  projectStats: {
    totalProjects: 2,
    activeProjects: 1,
    completedProjects: 0,
    delayedProjects: 0,
    onHoldProjects: 0,
    totalBudget: 350000,
    budgetUsed: 55000,
    averageDeliveryHealth: 85,
    averageTeamUtilization: 75,
    highRiskProjects: []
  }
};

export const mockGapAnalysis: SkillGapReport = {
  currentSkills: [
    { name: 'React', avgProficiency: 4.5, count: 1 },
    { name: 'Python', avgProficiency: 4, count: 1 }
  ],
  targetSkills: [
    { name: 'React', requiredProficiency: 4 },
    { name: 'Cloud Computing', requiredProficiency: 3 }
  ],
  gaps: [
    { skillName: 'Cloud Computing', status: 'critical', currentAvg: 0, target: 3, difference: -3 }
  ],
  weaknesses: ['Lack of Cloud Computing expertise'],
  hiringRecommendations: ['Hire a DevOps engineer or Cloud Architect'],
  upskillingSuggestions: [
    { skill: 'Cloud Computing', suggestedCourse: 'AWS Solutions Architect', candidates: ['emp1', 'emp2'] }
  ]
};
