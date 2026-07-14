import React from 'react';
import { ValidationResult, ParseResult } from '../../../utils/api';
import { CheckCircle2, AlertTriangle, XCircle, Download } from 'lucide-react';

interface Step4ValidationProps {
  parseResult: ParseResult;
  validationResult: ValidationResult | null;
  duplicateResolution: string;
  onDuplicateResolutionChange: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step4_Validation: React.FC<Step4ValidationProps> = ({ 
  parseResult, 
  validationResult, 
  duplicateResolution, 
  onDuplicateResolutionChange, 
  onBack, 
  onNext 
}) => {
  if (!validationResult) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[14px] font-medium text-[var(--text-secondary)]">Validating {parseResult.rowCount} rows against TalentGraph schema...</p>
      </div>
    );
  }

  const hasBlockingErrors = validationResult.errorCount > 0;

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4">
      <div>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Review & Validate</h3>
        <p className="text-[14px] text-[var(--text-secondary)]">
          We've checked your data. Review the summary below before starting the import.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--green-soft)] border border-[var(--green)] p-5 rounded-xl flex flex-col items-center text-center">
          <CheckCircle2 className="w-8 h-8 text-[var(--green)] mb-2" />
          <h4 className="text-2xl font-bold text-[var(--text-primary)]">{validationResult.validCount}</h4>
          <p className="text-[13px] font-medium text-[var(--green)]">Ready to import</p>
        </div>
        
        <div className="bg-[var(--amber-soft)] border border-[var(--amber)] p-5 rounded-xl flex flex-col items-center text-center">
          <AlertTriangle className="w-8 h-8 text-[var(--amber)] mb-2" />
          <h4 className="text-2xl font-bold text-[var(--text-primary)]">{validationResult.warningCount}</h4>
          <p className="text-[13px] font-medium text-[var(--amber)]">Warnings (Will import)</p>
        </div>

        <div className="bg-[var(--red-soft)] border border-[var(--red)] p-5 rounded-xl flex flex-col items-center text-center">
          <XCircle className="w-8 h-8 text-[var(--red)] mb-2" />
          <h4 className="text-2xl font-bold text-[var(--text-primary)]">{validationResult.errorCount}</h4>
          <p className="text-[13px] font-medium text-[var(--red)]">Errors (Will be skipped)</p>
        </div>
      </div>

      {validationResult.duplicateCount > 0 && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] p-5 rounded-xl space-y-3">
          <h4 className="font-bold text-[15px] text-[var(--text-primary)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[var(--amber)]" />
            Duplicate Detection
          </h4>
          <p className="text-[13px] text-[var(--text-secondary)]">
            We found <strong>{validationResult.duplicateCount} rows</strong> that match existing records based on email address. How would you like to handle them?
          </p>
          <select 
            value={duplicateResolution}
            onChange={(e) => onDuplicateResolutionChange(e.target.value)}
            className="w-full md:w-auto border border-[var(--border-strong)] rounded-md py-2 px-3 text-[14px] focus:outline-none focus:border-[var(--accent)] bg-white font-medium"
          >
            <option value="skip">Skip duplicates (keep existing data)</option>
            <option value="overwrite">Overwrite existing records with new data</option>
          </select>
        </div>
      )}

      {hasBlockingErrors && (
        <div className="bg-[var(--bg-surface)] border border-[var(--red)] rounded-xl overflow-hidden">
          <div className="p-4 bg-[var(--red-soft)] border-b border-[var(--red)] flex justify-between items-center">
            <h4 className="font-bold text-[14px] text-[var(--red)]">Rows with blocking errors ({validationResult.errorCount})</h4>
            <button className="text-[12px] font-bold text-[var(--red)] hover:underline flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Download Error Report
            </button>
          </div>
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-white border-b border-[var(--border-subtle)] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                <th className="px-4 py-2 w-24">Row</th>
                <th className="px-4 py-2">Error Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {validationResult.errors.map((err, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="px-4 py-2 font-mono text-[var(--text-secondary)]">#{err.row}</td>
                  <td className="px-4 py-2 text-[var(--red)] font-medium">{err.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 bg-white text-[12px] text-[var(--text-secondary)] italic">
            Note: These rows will be skipped during import. You can fix them in the downloaded error report and run a second import later.
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 border-t border-[var(--border-subtle)]">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-md font-medium text-[14px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors border border-[var(--border-default)]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="bg-[var(--accent)] text-white px-6 py-2 rounded-md font-medium text-[14px] hover:bg-[var(--accent-hover)] transition-colors shadow-sm"
        >
          {validationResult.errorCount > 0 ? 'Skip Errors & Proceed' : 'Proceed to Import'}
        </button>
      </div>
    </div>
  );
};
