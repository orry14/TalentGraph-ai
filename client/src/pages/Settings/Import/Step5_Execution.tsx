import React, { useEffect, useState } from 'react';
import { api, ValidationResult } from '../../../utils/api';
import { CheckCircle2, ChevronRight, FileText } from 'lucide-react';

interface Step5ExecutionProps {
  dataType: string;
  mapping: Record<string, string>;
  duplicateResolution: string;
  validationResult: ValidationResult;
  onFinish: () => void;
}

export const Step5_Execution: React.FC<Step5ExecutionProps> = ({ 
  dataType, 
  mapping, 
  duplicateResolution, 
  validationResult,
  onFinish
}) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'starting' | 'processing' | 'completed'>('starting');

  useEffect(() => {
    let interval: any;
    
    const runMockImport = async () => {
      setStatus('processing');
      await api.executeImport(dataType, mapping, duplicateResolution);
      
      // Mock progress bar
      let currentProgress = 0;
      interval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress >= 100) {
          setProgress(100);
          setStatus('completed');
          clearInterval(interval);
        } else {
          setProgress(currentProgress);
        }
      }, 300);
    };

    runMockImport();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4">
      <div className="text-center space-y-4 py-8">
        {status !== 'completed' ? (
          <>
            <h3 className="text-2xl font-bold text-[var(--text-primary)]">Importing {dataType}...</h3>
            <p className="text-[15px] text-[var(--text-secondary)]">Please don't close this window while we process your data.</p>
            
            <div className="max-w-md mx-auto mt-8">
              <div className="flex justify-between text-[13px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 bg-[var(--bg-surface-alt)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-3">
                Processing row {Math.floor((progress / 100) * validationResult.validCount)} of {validationResult.validCount}
              </p>
            </div>
          </>
        ) : (
          <div className="animate-in zoom-in-95 space-y-6">
            <div className="w-20 h-20 bg-[var(--green-soft)] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-[var(--green)]" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Import Successful!</h3>
              <p className="text-[15px] text-[var(--text-secondary)] max-w-md mx-auto">
                Your data has been successfully imported and mapped into TalentGraph.
              </p>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-xl max-w-sm mx-auto p-5 text-left">
              <h4 className="font-bold text-[13px] text-[var(--text-secondary)] uppercase tracking-wider mb-4 border-b border-[var(--border-subtle)] pb-2">Import Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[var(--text-primary)]">Data Type</span>
                  <span className="font-bold text-[14px] text-[var(--text-primary)]">{dataType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[var(--text-primary)]">Rows Imported</span>
                  <span className="font-bold text-[14px] text-[var(--green)]">{validationResult.validCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[14px] text-[var(--text-primary)]">Rows Skipped</span>
                  <span className="font-bold text-[14px] text-[var(--text-tertiary)]">{validationResult.errorCount}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => window.location.hash = 'settings'}
                className="px-6 py-2.5 rounded-md font-medium text-[14px] text-[var(--text-primary)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface-alt)] transition-colors border border-[var(--border-strong)] flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> View Import Log
              </button>
              <button
                onClick={onFinish}
                className="bg-[var(--accent)] text-white px-6 py-2.5 rounded-md font-bold text-[14px] hover:bg-[var(--accent-hover)] transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                Go to Workspace <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
