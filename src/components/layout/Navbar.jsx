import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Camera,
  Search,
  Command,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { getStudentProfile, getTimetableImage } from '../../utils/storage';

export default function Navbar({ onToggleSidebar, onOpenSearch, onNavigate }) {
  const { isDark, toggleTheme } = useTheme();
  const profile = getStudentProfile();
  const hasTimetablePhoto = !!getTimetableImage();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      
      {/* Left: Sidebar Toggle & App Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all active:scale-95"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
            {profile.college || 'My College Attendance'}
          </span>
          {profile.semester && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              {profile.semester}
            </span>
          )}
        </div>
      </div>

      {/* Middle: Quick Search Pill (Desktop) */}
      <div className="hidden md:flex items-center">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-indigo-500/40 transition-all text-xs font-medium w-56 group shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 group-hover:text-indigo-500 transition-colors" />
          <span className="flex-1 text-left">Quick Search...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Timetable Photo Shortcut, Theme Toggle, Profile */}
      <div className="flex items-center gap-2">
        
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Quick Timetable Photo Button */}
        <button
          onClick={() => onNavigate('timetable')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/40 transition-all hover:scale-102 active:scale-95 shadow-2xs"
        >
          <Camera className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden sm:inline">{hasTimetablePhoto ? 'Timetable Pic' : '+ Upload Pic'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all active:scale-95"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Student Avatar Monogram */}
        <button
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 cursor-pointer p-0.5 rounded-xl hover:ring-2 hover:ring-indigo-500/50 transition-all active:scale-95"
          title="Profile & Settings"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-600/20 ring-1 ring-white/20 shrink-0">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'S'}
          </div>
        </button>

      </div>

    </header>
  );
}
