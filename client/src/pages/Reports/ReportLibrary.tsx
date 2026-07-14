import React from 'react';
import {
  Users,
  UserMinus,
  BrainCircuit,
  Briefcase,
  Filter,
  TrendingUp,
  Target,
  FolderGit,
  Network,
  ShieldAlert,
  Activity,
  DollarSign,
  PieChart,
  Calendar,
  Clock,
  FileText,
  ListChecks
} from 'lucide-react';
import { ReportType, ScheduledReport, GeneratedReport } from '../../utils/api';

interface ReportLibraryProps {
  selectedReport: ReportType | null;
  onSelectReport: (type: ReportType) => void;
  scheduledReports: ScheduledReport[];
  generatedReports: GeneratedReport[];
}

export const REPORT_TYPES = {
  Workforce: [
    { id: 'headcount_summary' as ReportType, name: 'Headcount Summary', icon: Users, desc: 'Current headcount by dept, role, location.' },
    { id: 'attrition_report' as ReportType, name: 'Attrition Report', icon: UserMinus, desc: 'Historical & predicted attrition.' },
    { id: 'skill_inventory' as ReportType, name: 'Skill Inventory', icon: BrainCircuit, desc: 'Full org skill matrix & proficiency.' },
    { id: 'bench_utilization' as ReportType, name: 'Bench & Utilization', icon: Briefcase, desc: 'Unallocated staff & bench cost.' },
    { id: 'onboarding_effectiveness' as ReportType, name: 'Onboarding Effectiveness', icon: ListChecks, desc: 'Avg time-to-complete, overdue tasks.' }
  ],
  Recruitment: [
    { id: 'hiring_funnel' as ReportType, name: 'Hiring Funnel', icon: Filter, desc: 'Conversion rates & time-to-hire.' },
    { id: 'drive_performance' as ReportType, name: 'Drive Performance', icon: TrendingUp, desc: 'Per-campaign cost & quality.' },
    { id: 'source_effectiveness' as ReportType, name: 'Source Effectiveness', icon: Target, desc: 'Best channels for hires.' }
  ],
  'Project & Delivery': [
    { id: 'portfolio_health' as ReportType, name: 'Portfolio Health', icon: FolderGit, desc: 'Health score & delivery confidence.' },
    { id: 'staffing_allocation' as ReportType, name: 'Staffing Allocation', icon: Network, desc: 'Who is staffed where at what %.' },
    { id: 'risk_spof' as ReportType, name: 'Risk & SPOF', icon: ShieldAlert, desc: 'Single points of failure & risk.' }
  ],
  'Executive / Financial': [
    { id: 'org_capability' as ReportType, name: 'Org Capability Index', icon: Activity, desc: 'Trend over time with factors.' },
    { id: 'cost_summary' as ReportType, name: 'Cost Summary', icon: DollarSign, desc: 'Combined financial view.' },
    { id: 'board_snapshot' as ReportType, name: 'Board Snapshot', icon: PieChart, desc: 'One-page presentation-ready summary.' }
  ]
};

export const ReportLibrary: React.FC<ReportLibraryProps> = ({
  selectedReport,
  onSelectReport,
  scheduledReports,
  generatedReports
}) => {
  return (
    <div className="w-[280px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-canvas)] overflow-y-auto flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <h2 className="font-semibold text-[16px] text-[var(--text-primary)]">Report Library</h2>
      </div>

      <div className="flex-1 p-3 space-y-6">
        {Object.entries(REPORT_TYPES).map(([category, reports]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2">
              {category}
            </h3>
            <div className="space-y-1">
              {reports.map((report) => {
                const isSelected = selectedReport === report.id;
                const Icon = report.icon;
                return (
                  <button
                    key={report.id}
                    onClick={() => onSelectReport(report.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? 'bg-[var(--bg-surface)] border-[var(--accent)] shadow-sm'
                        : 'bg-transparent border-transparent hover:bg-[var(--bg-surface)] hover:border-[var(--border-default)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'}`} />
                      <span className={`text-[13px] font-medium ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                        {report.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] pl-6 leading-tight">
                      {report.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2">
            Scheduled Reports
          </h3>
          {scheduledReports.map((report) => (
            <div key={report.id} className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[13px] font-medium text-[var(--text-primary)] truncate pr-2">{report.name}</span>
                <span className="text-[10px] uppercase font-bold text-[var(--blue)] bg-[var(--blue-soft)] px-1.5 py-0.5 rounded-sm">
                  {report.frequency}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Next: {new Date(report.nextRun).toLocaleDateString()}
              </p>
            </div>
          ))}
          {scheduledReports.length === 0 && (
            <p className="text-[12px] text-[var(--text-tertiary)] px-2">No scheduled reports.</p>
          )}
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2 pb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2">
            Recently Generated
          </h3>
          {generatedReports.map((report) => (
            <div key={report.id} className="p-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] group cursor-pointer hover:border-[var(--accent)] transition-colors">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[13px] font-medium text-[var(--text-primary)] truncate pr-2">{report.name}</span>
                <FileText className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--accent)]" />
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {new Date(report.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
          {generatedReports.length === 0 && (
            <p className="text-[12px] text-[var(--text-tertiary)] px-2">No recent reports.</p>
          )}
        </div>
      </div>
    </div>
  );
};
