import React, { useState, useEffect } from 'react';
import { Plus, FileBarChart } from 'lucide-react';
import { ReportLibrary, REPORT_TYPES } from './Reports/ReportLibrary';
import { ReportBuilder } from './Reports/ReportBuilder';
import { ReportPreview } from './Reports/ReportPreview';
import { ReportType, ScheduledReport, GeneratedReport, api } from '../utils/api';
import { GlassCard } from '../components/GlassCard';

export const Reports: React.FC = () => {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  
  const [activeFilters, setActiveFilters] = useState<any>(null);
  const [activeFormat, setActiveFormat] = useState<string>('on-screen');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Load scheduled and recent reports on mount
    const loadData = async () => {
      try {
        const [scheduled, generated] = await Promise.all([
          api.getScheduledReports(),
          api.getGeneratedReports()
        ]);
        setScheduledReports(scheduled);
        setGeneratedReports(generated);
      } catch (err) {
        console.error('Failed to load reports sidebar data', err);
      }
    };
    loadData();
  }, []);

  const handleSelectReport = (type: ReportType) => {
    setSelectedReport(type);
    setIsPreviewMode(false);
    setActiveFilters(null);
  };

  const handleGenerate = (filters: any, format: string) => {
    setActiveFilters(filters);
    setActiveFormat(format);
    setIsPreviewMode(true);
    
    // In a real app, this might trigger an actual backend PDF/CSV export if format !== 'on-screen'
    if (format !== 'on-screen') {
      console.log(`Triggering ${format} export...`);
      // api.exportReport(...) could be called here
    }
  };

  const handleSchedule = (filters: any, format: string) => {
    alert('Scheduling logic would open the Settings Automation drawer here.');
  };

  return (
    <div className="flex h-full -m-6">
      {/* Left Rail */}
      <ReportLibrary 
        selectedReport={selectedReport}
        onSelectReport={handleSelectReport}
        scheduledReports={scheduledReports}
        generatedReports={generatedReports}
      />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full bg-[var(--bg-canvas)] overflow-hidden">
        {/* Header Bar */}
        <header className="h-[64px] border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-8 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-[20px] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-[var(--accent)]" />
              Reports
            </h1>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">Generate and export boardroom-ready analytics.</p>
          </div>
          <button 
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-md text-[13px] font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-sm flex items-center gap-1.5"
            onClick={() => handleSelectReport('headcount_summary')}
          >
            <Plus className="w-4 h-4" /> New Report
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {!selectedReport ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] flex items-center justify-center">
                <FileBarChart className="w-8 h-8 text-[var(--text-tertiary)]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">Select a report type to get started</h2>
                <p className="text-[14px] text-[var(--text-secondary)] mt-2">Generate boardroom-ready insights from your workforce data.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-6">
                {REPORT_TYPES['Workforce'].slice(0, 1).map(r => (
                  <GlassCard key={r.id} className="p-4 cursor-pointer hover:border-[var(--accent)] transition-colors" onClick={() => handleSelectReport(r.id)}>
                    <r.icon className="w-6 h-6 text-[var(--blue)] mb-2" />
                    <h3 className="font-medium text-[14px] text-[var(--text-primary)]">{r.name}</h3>
                  </GlassCard>
                ))}
                {REPORT_TYPES['Project & Delivery'].slice(0, 1).map(r => (
                  <GlassCard key={r.id} className="p-4 cursor-pointer hover:border-[var(--accent)] transition-colors" onClick={() => handleSelectReport(r.id)}>
                    <r.icon className="w-6 h-6 text-[var(--purple)] mb-2" />
                    <h3 className="font-medium text-[14px] text-[var(--text-primary)]">{r.name}</h3>
                  </GlassCard>
                ))}
                {REPORT_TYPES['Executive / Financial'].slice(2, 3).map(r => (
                  <GlassCard key={r.id} className="p-4 cursor-pointer hover:border-[var(--accent)] transition-colors" onClick={() => handleSelectReport(r.id)}>
                    <r.icon className="w-6 h-6 text-[var(--amber)] mb-2" />
                    <h3 className="font-medium text-[14px] text-[var(--text-primary)]">{r.name}</h3>
                  </GlassCard>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <ReportBuilder 
                reportType={selectedReport} 
                onGenerate={handleGenerate}
                onSchedule={handleSchedule}
              />
              
              {isPreviewMode && activeFilters && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <ReportPreview 
                    reportType={selectedReport} 
                    filters={activeFilters}
                    format={activeFormat}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
