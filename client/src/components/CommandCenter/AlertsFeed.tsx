import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Zap } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
}

export const AlertsFeed: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  
  const getIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'medium': return <Zap className="w-5 h-5 text-amber-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-900/50 bg-red-950/20';
      case 'medium': return 'border-amber-900/50 bg-amber-950/20';
      default: return 'border-blue-900/50 bg-blue-950/20';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
      <AnimatePresence>
        {alerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-slate-500 text-sm text-center py-4"
          >
            Awaiting events...
          </motion.div>
        )}
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`p-3 rounded-lg border flex gap-3 ${getBorderColor(alert.severity)}`}
          >
            <div className="mt-0.5">
              {getIcon(alert.severity)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">{alert.type}</h4>
              <p className="text-xs text-slate-400 mt-1">{alert.message}</p>
              <span className="text-[10px] text-slate-500 mt-2 block">
                {alert.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
