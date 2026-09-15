import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Save,
  ShieldCheck,
  Building,
  GraduationCap,
  Trash2,
  AlertTriangle,
  RotateCcw,
  Smartphone,
  Download,
  Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
  getStudentProfile,
  saveStudentProfile,
  getSettings,
  saveSettings,
  clearAllData
} from '../utils/storage';

export default function SettingsPage() {
  const toast = useToast();

  const [profile, setProfile] = useState(getStudentProfile());
  const [settings, setSettings] = useState(getSettings());
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const loadData = () => {
    setProfile(getStudentProfile());
    setSettings(getSettings());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    saveStudentProfile(profile);
    saveSettings(settings);
    toast.success('Profile and settings saved successfully!');
  };

  const handleClearAll = () => {
    clearAllData();
    loadData();
    toast.success('All student data & subjects cleared successfully!');
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize student profile details and minimum attendance criteria.
        </p>
      </div>

      {/* Mobile App Download Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-tr from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/40 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/30 shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Install AttendX on Your Phone</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-xs text-indigo-200/90 mt-0.5">
              Get 1-tap home screen access with offline routine & instant attendance marking.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all hover:scale-102 active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Install / Download App</span>
        </button>
      </div>

      {/* Persistence Notice */}
      <div className="p-4 sm:p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
          <strong className="text-sm font-bold block text-indigo-900 dark:text-white mb-0.5">
            100% Offline & Private
          </strong>
          All your subjects, timetable pictures, weekly routine, and attendance records are stored directly inside your browser’s <code className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 font-mono text-[11px]">localStorage</code>.
        </div>
      </div>

      {/* Profile & Target Criteria Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <GraduationCap className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Student Profile & Attendance Target
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Your Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Roll Number / Student ID
              </label>
              <input
                type="text"
                placeholder="e.g. CS-2024-001"
                value={profile.rollNumber}
                onChange={(e) => setProfile({ ...profile, rollNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                College / University Name
              </label>
              <input
                type="text"
                placeholder="e.g. My College"
                value={profile.college}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Semester / Branch
              </label>
              <input
                type="text"
                placeholder="e.g. Semester 4 (CSE)"
                value={profile.semester}
                onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Global Minimum Attendance Target (%)
                </label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {settings.minAttendanceTarget}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={settings.minAttendanceTarget}
                onChange={(e) => setSettings({ ...settings, minAttendanceTarget: parseInt(e.target.value) || 75 })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
            >
              <Save className="w-4 h-4" />
              Save Profile & Targets
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Clean Slate */}
      <div className="p-6 rounded-3xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <Trash2 className="w-5 h-5" />
          <h2 className="text-base font-bold">
            Data Reset / Clean Slate
          </h2>
        </div>
        <p className="text-xs text-rose-900 dark:text-rose-200/80 leading-relaxed">
          Need a completely blank start? Clicking this will wipe all subjects, routine slots, logs, and reset profile details immediately.
        </p>
        <button
          type="button"
          onClick={() => setIsClearDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all hover:scale-102"
        >
          <RotateCcw className="w-4 h-4" />
          Wipe & Clean All Data
        </button>
      </div>

      <ConfirmDialog
        isOpen={isClearDialogOpen}
        onClose={() => setIsClearDialogOpen(false)}
        onConfirm={handleClearAll}
        title="Wipe & Reset All Data?"
        message="This will completely clear all your added subjects, attendance logs, and routine. This action cannot be undone."
        confirmText="Yes, Wipe Everything"
        type="danger"
      />

    </div>
  );
}
