import React, { useState } from 'react';
import { GlassCard } from '../../components/GlassCard';
import { ReportType } from '../../utils/api';
import { Calendar, Filter, Download, Plus, LayoutList, SlidersHorizontal, Settings2, FileText, FileSpreadsheet, Monitor } from 'lucide-react';

interface ReportBuilderProps {
  reportType: ReportType;
  onGenerate: (filters: any, format: string) => void;
  onSchedule: (filters: any, format: string) => void;
}

export const ReportBuilder: React.FC<ReportBuilderProps> = ({ reportType, onGenerate, onSchedule }) => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [department, setDepartment] = useState('All Departments');
  const [format, setFormat] = useState('on-screen');
  const [grouping, setGrouping] = useState('Department');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleGenerate = () => {
    onGenerate({ dateRange, department, grouping }, format);
  };

  return (
    <GlassCard className="p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-[16px] text-[var(--text-primary)] flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-[var(--accent)]" />
          Report Configuration
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Date Range */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Date Range
          </label>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md text-[13px] text-[var(--text-primary)] py-2 px-3 focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Quarter">Quarter</option>
            <option value="YTD">Year to Date</option>
            <option value="Custom">Custom Range...</option>
          </select>
        </div>

        {/* Primary Filter */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Department Filter
          </label>
          <select 
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md text-[13px] text-[var(--text-primary)] py-2 px-3 focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="All Departments">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        {/* Output Format */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" /> Output Format
          </label>
          <div className="flex gap-2">
            {[
              { id: 'on-screen', icon: Monitor, label: 'Preview' },
              { id: 'pdf', icon: FileText, label: 'PDF' },
              { id: 'csv', icon: FileSpreadsheet, label: 'CSV' }
            ].map(fmt => {
              const Icon = fmt.icon;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setFormat(fmt.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-md border text-[12px] font-medium transition-all ${
                    format === fmt.id
                      ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {fmt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5 pt-5 border-t border-[var(--border-subtle)] animate-in slide-in-from-top-2">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
              <LayoutList className="w-3.5 h-3.5" /> Group By
            </label>
            <select 
              value={grouping}
              onChange={(e) => setGrouping(e.target.value)}
              className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md text-[13px] text-[var(--text-primary)] py-2 px-3 focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="Department">Department</option>
              <option value="Role">Role</option>
              <option value="Location">Location</option>
            </select>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[13px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {showAdvanced ? 'Hide advanced filters' : 'More filters'}
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => onSchedule({ dateRange, department, grouping }, format)}
            className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-md text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] transition-colors flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" /> Save Schedule
          </button>
          <button
            onClick={handleGenerate}
            className="px-5 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-md text-[13px] font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <FileText className="w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>
    </GlassCard>
  );
};
