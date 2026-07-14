import React, { useState, useEffect } from 'react';
import { api, Employee, ConnectionRequest, AvailabilityPreference } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { 
  Users, MessageCircleQuestion, Search, Filter, ShieldCheck, 
  Clock, Zap, BookOpen, UserCheck, X, Check, ArrowRight
} from 'lucide-react';

export const SkillConnect: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'find' | 'connections' | 'availability'>('find');
  
  // Data State
  const [experts, setExperts] = useState<Employee[]>([]);
  const [requests, setRequests] = useState<{ sent: ConnectionRequest[], received: ConnectionRequest[] }>({ sent: [], received: [] });
  const [availability, setAvailability] = useState<AvailabilityPreference | null>(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [minProficiency, setMinProficiency] = useState<number>(3);
  const [loading, setLoading] = useState(false);

  // Modals
  const [quickConnectModal, setQuickConnectModal] = useState<Employee | null>(null);
  const [mentorshipModal, setMentorshipModal] = useState<Employee | null>(null);
  
  // Form state
  const [message, setMessage] = useState('');
  const [urgency, setUrgency] = useState<'No rush' | 'This week' | 'Blocking me now'>('No rush');
  const [goal, setGoal] = useState('');
  const [cadence, setCadence] = useState<'One-off session' | 'Few sessions' | 'Ongoing'>('Few sessions');

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    try {
      const [reqs, prefs] = await Promise.all([
        api.getConnectionRequests(user.id),
        api.getAvailabilityPreferences(user.id)
      ]);
      setRequests(reqs);
      setAvailability(prefs);
    } catch (err) {
      console.error('Failed to load user skill connect data', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const results = await api.searchSkillExperts(searchQuery, { minProficiency });
      setExperts(results);
    } catch (err) {
      console.error('Failed to search experts', err);
    } finally {
      setLoading(false);
    }
  };

  const submitQuickConnect = async () => {
    if (!quickConnectModal || !user) return;
    try {
      await api.createConnectionRequest({
        requesterId: user.id,
        recipientId: quickConnectModal.id,
        type: 'quick_connect',
        skillId: searchQuery,
        message,
        urgencyTag: urgency
      });
      alert('Quick connect request sent!');
      setQuickConnectModal(null);
      setMessage('');
      loadUserData();
    } catch (err) {
      alert('Failed to send request');
    }
  };

  const submitMentorship = async () => {
    if (!mentorshipModal || !user) return;
    try {
      await api.createConnectionRequest({
        requesterId: user.id,
        recipientId: mentorshipModal.id,
        type: 'mentorship',
        skillId: searchQuery,
        goal,
        cadence
      });
      alert('Mentorship request sent!');
      setMentorshipModal(null);
      setGoal('');
      loadUserData();
    } catch (err) {
      alert('Failed to send request');
    }
  };

  const updateStatus = async (id: string, status: ConnectionRequest['status']) => {
    try {
      await api.updateConnectionRequestStatus(id, status);
      // Optimistically update UI
      setRequests(prev => ({
        ...prev,
        received: prev.received.map(r => r.id === id ? { ...r, status } : r)
      }));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const saveAvailability = async () => {
    if (!availability || !user) return;
    try {
      await api.updateAvailabilityPreferences(user.id, availability);
      alert('Preferences saved!');
    } catch (err) {
      alert('Failed to save preferences');
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in max-w-[1400px] mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Skill Connect</h1>
          <p className="text-[var(--text-secondary)] mt-1">Find the right person, not just the right document.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] gap-6">
        <button 
          onClick={() => setActiveTab('find')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${activeTab === 'find' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4" /> Find an Expert
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('connections')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'connections' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <MessageCircleQuestion className="w-4 h-4" /> My Connections
          {requests.received.filter(r => r.status === 'pending').length > 0 && (
            <span className="bg-[var(--accent)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {requests.received.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('availability')}
          className={`pb-3 text-[14px] font-medium transition-colors border-b-2 ${activeTab === 'availability' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" /> My Availability
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        
        {/* --- FIND AN EXPERT --- */}
        {activeTab === 'find' && (
          <div className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Search by Skill or Tool</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
                    <input 
                      type="text" 
                      className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md pl-10 pr-4 py-2 text-[14px] focus:outline-none focus:border-[var(--accent)]"
                      placeholder="e.g. Kubernetes, GraphQL, Client Negotiation"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                </div>
                <div className="w-48">
                  <label className="block text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Min Proficiency</label>
                  <select 
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--accent)]"
                    value={minProficiency}
                    onChange={e => setMinProficiency(Number(e.target.value))}
                  >
                    <option value={3}>Intermediate (3+)</option>
                    <option value={4}>Advanced (4+)</option>
                    <option value={5}>Expert (5)</option>
                  </select>
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="bg-[var(--accent)] text-white px-6 py-2 rounded-md font-medium text-[14px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experts.map(expert => {
                const targetSkill = expert.technicalSkills.find(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
                return (
                  <GlassCard key={expert.id} className="p-5 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--blue-soft)] text-[var(--blue)] flex items-center justify-center font-bold">
                          {expert.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-bold text-[14px] text-[var(--text-primary)]">{expert.name}</h3>
                          <p className="text-[12px] text-[var(--text-secondary)]">{expert.role}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-[var(--green-soft)] text-[var(--green)] text-[10px] font-bold uppercase">
                        Open Now
                      </span>
                    </div>

                    <div className="bg-[var(--bg-canvas)] rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-[13px] text-[var(--text-primary)]">{targetSkill?.name}</span>
                        <span className="text-[12px] font-bold text-[var(--accent)]">Level {targetSkill?.proficiency}/5</span>
                      </div>
                      {targetSkill?.source === 'github_verified' ? (
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                          <ShieldCheck className="w-3.5 h-3.5 text-[var(--blue)]" /> GitHub-verified
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                          <UserCheck className="w-3.5 h-3.5" /> Self-reported
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setQuickConnectModal(expert)}
                        className="flex items-center justify-center gap-1.5 border border-[var(--accent)] text-[var(--accent)] py-1.5 rounded-md text-[12px] font-bold hover:bg-[var(--accent-soft)] transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5" /> Quick Connect
                      </button>
                      <button 
                        onClick={() => setMentorshipModal(expert)}
                        className="flex items-center justify-center gap-1.5 bg-[var(--accent)] text-white py-1.5 rounded-md text-[12px] font-bold hover:bg-[var(--accent-hover)] transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Mentorship
                      </button>
                    </div>
                  </GlassCard>
                );
              })}
              {searchQuery && !loading && experts.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-[var(--border-default)] rounded-xl bg-[var(--bg-surface)]">
                  <p className="text-[14px] text-[var(--text-secondary)]">No experts found for "{searchQuery}".</p>
                  <button className="mt-3 text-[13px] font-bold text-[var(--accent)] hover:underline">
                    Consider upskilling or hiring for this skill <ArrowRight className="w-3 h-3 inline" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MY CONNECTIONS --- */}
        {activeTab === 'connections' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-4">Requests Received (As Expert)</h3>
              {requests.received.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-secondary)] text-[13px]">
                  No incoming requests right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {requests.received.map(req => (
                    <GlassCard key={req.id} className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${req.type === 'quick_connect' ? 'bg-[var(--amber-soft)] text-[var(--amber)]' : 'bg-[var(--purple-soft)] text-[var(--purple)]'}`}>
                            {req.type.replace('_', ' ')}
                          </span>
                          {req.status === 'pending' && <span className="w-2 h-2 rounded-full bg-[var(--red)] animate-pulse" />}
                        </div>
                        <span className="text-[11px] text-[var(--text-tertiary)]">{new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mb-3">
                        <h4 className="font-bold text-[14px] text-[var(--text-primary)]">
                          {req.requesterName} <span className="text-[var(--text-tertiary)] font-normal text-[12px]">is asking about</span> {req.skillId}
                        </h4>
                        <p className="text-[13px] text-[var(--text-secondary)] mt-2 bg-[var(--bg-canvas)] p-3 rounded-md border border-[var(--border-subtle)]">
                          "{req.message}"
                        </p>
                      </div>
                      
                      {req.status === 'pending' ? (
                        <div className="flex gap-3 mt-4">
                          <button onClick={() => updateStatus(req.id, 'accepted')} className="flex-1 bg-[var(--accent)] text-white py-1.5 rounded text-[13px] font-bold hover:bg-[var(--accent-hover)] transition-colors">
                            Accept & Connect
                          </button>
                          <button onClick={() => updateStatus(req.id, 'declined')} className="px-4 py-1.5 border border-[var(--border-strong)] rounded text-[13px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)] transition-colors">
                            Decline
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                          <span className="text-[12px] font-bold capitalize text-[var(--text-secondary)]">Status: {req.status}</span>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-4">Requests Sent (As Requester)</h3>
              {requests.sent.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-[var(--border-default)] rounded-xl text-[var(--text-secondary)] text-[13px]">
                  You haven't sent any connection requests yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {requests.sent.map(req => (
                    <GlassCard key={req.id} className="p-4 flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[var(--bg-canvas)] border border-[var(--border-default)] flex items-center justify-center font-bold text-[12px] text-[var(--text-secondary)]">
                            {req.recipientName?.slice(0,2) || 'EX'}
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-[var(--text-primary)]">{req.recipientName}</p>
                            <p className="text-[11px] text-[var(--text-tertiary)]">Skill: {req.skillId}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          req.status === 'pending' ? 'bg-[var(--amber-soft)] text-[var(--amber)]' :
                          req.status === 'accepted' ? 'bg-[var(--green-soft)] text-[var(--green)]' :
                          'bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[12px] text-[var(--text-secondary)] line-clamp-2 mt-2">{req.message || req.goal}</p>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- MY AVAILABILITY --- */}
        {activeTab === 'availability' && availability && (
          <div className="max-w-2xl">
            <GlassCard className="p-6 space-y-6">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--text-primary)] mb-1">Availability Preferences</h3>
                <p className="text-[13px] text-[var(--text-secondary)]">Control how you show up in search results for others.</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-surface-alt)] cursor-pointer transition-colors">
                  <div>
                    <p className="font-bold text-[14px] text-[var(--text-primary)]">Open to Quick Questions</p>
                    <p className="text-[12px] text-[var(--text-secondary)]">Allow people to ping you for one-off debugging or advice.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-[var(--accent)]" 
                    checked={availability.openToQuickQuestions}
                    onChange={e => setAvailability({...availability, openToQuickQuestions: e.target.checked})}
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 border border-[var(--border-default)] rounded-lg hover:bg-[var(--bg-surface-alt)] cursor-pointer transition-colors">
                  <div>
                    <p className="font-bold text-[14px] text-[var(--text-primary)]">Open to Mentorship</p>
                    <p className="text-[12px] text-[var(--text-secondary)]">Accept longer-term requests for skill development.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-[var(--accent)]" 
                    checked={availability.openToMentorship}
                    onChange={e => setAvailability({...availability, openToMentorship: e.target.checked})}
                  />
                </label>

                <div>
                  <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1">Weekly Capacity Note (Optional)</label>
                  <input 
                    type="text"
                    className="w-full bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--accent)]"
                    placeholder="e.g. 'Up to 2 hours/week' or 'Busy until Q3'"
                    value={availability.capacityNote}
                    onChange={e => setAvailability({...availability, capacityNote: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end">
                <button 
                  onClick={saveAvailability}
                  className="bg-[var(--accent)] text-white px-6 py-2 rounded-md font-medium text-[14px] hover:bg-[var(--accent-hover)] transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      {quickConnectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-canvas)]">
              <h3 className="font-bold text-[16px] text-[var(--text-primary)] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[var(--accent)]" /> Quick Connect with {quickConnectModal.name.split(' ')[0]}
              </h3>
              <button onClick={() => setQuickConnectModal(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1">What do you need help with? *</label>
                <textarea 
                  className="w-full h-24 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--accent)] resize-none"
                  placeholder="Be specific (e.g., 'I am stuck configuring the AWS load balancer timeout...')"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-2">Urgency</label>
                <div className="flex gap-3">
                  {['No rush', 'This week', 'Blocking me now'].map(level => (
                    <button 
                      key={level}
                      onClick={() => setUrgency(level as any)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium border transition-colors ${urgency === level ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-text)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex justify-end gap-3">
              <button onClick={() => setQuickConnectModal(null)} className="px-4 py-2 font-medium text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
              <button onClick={submitQuickConnect} disabled={!message.trim()} className="bg-[var(--accent)] text-white px-5 py-2 rounded-md font-medium text-[13px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50">
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

      {mentorshipModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-surface)] w-full max-w-lg rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-canvas)]">
              <h3 className="font-bold text-[16px] text-[var(--text-primary)] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accent)]" /> Request Mentorship from {mentorshipModal.name.split(' ')[0]}
              </h3>
              <button onClick={() => setMentorshipModal(null)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1">What are you hoping to learn/achieve? *</label>
                <textarea 
                  className="w-full h-24 bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-[var(--accent)] resize-none"
                  placeholder="e.g. 'I want to level up my system design skills before the Q3 promo cycle...'"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-2">Suggested Cadence</label>
                <div className="flex gap-3">
                  {['One-off session', 'Few sessions', 'Ongoing'].map(level => (
                    <button 
                      key={level}
                      onClick={() => setCadence(level as any)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium border transition-colors flex-1 ${cadence === level ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent-text)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-alt)]'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex justify-end gap-3">
              <button onClick={() => setMentorshipModal(null)} className="px-4 py-2 font-medium text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
              <button onClick={submitMentorship} disabled={!goal.trim()} className="bg-[var(--accent)] text-white px-5 py-2 rounded-md font-medium text-[13px] hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50">
                Send Mentorship Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
