import React, { useState } from 'react';
import { Opportunity, api } from '../../utils/api';
import { X, Sparkles } from 'lucide-react';

interface PostOpportunityModalProps {
  onClose: () => void;
  onSubmit: () => void;
}

export const PostOpportunityModal: React.FC<PostOpportunityModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Partial<Opportunity>>({
    title: '',
    projectName: '',
    description: '',
    requiredSkills: [],
    niceToHaveSkills: [],
    timeCommitment: '',
    priorityTag: 'Short-term',
    departmentScope: 'All'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.postOpportunity(formData);
    onSubmit();
  };

  const handleAISuggest = () => {
    setFormData(prev => ({
      ...prev,
      description: "Looking for an engineer to help optimize the backend queries. Should take about 10 hours of work total over the next two weeks. Familiarity with our PostgreSQL setup is required."
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center overflow-y-auto py-10">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Post New Opportunity</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--bg-surface-alt)] rounded-full transition-colors text-[var(--text-secondary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1">Opportunity Title</label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Backend Support for Q3 Launch"
                className="w-full border border-[var(--border-strong)] rounded-md py-2 px-3 text-[14px] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1">Linked Project (Optional)</label>
              <input 
                type="text" 
                value={formData.projectName}
                onChange={e => setFormData({...formData, projectName: e.target.value})}
                placeholder="Select project..."
                className="w-full border border-[var(--border-strong)] rounded-md py-2 px-3 text-[14px] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1">Department Scope</label>
              <select 
                value={formData.departmentScope}
                onChange={e => setFormData({...formData, departmentScope: e.target.value})}
                className="w-full border border-[var(--border-strong)] rounded-md py-2 px-3 text-[14px] focus:outline-none focus:border-[var(--accent)] bg-white"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering Only</option>
                <option value="Sales">Sales Only</option>
                <option value="Marketing">Marketing Only</option>
              </select>
            </div>

            <div className="col-span-2">
              <div className="flex justify-between items-end mb-1">
                <label className="block text-[13px] font-semibold text-[var(--text-primary)]">Description</label>
                <button type="button" onClick={handleAISuggest} className="text-[12px] font-medium text-[var(--accent)] flex items-center gap-1 hover:underline">
                  <Sparkles className="w-3.5 h-3.5"/> Auto-draft from Project
                </button>
              </div>
              <textarea 
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe what the work involves and what success looks like..."
                className="w-full border border-[var(--border-strong)] rounded-md py-2 px-3 text-[14px] focus:outline-none focus:border-[var(--accent)] resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1">Time Commitment</label>
              <input 
                required
                type="text" 
                value={formData.timeCommitment}
                onChange={e => setFormData({...formData, timeCommitment: e.target.value})}
                placeholder="e.g. 20% for 4 weeks"
                className="w-full border border-[var(--border-strong)] rounded-md py-2 px-3 text-[14px] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-[var(--text-primary)] mb-1">Priority Tag</label>
              <select 
                value={formData.priorityTag}
                onChange={e => setFormData({...formData, priorityTag: e.target.value as any})}
                className="w-full border border-[var(--border-strong)] rounded-md py-2 px-3 text-[14px] focus:outline-none focus:border-[var(--accent)] bg-white"
              >
                <option value="Low priority">Low priority</option>
                <option value="Stretch opportunity">Stretch opportunity</option>
                <option value="Short-term">Short-term</option>
                <option value="Backfill needed">Backfill needed</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border-subtle)]">
            <button type="button" onClick={onClose} className="px-4 py-2 font-medium text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] rounded-md transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-[var(--accent)] text-white rounded-md font-medium text-[13px] hover:bg-[var(--accent-hover)] transition-colors shadow-sm">
              Publish Opportunity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
