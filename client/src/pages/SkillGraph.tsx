import React from 'react';
import { OrgTwinWorkspace } from '../components/OrgTwinWorkspace';
import { Employee, Project } from '../utils/api';

interface SkillGraphProps {
  employees: Employee[];
  projects: Project[];
}

export const SkillGraph: React.FC<SkillGraphProps> = ({ employees, projects }) => {
  return <OrgTwinWorkspace employees={employees} projects={projects} />;
};
