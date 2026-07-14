import React from 'react';
import { Users, UserSearch, FolderGit, BrainCircuit } from 'lucide-react';

interface Step1DataTypeProps {
  selectedType: string | null;
  onSelect: (type: string) => void;
  onNext: () => void;
}

const DATA_TYPES = [
  { id: 'Employees', icon: Users, desc: 'Names, roles, departments, and basic profile info.' },
  { id: 'Candidates', icon: UserSearch, desc: 'Applicant tracking data, pipelines, and interviews.' },
  { id: 'Projects', icon: FolderGit, desc: 'Project names, statuses, and timeline data.' },
  { id: 'Skills', icon: BrainCircuit, desc: 'Employee skill matrices and proficiency levels.' }
];

export const Step1_DataType: React.FC<Step1DataTypeProps> = ({ selectedType, onSelect, onNext }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">What are you importing?</h3>
        <p className="text-[14px] text-[var(--text-secondary)]">Select the type of data you want to bring into TalentGraph.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DATA_TYPES.map(type => {
          const Icon = type.icon;
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4 ${
                isSelected 
                  ? 'border-[var(--accent)] bg-[var(--accent)]/5' 
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-canvas)] text-[var(--text-secondary)]'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className={`font-bold text-[15px] ${isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>
                  {type.id}
                </h4>
                <p className="text-[13px] text-[var(--text-secondary)] mt-1">{type.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!selectedType}
          className="bg-[var(--accent)] text-white px-6 py-2 rounded-md font-medium text-[14px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};
