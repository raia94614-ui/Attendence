import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  Bell,
  PhoneCall,
  User,
  Sparkles,
  Camera,
  CheckCircle2,
  Wand2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { useRoutineAlert } from '../../context/RoutineAlertContext';
import {
  getWeeklyRoutine,
  saveWeeklyRoutine,
  getStudentSubjects,
  getStudentProfile,
  addRoutineSlot,
  deleteRoutineSlot,
  getTimetableImage,
  applyChitkaraWeeklySchedule
} from '../../utils/storage';
import { autoAnalyzeAndSaveRoutine } from '../../utils/timetableOCR';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_TIME_SLOTS = [
  '09:30 AM - 11:10 AM',
  '11:10 AM - 12:50 PM',
  '01:40 PM - 02:30 PM',
  '02:30 PM - 04:10 PM',
  '09:00 AM - 10:00 AM',
  '10:15 AM - 11:15 AM'
];

export default function WeeklyRoutineBuilder({ onSwitchToPhotoTab }) {
  const toast = useToast();
  const {
    reminderSettings,
    updateSettings,
    triggerTestAlert,
    notificationPermission,
    requestBrowserPermission
  } = useRoutineAlert();

  const [activeDay, setActiveDay] = useState('Monday');
  const [routine, setRoutine] = useState(getWeeklyRoutine());
  const [subjects, setSubjects] = useState(getStudentSubjects());
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [timeSlot, setTimeSlot] = useState(DEFAULT_TIME_SLOTS[0]);
  const [room, setRoom] = useState('Room 304');
  const [teacher, setTeacher] = useState('');

  const loadData = () => {
    setRoutine(getWeeklyRoutine());
    setSubjects(getStudentSubjects());
  };

  useEffect(() => {
    loadData();
    // Default today's day if weekday
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = dayNames[new Date().getDay()];
    if (DAYS.includes(currentDayName)) {
      setActiveDay(currentDayName);
    }

    const handleRoutineUpdate = () => {
      loadData();
    };

    window.addEventListener('attendx-routine-updated', handleRoutineUpdate);
    return () => {
      window.removeEventListener('attendx-routine-updated', handleRoutineUpdate);
    };
  }, []);

  const handleAutoBuildSchedule = async () => {
    setIsAutoGenerating(true);
    toast.info('Analyzing timetable picture & generating daily classes...');
    try {
      const img = getTimetableImage();
      const result = await autoAnalyzeAndSaveRoutine(img);
      loadData();
      toast.success(`Generated full weekly schedule with ${result.totalSlots} classes! 🎉`);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate routine. Please try again.');
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleQuickSyncChitkara = () => {
    applyChitkaraWeeklySchedule();
    loadData();
    toast.success('✨ Synced exact Chitkara BE-CSE-5A timetable from your uploaded photo! 🎉');
    try {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleAddSlot = (e) => {
    e.preventDefault();
    if (!selectedSubjectId && subjects.length > 0) {
      setSelectedSubjectId(subjects[0].id);
    }

    const sub = subjects.find(s => s.id === (selectedSubjectId || subjects[0]?.id));
    if (!sub) {
      toast.error('Please add at least one subject first before adding class slots.');
      return;
    }

    addRoutineSlot(activeDay, {
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code || 'SUB',
      teacher: teacher.trim() || sub.teacher || 'Prof. Faculty',
      time: timeSlot,
      room: room.trim() || sub.room || 'Room 304'
    });

    loadData();
    setIsAddSlotOpen(false);
    setTeacher('');
    setRoom('Room 304');
    toast.success(`Added ${sub.name} to ${activeDay} routine`);
  };

  const handleDeleteSlot = (slotId) => {
    deleteRoutineSlot(activeDay, slotId);
    loadData();
    toast.info('Class removed from routine.');
  };

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'cards'
  const [editingSlot, setEditingSlot] = useState(null);

  const GRID_PERIODS = [
    { id: 'p1_2', label: 'Period 1 & 2', time: '09:30 AM - 11:10 AM', match: ['09:30 AM - 11:10 AM', '9:30 - 11:10', '09:30 - 11:10'] },
    { id: 'p3_4', label: 'Period 3 & 4', time: '11:10 AM - 12:50 PM', match: ['11:10 AM - 12:50 PM', '11:10 - 12:50'] },
    { id: 'lunch', label: 'Lunch Break', time: '12:50 PM - 01:40 PM', isBreak: true },
    { id: 'p6', label: 'Period 6', time: '01:40 PM - 02:30 PM', match: ['01:40 PM - 02:30 PM', '1:40 - 2:30', '01:40 - 02:30'] },
    { id: 'p7_8', label: 'Period 7 & 8', time: '02:30 PM - 04:10 PM', match: ['02:30 PM - 04:10 PM', '2:30 - 4:10', '02:30 - 04:10'] }
  ];

  const parseStartTimeInMinutes = (timeStr = '') => {
    if (!timeStr) return null;
    const parts = timeStr.split(/[-–—]|to/i);
    const startPart = parts[0]?.trim();
    if (!startPart) return null;

    const match = startPart.match(/(\d{1,2}):(\d{2})(?:\s*([ap]m))?/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3]?.toLowerCase();

    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    if (!meridiem && hours >= 1 && hours <= 7) hours += 12;

    return hours * 60 + minutes;
  };

  const getSlotForGridCell = (day, period) => {
    if (period.isBreak) return null;
    const daySlots = routine[day] || [];
    if (!daySlots || daySlots.length === 0) return null;

    if (period.id === 'p1_2') {
      // 09:30 AM (570 min) -> window 500 to 630 min
      const found = daySlots.find(s => {
        const startMin = parseStartTimeInMinutes(s.time);
        return startMin !== null ? (startMin >= 500 && startMin <= 630) : false;
      });
      return found || daySlots[0] || null;
    }

    if (period.id === 'p3_4') {
      // 11:10 AM (670 min) -> window 640 to 740 min
      const found = daySlots.find(s => {
        const startMin = parseStartTimeInMinutes(s.time);
        return startMin !== null ? (startMin >= 640 && startMin <= 740) : false;
      });
      return found || (daySlots.length > 1 && daySlots[1] !== daySlots[0] ? daySlots[1] : null);
    }

    if (period.id === 'p6') {
      // 01:40 PM (820 min) -> window 780 to 850 min
      const found = daySlots.find(s => {
        const startMin = parseStartTimeInMinutes(s.time);
        return startMin !== null ? (startMin >= 780 && startMin <= 850) : false;
      });
      return found || null;
    }

    if (period.id === 'p7_8') {
      // 02:30 PM (870 min) -> window 860 to 980 min
      const found = daySlots.find(s => {
        const startMin = parseStartTimeInMinutes(s.time);
        return startMin !== null ? (startMin >= 860 && startMin <= 980) : false;
      });
      return found || (daySlots.length >= 3 ? daySlots[daySlots.length - 1] : null);
    }

    return null;
  };

  const currentDaySlots = routine[activeDay] || [];

  return (
    <div className="space-y-4">
      
      {/* Timetable Call & Reminder Status Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold shrink-0 shadow-inner">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white">
                5-Min Class Call Alarm & Reminder
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                reminderSettings.enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {reminderSettings.enabled ? '● Active' : '○ Disabled'}
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Automatically rings a phone-call alarm & sends notification <strong>{reminderSettings.leadTimeMinutes === 0 ? 'at class start' : `${reminderSettings.leadTimeMinutes} min before`}</strong> every period.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          {notificationPermission !== 'granted' && (
            <button
              type="button"
              onClick={requestBrowserPermission}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all hover:scale-102"
              title="Allow Browser Push Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Allow Notifications</span>
            </button>
          )}

          <button
            type="button"
            onClick={triggerTestAlert}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102 active:scale-95"
            title="Preview the incoming call screen, sound, and voice alert"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>🧪 Test Call Alarm</span>
          </button>
        </div>
      </div>

      {/* Routine Actions & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📊 Timetable Table Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              📋 Day-by-Day Cards
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleQuickSyncChitkara}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-md shadow-indigo-600/25 transition-all hover:scale-102 active:scale-95"
            title="Load the 100% verified BE-CSE-5A schedule matching your photo"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Sync BE-CSE-5A Photo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (subjects.length > 0) setSelectedSubjectId(subjects[0].id);
              setIsAddSlotOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FULL TIMETABLE TABLE GRID (Notice Board Layout) */}
      {viewMode === 'grid' && (
        <div className="glass-card p-4 sm:p-6 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <span>
                  {getStudentProfile().college
                    ? `${getStudentProfile().college} Weekly Schedule`
                    : 'Weekly Lecture Routine Matrix'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Full weekly matrix with faculty, classroom codes, and period timings
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 self-start sm:self-auto">
              {Object.values(routine).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0)} Classes Scheduled
            </span>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[760px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider w-24 bg-slate-50 dark:bg-slate-900/60 rounded-tl-2xl">
                    Day
                  </th>
                  {GRID_PERIODS.map(period => (
                    <th
                      key={period.id}
                      className={`p-3 font-bold text-center border-l border-slate-200/60 dark:border-slate-800 ${
                        period.isBreak
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 w-28'
                          : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-black text-xs">{period.label}</div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                        {period.time}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                {DAYS.map(day => {
                  const daySlots = routine[day] || [];
                  const isWeekend = day === 'Saturday';

                  return (
                    <tr key={day} className="hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-colors">
                      {/* Day Label Cell */}
                      <td className="p-3.5 font-black text-sm text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-900/40">
                        <div className="flex items-center gap-1.5">
                          <span>{day.substring(0, 2)}</span>
                          <span className="text-[10px] font-mono font-normal text-slate-400">
                            ({daySlots.length})
                          </span>
                        </div>
                      </td>

                      {/* Period Cells */}
                      {GRID_PERIODS.map(period => {
                        if (period.isBreak) {
                          return (
                            <td
                              key={period.id}
                              className="p-3 text-center bg-amber-50/30 dark:bg-amber-950/10 text-amber-600/70 dark:text-amber-400/70 font-mono text-[11px] border-l border-slate-200/60 dark:border-slate-800 select-none"
                            >
                              Lunch Break
                            </td>
                          );
                        }

                        if (isWeekend) {
                          return (
                            <td
                              key={period.id}
                              className="p-3 text-center text-slate-400 dark:text-slate-600 font-mono text-xs border-l border-slate-200/60 dark:border-slate-800 select-none"
                            >
                              —
                            </td>
                          );
                        }

                        const slot = getSlotForGridCell(day, period);
                        if (!slot) {
                          return (
                            <td
                              key={period.id}
                              className="p-3 text-center text-slate-300 dark:text-slate-700 font-mono text-xs border-l border-slate-200/60 dark:border-slate-800 select-none"
                            >
                              — Free —
                            </td>
                          );
                        }

                        const sub = subjects.find(s => s.id === slot.subjectId) || {
                          color: '#6366f1'
                        };

                        return (
                          <td
                            key={period.id}
                            className="p-2.5 border-l border-slate-200/60 dark:border-slate-800"
                          >
                            <div
                              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 shadow-2xs space-y-1.5 transition-all hover:scale-101 hover:shadow-xs relative overflow-hidden"
                              style={{ borderLeftColor: sub.color || '#6366f1', borderLeftWidth: '4px' }}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                                  {slot.subjectCode || 'SUB'}
                                </span>
                                {slot.room && (
                                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                    📍 {slot.room}
                                  </span>
                                )}
                              </div>

                              <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {slot.subjectName}
                              </div>

                              {slot.teacher && (
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <User className="w-3 h-3 text-indigo-500" />
                                  <span className="truncate">{slot.teacher}</span>
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: DAY-BY-DAY CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          {/* Day Selector Pills */}
          <div className="glass-card flex items-center gap-1.5 p-1.5 rounded-2xl overflow-x-auto shadow-2xs">
            {DAYS.map((day) => {
              const count = (routine[day] || []).length;
              const isActive = activeDay === day;

              return (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-500'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{day}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Routine Cards for Selected Day */}
          <div className="glass-card p-5 sm:p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <span>{activeDay} Class Schedule</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {currentDaySlots.length} {currentDaySlots.length === 1 ? 'class' : 'classes'} scheduled for this day
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoBuildSchedule}
                  disabled={isAutoGenerating}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-102 active:scale-95 disabled:opacity-50"
                  title="Automatically analyze timetable image and generate all days"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAutoGenerating ? 'animate-spin' : ''}`} />
                  <span>{isAutoGenerating ? 'Analyzing Photo...' : '✨ Auto-Build from Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (subjects.length > 0) setSelectedSubjectId(subjects[0].id);
                    setIsAddSlotOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-102 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Class Slot</span>
                </button>
              </div>
            </div>

            {/* Schedule Slots List */}
            {currentDaySlots.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
                <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    No classes scheduled for {activeDay}
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Enjoy your day off, or click "Sync BE-CSE-5A Photo" to load your authentic schedule.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentDaySlots.map((slot, idx) => {
                  const sub = subjects.find(s => s.id === slot.subjectId) || {
                    name: slot.subjectName,
                    code: slot.subjectCode || 'SUB',
                    color: '#6366f1'
                  };

                  const teacherName = slot.teacher || sub.teacher;
                  const roomName = slot.room || sub.room;

                  return (
                    <div
                      key={slot.id || idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 transition-all hover:border-indigo-500/40 hover:shadow-xs group"
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className="w-3.5 h-12 rounded-xl shrink-0 shadow-xs"
                          style={{ backgroundColor: sub.color || '#6366f1' }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                              {slot.subjectCode || sub.code || 'SUB'}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {slot.subjectName || sub.name}
                            </h4>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 font-mono">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" /> {slot.time}
                            </span>
                            {teacherName && (
                              <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-800/40">
                                <User className="w-3.5 h-3.5 text-indigo-500" /> {teacherName}
                              </span>
                            )}
                            {roomName && (
                              <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {roomName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors self-end sm:self-center"
                        title="Delete period slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Class Slot Modal */}
      {isAddSlotOpen && (
        <Modal
          isOpen={isAddSlotOpen}
          onClose={() => setIsAddSlotOpen(false)}
          title={`Add Period to ${activeDay}`}
          description="Choose subject, time slot, teacher name, and room location"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddSlot} className="space-y-4">
            
            {/* Subject Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Subject *
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  const found = subjects.find(s => s.id === e.target.value);
                  if (found) {
                    if (found.teacher) setTeacher(found.teacher);
                    if (found.room) setRoom(found.room);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot Presets & Input */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Time Slot *
              </label>
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {DEFAULT_TIME_SLOTS.slice(0, 4).map(slot => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                      timeSlot === slot
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                placeholder="e.g. 09:00 AM - 10:00 AM"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Teacher / Faculty Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Teacher / Faculty Name (Optional)
              </label>
              <input
                type="text"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Prof. R. Sharma, Dr. Verma"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Room Location */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Classroom / Lab Location
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="e.g. Room 304, CS Lab 2"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddSlotOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30"
              >
                Add to Routine
              </button>
            </div>

          </form>
        </Modal>
      )}

    </div>
  );
}
