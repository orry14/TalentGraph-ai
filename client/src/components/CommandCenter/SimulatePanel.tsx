import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { api } from '../../utils/api'; // assuming api has a generic post, or I can use fetch

export const SimulatePanel: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const triggerSimulation = async () => {
    if (!window.confirm("Trigger demo simulation event?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/simulate-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          eventType: 'demo',
          message: 'CRITICAL: Senior React Developer Resigned (Simulation)',
          payload: { employeeId: 'demo-123' }
        })
      });
    } catch (e) {
      console.error(e);
      alert('Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={triggerSimulation}
      disabled={loading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
      title="Inject a fake event to demo the live dashboard updates"
    >
      <PlayCircle className="w-4 h-4" />
      {loading ? 'Simulating...' : 'Simulate Demo Event'}
    </button>
  );
};
