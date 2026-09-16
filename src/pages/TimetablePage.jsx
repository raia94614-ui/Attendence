import React, { useState } from 'react';
import {
  Calendar,
  Camera,
  Layers,
  Sparkles,
  Info,
  Bot
} from 'lucide-react';
import WeeklyRoutineBuilder from '../components/routine/WeeklyRoutineBuilder';
import TimetableImageUploader from '../components/routine/TimetableImageUploader';

export default function TimetablePage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('routine'); // 'routine' | 'photo'

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Timetable & Weekly Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Notice Board Grid matrix, daily period routine, and AI timetable scanner.
          </p>
        </div>

        {/* Action Buttons & Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('scan-timetable')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-102 active:scale-95"
            >
              <Bot className="w-4 h-4" />
              <span>Scan with AI</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setActiveTab('routine')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'routine'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Routine Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('photo')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'photo'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Noticeboard Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Tip */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
          {activeTab === 'routine' ? (
            <span>
              <strong>Weekly Schedule Tip:</strong> Classes added here will automatically appear on your <strong>Dashboard</strong> every day for quick 1-tap attendance marking!
            </span>
          ) : (
            <span>
              <strong>Timetable Photo Tip:</strong> Upload a clear photo of your official college noticeboard timetable or department PDF screenshot to keep it easily accessible at all times.
            </span>
          )}
        </div>
      </div>

      {/* Dynamic Content */}
      {activeTab === 'routine' ? (
        <WeeklyRoutineBuilder />
      ) : (
        <TimetableImageUploader
          onRoutineBuilt={() => {
            setActiveTab('routine');
          }}
        />
      )}

    </div>
  );
}
