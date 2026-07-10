import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-800 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-800 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-5/6" />
        <div className="h-3 bg-slate-800 rounded w-4/6" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-6 animate-pulse space-y-4">
      <div className="h-4 bg-slate-800 rounded w-1/4 mb-6" />
      {[1, 2, 3, 4].map(n => (
        <div key={n} className="flex justify-between items-center py-3 border-b border-slate-800/50">
          <div className="h-4 bg-slate-800 rounded w-1/5" />
          <div className="h-4 bg-slate-800 rounded w-1/6" />
          <div className="h-4 bg-slate-800 rounded w-1/8" />
          <div className="h-4 bg-slate-800 rounded w-1/12" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 glass-panel rounded-xl">
          <div className="w-10 h-10 bg-slate-800 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-800 rounded w-1/4" />
            <div className="h-2 bg-slate-800 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};
