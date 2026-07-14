import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, Download } from 'lucide-react';

interface Step2UploadProps {
  dataType: string;
  file: File | null;
  onUpload: (f: File) => void;
  onClear: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2_Upload: React.FC<Step2UploadProps> = ({ dataType, file, onUpload, onClear, onBack, onNext }) => {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (newFile: File) => {
    const ext = newFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      alert('Please upload a .csv, .xlsx, or .xls file');
      return;
    }
    onUpload(newFile);
  };

  const handleDownloadTemplate = () => {
    let headers = '';
    let row = '';
    let filename = '';

    switch (dataType.toLowerCase()) {
      case 'employees':
        headers = 'Full Name,Email,Role,Department,Experience Years,Skills,Performance Rating';
        row = 'Jane Doe,jane@example.com,Software Engineer,Engineering,5,"React, Node.js",4.5';
        filename = 'talentgraph_employee_template.csv';
        break;
      case 'candidates':
        headers = 'Full Name,Email,Phone,Applied Role,Source,Status';
        row = 'John Smith,john@example.com,555-0100,Frontend Dev,LinkedIn,Applied';
        filename = 'talentgraph_candidate_template.csv';
        break;
      case 'projects':
        headers = 'Project Name,Client,Status,Budget,Start Date';
        row = 'Website Redesign,Acme Corp,Active,50000,2024-01-01';
        filename = 'talentgraph_project_template.csv';
        break;
      case 'skills':
        headers = 'Email,Skill Name,Proficiency,Last Used';
        row = 'jane@example.com,React,5,2024-03-15';
        filename = 'talentgraph_skills_template.csv';
        break;
      default:
        headers = 'Column1,Column2';
        row = 'Data1,Data2';
        filename = 'talentgraph_template.csv';
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + row;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Upload your {dataType} data</h3>
          <p className="text-[14px] text-[var(--text-secondary)]">Upload a CSV or Excel file containing your records.</p>
        </div>
        <button 
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 text-[13px] font-medium text-[var(--accent)] hover:underline bg-[var(--accent)]/10 px-3 py-1.5 rounded-md"
        >
          <Download className="w-4 h-4" /> Download Template
        </button>
      </div>

      {!file ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
            dragActive ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--border-strong)] hover:bg-[var(--bg-surface-alt)]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-16 h-16 bg-[var(--bg-canvas)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--border-subtle)]">
            <UploadCloud className="w-8 h-8 text-[var(--accent)]" />
          </div>
          <h4 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">Click or drag file to this area to upload</h4>
          <p className="text-[13px] text-[var(--text-secondary)] mb-6">Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.</p>
          
          <input 
            ref={inputRef}
            type="file" 
            accept=".csv, .xlsx, .xls"
            onChange={handleChange}
            className="hidden"
          />
          <button 
            onClick={() => inputRef.current?.click()}
            className="bg-white border border-[var(--border-default)] text-[var(--text-primary)] px-6 py-2 rounded-md font-medium text-[14px] hover:bg-[var(--bg-surface-alt)] transition-colors shadow-sm"
          >
            Browse Files
          </button>
          
          <div className="mt-6 flex justify-center gap-6 text-[12px] text-[var(--text-tertiary)]">
            <span>Max file size: 10MB</span>
            <span>Max rows: 5,000</span>
          </div>
        </div>
      ) : (
        <div className="border border-[var(--border-strong)] rounded-xl p-6 bg-[var(--bg-surface)]">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--green-soft)] rounded-lg text-[var(--green)]">
                <File className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-[15px] text-[var(--text-primary)]">{file.name}</h4>
                <p className="text-[13px] text-[var(--text-secondary)]">{(file.size / 1024).toFixed(1)} KB • Uploaded successfully</p>
              </div>
            </div>
            <button 
              onClick={onClear}
              className="p-2 hover:bg-[var(--red-soft)] hover:text-[var(--red)] rounded-md transition-colors text-[var(--text-secondary)]"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
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
          disabled={!file}
          className="bg-[var(--accent)] text-white px-6 py-2 rounded-md font-medium text-[14px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next Step
        </button>
      </div>
    </div>
  );
};
