import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Bot,
  RefreshCw,
  Plus,
  Flame,
  Check,
  X,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Palmtree
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { useRoutineAlert } from '../context/RoutineAlertContext';
import {
  getWeeklyRoutine,
  getStudentSubjects,
  getDailyAttendanceLogs,
  markDailyLectureStatus,
  isDateHoliday,
  addRoutineSlot,
  applyChitkaraWeeklySchedule
} from '../utils/storage';
import { getTodayDateString, formatDate } from '../utils/dateUtils';
import { parseTimeToMinutes, getCurrentTimeMinutes, formatMinutesRemaining } from '../utils/routineNotifier';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DailyRoutinePage({ onNavigate }) {
  const toast = useToast();
  const { nextUpcomingClass } = useRoutineAlert();

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = dayNames[today.getDay()];
  const todayDateStr = getTodayDateString();

  const [selectedDay, setSelectedDay] = useState(
    DAYS.includes(todayDayName) ? todayDayName : 'Monday'
  );

  const [routine, setRoutine] = useState(getWeeklyRoutine());
  const [subjects, setSubjects] = useState(getStudentSubjects());
  const [dailyLogs, setDailyLogs] = useState(getDailyAttendanceLogs());
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(getCurrentTimeMinutes());

  // Add extra slot modal
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [newSlotData, setNewSlotData] = useState({
    subjectId: '',
    customName: '',
    customCode: '',
    startTime: '09:30 AM',
    endTime: '11:10 AM',
    room: 'RJ310R',
    teacher: ''
  });

  const loadData = () => {
    setRoutine(getWeeklyRoutine());
    setSubjects(getStudentSubjects());
    setDailyLogs(getDailyAttendanceLogs());
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      setCurrentTimeMinutes(getCurrentTimeMinutes());
    }, 30000); // 30 sec clock tick

    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener('attendx-attendance-updated', handleUpdate);
    window.addEventListener('attendx-routine-updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('attendx-attendance-updated', handleUpdate);
      window.removeEventListener('attendx-routine-updated', handleUpdate);
    };
  }, []);

  const isToday = selectedDay === todayDayName;
  const activeSlots = routine[selectedDay] || [];
  const holidayInfo = isDateHoliday(todayDateStr);

  // Subject color map
  const subjectMap = new Map();
  subjects.forEach(s => {
    subjectMap.set(s.id, s);
    subjectMap.set(s.name.toLowerCase(), s);
    subjectMap.set(s.code.toLowerCase(), s);
  });

  // Calculate live, completed, upcoming for slots
  const getSlotTimingStatus = (slot) => {
    if (!isToday) return { status: 'normal', text: '' };

    const parsed = parseTimeToMinutes(slot.time);
    if (!parsed) return { status: 'normal', text: '' };

    const { start, end } = parsed;
    if (currentTimeMinutes >= start && currentTimeMinutes <= end) {
      const minsLeft = end - currentTimeMinutes;
      return { status: 'live', text: `Live Class (${minsLeft}m left)` };
    } else if (currentTimeMinutes > end) {
      return { status: 'completed', text: 'Class Finished' };
    } else {
      const minsToStart = start - currentTimeMinutes;
      if (minsToStart <= 60) {
        return { status: 'upcoming', text: `Starts in ${minsToStart}m` };
      }
      return { status: 'scheduled', text: 'Upcoming' };
    }
  };

  const getSlotAttendanceStatus = (slot) => {
    const log = dailyLogs.find(
      l => l.date === todayDateStr &&
           (slot.subjectId ? l.subjectId === slot.subjectId : l.subjectName === slot.subjectName) &&
           (l.slotId ? l.slotId === slot.id : true)
    );
    return log ? log.status : null;
  };

  const handleMarkAttendance = (slot, status) => {
    const sub = subjectMap.get(slot.subjectId) || subjectMap.get((slot.subjectName || '').toLowerCase());
    const subId = sub ? sub.id : slot.subjectId || `sub-temp-${Date.now()}`;

    markDailyLectureStatus(todayDateStr, subId, status, {
      id: slot.id,
      day: selectedDay,
      time: slot.time,
      room: slot.room,
      teacher: slot.teacher
    });

    loadData();

    if (status === 'present') {
      toast.success(`Marked Present for ${slot.subjectName}! 🎉`);
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    } else if (status === 'absent') {
      toast.info(`Marked Absent for ${slot.subjectName}.`);
    } else {
      toast.info(`Class status set to Cancelled.`);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('attendx-attendance-updated'));
    }
  };

  // Find ongoing or next class
  let featuredClass = null;
  let featuredType = null; // 'live' | 'upcoming' | null

  if (isToday && activeSlots.length > 0) {
    for (const slot of activeSlots) {
      const parsed = parseTimeToMinutes(slot.time);
      if (parsed) {
        if (currentTimeMinutes >= parsed.start && currentTimeMinutes <= parsed.end) {
          featuredClass = slot;
          featuredType = 'live';
          break;
        } else if (currentTimeMinutes < parsed.start && !featuredClass) {
          featuredClass = slot;
          featuredType = 'upcoming';
        }
      }
    }
  }

  // Handle Add Extra Class
  const handleAddExtraClass = (e) => {
    e.preventDefault();
    let sub = subjects.find(s => s.id === newSlotData.subjectId);
    
    if (!sub || newSlotData.subjectId === 'custom') {
      const name = newSlotData.customName?.trim() || 'New Subject';
      const code = newSlotData.customCode?.trim() || name.slice(0, 4).toUpperCase();
      sub = {
        id: `sub-${code.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
        name: name,
        code: code,
        teacher: newSlotData.teacher || 'Prof. Faculty',
        room: newSlotData.room || 'RJ310R',
        color: '#6366f1',
        present: 0,
        total: 0,
        target: 75
      };
      const updatedSubjects = [...subjects, sub];
      saveStudentSubjects(updatedSubjects);
      setSubjects(updatedSubjects);
    }

    const timeStr = `${newSlotData.startTime} - ${newSlotData.endTime}`;
    addRoutineSlot(selectedDay, {
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      teacher: newSlotData.teacher || sub.teacher || 'Prof. Faculty',
      room: newSlotData.room || sub.room || 'RJ310R',
      time: timeStr,
      type: 'Lecture'
    });

    loadData();
    setIsAddSlotModalOpen(false);
    toast.success(`Added ${sub.name} to ${selectedDay}'s routine! 🎉`);
  };

  const handleQuickSync = () => {
    applyChitkaraWeeklySchedule();
    loadData();
    toast.success('✨ Synced complete BE-CSE-5A routine from your timetable! 🎉');
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* HEADER WITH TODAY'S DATE & TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Daily Class Routine
            </h1>
            {isToday && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Today
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleQuickSync}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all hover:scale-102"
            title="Load authentic Chitkara BE-CSE-5A schedule"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Sync BE-CSE-5A</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('scan-timetable')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:scale-102 transition-transform"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Scan Timetable</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('timetable')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Week View</span>
          </button>
        </div>
      </div>

      {/* DAY SWITCHER TABS */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
        {DAYS.map((day) => {
          const isCurrentDayTab = day === todayDayName;
          const isSelected = selectedDay === day;
          const classCount = (routine[day] || []).length;

          return (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-102'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              {isCurrentDayTab && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              )}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {classCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* HERO SPOTLIGHT: ONGOING / NEXT CLASS */}
      {isToday && featuredClass && (
        <div
          className={`p-5 sm:p-6 rounded-3xl border shadow-md relative overflow-hidden transition-all ${
            featuredType === 'live'
              ? 'bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-700 text-white border-emerald-400/40 shadow-emerald-600/20'
              : 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white border-indigo-700/50 shadow-indigo-900/30'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    featuredType === 'live'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {featuredType === 'live' ? '🔴 Live Class Ongoing Now' : '⏳ Next Upcoming Class'}
                </span>
                <span className="text-xs font-mono opacity-90">{featuredClass.time}</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {featuredClass.subjectName}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs opacity-90 mt-1">
                  {featuredClass.subjectCode && (
                    <span className="font-mono font-bold bg-white/15 px-2 py-0.5 rounded">
                      {featuredClass.subjectCode}
                    </span>
                  )}
                  {featuredClass.room && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {featuredClass.room}
                    </span>
                  )}
                  {featuredClass.teacher && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> {featuredClass.teacher}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Attendance 1-tap for Featured Class */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {(() => {
                const marked = getSlotAttendanceStatus(featuredClass);
                if (marked) {
                  return (
                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Marked {marked}
                      </span>
                    </div>
                  );
                }

                return (
                  <>
                    <button
                      type="button"
                      onClick={() => handleMarkAttendance(featuredClass, 'present')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Present</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarkAttendance(featuredClass, 'absent')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-500/80 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Absent</span>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* HOLIDAY BANNER IF ANY */}
      {isToday && holidayInfo && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-900 dark:text-amber-200">
          <Palmtree className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold block">College Holiday Today: {holidayInfo.name}</span>
            <p className="text-[11px] opacity-90">{holidayInfo.description || 'Enjoy your day off!'}</p>
          </div>
        </div>
      )}

      {/* CHRONOLOGICAL CLASS CARDS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>{selectedDay}&apos;s Schedule ({activeSlots.length} Classes)</span>
          </h3>

          <button
            type="button"
            onClick={() => {
              if (subjects.length > 0) {
                setNewSlotData(prev => ({ ...prev, subjectId: subjects[0].id }));
              }
              setIsAddSlotModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Class</span>
          </button>
        </div>

        {activeSlots.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No classes scheduled for {selectedDay}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Scan your timetable photo with AI, add a class manually, or sync the full Chitkara BE-CSE-5A schedule.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleQuickSync}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-102"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sync BE-CSE-5A Routine</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('scan-timetable')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Scan Timetable with AI</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {activeSlots.map((slot, idx) => {
              const timing = getSlotTimingStatus(slot);
              const markedStatus = getSlotAttendanceStatus(slot);
              const sub = subjectMap.get(slot.subjectId) || subjectMap.get((slot.subjectName || '').toLowerCase());
              const accentColor = sub?.color || '#6366f1';

              return (
                <div
                  key={slot.id || idx}
                  className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all ${
                    timing.status === 'live'
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Class Info */}
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div
                        className="w-3 self-stretch sm:self-auto sm:w-3 sm:h-12 rounded-full shrink-0 mt-1 sm:mt-0"
                        style={{ backgroundColor: accentColor }}
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-800/40">
                            {slot.subjectCode || sub?.code || 'SUB'}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {slot.subjectName}
                          </h4>

                          {/* Live or Timing Badge */}
                          {timing.status === 'live' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                              {timing.text}
                            </span>
                          )}

                          {timing.status === 'upcoming' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              {timing.text}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-indigo-500" /> {slot.time}
                          </span>
                          {slot.room && (
                            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {slot.room}
                            </span>
                          )}
                          {slot.teacher && (
                            <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              <User className="w-3.5 h-3.5 text-slate-400" /> {slot.teacher}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Attendance Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-end">
                      {markedStatus ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold capitalize ${
                              markedStatus === 'present'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                : markedStatus === 'absent'
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {markedStatus === 'present' && <Check className="w-3.5 h-3.5" />}
                            {markedStatus === 'absent' && <X className="w-3.5 h-3.5" />}
                            <span>Marked {markedStatus}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(slot, markedStatus === 'present' ? 'absent' : 'present')}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg"
                            title="Toggle status"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(slot, 'present')}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm shadow-emerald-600/30 transition-transform active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Present</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(slot, 'absent')}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Absent</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMarkAttendance(slot, 'cancelled')}
                            className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-slate-600 text-[11px] font-semibold"
                            title="Class cancelled"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD EXTRA SLOT MODAL */}
      {isAddSlotModalOpen && (
        <Modal
          isOpen={isAddSlotModalOpen}
          onClose={() => setIsAddSlotModalOpen(false)}
          title={`Add Class Period (${selectedDay})`}
          description="Add an extra scheduled lecture or lab session"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddExtraClass} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject *</label>
              <select
                value={newSlotData.subjectId}
                onChange={(e) => {
                  const val = e.target.value;
                  const s = subjects.find(sub => sub.id === val);
                  setNewSlotData({
                    ...newSlotData,
                    subjectId: val,
                    teacher: s?.teacher || newSlotData.teacher || '',
                    room: s?.room || newSlotData.room || 'RJ310R'
                  });
                }}
                className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="custom">+ Create New Subject / Custom Name</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {(!newSlotData.subjectId || newSlotData.subjectId === 'custom') && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/40">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Predictive Analytics"
                    value={newSlotData.customName}
                    onChange={(e) => setNewSlotData({ ...newSlotData, customName: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required={!newSlotData.subjectId || newSlotData.subjectId === 'custom'}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Code / Acronym</label>
                  <input
                    type="text"
                    placeholder="e.g. PA"
                    value={newSlotData.customCode}
                    onChange={(e) => setNewSlotData({ ...newSlotData, customCode: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                <input
                  type="text"
                  value={newSlotData.startTime}
                  onChange={(e) => setNewSlotData({ ...newSlotData, startTime: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                <input
                  type="text"
                  value={newSlotData.endTime}
                  onChange={(e) => setNewSlotData({ ...newSlotData, endTime: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Room</label>
                <input
                  type="text"
                  value={newSlotData.room}
                  onChange={(e) => setNewSlotData({ ...newSlotData, room: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Teacher</label>
                <input
                  type="text"
                  value={newSlotData.teacher}
                  onChange={(e) => setNewSlotData({ ...newSlotData, teacher: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddSlotModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Add Class
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
