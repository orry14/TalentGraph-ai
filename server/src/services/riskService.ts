import { Employee } from '../db/seedData.js';

export interface CapabilityRisk {
  skill: string;
  employee: Employee;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  capabilityImpact: number;
  recommendedAction: string;
  alternativeCandidates: string[];
  flightRiskScore: number;
}

class RiskService {
  /**
   * Identifies Single Points of Failure (SPOF) and capability risks
   */
  public calculateCapabilityRisks(employees: Employee[]): CapabilityRisk[] {
    const risks: CapabilityRisk[] = [];
    
    // 1. Load all employee skills with proficiency >= 4
    const skillMap = new Map<string, Employee[]>();
    
    employees.forEach(employee => {
      employee.technicalSkills.forEach(skill => {
        if (skill.proficiency >= 4) {
          const key = skill.name.toLowerCase();
          if (!skillMap.has(key)) {
            skillMap.set(key, []);
          }
          skillMap.get(key)!.push(employee);
        }
      });
    });

    // 2. Identify SPOFs (only one employee has proficiency >= 4)
    skillMap.forEach((experts, skillName) => {
      if (experts.length === 1) {
        const employee = experts[0];
        
        // 4. Calculate Flight Risk
        // Simulated fields if not present in seed data
        const performanceDecline = 5 - employee.performanceRating; // 0 to 5 scale
        
        // Default to some mock values if DB fields are missing during transition
        // @ts-ignore
        const engagementIndex = employee.engagementIndex ?? 85; 
        const engagementDrop = (100 - engagementIndex) / 20; // 0 to 5 scale approx
        
        // @ts-ignore
        const promotionDateStr = employee.promotionDate ?? new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString();
        const yearsWithoutPromotion = (Date.now() - new Date(promotionDateStr).getTime()) / (1000 * 60 * 60 * 24 * 365);
        
        // Formula: 0.4 × Performance Decline + 0.3 × Years Without Promotion + 0.3 × Engagement Drop
        let flightRiskScore = (0.4 * performanceDecline) + (0.3 * yearsWithoutPromotion) + (0.3 * engagementDrop);
        flightRiskScore = Math.min(Math.max(flightRiskScore, 0), 5); // clamp 0-5
        
        // Risk Levels
        let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'Low';
        if (flightRiskScore >= 4) riskLevel = 'Critical';
        else if (flightRiskScore >= 3) riskLevel = 'High';
        else if (flightRiskScore >= 2) riskLevel = 'Medium';

        // Capability Impact based on how critical the skill is (mocking this based on skill prevalence across org)
        const totalPeopleWithSkill = employees.filter(e => e.technicalSkills.some(s => s.name.toLowerCase() === skillName)).length;
        const capabilityImpact = totalPeopleWithSkill <= 2 ? 5 : 3;

        // Recommended Action
        let recommendedAction = 'Monitor closely';
        if (riskLevel === 'Critical') recommendedAction = 'Immediate knowledge transfer required. Initiate retention discussion.';
        else if (riskLevel === 'High') recommendedAction = 'Upskill backups immediately.';
        else if (riskLevel === 'Medium') recommendedAction = 'Plan cross-training sessions.';

        // Find alternative candidates (people with proficiency 2 or 3 in the skill)
        const alternatives = employees
          .filter(e => e.id !== employee.id && e.technicalSkills.some(s => s.name.toLowerCase() === skillName && s.proficiency >= 2))
          .sort((a, b) => b.performanceRating - a.performanceRating)
          .map(e => e.name)
          .slice(0, 3);

        risks.push({
          // Capitalize skill name based on original
          skill: employee.technicalSkills.find(s => s.name.toLowerCase() === skillName)?.name || skillName,
          employee,
          riskLevel,
          capabilityImpact,
          recommendedAction,
          alternativeCandidates: alternatives.length > 0 ? alternatives : ['External hire recommended'],
          flightRiskScore
        });
      }
    });

    // Sort by risk severity
    return risks.sort((a, b) => b.flightRiskScore - a.flightRiskScore);
  }
}

export const riskService = new RiskService();
