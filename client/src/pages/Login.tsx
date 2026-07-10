import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await login('demo@workforce.ai', 'demo');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden bg-grid-pattern px-4">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-gradient-to-tr from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)] mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="font-outfit font-extrabold text-3xl tracking-tight text-white">TalentGraph</h1>
          <p className="text-slate-400 text-sm mt-2">Workforce Intelligence & AI Capabilities Platform</p>
        </div>

        {/* Card */}
        <div className="glass-panel-glow rounded-3xl p-8 border border-white/5 backdrop-blur-2xl">
          <h2 className="font-outfit font-bold text-xl text-slate-100 mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start space-x-3 text-red-400 text-xs">
              <ShieldAlert className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Corporate Email
              </label>
              <input
                type="email"
                required
                placeholder="alex.rivera@workforce.ai"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full glass-input px-4 py-3 rounded-xl text-sm text-slate-100 placeholder:text-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(59,130,246,0.3)] active:scale-95"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              {!isLoading && <ArrowRight className="w-4.5 h-4.5" />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-900" />
            </div>
            <span className="relative z-10 px-3 bg-slate-950/40 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              Or Explore Instantly
            </span>
          </div>

          {/* Quick Login Button */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-3 bg-slate-900/60 hover:bg-slate-900/90 text-slate-300 border border-slate-800/80 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
          >
            Enter with Quick Demo Account
          </button>

          <div className="mt-6 text-center">
            <span className="text-[10px] text-slate-500 font-medium">
              Demo bypass: uses any email, password: <code className="text-slate-400 bg-slate-900/50 py-0.5 px-1.5 rounded">demo</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
