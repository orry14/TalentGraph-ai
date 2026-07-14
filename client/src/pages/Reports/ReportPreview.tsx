import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquare, Link as LinkIcon, Mail, Download, Building, AlertCircle } from 'lucide-react';
import { ReportType, api } from '../../utils/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ReportPreviewProps {
  reportType: ReportType;
  filters: any;
  format: string;
}

const REPORT_CONFIG: Record<string, any> = {
  headcount_summary: {
    kpis: [
      { label: 'Total Headcount', value: '1,245', trend: '+4.2% vs last', trendColor: 'text-green-600' },
      { label: 'Engineering %', value: '45%', trend: '+1.1% vs last', trendColor: 'text-green-600' },
      { label: 'Avg Tenure', value: '3.2 yrs', trend: '-0.1 yrs vs last', trendColor: 'text-amber-600' }
    ],
    chartType: 'Bar',
    chartDataKey: 'headcount',
    chartColor: '#3b82f6',
    chartTitle: 'Headcount by Department',
    data: [
      { name: 'Engineering', headcount: 560 },
      { name: 'Product', headcount: 120 },
      { name: 'Design', headcount: 80 },
      { name: 'Sales', headcount: 310 },
      { name: 'Marketing', headcount: 175 }
    ]
  },
  attrition_report: {
    kpis: [
      { label: 'Voluntary Attrition', value: '4.8%', trend: '-0.5% vs last', trendColor: 'text-green-600' },
      { label: 'Involuntary Attrition', value: '2.1%', trend: '+0.2% vs last', trendColor: 'text-red-600' },
      { label: 'Predicted Risk', value: 'High', trend: 'In 3 Depts', trendColor: 'text-red-600' }
    ],
    chartType: 'Area',
    chartDataKey: 'rate',
    chartColor: '#ef4444',
    chartTitle: 'Historical Attrition Trend (%)',
    data: [
      { name: 'Q1', rate: 3.2 },
      { name: 'Q2', rate: 4.1 },
      { name: 'Q3', rate: 5.5 },
      { name: 'Q4', rate: 4.8 }
    ]
  },
  bench_utilization: {
    kpis: [
      { label: 'Avg Utilization', value: '82%', trend: '-3% vs last', trendColor: 'text-red-600' },
      { label: 'Current Bench', value: '45', trend: '+12 vs last', trendColor: 'text-red-600' },
      { label: 'Bench Cost', value: '$850k', trend: '+$120k vs last', trendColor: 'text-red-600' }
    ],
    chartType: 'Area',
    chartDataKey: 'utilization',
    chartColor: '#10b981',
    chartTitle: 'Utilization Rate Trend (%)',
    data: [
      { name: 'Jan', utilization: 88 },
      { name: 'Feb', utilization: 85 },
      { name: 'Mar', utilization: 86 },
      { name: 'Apr', utilization: 82 },
      { name: 'May', utilization: 84 }
    ]
  },
  portfolio_health: {
    kpis: [
      { label: 'Active Projects', value: '34', trend: '+2 vs last', trendColor: 'text-green-600' },
      { label: 'At Risk', value: '4', trend: '-1 vs last', trendColor: 'text-green-600' },
      { label: 'Avg Health Score', value: '92/100', trend: 'Stable', trendColor: 'text-gray-600' }
    ],
    chartType: 'Bar',
    chartDataKey: 'projects',
    chartColor: '#8b5cf6',
    chartTitle: 'Projects by Health Status',
    data: [
      { name: 'Excellent', projects: 18 },
      { name: 'Healthy', projects: 12 },
      { name: 'Warning', projects: 3 },
      { name: 'Critical', projects: 1 }
    ]
  },
  org_capability: {
    kpis: [
      { label: 'Capability Index', value: '83%', trend: '+2% vs last', trendColor: 'text-green-600' },
      { label: 'Skill Gap Density', value: '14%', trend: '-1% vs last', trendColor: 'text-green-600' },
      { label: 'Learning Velocity', value: 'High', trend: 'Top 10%', trendColor: 'text-green-600' }
    ],
    chartType: 'Area',
    chartDataKey: 'score',
    chartColor: '#f59e0b',
    chartTitle: 'Capability Index Trend',
    data: [
      { name: 'Q1', score: 78 },
      { name: 'Q2', score: 79 },
      { name: 'Q3', score: 81 },
      { name: 'Q4', score: 83 }
    ]
  },
  onboarding_effectiveness: {
    kpis: [
      { label: 'Avg Time-to-Productive', value: '42 Days', trend: '-3 days vs last', trendColor: 'text-green-600' },
      { label: 'Overdue Task Rate', value: '8.4%', trend: '+1.2% vs last', trendColor: 'text-red-600' },
      { label: 'Check-in Sentiment', value: 'Positive', trend: 'Stable', trendColor: 'text-gray-600' }
    ],
    chartType: 'Bar',
    chartDataKey: 'days',
    chartColor: '#8b5cf6',
    chartTitle: 'Avg Onboarding Completion Time by Dept',
    data: [
      { name: 'Engineering', days: 45 },
      { name: 'Sales', days: 30 },
      { name: 'Marketing', days: 28 },
      { name: 'Product', days: 40 },
      { name: 'Design', days: 35 }
    ]
  }
};

const DEFAULT_CONFIG = {
  kpis: [
    { label: 'Metric 1', value: '1,245', trend: '↑ 4.2% vs last', trendColor: 'text-green-600' },
    { label: 'Metric 2', value: '84.5%', trend: '↑ 1.1% vs last', trendColor: 'text-green-600' },
    { label: 'Metric 3', value: '$2.4M', trend: '↓ 0.5% vs last', trendColor: 'text-red-600' }
  ],
  chartType: 'Area',
  chartDataKey: 'value',
  chartColor: '#3b82f6',
  chartTitle: 'Trend Analysis',
  data: [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 550 },
    { name: 'Apr', value: 480 },
    { name: 'May', value: 600 }
  ]
};


export const ReportPreview: React.FC<ReportPreviewProps> = ({ reportType, filters, format }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loadingAnswer, setLoadingAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = REPORT_CONFIG[reportType] || DEFAULT_CONFIG;

  useEffect(() => {
    let isMounted = true;
    const fetchSummary = async () => {
      setLoadingSummary(true);
      setError(null);
      try {
        const res = await api.generateReportSummary(reportType, filters);
        if (isMounted) setSummary(res.summary);
      } catch (err: any) {
        if (isMounted) setError('Summary unavailable');
      } finally {
        if (isMounted) setLoadingSummary(false);
      }
    };
    fetchSummary();
    return () => { isMounted = false; };
  }, [reportType, filters]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoadingAnswer(true);
    setAnswer(null);
    try {
      const res = await api.askReportQuestion(reportType, question, filters);
      setAnswer(res.answer);
    } catch (err) {
      setAnswer('Sorry, I could not generate an answer at this time.');
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <div className="bg-white border border-[var(--border-strong)] shadow-sm max-w-4xl mx-auto min-h-[800px] flex flex-col font-sans text-gray-800">
      {/* Printable Page Wrapper */}
      <div className="p-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-gray-900 p-1.5 rounded text-white"><Building className="w-5 h-5" /></div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">TalentGraph Inc.</h1>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">{reportType.replace(/_/g, ' ')}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filters.dateRange} • {filters.department}
            </p>
          </div>
          <div className="text-right text-sm text-gray-500 space-y-1">
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p>By: Current User</p>
          </div>
        </div>

        {/* AI Summary Block */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-5 mb-8">
          <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" /> Executive Summary
          </h3>
          {loadingSummary ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                <div className="h-2 bg-blue-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-sm text-amber-600 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {error}</div>
          ) : (
            <p className="text-sm text-blue-800 leading-relaxed">{summary}</p>
          )}
        </div>

        {/* Dynamic KPI Strip */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {config.kpis.map((kpi: any, idx: number) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              <p className={`text-xs font-medium mt-1 ${kpi.trendColor}`}>{kpi.trend}</p>
            </div>
          ))}
        </div>

        {/* Dynamic Main Content Area (Chart) */}
        <div className="flex-1 border border-gray-200 rounded-lg p-6 mb-8 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">{config.chartTitle}</h3>
          <div className="h-[300px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              {config.chartType === 'Area' ? (
                <AreaChart data={config.data}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey={config.chartDataKey} stroke={config.chartColor} fill={`${config.chartColor}33`} strokeWidth={2} />
                </AreaChart>
              ) : (
                <BarChart data={config.data}>
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey={config.chartDataKey} fill={config.chartColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ask AI Box */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <form onSubmit={handleAsk} className="flex gap-2">
            <div className="relative flex-1">
              <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question about this report (e.g., What caused the sudden spike?)"
                className="w-full bg-white border border-gray-300 rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingAnswer || !question.trim()}
              className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {loadingAnswer ? 'Thinking...' : 'Ask AI'}
            </button>
          </form>
          {answer && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-900">
              <div className="font-semibold mb-1 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5"/> Answer</div>
              {answer}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
          <p>Confidential & Proprietary</p>
          <p>Powered by TalentGraph Intelligence</p>
          <p>Page 1 of 1</p>
        </div>
      </div>

      {/* Floating Action Bar (not printed) */}
      <div className="bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] p-4 flex justify-between items-center print:hidden">
        <p className="text-[13px] text-[var(--text-secondary)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span> Live Preview ({format})
        </p>
        <div className="flex gap-2">
          <button onClick={() => alert('Share Link generated and copied to clipboard!')} className="px-3 py-1.5 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] flex items-center gap-1.5 transition-colors">
            <LinkIcon className="w-4 h-4" /> Share Link
          </button>
          <button onClick={() => alert('Email composer opened with PDF attached.')} className="px-3 py-1.5 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-alt)] flex items-center gap-1.5 transition-colors">
            <Mail className="w-4 h-4" /> Email PDF
          </button>
          <button onClick={() => alert('Exporting report as PDF...')} className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-md text-[13px] font-medium hover:bg-[var(--accent-hover)] flex items-center gap-1.5 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>
    </div>
  );
};
