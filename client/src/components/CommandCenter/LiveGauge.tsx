import React from 'react';
import { motion } from 'framer-motion';

export const LiveGauge: React.FC<{ value: number }> = ({ value }) => {
  // Simple SVG semi-circle gauge using framer-motion for the fill
  const radius = 60;
  const circumference = radius * Math.PI;
  const dashoffset = circumference - (value / 100) * circumference;

  const color = value > 90 ? '#ef4444' : value > 75 ? '#3b82f6' : '#10b981';

  return (
    <div className="flex flex-col items-center justify-center relative pt-4">
      <svg className="w-40 h-24" viewBox="0 0 140 80">
        {/* Background track */}
        <path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke="#1e293b"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Animated fill */}
        <motion.path
          d="M 10 70 A 60 60 0 0 1 130 70"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute bottom-0 text-center">
        <motion.span 
          className="text-4xl font-bold text-slate-100"
          key={value}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {value.toFixed(0)}%
        </motion.span>
      </div>
    </div>
  );
};
