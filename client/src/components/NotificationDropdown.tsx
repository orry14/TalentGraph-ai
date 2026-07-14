import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, UserMinus, ShieldAlert, X } from 'lucide-react';
import { api, Employee, Project } from '../utils/api';

export const NotificationDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [empRes, projRes] = await Promise.all([api.getEmployees(), api.getProjects()]);
        const empArray: any[] = Array.isArray(empRes) ? empRes : (empRes as any).employees || [];
        const employees: Employee[] = empArray;
        const projects = projRes;

        const notifs = [];

        // High Flight Risk Mocking
        employees.forEach((emp: Employee) => {
          if (emp.performanceRating && emp.performanceRating < 3.5) {
            notifs.push({
              id: `risk-${emp.id}`,
              type: 'risk',
              title: 'High Attrition Risk Detected',
              message: `${emp.name} (${emp.role}) is at high flight risk due to low engagement.`,
              time: 'Just now',
              read: false
            });
          }
        });

        // At Risk Projects
        projects.forEach((proj: Project) => {
          if (proj.healthScore && proj.healthScore < 60) {
            notifs.push({
              id: `proj-${proj.id}`,
              type: 'project',
              title: 'Project At Risk',
              message: `${proj.name} health score dropped to ${proj.healthScore}%.`,
              time: '1 hour ago',
              read: false
            });
          }
        });

        // Mocked new candidate (since we don't have real live candidate flow)
        notifs.push({
          id: 'cand-1',
          type: 'candidate',
          title: 'New Candidate Applied',
          message: 'A strong match for "NextGen Core API" has entered the pipeline.',
          time: '2 hours ago',
          read: false
        });

        setNotifications(notifs);
        setUnreadCount(notifs.length);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();

    // Close on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[var(--border-default)] rounded-xl shadow-lg z-50 overflow-hidden font-outfit">
          <div className="px-4 py-3 border-b border-[var(--border-default)] flex justify-between items-center bg-gray-50/50">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-[var(--text-tertiary)]">
                No notifications right now.
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className={`p-4 border-b border-[var(--border-subtle)] hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                  <div className="flex gap-3">
                    <div className="mt-0.5 shrink-0">
                      {notif.type === 'risk' && <UserMinus className="w-4 h-4 text-orange-500" />}
                      {notif.type === 'project' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {notif.type === 'candidate' && <ShieldAlert className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{notif.title}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 font-medium uppercase tracking-wider">{notif.time}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="px-4 py-2 bg-gray-50 border-t border-[var(--border-default)] text-center">
            <button className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
