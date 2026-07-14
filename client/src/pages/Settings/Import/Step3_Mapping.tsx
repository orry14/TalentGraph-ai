import React from 'react';
import { ParseResult } from '../../../utils/api';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface Step3MappingProps {
  parseResult: ParseResult;
  mapping: Record<string, string>;
  onMappingChange: (header: string, field: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const TALENTGRAPH_FIELDS = [
  { id: 'skip', label: 'Skip this column', group: 'Actions' },
  { id: 'custom', label: 'Add as custom field', group: 'Actions' },
  { id: 'full_name', label: 'Full Name', group: 'Required', req: true },
  { id: 'email', label: 'Email Address', group: 'Required', req: true },
  { id: 'department', label: 'Department', group: 'Optional' },
  { id: 'role', label: 'Job Role / Title', group: 'Optional' },
  { id: 'start_date', label: 'Start Date', group: 'Optional' },
  { id: 'location', label: 'Location', group: 'Optional' },
];

export const Step3_Mapping: React.FC<Step3MappingProps> = ({ parseResult, mapping, onMappingChange, onBack, onNext }) => {
  
  // Check if required fields are mapped (mock logic assuming Employees type for now)
  const mappedValues = Object.values(mapping);
  const hasName = mappedValues.includes('full_name');
  const hasEmail = mappedValues.includes('email');
  const canProceed = hasName && hasEmail;

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Map your columns</h3>
        <p className="text-[14px] text-[var(--text-secondary)]">
          We've auto-matched fields where possible. Please review and map the remaining columns to TalentGraph fields.
        </p>
      </div>

      {!canProceed && (
        <div className="bg-[var(--amber-soft)] border border-[var(--amber)] p-4 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--amber)] shrink-0" />
          <p className="text-[13px] text-[var(--amber)] font-medium">
            You must map the required fields (<strong className="font-bold">Full Name</strong> and <strong className="font-bold">Email Address</strong>) before continuing.
          </p>
        </div>
      )}

      <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)]">
              <th className="px-4 py-3 text-[13px] font-semibold text-[var(--text-primary)] w-[45%]">Your Column Header</th>
              <th className="px-4 py-3 w-[10%] text-center"></th>
              <th className="px-4 py-3 text-[13px] font-semibold text-[var(--text-primary)] w-[45%]">TalentGraph Field</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {parseResult.headers.map(header => (
              <tr key={header} className="hover:bg-[var(--bg-canvas)] transition-colors">
                <td className="px-4 py-4">
                  <span className="font-medium text-[14px] text-[var(--text-primary)] bg-[var(--bg-canvas)] border border-[var(--border-default)] px-3 py-1.5 rounded-md inline-block">
                    {header}
                  </span>
                  <div className="text-[12px] text-[var(--text-tertiary)] mt-2">
                    Sample: <span className="italic">"{parseResult.previewData[0]?.[header]}"</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center text-[var(--text-tertiary)]">
                  <ArrowRight className="w-4 h-4 mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <select
                    value={mapping[header] || ''}
                    onChange={e => onMappingChange(header, e.target.value)}
                    className={`w-full border rounded-md py-2 px-3 text-[14px] focus:outline-none focus:border-[var(--accent)] ${
                      mapping[header] ? 'bg-white border-[var(--border-strong)] text-[var(--text-primary)]' : 'bg-[var(--red-soft)] border-[var(--red)] text-[var(--red)]'
                    }`}
                  >
                    <option value="" disabled>Select a field...</option>
                    <optgroup label="Actions">
                      {TALENTGRAPH_FIELDS.filter(f => f.group === 'Actions').map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Required Fields">
                      {TALENTGRAPH_FIELDS.filter(f => f.group === 'Required').map(f => (
                        <option key={f.id} value={f.id}>{f.label} *</option>
                      ))}
                    </optgroup>
                    <optgroup label="Optional Fields">
                      {TALENTGRAPH_FIELDS.filter(f => f.group === 'Optional').map(f => (
                        <option key={f.id} value={f.id}>{f.label}</option>
                      ))}
                    </optgroup>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between pt-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-md font-medium text-[14px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors border border-[var(--border-default)]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-[var(--accent)] text-white px-6 py-2 rounded-md font-medium text-[14px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};
