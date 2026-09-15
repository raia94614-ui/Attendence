import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  Info
} from 'lucide-react';
import Badge from '../components/common/Badge';
import StatusBadge from '../components/attendance/StatusBadge';
import Modal from '../components/common/Modal';
import { getDailyAttendanceLogs, getStudentSubjects } from '../utils/storage';
import { getCalendarGrid, formatDate } from '../utils/dateUtils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyLogs, setDailyLogs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDayObj, setSelectedDayObj] = useState(null);

  useEffect(() => {
    setDailyLogs(getDailyAttendanceLogs());
    setSubjects(getStudentSubjects());
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    return getCalendarGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Group logs by date string
  const logsByDate = useMemo(() => {
    const map = {};
    dailyLogs.forEach(log => {
      if (!map[log.date]) map[log.date] = [];
      map[log.date].push(log);
    });
    return map;
  }, [dailyLogs]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-6">
      
      {/* Month Navigation & Today Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Attendance History Calendar
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monthly calendar timeline of attended, missed, and cancelled lecture sessions.
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3.5 py-2 rounded-xl glass-card text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-all hover:scale-102 active:scale-95 shadow-2xs"
          >
            Today
          </button>
          <div className="flex items-center glass-card rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[140px] text-center font-mono">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="glass-card p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
            <span className="text-slate-700 dark:text-slate-300">All Attended</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
            <span className="text-slate-700 dark:text-slate-300">Partial Attendance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
            <span className="text-slate-700 dark:text-slate-300">Bunked / Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-400 shadow-xs" />
            <span className="text-slate-700 dark:text-slate-300">Cancelled / Off</span>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Tap any active date to view classes
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-sm">
        
        <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60 text-center py-3 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200/60 dark:divide-slate-800/80 border-b border-slate-200/80 dark:border-slate-800">
          {calendarDays.map((dayObj, idx) => {
            const logsForDay = logsByDate[dayObj.dateString] || [];
            const hasLogs = logsForDay.length > 0;

            let presentCount = 0;
            let absentCount = 0;
            let cancelledCount = 0;

            logsForDay.forEach(l => {
              if (l.status === 'present') presentCount++;
              else if (l.status === 'absent') absentCount++;
              else if (l.status === 'cancelled') cancelledCount++;
            });

            let dotColor = null;
            if (hasLogs) {
              if (absentCount === 0 && presentCount > 0) dotColor = 'bg-emerald-500 shadow-emerald-500/50';
              else if (presentCount === 0 && absentCount > 0) dotColor = 'bg-rose-500 shadow-rose-500/50';
              else if (presentCount > 0 && absentCount > 0) dotColor = 'bg-amber-500 shadow-amber-500/50';
              else dotColor = 'bg-slate-400';
            }

            return (
              <div
                key={idx}
                onClick={() => {
                  if (hasLogs) setSelectedDayObj({ day: dayObj, logs: logsForDay });
                }}
                className={`min-h-[90px] sm:min-h-[110px] p-2.5 sm:p-3 transition-all flex flex-col justify-between ${
                  !dayObj.isCurrentMonth
                    ? 'bg-slate-50/20 dark:bg-slate-950/40 text-slate-300 dark:text-slate-700'
                    : 'hover:bg-indigo-50/50 dark:hover:bg-slate-800/60'
                } ${dayObj.isToday ? 'bg-indigo-500/10 dark:bg-indigo-950/40 ring-1 ring-inset ring-indigo-500/40' : ''} ${
                  hasLogs ? 'cursor-pointer hover:scale-[1.01]' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                      dayObj.isToday
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : dayObj.isCurrentMonth
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {dayObj.day}
                  </span>

                  {hasLogs && (
                    <span className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-xs animate-pulse`} />
                  )}
                </div>

                {/* Day Logs Summary Pill */}
                {hasLogs && (
                  <div className="mt-1 space-y-1">
                    <div className="px-2 py-0.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/90 text-[10px] font-mono font-bold flex items-center justify-between shadow-2xs">
                      <span className="text-emerald-600 dark:text-emerald-400">{presentCount}P</span>
                      <span className="text-rose-600 dark:text-rose-400">{absentCount}A</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Day Inspector Modal */}
      {selectedDayObj && (
        <Modal
          isOpen={!!selectedDayObj}
          onClose={() => setSelectedDayObj(null)}
          title={`Classes on ${formatDate(selectedDayObj.day.dateString)}`}
          description={`${selectedDayObj.logs.length} lecture sessions logged on this day`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-3">
            {selectedDayObj.logs.map((log, idx) => {
              const sub = subjects.find(s => s.id === log.subjectId);

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {log.subjectName || sub?.name || 'Lecture'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {log.time} {log.room ? `• ${log.room}` : ''}
                    </p>
                  </div>

                  <div>
                    {log.status === 'present' ? (
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Attended
                      </span>
                    ) : log.status === 'absent' ? (
                      <span className="px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200/60 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Bunked
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}

    </div>
  );
}
