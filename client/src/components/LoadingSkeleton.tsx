import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-surface-card border border-border rounded-md p-6 shadow-card animate-pulse space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-surface-sunken rounded-md" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-sunken rounded w-1/3" />
          <div className="h-3 bg-surface-sunken rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-surface-sunken rounded w-full" />
        <div className="h-3 bg-surface-sunken rounded w-5/6" />
        <div className="h-3 bg-surface-sunken rounded w-4/6" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC = () => {
  return (
    <div className="bg-surface-card border border-border rounded-md p-6 shadow-card animate-pulse space-y-4">
      <div className="h-4 bg-surface-sunken rounded w-1/4 mb-6" />
      {[1, 2, 3, 4].map(n => (
        <div key={n} className="flex justify-between items-center py-3 border-b border-border">
          <div className="h-4 bg-surface-sunken rounded w-1/5" />
          <div className="h-4 bg-surface-sunken rounded w-1/6" />
          <div className="h-4 bg-surface-sunken rounded w-1/8" />
          <div className="h-4 bg-surface-sunken rounded w-1/12" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-surface-card border border-border rounded-md shadow-card">
          <div className="w-10 h-10 bg-surface-sunken rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-surface-sunken rounded w-1/4" />
            <div className="h-2 bg-surface-sunken rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};
