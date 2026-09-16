import React from 'react';
import {
  Menu,
  Sun,
  Moon,
  Camera,
  Search,
  Smartphone,
  Clock,
  PhoneCall
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useRoutineAlert } from '../../context/RoutineAlertContext';
import { getStudentProfile, getTimetableImage } from '../../utils/storage';
import { formatMinutesRemaining } from '../../utils/routineNotifier';

export default function Navbar({ onToggleSidebar, onOpenSearch, onNavigate }) {
  const { isDark, toggleTheme } = useTheme();
  const { nextUpcomingClass, triggerTestAlert } = useRoutineAlert();
  const profile = getStudentProfile();
  const hasTimetablePhoto = !!getTimetableImage();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      
      {/* Left: Sidebar Toggle, App Title & Next Class Live Pill */}
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
            {profile.college || 'My Attendance'}
          </span>
          {profile.semester && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              {profile.semester}
            </span>
          )}
        </div>

        {/* Live Next Class Pill */}
        {nextUpcomingClass && (
          <button
            type="button"
            onClick={() => onNavigate('timetable')}
            className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-102 active:scale-95 shadow-2xs ${
              nextUpcomingClass.state === 'live'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 ring-1 ring-rose-500/20'
                : nextUpcomingClass.diffMinutes <= 15
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 animate-pulse'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}
            title="Click to view routine schedule"
          >
            {nextUpcomingClass.state === 'live' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>Live Now: {nextUpcomingClass.subjectName}</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>In {formatMinutesRemaining(nextUpcomingClass.diffMinutes)}: {nextUpcomingClass.subjectName}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Middle: Quick Search Pill (Desktop) */}
      <div className="hidden md:flex items-center">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-indigo-500/40 transition-all text-xs font-medium w-52 lg:w-56 group shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 group-hover:text-indigo-500 transition-colors" />
          <span className="flex-1 text-left">Quick Search...</span>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Download App, Timetable Photo Shortcut, Theme Toggle, Profile */}
      <div className="flex items-center gap-2">
        
        {/* Mobile Search Icon */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Test Class Call Alert / Alarm Button */}
        <button
          type="button"
          onClick={triggerTestAlert}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold transition-all hover:scale-102 active:scale-95 shadow-2xs"
          title="Test 5-Minute Class Call Alarm with ringtone and speech"
        >
          <PhoneCall className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden lg:inline">Test Call Alert</span>
        </button>

        {/* Download App on Phone / Desktop Button */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all hover:scale-102 active:scale-95 shadow-2xs"
          title="Download & Install App on Phone"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Download App</span>
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
