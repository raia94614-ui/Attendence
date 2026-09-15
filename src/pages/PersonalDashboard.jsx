import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Plus,
  BookOpen,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Maximize2,
  Printer,
  Sliders,
  Flame,
  Palmtree,
  CheckSquare
} from 'lucide-react';
import TodayRoutineWidget from '../components/dashboard/TodayRoutineWidget';
import PersonalSubjectModal from '../components/subjects/PersonalSubjectModal';
import WhatIfSimulatorModal from '../components/dashboard/WhatIfSimulatorModal';
import PrintableAttendanceSlip from '../components/reports/PrintableAttendanceSlip';
import BunkBadge from '../components/common/BunkBadge';
import Badge from '../components/common/Badge';
import { useToast } from '../context/ToastContext';
import {
  getStudentSubjects,
  getStudentProfile,
  getTimetableImage,
  adjustSubjectAttendance,
  getSettings,
  getHolidays,
  getAssignments
} from '../utils/storage';
import { calculateOverallStudentMetrics } from '../utils/calculations';
import { getTodayDateString, formatDate } from '../utils/dateUtils';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PersonalDashboard({ onNavigate }) {
  const toast = useToast();

  const [subjects, setSubjects] = useState([]);
  const [profile, setProfile] = useState(getStudentProfile());
  const [timetableImg, setTimetableImg] = useState(getTimetableImage());
  const [settings, setSettings] = useState(getSettings());
  const [holidays, setHolidays] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Modals
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSlipOpen, setIsSlipOpen] = useState(false);

  const loadData = () => {
    setSubjects(getStudentSubjects());
    setProfile(getStudentProfile());
    setTimetableImg(getTimetableImage());
    setSettings(getSettings());
    setHolidays(getHolidays());
    setAssignments(getAssignments());
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    return calculateOverallStudentMetrics(subjects, settings.minAttendanceTarget || 75);
  }, [subjects, settings]);

  const todayDateStr = getTodayDateString();
  const todayDayName = DAYS[new Date().getDay()];

  // Pending assignments count
  const pendingAssignmentsCount = assignments.filter(a => !a.completed).length;

  const handleQuickAdjust = (subjectId, isPresent) => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub) return;

    if (isPresent) {
      adjustSubjectAttendance(subjectId, 1, 1);
      toast.success(`+1 Present added to ${sub.name}`);
    } else {
      adjustSubjectAttendance(subjectId, 0, 1);
      toast.warning(`+1 Absent / Bunk added to ${sub.name}`);
    }
    loadData();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Hero Glass Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white shadow-2xl shadow-indigo-950/40 border border-indigo-900/40 p-6 sm:p-8">
        
        {/* Ambient Gradient Glow Spheres */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Student Welcome & Stats */}
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{todayDayName}, {formatDate(todayDateStr)}</span>
              </span>
              
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 shadow-2xs">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" /> 
                <span>5-Day Streak 🔥</span>
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Offline
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white pt-1">
              {profile.name ? (
                <>Hey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">{profile.name}</span>! 👋</>
              ) : (
                <>Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">AttendX</span>! 👋</>
              )}
            </h1>

            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Overall Attendance: <strong className="text-white font-bold px-1.5 py-0.5 rounded-md bg-white/10">{metrics.overallPercentage}%</strong> ({metrics.totalPresent}/{metrics.totalHeld} classes attended).
              {metrics.overallSafeBunks > 0 ? (
                <span className="text-emerald-300 font-semibold ml-1.5 inline-flex items-center gap-1">
                  <span>🌴 You have <strong>{metrics.overallSafeBunks} safe bunks</strong> available!</span>
                </span>
              ) : metrics.overallMustAttend > 0 ? (
                <span className="text-rose-300 font-semibold ml-1.5 inline-flex items-center gap-1">
                  <span>⚠️ Attend next <strong>{metrics.overallMustAttend} classes</strong> for {settings.minAttendanceTarget}%!</span>
                </span>
              ) : null}
            </p>
          </div>

          {/* Quick Top Tools */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold backdrop-blur-md transition-all hover:scale-102 active:scale-95 shadow-lg shadow-black/20"
            >
              <Sliders className="w-4 h-4 text-indigo-300" />
              <span>What-If Simulator</span>
            </button>

            <button
              onClick={() => setIsSlipOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold backdrop-blur-md transition-all hover:scale-102 active:scale-95 shadow-lg shadow-black/20"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>Official Slip</span>
            </button>

            <button
              onClick={() => {
                setSubjectToEdit(null);
                setIsAddSubjectOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all hover:scale-102 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Overall % */}
        <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl flex items-center justify-between group">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Overall Attendance
            </p>
            <p className={`text-2xl sm:text-3xl font-black mt-1 tracking-tight ${metrics.isEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
              {metrics.overallPercentage}%
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${metrics.isEligible ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <p className="text-[11px] text-slate-400 font-medium">
                Target: {settings.minAttendanceTarget || 75}%
              </p>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 transition-transform group-hover:scale-110 shadow-sm ${metrics.isEligible ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Classes Attended */}
        <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl flex items-center justify-between group">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Classes Attended
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
              {metrics.totalPresent} <span className="text-xs font-bold text-slate-400">/ {metrics.totalHeld}</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <p className="text-[11px] text-indigo-300 font-medium">
                {metrics.totalHeld - metrics.totalPresent} missed / bunked
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Safe Bunks */}
        <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl flex items-center justify-between group">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Safe Bunk Meter
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 tracking-tight">
              {metrics.overallSafeBunks} <span className="text-xs font-bold text-slate-400">classes</span>
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[11px] text-slate-400 font-medium">
                Available penalty-free
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Subjects */}
        <div className="glass-card glass-card-hover p-4 sm:p-5 rounded-3xl flex items-center justify-between group">
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Courses
            </p>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
              {metrics.totalSubjects}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              <p className="text-[11px] text-purple-300 font-medium">
                {metrics.subjectsAboveTarget} above target
              </p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* TODAY'S & TOMORROW'S ROUTINE WIDGET WITH 1-TAP ATTENDANCE */}
      <TodayRoutineWidget
        onNavigate={onNavigate}
        onAttendanceUpdate={loadData}
      />

      {/* ACADEMIC DEADLINES & TIMETABLE PHOTO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Timetable Photo Card */}
        <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-3xl flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  College Timetable Picture
                </h4>
                <p className="text-xs text-slate-400">
                  {timetableImg ? 'Photo saved offline in browser' : 'No photo uploaded yet'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('timetable')}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/20 transition-all hover:scale-102"
            >
              {timetableImg ? 'Open & Zoom' : '+ Upload Pic'}
            </button>
          </div>

          {timetableImg ? (
            <div
              onClick={() => onNavigate('timetable')}
              className="relative h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer group flex items-center justify-center shadow-inner"
            >
              <img src={timetableImg} alt="Timetable preview" className="w-full h-full object-cover opacity-75 group-hover:opacity-95 transition-all group-hover:scale-105 duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <span className="absolute px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold backdrop-blur-md border border-white/10 shadow-lg group-hover:bg-indigo-600 transition-colors flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" /> Click to Inspect & Zoom
              </span>
            </div>
          ) : (
            <div
              onClick={() => onNavigate('timetable')}
              className="h-28 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-xs text-slate-400 cursor-pointer hover:border-indigo-500/60 hover:bg-indigo-950/20 transition-all p-3 text-center"
            >
              <Camera className="w-6 h-6 text-slate-500 mb-1" />
              <span className="font-semibold text-slate-300">Click to upload your routine screenshot</span>
              <span className="text-[11px] text-slate-500">PNG, JPG, or Screenshot</span>
            </div>
          )}
        </div>

        {/* Assignments & Holidays Quick Snapshot */}
        <div className="glass-card glass-card-hover p-5 sm:p-6 rounded-3xl flex flex-col justify-between space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
                <CheckSquare className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Assignments & College Breaks
                </h4>
                <p className="text-xs text-slate-400">
                  {pendingAssignmentsCount} pending task{pendingAssignmentsCount === 1 ? '' : 's'} • {holidays.length} upcoming breaks
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('holidays')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/20 transition-all hover:scale-102"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {assignments.slice(0, 2).map((asg) => (
              <div key={asg.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${asg.completed ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className={`font-semibold truncate ${asg.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {asg.title}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  Due {formatDate(asg.dueDate)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MY SUBJECTS CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>My Subjects & Attendance Cards</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                {subjects.length} Total
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Track percentage, safe bunks, or tap + / - for instant manual adjustments
            </p>
          </div>

          <button
            onClick={() => {
              setSubjectToEdit(null);
              setIsAddSubjectOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-102 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 rounded-3xl">
            <BookOpen className="w-12 h-12 mx-auto text-slate-700 mb-3" />
            <p className="text-base font-bold text-slate-300">
              No subjects added yet!
            </p>
            <p className="text-xs text-slate-400 mt-1">Add your college subjects to start tracking your attendance & safe bunks.</p>
            <button
              onClick={() => setIsAddSubjectOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-4 h-4" /> Add First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.subjects.map((sub) => {
              const isBelow = sub.percentage < sub.target;

              return (
                <div
                  key={sub.id}
                  className="glass-card glass-card-hover p-5 rounded-3xl flex flex-col justify-between space-y-4 relative overflow-hidden group"
                >
                  {/* Color Accent Bar on Top */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: sub.color || '#6366f1' }}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: sub.color || '#6366f1' }}
                        />
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 shadow-2xs">
                          {sub.code || 'SUB'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className={`text-2xl font-black tracking-tight ${isBelow ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {sub.percentage}%
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-white mt-2.5 leading-snug">
                      {sub.name}
                    </h4>
                    {sub.teacher && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sub.teacher}
                      </p>
                    )}

                    <div className="mt-3.5 space-y-1.5">
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isBelow
                              ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/50'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/50'
                          }`}
                          style={{ width: `${Math.min(100, sub.percentage)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                        <span>{sub.present} / {sub.total} classes</span>
                        <span className="font-mono text-slate-400">Target: {sub.target}%</span>
                      </div>
                    </div>

                    <div className="mt-3.5">
                      <BunkBadge stats={sub} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(sub.id, true)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 shadow-2xs"
                      >
                        + Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAdjust(sub.id, false)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 transition-all hover:scale-105 active:scale-95 shadow-2xs"
                      >
                        + Bunk
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSubjectToEdit(sub);
                        setIsAddSubjectOpen(true);
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-indigo-400 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddSubjectOpen && (
        <PersonalSubjectModal
          isOpen={isAddSubjectOpen}
          onClose={() => {
            setIsAddSubjectOpen(false);
            setSubjectToEdit(null);
          }}
          subject={subjectToEdit}
          onSaved={loadData}
        />
      )}

      {isSimulatorOpen && (
        <WhatIfSimulatorModal
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          subjects={subjects}
          defaultTarget={settings.minAttendanceTarget || 75}
        />
      )}

      {isSlipOpen && (
        <PrintableAttendanceSlip
          isOpen={isSlipOpen}
          onClose={() => setIsSlipOpen(false)}
          profile={profile}
          metrics={metrics}
          settings={settings}
        />
      )}

    </div>
  );
}
