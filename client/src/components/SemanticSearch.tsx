import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Loader2, X } from 'lucide-react';
import { api } from '../utils/api';

interface SemanticSearchResult {
  id: string;
  name: string;
  role: string;
  department: string;
  similarity: number;
}

interface SemanticSearchProps {
  onSelectEmployee: (id: string) => void;
  className?: string;
}

export const SemanticSearch: React.FC<SemanticSearchProps> = ({ onSelectEmployee, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SemanticSearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const data = await api.semanticSearch(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (id: string) => {
    onSelectEmployee(id);
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex items-center">
        <Sparkles className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Semantic search (e.g. 'needs someone good with cloud and microservices')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query) setShowDropdown(true); }}
          className="w-full glass-input pl-9 pr-10 py-2.5 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 border-indigo-500/30 focus:border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all"
        />
        {isSearching ? (
          <Loader2 className="w-4 h-4 text-indigo-400 animate-spin absolute right-3 top-3" />
        ) : query ? (
          <button onClick={() => setQuery('')} className="absolute right-3 top-3">
            <X className="w-4 h-4 text-slate-500 hover:text-slate-300" />
          </button>
        ) : null}
      </div>

      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-slate-900 border border-indigo-500/30 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
          <div className="p-2 bg-indigo-950/20 border-b border-indigo-900/50 flex justify-between items-center">
            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">AI Skill Match Results</span>
            <span className="text-[9px] text-slate-500">Powered by Vector Search</span>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
            {results.length > 0 ? (
              results.map((res) => (
                <button
                  key={res.id}
                  onClick={() => handleSelect(res.id)}
                  className="w-full text-left p-3 hover:bg-slate-800/80 rounded-lg flex justify-between items-center group transition-colors"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">{res.name}</h5>
                    <p className="text-[10px] text-slate-500">{res.role} • {res.department}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-indigo-400">{(res.similarity * 100).toFixed(1)}%</span>
                      <span className="text-[8px] text-slate-500 uppercase">Match</span>
                    </div>
                  </div>
                </button>
              ))
            ) : !isSearching ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching profiles found for this query.
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
