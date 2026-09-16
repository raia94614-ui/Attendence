import React from 'react';
import {
  LayoutDashboard,
  Clock,
  Bot,
  Layers,
  BookOpen,
  CalendarDays,
  Settings
} from 'lucide-react';
import { useRoutineAlert } from '../../context/RoutineAlertContext';

export default function MobileBottomNav({ currentPage, onNavigate }) {
  const { nextUpcomingClass } = useRoutineAlert();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'daily-routine', label: 'Routine', icon: Clock, badge: nextUpcomingClass ? '●' : null },
    { id: 'scan-timetable', label: 'Scan AI', icon: Bot, isAction: true },
    { id: 'timetable', label: 'Timetable', icon: Layers },
    { id: 'subjects', label: 'Subjects', icon: BookOpen }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-1.5 shadow-2xl safe-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
              }`}
            >
              {/* Active Indicator Glow Pill */}
              {isActive && (
                <span className="absolute -top-1.5 w-8 h-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-sm shadow-indigo-500/50" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-indigo-600 dark:text-indigo-400' : ''}`} />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                )}
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[60px]">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
