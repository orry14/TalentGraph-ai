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
          'bg-surface-card border border-border rounded-md shadow-card p-6 transition-all duration-300 relative',
          hoverGlow && 'hover:border-border-strong hover:shadow-md'
        ),
        className
      )}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
};
