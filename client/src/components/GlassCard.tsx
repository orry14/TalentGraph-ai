import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
  hoverGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = false,
  hoverGlow = false,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[12px] p-6 shadow-xs transition-all duration-150',
          hoverGlow && 'hover:shadow-sm'
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
