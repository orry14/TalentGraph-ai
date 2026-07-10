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
          'glass-panel rounded-2xl p-6 transition-all duration-300 relative overflow-hidden',
          glow && 'glass-panel-glow',
          hoverGlow && 'hover:shadow-[0_0_25px_rgba(59,130,246,0.12)] hover:border-blue-500/20'
        ),
        className
      )}
      {...props}
    >
      {/* Decorative top-right background gradient */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
