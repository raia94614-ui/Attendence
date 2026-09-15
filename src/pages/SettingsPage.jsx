import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Save,
  ShieldCheck,
  Building,
  GraduationCap
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import {
  getStudentProfile,
  saveStudentProfile,
  getSettings,
  saveSettings
} from '../utils/storage';

export default function SettingsPage() {
  const toast = useToast();

  const [profile, setProfile] = useState(getStudentProfile());
  const [settings, setSettings] = useState(getSettings());

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

    </div>
  );
}
