import React, { useState } from 'react';
import { OnboardingRecord, OnboardingTask, api } from '../../utils/api';
import { GlassCard } from '../../components/GlassCard';
import { ChevronLeft, Calendar, CheckCircle2, Circle, AlertCircle, Clock, MessageSquare, Sparkles } from 'lucide-react';

interface OnboardingTimelineProps {
  record: OnboardingRecord;
  onBack: () => void;
}

const PHASES = ['Before Day 1', 'Week 1', 'Weeks 2-4', 'Days 30/60/90'];

export const OnboardingTimeline: React.FC<OnboardingTimelineProps> = ({ record, onBack }) => {
  const [tasks, setTasks] = useState<OnboardingTask[]>(record.tasks);
  const [buddyId, setBuddyId] = useState(record.buddyId || '');

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Done' ? 'Upcoming' : 'Done';
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t);
    setTasks(updatedTasks);
    // Mock API call
    await api.updateOnboardingTask(record.id, taskId, newStatus);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done': return <CheckCircle2 className="w-5 h-5 text-[var(--green)]" />;
      case 'Overdue': return <AlertCircle className="w-5 h-5 text-[var(--red)]" />;
      case 'Due today': return <Clock className="w-5 h-5 text-[var(--amber)]" />;
      default: return <Circle className="w-5 h-5 text-[var(--border-strong)]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4">
      {/* Header / Back */}
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-2"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <GlassCard className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-4 items-center">
            <div className="relative">
              {/* Circular Progress Ring */}
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="transparent" stroke="var(--bg-surface-alt)" strokeWidth="6" />
                <circle 
                  cx="32" cy="32" r="28" 
                  fill="transparent" 
                  stroke="var(--accent)" 
                  strokeWidth="6" 
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - record.progress / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-[14px] text-[var(--text-primary)]">
                {record.progress}%
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">{record.employeeName}</h2>
              <p className="text-[14px] text-[var(--text-secondary)] mt-1">{record.role} • {record.department}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[12px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Buddy / Mentor</p>
            <select 
              value={buddyId}
              onChange={(e) => setBuddyId(e.target.value)}
              className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md text-[13px] font-medium text-[var(--text-primary)] py-1.5 px-3 pr-8 focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">Assign a buddy...</option>
              <option value="e-102">Alex Rivera</option>
              <option value="e-103">Elena Rostova</option>
              <option value="e-104">Aisha Rahman</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Timeline / Checklist */}
      <div className="space-y-6">
        {PHASES.map((phase, idx) => {
          const phaseTasks = tasks.filter(t => t.phase === phase);
          if (phaseTasks.length === 0) return null;

          return (
            <div key={phase} className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-strong)] flex items-center justify-center font-bold text-[13px] text-[var(--text-secondary)] z-10">
                  {idx + 1}
                </div>
                <h3 className="font-bold text-[16px] text-[var(--text-primary)]">{phase}</h3>
              </div>
              
              {/* Vertical line connecting phases */}
              {idx < PHASES.length - 1 && (
                <div className="absolute left-4 top-8 bottom-[-40px] w-px bg-[var(--border-default)] z-0"></div>
              )}

              <div className="ml-12 space-y-3">
                {phaseTasks.map(task => (
                  <GlassCard 
                    key={task.id}
                    className={`p-3 flex items-center justify-between group transition-all hover:border-[var(--border-strong)] ${
                      task.status === 'Overdue' ? 'border-l-4 border-l-[var(--red)]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleTask(task.id, task.status)}
                        className="focus:outline-none hover:scale-110 transition-transform"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div>
                        <p className={`text-[14px] font-medium ${task.status === 'Done' ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
                          {task.name}
                        </p>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 flex items-center gap-1.5">
                          <span className="bg-[var(--bg-canvas)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">Owner: {task.ownerId}</span>
                          • Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                      task.status === 'Done' ? 'bg-[var(--green-soft)] text-[var(--green)]' :
                      task.status === 'Overdue' ? 'bg-[var(--red-soft)] text-[var(--red)]' :
                      task.status === 'Due today' ? 'bg-[var(--amber-soft)] text-[var(--amber)]' :
                      'bg-[var(--bg-surface-alt)] text-[var(--text-secondary)]'
                    }`}>
                      {task.status}
                    </span>
                  </GlassCard>
                ))}
              </div>
            </div>
          );
        })}

        {/* AI Recommendations */}
        <div className="relative mt-8">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--blue-soft)] border border-[var(--blue)] flex items-center justify-center text-[var(--blue)] z-10">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[16px] text-[var(--blue)]">AI Suggested Additions</h3>
            </div>
            
            <div className="ml-12">
              <GlassCard className="p-4 bg-[var(--blue-soft)]/30 border-[var(--blue)]/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-[14px] text-[var(--text-primary)] mb-1">Schedule a pairing session with Alex Rivera</h4>
                    <p className="text-[13px] text-[var(--text-secondary)]">Alex is the closest skill match on the team for React architecture (92% overlap).</p>
                  </div>
                  <button className="px-3 py-1.5 bg-white border border-[var(--border-default)] rounded-md text-[12px] font-medium hover:bg-gray-50 transition-colors shadow-sm">
                    Add to Timeline
                  </button>
                </div>
              </GlassCard>
            </div>
        </div>

        {/* 30/60/90 Check-in Prompts */}
        <div className="ml-12 mt-8 p-5 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--bg-surface)]">
          <h4 className="font-semibold text-[14px] text-[var(--text-primary)] flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-[var(--text-tertiary)]" /> Scheduled Check-ins
          </h4>
          <p className="text-[13px] text-[var(--text-secondary)] mb-4">
            Automated pulse surveys will be sent to the new hire at 30, 60, and 90 days. Responses will appear here.
          </p>
          <button className="text-[13px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
            Configure Survey Template →
          </button>
        </div>

      </div>
    </div>
  );
};
