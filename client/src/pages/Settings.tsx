import React, { useState, useEffect } from 'react';
import { api, ScheduledReport, ImportLog } from '../utils/api';
import { GlassCard } from '../components/GlassCard';
import { Calendar, Trash2, ShieldAlert, Plus, Check, Download, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'automations' | 'data'>('data');
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [reportType, setReportType] = useState('dashboard');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [recipients, setRecipients] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsData, logsData] = await Promise.all([
        api.getScheduledReports(),
        api.getImportLogs()
      ]);
      setReports(reportsData);
      setImportLogs(logsData);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipients.trim()) return;
    
    setSaving(true);
    setSuccess(false);
    try {
      const recipientList = recipients.split(',').map(email => email.trim()).filter(Boolean);
      await api.createScheduledReport({
        type: reportType as any,
        frequency,
        recipients: recipientList,
        format: 'pdf',
        status: 'active',
        nextRun: new Date().toISOString()
      });
      setSuccess(true);
      setRecipients('');
      fetchData();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to create scheduled report:', err);
      alert('Error creating scheduled report');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this scheduled report?')) return;
    try {
      const deleted = await api.deleteScheduledReport(id);
      if (deleted) {
        setReports(reports.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  const navigateToImportWizard = () => {
    window.location.hash = 'settings-import';
  };

  return (
    <div className="space-y-8 p-8 max-w-[1200px] mx-auto animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Platform Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your workspace configuration and data imports.</p>
      </div>

      <div className="flex border-b border-[var(--border-subtle)] gap-6">
        <button 
          onClick={() => setActiveTab('data')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${activeTab === 'data' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Data & Imports
        </button>
        <button 
          onClick={() => setActiveTab('automations')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${activeTab === 'automations' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          Automations
        </button>
      </div>

      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[var(--bg-surface)] p-6 rounded-xl border border-[var(--border-default)]">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--accent)]" /> Bulk Data Import
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-md">
                Import employees, candidates, and projects from a CSV or Excel file. Our mapping wizard handles standard ATS and HRIS exports.
              </p>
            </div>
            <button 
              onClick={navigateToImportWizard}
              className="bg-[var(--accent)] text-white px-5 py-2.5 rounded-lg font-medium text-[14px] hover:bg-[var(--accent-hover)] transition-colors shadow-sm flex items-center gap-2"
            >
              Start Import Wizard <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <GlassCard className="p-6">
            <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-4">Import History</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">File</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider text-right">Summary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {importLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--bg-canvas)] transition-colors">
                      <td className="px-4 py-4 text-[13px] text-[var(--text-secondary)] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-[13px] text-[var(--text-primary)]">{log.fileName}</p>
                        <p className="text-[11px] text-[var(--text-tertiary)]">by {log.uploadedBy}</p>
                      </td>
                      <td className="px-4 py-4 font-medium text-[13px] text-[var(--text-primary)]">
                        {log.dataType}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          log.status === 'completed' ? 'bg-[var(--green-soft)] text-[var(--green)]' :
                          log.status === 'completed_with_errors' ? 'bg-[var(--amber-soft)] text-[var(--amber)]' :
                          'bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]'
                        }`}>
                          {log.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[13px] font-medium text-[var(--text-primary)]">
                            {log.importedCount} / {log.totalRows} imported
                          </span>
                          {log.failedCount > 0 && (
                            <button className="text-[11px] font-medium text-[var(--red)] flex items-center gap-1 hover:underline">
                              <Download className="w-3 h-3" /> Error Report ({log.failedCount})
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {importLogs.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-secondary)] text-[13px] border border-dashed border-[var(--border-strong)] rounded-xl mt-4">
                        No imports have been processed yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {activeTab === 'automations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Schedule Card */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h3 className="text-md font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                Schedule Automated Report
              </h3>
              
              <form onSubmit={handleCreateReport} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 block">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] py-2.5 px-3 focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="dashboard">Executive Dashboard Summary</option>
                    <option value="employees">Employee Workspace Directory</option>
                    <option value="gap-analysis">Skill Gap Analysis</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 block">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly')}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-xs text-[var(--text-primary)] py-2.5 px-3 focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="weekly">Weekly Export</option>
                    <option value="monthly">Monthly Export</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 block">Recipient Emails</label>
                  <input
                    type="text"
                    placeholder="e.g. manager@workforce.ai, hr@workforce.ai"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    required
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl text-xs py-2.5 px-3 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-blue-500/50"
                  />
                  <span className="text-[12px] text-[var(--text-tertiary)] mt-1 block">Separate multiple emails with commas.</span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {success ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Report Scheduled!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{saving ? 'Scheduling...' : 'Add Schedule'}</span>
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          </div>

          {/* Existing Schedules Table */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <h3 className="text-md font-bold text-[var(--text-primary)] mb-4">Active Automation Schedules</h3>
              
              {loading ? (
                <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">Loading active automations...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-[var(--text-tertiary)] text-sm">No active report schedules configured.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--border-default)] text-[var(--text-tertiary)] uppercase tracking-wider font-semibold">
                        <th className="pb-3">Report</th>
                        <th className="pb-3">Frequency</th>
                        <th className="pb-3">Recipients</th>
                        <th className="pb-3">Next Scheduled Run</th>
                        <th className="pb-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-[var(--text-secondary)]">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-[var(--bg-surface)]/10">
                          <td className="py-4 font-bold text-[var(--text-primary)] capitalize">
                            {report.type.replace('_', ' ')}
                          </td>
                          <td className="py-4 capitalize">
                            {report.frequency}
                          </td>
                          <td className="py-4 font-mono text-[12px]">
                            {report.recipients.join(', ')}
                          </td>
                          <td className="py-4 text-[var(--text-tertiary)]">
                            {new Date(report.nextRun).toLocaleString()}
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1"
                              title="Cancel Schedule"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
