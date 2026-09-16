import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Check,
  X,
  Clock,
  MapPin,
  CheckCircle2,
  Palmtree,
  PhoneCall,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../../context/ToastContext';
import { useRoutineAlert } from '../../context/RoutineAlertContext';
import {
  getWeeklyRoutine,
  getStudentSubjects,
  getDailyAttendanceLogs,
  markDailyLectureStatus,
  isDateHoliday
} from '../../utils/storage';
import { getTodayDateString, formatDate } from '../../utils/dateUtils';
import { parseTimeToMinutes, getCurrentTimeMinutes, formatMinutesRemaining } from '../../utils/routineNotifier';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TodayRoutineWidget({ onNavigate, onAttendanceUpdate }) {
  const toast = useToast();
  const {
    nextUpcomingClass,
    triggerAlert,
    triggerTestAlert,
    reminderSettings
  } = useRoutineAlert();

  const [viewMode, setViewMode] = useState('today'); // 'today' | 'tomorrow'

  const today = new Date();
  const todayDateStr = getTodayDateString();
  const todayDayName = DAYS[today.getDay()];

  // Tomorrow calculation
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0];
  const tomorrowDayName = DAYS[tomorrow.getDay()];

  const activeDayName = viewMode === 'today' ? todayDayName : tomorrowDayName;
  const activeDateStr = viewMode === 'today' ? todayDateStr : tomorrowDateStr;

  const [routine, setRoutine] = useState(getWeeklyRoutine());
  const [subjects, setSubjects] = useState(getStudentSubjects());
  const [dailyLogs, setDailyLogs] = useState(getDailyAttendanceLogs());

  const loadData = () => {
    setRoutine(getWeeklyRoutine());
    setSubjects(getStudentSubjects());
    setDailyLogs(getDailyAttendanceLogs());
  };

  useEffect(() => {
    loadData();

    const handleExternalUpdate = () => {
      loadData();
    };

    window.addEventListener('attendx-attendance-updated', handleExternalUpdate);
    return () => {
      window.removeEventListener('attendx-attendance-updated', handleExternalUpdate);
    };
  }, []);

  const activeSlots = routine[activeDayName] || [];
  const holidayInfo = isDateHoliday(activeDateStr);

  const getSlotStatus = (slot) => {
    const log = dailyLogs.find(l => 
      l.date === activeDateStr &&
      l.subjectId === slot.subjectId &&
      (l.slotId ? l.slotId === slot.id : true)
    );
    return log ? log.status : null;
  };

  const handleMarkStatus = (slot, status) => {
    markDailyLectureStatus(activeDateStr, slot.subjectId, status, {
      id: slot.id,
      day: activeDayName,
      time: slot.time,
      room: slot.room
    });

    loadData();
    if (onAttendanceUpdate) onAttendanceUpdate();

    if (status === 'present') {
      toast.success(`Marked Present for ${slot.subjectName}! 🎉`);
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.75 }
        });
      } catch (e) {}
    } else if (status === 'absent') {
      toast.warning(`Marked Bunked / Absent for ${slot.subjectName}`);
    } else {
      toast.info(`Marked as Cancelled / Off for ${slot.subjectName}`);
    }
  };

  // Live lecture detection helper
  const isClassLiveNow = (timeStr) => {
    if (!timeStr || viewMode !== 'today') return false;
    try {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Extract e.g. "09:00 AM - 10:00 AM" or "09:00 - 10:00"
      const parts = timeStr.split('-').map(s => s.trim());
      if (parts.length !== 2) return false;

      const parseTimeToMinutes = (t) => {
        const isPM = /pm/i.test(t);
        const isAM = /am/i.test(t);
        const clean = t.replace(/(am|pm)/gi, '').trim();
        const [hStr, mStr] = clean.split(':');
        let h = parseInt(hStr, 10);
        const m = parseInt(mStr || '0', 10);
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;
        return h * 60 + m;
      };

      const start = parseTimeToMinutes(parts[0]);
      const end = parseTimeToMinutes(parts[1]);
      return currentMinutes >= start && currentMinutes <= end;
    } catch (e) {
      return false;
    }
  };

  const markedCount = activeSlots.filter(s => getSlotStatus(s) !== null).length;
  const isAllMarked = activeSlots.length > 0 && markedCount === activeSlots.length;

  return (
    <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
      
      {/* Header with Today / Tomorrow Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
              {activeDayName} ({formatDate(activeDateStr)})
            </span>
            {viewMode === 'today' && isAllMarked && !holidayInfo && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5" /> All Marked for Today
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-white tracking-tight mt-1.5 flex items-center gap-2">
            <span>{viewMode === 'today' ? "Today's Schedule & 1-Tap Attendance" : "Tomorrow's Schedule Preview"}</span>
          </h3>
        </div>

        {/* Segmented View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-900 border border-slate-800 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setViewMode('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'today'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Today ({todayDayName.substring(0, 3)})
          </button>
          <button
            onClick={() => setViewMode('tomorrow')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'tomorrow'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tomorrow ({tomorrowDayName.substring(0, 3)})
          </button>
        </div>
      </div>

      {/* College Holiday Notice (If any) */}
      {holidayInfo && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
          <Palmtree className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200">
            <strong className="font-bold block text-sm text-emerald-300">
              College is Closed ({holidayInfo.name})
            </strong>
            This day is marked as an academic break / holiday. No classes are scheduled and attendance will not be affected.
          </div>
        </div>
      )}

      {/* Next Class Call Alarm Spotlight (Today Only) */}
      {viewMode === 'today' && nextUpcomingClass && !holidayInfo && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950/80 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold shrink-0 shadow-inner">
              <PhoneCall className="w-5 h-5 animate-pulse text-indigo-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {nextUpcomingClass.state === 'live' ? '🔴 Ongoing Lecture' : '⏰ Next Class Up'}
                </span>
                <span className="text-sm font-bold text-white">
                  {nextUpcomingClass.subjectName}
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                {nextUpcomingClass.state === 'live' 
                  ? `Live in progress (${nextUpcomingClass.time}) • 1-tap attend below`
                  : `Starts in ${formatMinutesRemaining(nextUpcomingClass.diffMinutes)} • ${nextUpcomingClass.time} ${nextUpcomingClass.teacher ? `• 👤 ${nextUpcomingClass.teacher}` : ''} ${nextUpcomingClass.room ? `• 📍 ${nextUpcomingClass.room}` : ''}`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => triggerAlert(nextUpcomingClass, nextUpcomingClass.diffMinutes || 0, false)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102 active:scale-95"
              title="Open incoming call alarm screen for this lecture"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Alarm Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* Slots List */}
      {!holidayInfo && activeSlots.length === 0 ? (
        <div className="py-10 text-center text-slate-400">
          <Calendar className="w-10 h-10 mx-auto text-slate-700 mb-2" />
          <p className="text-sm font-bold text-slate-300">
            No classes scheduled for {activeDayName}! 🎉
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Enjoy your day off or configure your routine in the Timetable tab.
          </p>
        </div>
      ) : !holidayInfo && (
        <div className="space-y-3">
          {activeSlots.map((slot) => {
            const sub = subjects.find(s => s.id === slot.subjectId) || {
              name: slot.subjectName,
              code: slot.subjectCode || 'SUB',
              color: '#6366f1'
            };
            const currentStatus = getSlotStatus(slot);
            const isLive = isClassLiveNow(slot.time);
            const teacherName = slot.teacher || sub.teacher;
            const roomName = slot.room || sub.room;

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${
                  currentStatus === 'present'
                    ? 'bg-emerald-950/30 border-emerald-500/40 shadow-xs'
                    : currentStatus === 'absent'
                    ? 'bg-rose-950/30 border-rose-500/40 shadow-xs'
                    : currentStatus === 'cancelled'
                    ? 'bg-slate-900/60 border-slate-800 opacity-60'
                    : isLive
                    ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40 shadow-md'
                    : 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                {/* Subject & Timing Info */}
                <div className="flex items-start sm:items-center gap-3.5">
                  <span
                    className="w-3.5 h-12 rounded-xl shrink-0 mt-0.5 sm:mt-0 shadow-xs"
                    style={{ backgroundColor: sub.color || '#6366f1' }}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700 shadow-2xs">
                        {slot.subjectCode || sub.code || 'SUB'}
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {slot.subjectName || sub.name}
                      </h4>
                      {isLive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500 text-white shadow-xs animate-live">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          Live Now
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-semibold text-slate-300 font-mono">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> {slot.time}
                      </span>
                      {teacherName && (
                        <span className="flex items-center gap-1 font-medium text-slate-300 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/50">
                          <User className="w-3.5 h-3.5 text-indigo-400" /> {teacherName}
                        </span>
                      )}
                      {roomName && (
                        <span className="flex items-center gap-1 font-medium text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" /> {roomName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 1-Tap Attendance Marking Buttons */}
                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => triggerAlert(slot, 0, false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/40 border border-slate-700/80 transition-all hover:scale-105 active:scale-95"
                    title="Ring Call Alarm for this period"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkStatus(slot, 'present')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 ${
                      currentStatus === 'present'
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-400'
                        : 'bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-emerald-950/40'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Attended</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkStatus(slot, 'absent')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 ${
                      currentStatus === 'absent'
                        ? 'bg-rose-600 text-white shadow-rose-600/30 ring-2 ring-rose-400'
                        : 'bg-slate-800 text-rose-400 border border-slate-700 hover:bg-rose-950/40'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Bunked</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMarkStatus(slot, 'cancelled')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-102 active:scale-95 ${
                      currentStatus === 'cancelled'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white bg-slate-800/80 border border-slate-700'
                    }`}
                  >
                    Off
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
