import { Project, ProjectMember, ProjectTask, ProjectMilestone, ProjectRisk, Employee } from '../db/seedData.js';

export interface HealthReport {
  projectId: string;
  projectName: string;
  healthScore: number;
  healthLevel: 'Excellent' | 'Healthy' | 'Warning' | 'High Risk' | 'Critical';
  healthExplanation: string;
  healthTrendWeek: number;
  healthTrendMonth: number;
  deliveryConfidence: number;
  onTimeProbability: number;
  budgetOverrunProbability: number;
  estimatedCompletionDate: string;
  metrics: {
    timelineProgress: number; // 0-100
    taskCompletion: number; // 0-100
    skillCoverage: number; // 0-100
    avgTeamPerformance: number; // 0-100
    budgetUsage: number; // 0-100
    resourceConflictCount: number;
    spofCount: number;
  };
  risks: ProjectRisk[];
  forecast: {
    chanceOfOnTimeDelivery: number;
    chanceOfBudgetOverrun: number;
    futureResourceShortage: boolean;
    upcomingSkillGaps: string[];
    estimatedCompletionDate: string;
    confidenceScore: number;
  };
}

class ProjectHealthService {
  /**
   * Run the Project Health Score and Risk Detection Engine
   */
  public generateHealthReport(
    project: Project,
    members: ProjectMember[],
    tasks: ProjectTask[],
    milestones: ProjectMilestone[],
    allEmployees: Employee[]
  ): HealthReport {
    const projectId = project.id;
    const requiredSkills = project.requiredSkills || [];
    const totalBudget = project.budget || 100000;
    
    // 1. Task Completion Metric (0-100)
    const projTasks = tasks.filter(t => t.projectId === projectId);
    const completedTasks = projTasks.filter(t => t.status === 'Completed').length;
    const taskCompletion = projTasks.length > 0 ? Math.round((completedTasks / projTasks.length) * 100) : 100;

    // 2. Timeline Progress Metric (0-100)
    const projMilestones = milestones.filter(m => m.projectId === projectId);
    const completedMilestones = projMilestones.filter(m => m.status === 'Completed' || m.status === 'Testing' || m.status === 'Deployment' || m.status === 'Maintenance').length;
    const timelineProgress = projMilestones.length > 0 ? Math.round((completedMilestones / projMilestones.length) * 100) : 50;

    // 3. Skill Coverage Metric (0-100)
    // Map assigned employee skills
    const assignedEmployeeIds = members.filter(m => m.projectId === projectId).map(m => m.employeeId);
    const assignedEmployees = allEmployees.filter(e => assignedEmployeeIds.includes(e.id));
    
    const coveredSkills = new Set<string>();
    assignedEmployees.forEach(emp => {
      emp.technicalSkills.forEach(s => {
        if (s.proficiency >= 3) {
          coveredSkills.add(s.name.toLowerCase());
        }
      });
    });

    let matchCount = 0;
    requiredSkills.forEach(reqSkill => {
      if (coveredSkills.has(reqSkill.toLowerCase())) {
        matchCount++;
      }
    });
    const skillCoverage = requiredSkills.length > 0 ? Math.round((matchCount / requiredSkills.length) * 100) : 100;

    // 4. Average Team Performance (0-100)
    const activeMembers = members.filter(m => m.projectId === projectId);
    const avgPerf = activeMembers.length > 0
      ? activeMembers.reduce((sum, m) => sum + m.performance, 0) / activeMembers.length
      : 4.5;
    const avgTeamPerformance = Math.round((avgPerf / 5.0) * 100);

    // 5. Budget Usage Metric (0-100)
    // Assume a simulated budget usage based on completed tasks + current members allocation
    const salaryCostEstimate = activeMembers.reduce((sum, m) => {
      const emp = allEmployees.find(e => e.id === m.employeeId);
      const exp = emp ? emp.experienceYears : 5;
      const rate = 50000 + (exp * 6500); // mock annual rate
      const monthlyRate = rate / 12;
      return sum + (monthlyRate * (m.allocation / 100));
    }, 0);

    const timeElapsedMonths = Math.max(1, Math.round((project.durationMonths || 6) * (timelineProgress / 100)));
    const budgetUsed = Math.min(totalBudget, Math.round(salaryCostEstimate * timeElapsedMonths));
    const budgetUsage = Math.round((budgetUsed / totalBudget) * 100);

    // 6. Over-allocation & Resource Conflicts
    const overallocatedCount = activeMembers.filter(m => m.availability === 'Overallocated' || m.allocation > 100).length;
    
    // 7. Single Point of Failure (SPOF) Detection
    let spofCount = 0;
    requiredSkills.forEach(skill => {
      const experts = allEmployees.filter(e => e.technicalSkills.some(s => s.name.toLowerCase() === skill.toLowerCase() && s.proficiency >= 4));
      if (experts.length === 1 && assignedEmployeeIds.includes(experts[0].id)) {
        spofCount++;
      }
    });

    // ----------------------------------------------------
    // Health Score Formula
    // ----------------------------------------------------
    // Base Calculation:
    // 20% Timeline Progress + 15% Task Completion + 20% Skill Coverage + 15% Team Performance + 15% Budget Margin + 15% Resource Safety
    const timelinePart = (timelineProgress / 100) * 20;
    const taskPart = (taskCompletion / 100) * 15;
    const skillPart = (skillCoverage / 100) * 20;
    const perfPart = (avgTeamPerformance / 100) * 15;
    
    // Budget efficiency (closer to timeline progress is better, penalize heavily if budget exceeds progress by > 20%)
    const budgetExcess = budgetUsage - timelineProgress;
    let budgetPart = 15;
    if (budgetExcess > 20) {
      budgetPart = Math.max(0, 15 - (budgetExcess - 20) * 0.5);
    }

    // Resource safety penalties (overallocation, SPOFs)
    let resourcePart = 15;
    resourcePart -= (overallocatedCount * 4);
    resourcePart -= (spofCount * 3);
    resourcePart = Math.max(0, resourcePart);

    let healthScore = Math.round((timelinePart + taskPart + skillPart + perfPart + (budgetPart / 100 * 15) + (resourcePart / 100 * 15)) * 100);
    // Adjust base value to fit the target 0-100 range
    healthScore = Math.min(100, Math.max(10, Math.round(
      (timelineProgress * 0.2) + 
      (taskCompletion * 0.25) + 
      (skillCoverage * 0.25) + 
      (avgTeamPerformance * 0.15) + 
      ((100 - Math.max(0, budgetUsage - timelineProgress)) * 0.1) +
      ((100 - (overallocatedCount * 25) - (spofCount * 15)) * 0.05)
    )));

    // ----------------------------------------------------
    // Health Levels
    // ----------------------------------------------------
    let healthLevel: 'Excellent' | 'Healthy' | 'Warning' | 'High Risk' | 'Critical';
    if (healthScore >= 90) healthLevel = 'Excellent';
    else if (healthScore >= 75) healthLevel = 'Healthy';
    else if (healthScore >= 60) healthLevel = 'Warning';
    else if (healthScore >= 40) healthLevel = 'High Risk';
    else healthLevel = 'Critical';

    // ----------------------------------------------------
    // Risk Detection
    // ----------------------------------------------------
    const detectedRisks: ProjectRisk[] = [];
    let riskCounter = 1;

    // A. Budget Overrun
    if (budgetUsage > timelineProgress + 15) {
      const excess = budgetUsage - timelineProgress;
      const severity = excess > 30 ? 'Critical' : 'High';
      detectedRisks.push({
        id: riskCounter++,
        projectId,
        type: 'Budget Overrun',
        description: `Project budget consumption (${budgetUsage}%) exceeds milestones progress (${timelineProgress}%) by ${Math.round(excess)}%.`,
        severity,
        recommendation: 'Optimize development resources, reduce scope, or request budget extension.',
        expectedImprovement: `Expected to reduce budget overrun risk by 25% and stabilize overall health +${Math.round(excess * 0.25)}%.`
      });
    }

    // B. Schedule Delay
    const overdueTasks = projTasks.filter(t => t.status !== 'Completed' && new Date(t.dueDate) < new Date()).length;
    if (overdueTasks > 0 || (timelineProgress < 40 && timeElapsedMonths > (project.durationMonths || 6) * 0.6)) {
      detectedRisks.push({
        id: riskCounter++,
        projectId,
        type: 'Schedule Delay',
        description: `Schedule lag detected. There are ${overdueTasks} overdue tasks, and milestone targets are falling behind.`,
        severity: overdueTasks > 2 ? 'High' : 'Medium',
        recommendation: 'Delay release window by 2 weeks or inject unassigned bench engineers into critical tasks.',
        expectedImprovement: 'Expected to restore timeline alignment and improve on-time completion confidence by +15%.'
      });
    }

    // C. Missing Skills
    const missingSkills = requiredSkills.filter(s => !coveredSkills.has(s.toLowerCase()));
    if (missingSkills.length > 0) {
      detectedRisks.push({
        id: riskCounter++,
        projectId,
        type: 'Missing Skills',
        description: `Skills deficit detected: Required competencies for [${missingSkills.join(', ')}] are not represented in current active members.`,
        severity: missingSkills.length > 1 ? 'Critical' : 'High',
        recommendation: `Assign a specialist with ${missingSkills[0]} from the bench or establish intensive upskilling paths.`,
        expectedImprovement: `Instantly satisfies critical technical requirements and improves skill match index, boosting health score by +${missingSkills.length * 8} points.`
      });
    }

    // D. Overallocated Employees & Resource Conflicts
    if (overallocatedCount > 0) {
      detectedRisks.push({
        id: riskCounter++,
        projectId,
        type: 'Resource Conflict',
        description: `There are ${overallocatedCount} team members overallocated or double-booked across concurrent projects.`,
        severity: overallocatedCount > 1 ? 'High' : 'Medium',
        recommendation: 'Adjust time allocations to 50/50 split or replace with unassigned developers from the bench.',
        expectedImprovement: 'Eliminates burn-out probability and increases weekly task velocity by +12%.'
      });
    }

    // E. Single Point of Failure (SPOF)
    if (spofCount > 0) {
      detectedRisks.push({
        id: riskCounter++,
        projectId,
        type: 'SPOF',
        description: `Single Point of Failure vulnerability: Key technologies are dependent on a single key employee (${spofCount} skills affected).`,
        severity: 'High',
        recommendation: 'Implement cross-training workshops and pair juniors to facilitate active knowledge sharing.',
        expectedImprovement: 'De-risks delivery continuity and ensures project resilience against employee attrition.'
      });
    }

    // F. Low Performance
    if (avgTeamPerformance < 75) {
      detectedRisks.push({
        id: riskCounter++,
        projectId,
        type: 'Low Performance',
        description: `The average performance index of active staff is low (${avgTeamPerformance}%/100).`,
        severity: 'Medium',
        recommendation: 'Align Senior Technical Lead to oversee architecture and conduct weekly code reviews.',
        expectedImprovement: 'Boosts team delivery confidence and increases sprint task output quality +20%.'
      });
    }

    // ----------------------------------------------------
    // Forecast Engine
    // ----------------------------------------------------
    const onTimeProbability = Math.max(15, Math.min(98, Math.round(
      (timelineProgress * 0.3) + (taskCompletion * 0.3) + (skillCoverage * 0.25) + (avgTeamPerformance * 0.15) - (detectedRisks.filter(r => r.severity === 'Critical' || r.severity === 'High').length * 10)
    )));

    const budgetOverrunProbability = Math.max(2, Math.min(95, Math.round(
      (budgetUsage > timelineProgress ? (budgetUsage - timelineProgress) * 2.5 : 5) + (detectedRisks.some(r => r.type === 'Budget Overrun') ? 25 : 0)
    )));

    const futureResourceShortage = overallocatedCount > 0 || missingSkills.length > 0;
    
    // Projected end date
    const totalDurationMs = (project.durationMonths || 6) * 30 * 24 * 60 * 60 * 1000;
    const startMs = project.startDate ? new Date(project.startDate).getTime() : Date.now() - (totalDurationMs * 0.3);
    const timeElapsedMs = Date.now() - startMs;
    const estimatedCompletionMs = startMs + (timeElapsedMs / Math.max(0.1, timelineProgress / 100));
    
    const estimatedCompletionDate = isNaN(estimatedCompletionMs)
      ? new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(estimatedCompletionMs).toISOString().split('T')[0];

    const confidenceScore = Math.round(
      (onTimeProbability * 0.6) + ((100 - budgetOverrunProbability) * 0.4)
    );

    // AI Explanation Text
    let healthExplanation = `AI Analysis: The project is performing in the ${healthLevel} category with a health index of ${healthScore}/100. `;
    if (detectedRisks.length === 0) {
      healthExplanation += "All timeline milestones, budgets, and skill requirements are aligned to target delivery parameters.";
    } else {
      healthExplanation += `There are ${detectedRisks.length} active risks flagged. Main bottleneck concerns are: ${detectedRisks.map(r => r.type).join(', ')}. Addressing these bottlenecks will stabilize the delivery confidence index.`;
    }

    // Historical trends
    const healthTrendWeek = project.healthTrendWeek !== undefined ? project.healthTrendWeek : (healthScore > 75 ? 2 : -3);
    const healthTrendMonth = project.healthTrendMonth !== undefined ? project.healthTrendMonth : (healthScore > 75 ? 4 : -8);
    const deliveryConfidence = confidenceScore;

    return {
      projectId,
      projectName: project.name,
      healthScore,
      healthLevel,
      healthExplanation,
      healthTrendWeek,
      healthTrendMonth,
      deliveryConfidence,
      onTimeProbability,
      budgetOverrunProbability,
      estimatedCompletionDate,
      metrics: {
        timelineProgress,
        taskCompletion,
        skillCoverage,
        avgTeamPerformance,
        budgetUsage,
        resourceConflictCount: overallocatedCount,
        spofCount
      },
      risks: detectedRisks,
      forecast: {
        chanceOfOnTimeDelivery: onTimeProbability,
        chanceOfBudgetOverrun: budgetOverrunProbability,
        futureResourceShortage,
        upcomingSkillGaps: missingSkills,
        estimatedCompletionDate,
        confidenceScore
      }
    };
  }
}

export const projectHealthService = new ProjectHealthService();
