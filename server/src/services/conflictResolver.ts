import { Employee, Project } from '../db/seedData.js';
import { analytics } from './analytics.js';

export interface ResolutionOption {
  optionType: 'Split Allocation' | 'Alternative Employee' | 'Upskill Replacement' | 'Delay Project';
  description: string;
  businessImpact: 'High' | 'Medium' | 'Low';
  deliveryRisk: 'High' | 'Medium' | 'Low';
  skillMatchScore: number; // 0-100
  cost: 'High' | 'Medium' | 'Low';
  rank: number;
  suggestedEmployee?: { id: string; name: string };
}

export interface Conflict {
  employee: Employee;
  allocationPercentage: number;
  conflictingProjects: {
    project: Project;
    priorityScore: number;
  }[];
  resolutionOptions: ResolutionOption[];
}

class ConflictResolver {
  public detectConflicts(employees: Employee[], projects: Project[]): Conflict[] {
    const conflicts: Conflict[] = [];

    // Find employees on more than 1 project
    const overallocated = employees.filter(e => e.currentProjects.length > 1);

    overallocated.forEach(emp => {
      // Find actual project details
      const empProjects = emp.currentProjects
        .map(projName => projects.find(p => p.name === projName))
        .filter((p): p is Project => p !== undefined);

      if (empProjects.length < 2) return;

      const allocationPercentage = empProjects.length * 100; // E.g., 2 projects = 200%

      const conflictingProjects = empProjects.map(p => {
        const priorityScore = (p.durationMonths * 2) + (p.teamSize * 3);
        return { project: p, priorityScore };
      }).sort((a, b) => b.priorityScore - a.priorityScore);

      // Generate options for the lower priority project
      const lowerPriorityProject = conflictingProjects[1].project;
      const options: ResolutionOption[] = [];

      // Option A: Split Allocation
      options.push({
        optionType: 'Split Allocation',
        description: `Split ${emp.name}'s time 50/50 between the projects.`,
        businessImpact: 'Medium',
        deliveryRisk: 'High', // High risk because they are context switching
        skillMatchScore: 100,
        cost: 'Low',
        rank: 0
      });

      // Option B: Recommend Alternative Employee
      const candidates = employees.filter(e => e.id !== emp.id && e.currentProjects.length === 0);
      let bestAlt: Employee | null = null;
      let bestMatch = 0;

      candidates.forEach(c => {
        let matchCount = 0;
        c.technicalSkills.forEach(s => {
          if (lowerPriorityProject.requiredSkills.includes(s.name)) matchCount++;
        });
        const score = lowerPriorityProject.requiredSkills.length > 0 
          ? (matchCount / lowerPriorityProject.requiredSkills.length) * 100 : 0;
        if (score > bestMatch) {
          bestMatch = score;
          bestAlt = c;
        }
      });

      if (bestAlt && bestMatch >= 50) {
        const alt = bestAlt as Employee;
        options.push({
          optionType: 'Alternative Employee',
          description: `Replace with ${alt.name} who is currently unassigned.`,
          businessImpact: 'Low',
          deliveryRisk: 'Low',
          skillMatchScore: Math.round(bestMatch),
          cost: 'Low',
          suggestedEmployee: { id: alt.id, name: alt.name },
          rank: 0
        });
      }

      // Option C: Upskill Replacement
      if (!bestAlt || bestMatch < 80) {
        options.push({
          optionType: 'Upskill Replacement',
          description: `Find an internal junior candidate and upskill them for ${lowerPriorityProject.name}.`,
          businessImpact: 'High',
          deliveryRisk: 'Medium',
          skillMatchScore: 50,
          cost: 'Medium',
          rank: 0
        });
      }

      // Option D: Delay Project
      options.push({
        optionType: 'Delay Project',
        description: `Delay ${lowerPriorityProject.name} by 2 months until resources free up.`,
        businessImpact: 'High',
        deliveryRisk: 'Low',
        skillMatchScore: 100,
        cost: 'High',
        rank: 0
      });

      // Rank options (Simple logic: prefer Alternative Employee, then Split, then Upskill, then Delay)
      options.forEach(opt => {
        let score = 0;
        if (opt.optionType === 'Alternative Employee') score = 4;
        if (opt.optionType === 'Upskill Replacement') score = 3;
        if (opt.optionType === 'Split Allocation') score = 2;
        if (opt.optionType === 'Delay Project') score = 1;
        opt.rank = score;
      });

      options.sort((a, b) => b.rank - a.rank);

      conflicts.push({
        employee: emp,
        allocationPercentage,
        conflictingProjects,
        resolutionOptions: options
      });
    });

    return conflicts;
  }
}

export const conflictResolver = new ConflictResolver();
