import React, { useState, useEffect } from 'react';
import { api, ScheduledReport } from '../utils/api';
import { GlassCard } from '../components/GlassCard';
import { Calendar, Trash2, ShieldAlert, Plus, Check, Settings as SettingsIcon, Bell, Users, Lock, Database } from 'lucide-react';

export const Settings: React.FC = () => {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('automation');
  
  // Form State
  const [reportType, setReportType] = useState('dashboard');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [recipients, setRecipients] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const data = await api.getScheduledReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load scheduled reports:', err);
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
        report_type: reportType,
        frequency,
        recipient_emails: recipientList,
        filters: {} // Generic empty filters for default scheduled reports
      });
      setSuccess(true);
      setRecipients('');
      fetchSchedules();
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

  return (
    <div className="flex gap-8 h-[calc(100vh-140px)]">
      
      {/* Left Navigation Pane */}
      <div className="w-64 shrink-0 flex flex-col space-y-1">
        <h2 className="text-lg font-bold text-text-primary px-3 mb-4">Platform Settings</h2>
        
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'general' ? 'bg-brand-tint text-brand' : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary'
          }`}
        >
          <SettingsIcon className="w-4 h-4" /> General
        </button>
        <button
          onClick={() => setActiveTab('automation')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'automation' ? 'bg-brand-tint text-brand' : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary'
          }`}
        >
          <Calendar className="w-4 h-4" /> Automations & Reports
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'notifications' ? 'bg-brand-tint text-brand' : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary'
          }`}
        >
          <Bell className="w-4 h-4" /> Notifications
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'team' ? 'bg-brand-tint text-brand' : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary'
          }`}
        >
          <Users className="w-4 h-4" /> Team & Roles
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'security' ? 'bg-brand-tint text-brand' : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary'
          }`}
        >
          <Lock className="w-4 h-4" /> Security
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'integrations' ? 'bg-brand-tint text-brand' : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary'
          }`}
        >
          <Database className="w-4 h-4" /> Integrations
        </button>
      </div>

      {/* Right Content Pane */}
      <div className="flex-1 overflow-y-auto pr-2">
        {activeTab === 'automation' ? (
          <div className="space-y-6 max-w-4xl">
            <div>
              <h3 className="text-xl font-bold text-text-primary">Automations & Reports</h3>
              <p className="text-sm text-text-secondary mt-1">Configure scheduled data exports and platform scheduler rules.</p>
            </div>

            <GlassCard className="p-6">
              <h4 className="font-semibold text-sm text-text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand" />
                Schedule Automated Report
              </h4>
              
              <form onSubmit={handleCreateReport} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Report Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full bg-surface-sunken border border-border rounded-md text-xs text-text-primary py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="dashboard">Executive Dashboard Summary</option>
                    <option value="employees">Employee Workspace Directory</option>
                    <option value="gap-analysis">Skill Gap Analysis</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly')}
                    className="w-full bg-surface-sunken border border-border rounded-md text-xs text-text-primary py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <option value="weekly">Weekly Export</option>
                    <option value="monthly">Monthly Export</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 block">Recipient Emails</label>
                  <input
                    type="text"
                    placeholder="e.g. manager@workforce.ai, hr@workforce.ai"
                    value={recipients}
                    onChange={(e) => setRecipients(e.target.value)}
                    required
                    className="w-full bg-surface-sunken border border-border rounded-md text-xs py-2.5 px-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <span className="text-[10px] text-text-muted mt-1.5 block">Separate multiple emails with commas.</span>
                </div>

                <div className="md:col-span-2 mt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-auto px-6 py-2 bg-brand hover:bg-brand-hover text-white rounded-md text-xs font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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
                </div>
              </form>
            </GlassCard>

            <GlassCard className="p-6">
              <h4 className="font-semibold text-sm text-text-primary mb-4">Active Automation Schedules</h4>
              
              {loading ? (
                <div className="text-center py-8 text-text-muted text-sm font-medium">Loading active automations...</div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm font-medium">No active report schedules configured.</div>
              ) : (
                <div className="overflow-x-auto border border-border rounded-md">
                  <table className="w-full text-left text-xs bg-surface-card">
                    <thead className="bg-surface-sunken">
                      <tr className="text-[11px] text-text-secondary uppercase tracking-wider font-semibold border-b border-border">
                        <th className="p-3">Report</th>
                        <th className="p-3">Frequency</th>
                        <th className="p-3">Recipients</th>
                        <th className="p-3">Next Scheduled Run</th>
                        <th className="p-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reports.map((report) => (
                        <tr key={report.id} className="hover:bg-surface-sunken transition-colors">
                          <td className="p-3 font-semibold text-text-primary capitalize">
                            {report.report_type.replace('-', ' ')}
                          </td>
                          <td className="p-3 font-medium text-text-secondary capitalize">
                            {report.frequency}
                          </td>
                          <td className="p-3 font-mono text-[10px] text-text-secondary">
                            {report.recipient_emails.join(', ')}
                          </td>
                          <td className="p-3 font-medium text-text-secondary">
                            {new Date(report.next_run_at).toLocaleString()}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteReport(report.id)}
                              className="text-text-muted hover:text-danger transition-colors p-1"
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
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <SettingsIcon className="w-8 h-8 text-text-muted mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-text-primary">Configuration Pane</h3>
              <p className="text-xs text-text-secondary mt-1">This section is currently under construction.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
