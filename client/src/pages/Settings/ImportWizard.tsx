import React, { useState } from 'react';
import { api, ParseResult, ValidationResult } from '../../utils/api';
import { Step1_DataType } from './Import/Step1_DataType';
import { Step2_Upload } from './Import/Step2_Upload';
import { Step3_Mapping } from './Import/Step3_Mapping';
import { Step4_Validation } from './Import/Step4_Validation';
import { Step5_Execution } from './Import/Step5_Execution';
import { ChevronRight, X } from 'lucide-react';

export const ImportWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  
  // Wizard State
  const [dataType, setDataType] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [duplicateResolution, setDuplicateResolution] = useState('skip');

  const handleNext = async () => {
    if (step === 2 && file && dataType) {
      // Transitioning to Step 3, need to parse
      const res = await api.parseImportFile(file, dataType);
      setParseResult(res);
      
      // Auto-match some headers mock
      const initialMapping: Record<string, string> = {};
      res.headers.forEach(h => {
        const lower = h.toLowerCase();
        if (lower.includes('name')) initialMapping[h] = 'full_name';
        if (lower.includes('email')) initialMapping[h] = 'email';
        if (lower.includes('dept') || lower.includes('department')) initialMapping[h] = 'department';
        if (lower.includes('title') || lower.includes('role')) initialMapping[h] = 'role';
      });
      setMapping(initialMapping);
    } else if (step === 3 && dataType) {
      // Transitioning to Step 4, need to validate
      setValidationResult(null); // Clear previous
      setStep(4); // Move step immediately so loading state shows
      const res = await api.validateImportMapping(dataType, mapping);
      setValidationResult(res);
      return;
    }
    
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const closeWizard = () => {
    if (window.confirm('Are you sure you want to cancel this import? All progress will be lost.')) {
      window.location.hash = 'settings';
    }
  };

  const STEPS = [
    { num: 1, title: 'Data Type' },
    { num: 2, title: 'Upload' },
    { num: 3, title: 'Map Columns' },
    { num: 4, title: 'Review' },
    { num: 5, title: 'Import' }
  ];

  return (
    <div className="max-w-[1000px] mx-auto p-8 animate-in fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Data Import Wizard</h2>
          <p className="text-[var(--text-secondary)] mt-1">Bring your existing data into TalentGraph seamlessly.</p>
        </div>
        {step < 5 && (
          <button 
            onClick={closeWizard}
            className="p-2 hover:bg-[var(--bg-surface-alt)] rounded-full transition-colors text-[var(--text-secondary)]"
            title="Cancel Import"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-[var(--border-subtle)] z-0"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[var(--accent)] z-0 transition-all duration-500 ease-in-out" 
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((s, idx) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-colors ${
                  isCompleted ? 'bg-[var(--accent)] text-white' :
                  isCurrent ? 'bg-[var(--bg-canvas)] border-2 border-[var(--accent)] text-[var(--accent)]' :
                  'bg-[var(--bg-canvas)] border border-[var(--border-strong)] text-[var(--text-tertiary)]'
                }`}>
                  {s.num}
                </div>
                <span className={`text-[12px] font-semibold uppercase tracking-wider absolute -bottom-6 w-24 text-center ${
                  isCurrent ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
                }`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-default)] p-8 mt-12 min-h-[400px]">
        {step === 1 && (
          <Step1_DataType 
            selectedType={dataType}
            onSelect={setDataType}
            onNext={handleNext}
          />
        )}
        
        {step === 2 && (
          <Step2_Upload 
            dataType={dataType!}
            file={file}
            onUpload={setFile}
            onClear={() => setFile(null)}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {step === 3 && parseResult && (
          <Step3_Mapping 
            parseResult={parseResult}
            mapping={mapping}
            onMappingChange={(header, field) => setMapping(prev => ({ ...prev, [header]: field }))}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {step === 4 && parseResult && (
          <Step4_Validation 
            parseResult={parseResult}
            validationResult={validationResult}
            duplicateResolution={duplicateResolution}
            onDuplicateResolutionChange={setDuplicateResolution}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {step === 5 && validationResult && (
          <Step5_Execution 
            dataType={dataType!}
            mapping={mapping}
            duplicateResolution={duplicateResolution}
            validationResult={validationResult}
            onFinish={() => {
              window.location.hash = dataType?.toLowerCase() === 'projects' ? 'projects' : 'employees';
            }}
          />
        )}
      </div>
    </div>
  );
};
