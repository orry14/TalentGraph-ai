import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LiveGauge } from '../components/CommandCenter/LiveGauge';
import { AlertsFeed } from '../components/CommandCenter/AlertsFeed';
import { LiveGraph } from '../components/CommandCenter/LiveGraph';
import { SimulatePanel } from '../components/CommandCenter/SimulatePanel';
import { api } from '../utils/api';
import { AlertCircle, Activity, DollarSign, Users } from 'lucide-react';

interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
}

export const CommandCenter: React.FC = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState({
    headcount: 0,
    utilization: 0,
    benchCost: 0
  });

  useEffect(() => {
    // Initial fetch to seed data
    const fetchInitialData = async () => {
      try {
        const dashboardStats = await api.getDashboardStats();
        setStats({
          headcount: dashboardStats.totalEmployees || 0,
          utilization: dashboardStats.predictiveAnalytics?.benchUtilizationForecast || 85,
          benchCost: (dashboardStats as any).benchCostAnalysis?.totalBenchCost || 120000
        });
      } catch (e) {
        console.error("Failed to load initial data for Command Center", e);
      }
    };
    fetchInitialData();

    // Setup Socket.io connection
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to Command Center live feed');
    });

    socketInstance.on('staffing_update', (data) => {
      addAlert('Staffing Change', 'medium', `Staffing updated for employee ${data.employeeId} on project ${data.projectId}`);
      // Slight randomization for demo purposes
      setStats(prev => ({ ...prev, utilization: Math.min(100, Math.max(0, prev.utilization + (data.type === 'add' ? 1 : -1))) }));
    });

    socketInstance.on('risk_alert', (data) => {
      addAlert(data.type, data.severity, data.message);
    });

    socketInstance.on('spof_alert', (data) => {
      addAlert('SPOF Detected', 'high', data.message);
    });

    socketInstance.on('cost_update', (data) => {
      setStats(prev => ({ ...prev, benchCost: data.benchCost }));
    });

    socketInstance.on('simulation_event', (data) => {
      addAlert('Simulation Event', 'high', data.message);
      // Simulate cascading metric effects
      setStats(prev => ({
        ...prev,
        utilization: prev.utilization - 2,
        benchCost: prev.benchCost + 5000
      }));
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const addAlert = (type: string, severity: 'low' | 'medium' | 'high', message: string) => {
    setAlerts(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type,
      severity,
      message,
      timestamp: new Date()
    }, ...prev].slice(0, 10)); // Keep last 10 alerts
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6 overflow-hidden">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            Workforce Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live Telemetry Active
          </p>
        </div>
        
        {user?.role === 'admin' && (
          <SimulatePanel />
        )}
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1">
        {/* Left Column: Gauges and Metrics */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Global Utilization
            </h3>
            <LiveGauge value={stats.utilization} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1">
                <Users className="w-3 h-3" /> Headcount
              </h3>
              <p className="text-2xl font-semibold text-slate-200">{stats.headcount}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
              <h3 className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-red-400" /> Bench Cost
              </h3>
              <p className="text-xl font-semibold text-red-400">${stats.benchCost.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 backdrop-blur-sm overflow-hidden flex flex-col">
            <h3 className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Live Alerts Feed
            </h3>
            <AlertsFeed alerts={alerts} />
          </div>
        </div>

        {/* Right Column: Network Graph */}
        <div className="col-span-12 lg:col-span-9 bg-slate-900/30 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[size:32px_32px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent z-10 pointer-events-none"></div>
          
          <LiveGraph updateTrigger={alerts.length} />
          
          <div className="absolute bottom-6 left-6 z-20">
            <h3 className="text-xl font-semibold text-slate-200">Talent Network Topology</h3>
            <p className="text-slate-400 text-sm">Real-time connection mapping</p>
          </div>
        </div>
      </div>
    </div>
  );
};
