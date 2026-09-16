import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Clock,
  Layers,
  Bot,
  FileText,
  Settings,
  Sparkles,
  X,
  Camera,
  ShieldCheck,
  Smartphone,
  Download
} from 'lucide-react';
import { getStudentProfile } from '../../utils/storage';

export default function Sidebar({
  currentPage,
  onNavigate,
  isCollapsed,
  isOpenMobile,
  onCloseMobile
}) {
  const profile = getStudentProfile();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: CalendarDays },
    { id: 'daily-routine', label: 'Daily Routine', icon: Clock },
    { id: 'timetable', label: 'Timetable', icon: Layers },
    { id: 'scan-timetable', label: 'Scan Timetable', icon: Bot, highlight: true },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 select-none text-slate-100">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            A
          </div>
          {!isCollapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  Attend<span className="text-indigo-400">X</span>
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                  Student
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate">Routine & Attendance</p>
            </div>
          )}
        </div>

        {/* Mobile close */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-slate-400 hover:text-white lg:hidden rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (isOpenMobile) onCloseMobile();
              }}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {!isCollapsed && item.highlight && !isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </button>
          );
        })}

        {/* Download App Shortcut in Nav */}
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-pwa-install'));
            if (isOpenMobile) onCloseMobile();
          }}
          title={isCollapsed ? 'Download App' : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 mt-2 rounded-xl font-semibold text-sm transition-all duration-200 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 border border-emerald-500/20 group ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Smartphone className="w-5 h-5 shrink-0 text-emerald-400 group-hover:scale-110 transition-transform" />
          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1 min-w-0">
              <span className="truncate font-bold">Download App</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                PWA
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Bottom Profile Summary Card */}
      {!isCollapsed && (
        <div
          onClick={() => {
            onNavigate('settings');
            if (isOpenMobile) onCloseMobile();
          }}
          className="p-3 m-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors"
          title="Click to edit profile"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md ring-2 ring-indigo-500/30 shrink-0">
              {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {profile.name || 'My Profile'}
              </p>
              <p className="text-[10px] text-indigo-300 font-mono truncate">
                {profile.rollNumber || 'Tap to edit profile'}
              </p>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Offline Stored
            </span>
            <span className="text-[10px] text-slate-400">v2.0</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-full h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
