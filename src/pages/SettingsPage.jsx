import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  ShieldCheck,
  GraduationCap,
  Trash2,
  RotateCcw,
  Smartphone,
  Download,
  Sparkles,
  Bell,
  PhoneCall,
  Volume2,
  Mic,
  Clock
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useRoutineAlert } from '../context/RoutineAlertContext';
import { playClassRingtone, stopClassRingtone } from '../utils/routineAlarmAudio';
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
  const {
    reminderSettings,
    updateSettings,
    triggerTestAlert,
    notificationPermission,
    requestBrowserPermission
  } = useRoutineAlert();

  const [profile, setProfile] = useState(getStudentProfile());
  const [settings, setSettings] = useState(getSettings());
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isPlayingSoundPreview, setIsPlayingSoundPreview] = useState(false);

  const toggleSoundPreview = (soundType) => {
    if (isPlayingSoundPreview) {
      stopClassRingtone();
      setIsPlayingSoundPreview(false);
    } else {
      playClassRingtone(soundType || reminderSettings.soundType || 'marimba');
      setIsPlayingSoundPreview(true);
      setTimeout(() => {
        stopClassRingtone();
        setIsPlayingSoundPreview(false);
      }, 5000);
    }
  };

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

      {/* Timetable Class Call Alarms & Notification Settings Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-indigo-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Timetable Class Call Alarms & Notifications
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Get an incoming phone-call style alarm & browser notification before every lecture
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={triggerTestAlert}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102 active:scale-95"
            title="Preview the incoming call screen, sound, and voice alert"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>🧪 Test Call Alarm</span>
          </button>
        </div>

        <div className="space-y-4">
          
          {/* Master Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-900 dark:text-white cursor-pointer" htmlFor="enable-call-alarms">
                Enable 10-Min Class Call Alarms
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Automatically ring incoming call modal & vibrate phone 10 minutes before class starts
              </p>
            </div>
            <input
              id="enable-call-alarms"
              type="checkbox"
              checked={reminderSettings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              className="w-5 h-5 rounded-md accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Lead Time Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>Remind Me (Notice Time Before Class)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: '10 Minutes Before (Default)', value: 10 },
                { label: '5 Minutes Before', value: 5 },
                { label: '15 Minutes Before', value: 15 },
                { label: 'At Class Start (0 min)', value: 0 }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => updateSettings({ leadTimeMinutes: opt.value })}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    parseInt(reminderSettings.leadTimeMinutes, 10) === opt.value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-500/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ringtone Sound Selector & Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Call Ringtone Alarm Sound</span>
              </label>
              <button
                type="button"
                onClick={() => toggleSoundPreview()}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>{isPlayingSoundPreview ? '⏹ Stop Sound Preview' : '▶ Play Sample Ringtone'}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'marimba', name: 'Smartphone Marimba', desc: 'Melodic ringtone' },
                { id: 'chime', name: 'Modern Chime', desc: 'Soft double bell' },
                { id: 'buzzer', name: 'Urgent Buzzer', desc: 'Alert beep' }
              ].map(s => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    updateSettings({ soundType: s.id });
                    playClassRingtone(s.id);
                    setIsPlayingSoundPreview(true);
                    setTimeout(() => {
                      stopClassRingtone();
                      setIsPlayingSoundPreview(false);
                    }, 3000);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    reminderSettings.soundType === s.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-950 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500/40'
                  }`}
                >
                  <p className="text-xs font-bold">{s.name}</p>
                  <p className="text-[10px] text-slate-400">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Voice Speech & Native Notification Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Voice Announcement */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2.5">
                <Mic className="w-4 h-4 text-purple-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Voice Announcement</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Speak lecture name & room verbally</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={reminderSettings.speechEnabled}
                onChange={(e) => updateSettings({ speechEnabled: e.target.checked })}
                className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Browser Push Notification */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Browser Push Notification</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {notificationPermission === 'granted' ? '● Permission Granted' : '○ Permission Needed'}
                  </p>
                </div>
              </div>
              {notificationPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={requestBrowserPermission}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] shadow-xs transition-all"
                >
                  Enable
                </button>
              ) : (
                <input
                  type="checkbox"
                  checked={reminderSettings.browserNotificationEnabled}
                  onChange={(e) => updateSettings({ browserNotificationEnabled: e.target.checked })}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
              )}
            </div>

          </div>

        </div>
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
