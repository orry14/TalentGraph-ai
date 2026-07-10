import { Employee, Project } from '../db/seedData.js';

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
  upskillingSuggestions: { skill: string; suggestedCourse: string; candidates: string[] }[];
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

class AnalyticsEngine {
  /**
   * Calculate general workforce stats for the dashboard
   */
  public calculateDashboardStats(employees: Employee[], projects: Project[]) {
    if (employees.length === 0) {
      return {
        capabilityScore: 0,
        totalEmployees: 0,
        avgExperience: 0,
        avgPerformance: 0,
        skillDistribution: [],
        departmentExpertise: [],
        techAdoption: [],
        topExperts: []
      };
    }

    // 1. Total Experience & Performance
    const totalExp = employees.reduce((sum, e) => sum + e.experienceYears, 0);
    const avgExp = parseFloat((totalExp / employees.length).toFixed(1));
    const totalPerf = employees.reduce((sum, e) => sum + e.performanceRating, 0);
    const avgPerf = parseFloat((totalPerf / employees.length).toFixed(2));

    // 2. Average Skill Proficiency
    let totalSkillsCount = 0;
    let totalSkillsSum = 0;
    employees.forEach(e => {
      e.technicalSkills.forEach(s => {
        totalSkillsCount++;
        totalSkillsSum += s.proficiency;
      });
    });
    const avgSkillProf = totalSkillsCount > 0 ? totalSkillsSum / totalSkillsCount : 0;

    // 3. Organization Capability Score (0-100 index)
    // Formula: (avgPerf/5 * 40) + (avgSkillProf/5 * 40) + (avgExp/12 * 20)
    const perfScore = (avgPerf / 5.0) * 40;
    const skillScore = (avgSkillProf / 5.0) * 40;
    const expScore = Math.min((avgExp / 10.0) * 20, 20); // cap exp at 10 years for 100% weight
    const capabilityScore = Math.round(perfScore + skillScore + expScore);

    // 4. Skill Distribution (Recharts Radar / Bar)
    const skillMap = new Map<string, { totalProf: number; count: number; type: string }>();
    employees.forEach(e => {
      e.technicalSkills.forEach(s => {
        const existing = skillMap.get(s.name) || { totalProf: 0, count: 0, type: 'technical' };
        existing.totalProf += s.proficiency;
        existing.count++;
        skillMap.set(s.name, existing);
      });
    });

    const skillDistribution = Array.from(skillMap.entries()).map(([name, data]) => ({
      name,
      avgProficiency: parseFloat((data.totalProf / data.count).toFixed(1)),
      count: data.count
    })).sort((a, b) => b.count - a.count).slice(0, 12); // top 12 skills

    // 5. Department-wise Expertise (stacked bar charts)
    const depts = Array.from(new Set(employees.map(e => e.department)));
    const departmentExpertise = depts.map(dept => {
      const deptEmps = employees.filter(e => e.department === dept);
      const avgDeptExp = deptEmps.reduce((sum, e) => sum + e.experienceYears, 0) / deptEmps.length;
      const avgDeptPerf = deptEmps.reduce((sum, e) => sum + e.performanceRating, 0) / deptEmps.length;
      
      let deptSkillsSum = 0;
      let deptSkillsCount = 0;
      deptEmps.forEach(e => {
        e.technicalSkills.forEach(s => {
          deptSkillsSum += s.proficiency;
          deptSkillsCount++;
        });
      });
      const avgDeptSkill = deptSkillsCount > 0 ? deptSkillsSum / deptSkillsCount : 0;

      return {
        department: dept,
        headcount: deptEmps.length,
        avgExperience: parseFloat(avgDeptExp.toFixed(1)),
        avgPerformance: parseFloat(avgDeptPerf.toFixed(2)),
        avgSkillProficiency: parseFloat(avgDeptSkill.toFixed(1))
      };
    });

    // 6. Technology Adoption groups
    const techAdoption = [
      { name: 'Cloud & DevOps', value: employees.filter(e => e.technicalSkills.some(s => ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD'].includes(s.name))).length },
      { name: 'Frontend Tech', value: employees.filter(e => e.technicalSkills.some(s => ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'].includes(s.name))).length },
      { name: 'Backend & Data', value: employees.filter(e => e.technicalSkills.some(s => ['Node.js', 'PostgreSQL', 'SQL', 'Redis', 'GraphQL', 'Python'].includes(s.name))).length },
      { name: 'AI & Data Science', value: employees.filter(e => e.technicalSkills.some(s => ['PyTorch', 'TensorFlow', 'LLMs', 'Pandas'].includes(s.name))).length }
    ].filter(t => t.value > 0);

    // 7. Top Experts
    const topExperts = employees.map(e => {
      const bestSkill = [...e.technicalSkills].sort((a, b) => b.proficiency - a.proficiency)[0];
      return {
        id: e.id,
        name: e.name,
        role: e.role,
        department: e.department,
        expertSkill: bestSkill ? bestSkill.name : 'Generalist',
        proficiency: bestSkill ? bestSkill.proficiency : 5,
        rating: e.performanceRating
      };
    }).sort((a, b) => b.rating - a.rating).slice(0, 4);

    return {
      capabilityScore,
      totalEmployees: employees.length,
      avgExperience: avgExp,
      avgPerformance: avgPerf,
      skillDistribution,
      departmentExpertise,
      techAdoption,
      topExperts
    };
  }

  /**
   * Perform Project Staffing recommendations
   */
  public recommendStaffing(
    projectName: string,
    requiredSkills: string[],
    teamSize: number,
    durationMonths: number,
    employees: Employee[]
  ): StaffingRecommendation {
    const candidates = employees.map(employee => {
      const empSkills = new Map(employee.technicalSkills.map(s => [s.name.toLowerCase(), s.proficiency]));
      
      let matchedCount = 0;
      let scoreSum = 0;
      const matchingSkills: string[] = [];

      requiredSkills.forEach(reqSkill => {
        const prof = empSkills.get(reqSkill.toLowerCase());
        if (prof !== undefined) {
          matchedCount++;
          scoreSum += prof; // 1 to 5
          matchingSkills.push(reqSkill);
        }
      });

      // Calculate match percentage
      // Formula: (matchedCount / totalRequired * 60) + (avgProf/5 * 25) + (perfRating/5 * 10) + (expYears/10 * 5)
      const coverageRatio = requiredSkills.length > 0 ? matchedCount / requiredSkills.length : 0;
      const avgProf = matchedCount > 0 ? scoreSum / matchedCount : 0;
      
      const coverageComponent = coverageRatio * 60;
      const profComponent = (avgProf / 5.0) * 25;
      const perfComponent = (employee.performanceRating / 5.0) * 10;
      const expComponent = Math.min((employee.experienceYears / 10.0) * 5, 5);

      const matchPercentage = Math.round(coverageComponent + profComponent + perfComponent + expComponent);

      // Deduce role in project
      let roleInProject = 'Contributor';
      if (employee.experienceYears >= 7 && coverageRatio > 0.5) {
        roleInProject = 'Technical Lead';
      } else if (employee.technicalSkills.some(s => s.name === 'AWS' || s.name === 'Docker') && matchingSkills.includes('Docker')) {
        roleInProject = 'DevOps Lead';
      } else if (matchingSkills.includes('React') || matchingSkills.includes('Tailwind CSS')) {
        roleInProject = 'Frontend Lead';
      }

      return {
        employee,
        matchPercentage,
        matchingSkills,
        roleInProject
      };
    }).sort((a, b) => b.matchPercentage - a.matchPercentage);

    const recommendedTeam = candidates.slice(0, teamSize);
    const backupCandidates = candidates.slice(teamSize, teamSize + 3).map(c => ({
      employee: c.employee,
      matchPercentage: c.matchPercentage,
      matchingSkills: c.matchingSkills
    }));

    // Calculate overall match score (average of team scores)
    const overallMatchScore = recommendedTeam.length > 0
      ? Math.round(recommendedTeam.reduce((sum, c) => sum + c.matchPercentage, 0) / recommendedTeam.length)
      : 0;

    // Track skill overlap
    const skillOverlap = requiredSkills.map(skill => {
      const employeesCovering = recommendedTeam
        .filter(c => c.employee.technicalSkills.some(s => s.name.toLowerCase() === skill.toLowerCase()))
        .map(c => c.employee.name);
      return { skill, employeesCovering };
    });

    // Check for missing skills
    const coveredSkills = new Set(
      recommendedTeam.flatMap(c => c.employee.technicalSkills.map(s => s.name.toLowerCase()))
    );
    const missingSkills = requiredSkills.filter(s => !coveredSkills.has(s.toLowerCase()));

    return {
      projectName,
      requiredSkills,
      teamSize,
      durationMonths,
      recommendedTeam,
      overallMatchScore,
      skillOverlap,
      missingSkills,
      backupCandidates
    };
  }

  /**
   * Run Skill Gap Analysis comparing current skills with industry standard future tech targets
   */
  public runGapAnalysis(employees: Employee[]): SkillGapReport {
    // 1. Define future tech skills we want the org to excel in
    const targetSkills = [
      { name: 'LLMs', requiredProficiency: 4 },
      { name: 'Kubernetes', requiredProficiency: 4 },
      { name: 'TypeScript', requiredProficiency: 4 },
      { name: 'React', requiredProficiency: 4 },
      { name: 'GraphQL', requiredProficiency: 3 },
      { name: 'Docker', requiredProficiency: 4 },
      { name: 'Terraform', requiredProficiency: 3 },
      { name: 'Python', requiredProficiency: 4 }
    ];

    // 2. Fetch current skills aggregate from db
    const currentSkillsMap = new Map<string, { totalProf: number; count: number }>();
    employees.forEach(e => {
      e.technicalSkills.forEach(s => {
        const key = s.name.toLowerCase();
        const existing = currentSkillsMap.get(key) || { totalProf: 0, count: 0 };
        existing.totalProf += s.proficiency;
        existing.count++;
        currentSkillsMap.set(key, existing);
      });
    });

    const currentSkills = Array.from(currentSkillsMap.entries()).map(([lowerName, data]) => {
      // Find capitalized name
      const actualName = targetSkills.find(t => t.name.toLowerCase() === lowerName)?.name || 
                         employees.flatMap(e => e.technicalSkills).find(s => s.name.toLowerCase() === lowerName)?.name || 
                         lowerName;
      return {
        name: actualName,
        avgProficiency: parseFloat((data.totalProf / data.count).toFixed(1)),
        count: data.count
      };
    });

    // 3. Compare current vs target and build gap array
    const gaps = targetSkills.map(target => {
      const current = currentSkills.find(c => c.name.toLowerCase() === target.name.toLowerCase());
      const currentAvg = current ? current.avgProficiency : 0;
      const difference = currentAvg - target.requiredProficiency;
      
      let status: 'critical' | 'moderate' | 'healthy' = 'healthy';
      if (difference <= -1.5) {
        status = 'critical';
      } else if (difference < 0) {
        status = 'moderate';
      }

      return {
        skillName: target.name,
        status,
        currentAvg,
        target: target.requiredProficiency,
        difference: parseFloat(difference.toFixed(1))
      };
    });

    // 4. Generate weaknesses list
    const weaknesses = gaps
      .filter(g => g.status === 'critical' || g.status === 'moderate')
      .sort((a, b) => a.difference - b.difference)
      .map(g => g.skillName);

    // 5. Generate hiring recommendations
    const hiringRecommendations = gaps
      .filter(g => g.status === 'critical')
      .map(g => `Hire 1-2 Senior specialists with expertise in ${g.skillName} (Current Avg: ${g.currentAvg}, Target: ${g.target})`);

    // 6. Generate upskilling pathways
    const courses = {
      'LLMs': 'Generative AI & LLM Fine-Tuning Bootcamp',
      'Kubernetes': 'CKA: Certified Kubernetes Administrator',
      'TypeScript': 'TypeScript Patterns for Enterprise Applications',
      'GraphQL': 'GraphQL Federation & Schema Design',
      'Terraform': 'Infrastructure as Code with Terraform Associate'
    };

    const upskillingSuggestions = gaps
      .filter(g => g.status !== 'healthy')
      .map(g => {
        // Find employees who already have this skill at 2 or 3, so they can be upskilled to 4 or 5
        const candidates = employees
          .filter(e => e.technicalSkills.some(s => s.name.toLowerCase() === g.skillName.toLowerCase() && s.proficiency <= 3))
          .map(e => e.name);

        return {
          skill: g.skillName,
          suggestedCourse: (courses as any)[g.skillName] || `Advanced ${g.skillName} Development Masterclass`,
          candidates: candidates.slice(0, 3) // show top 3 candidates for upskilling
        };
      }).filter(s => s.candidates.length > 0);

    return {
      currentSkills,
      targetSkills,
      gaps,
      weaknesses,
      hiringRecommendations,
      upskillingSuggestions
    };
  }
}

export const analytics = new AnalyticsEngine();
