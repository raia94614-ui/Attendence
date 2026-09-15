import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  BookOpen,
  Edit2,
  Sparkles,
  Check
} from 'lucide-react';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import {
  getWeeklyRoutine,
  saveWeeklyRoutine,
  getStudentSubjects,
  addRoutineSlot,
  deleteRoutineSlot
} from '../../utils/storage';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:15 AM - 11:15 AM',
  '11:30 AM - 12:30 PM',
  '01:30 PM - 02:30 PM',
  '02:30 PM - 03:30 PM',
  '03:45 PM - 04:45 PM'
];

export default function WeeklyRoutineBuilder() {
  const toast = useToast();

  const [activeDay, setActiveDay] = useState('Monday');
  const [routine, setRoutine] = useState(getWeeklyRoutine());
  const [subjects, setSubjects] = useState(getStudentSubjects());

  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [timeSlot, setTimeSlot] = useState(DEFAULT_TIME_SLOTS[0]);
  const [room, setRoom] = useState('Room 304');

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
  }, []);

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
      time: timeSlot,
      room: room || 'Main Block'
    });

    loadData();
    setIsAddSlotOpen(false);
    toast.success(`Added ${sub.name} to ${activeDay} routine`);
  };

  const handleDeleteSlot = (slotId) => {
    deleteRoutineSlot(activeDay, slotId);
    loadData();
    toast.info('Class removed from routine.');
  };

  const currentDaySlots = routine[activeDay] || [];

  return (
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
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3.5">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>{activeDay} Class Schedule</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentDaySlots.length} {currentDaySlots.length === 1 ? 'class' : 'classes'} scheduled for this day
            </p>
          </div>

          <button
            onClick={() => {
              if (subjects.length > 0) setSelectedSubjectId(subjects[0].id);
              setIsAddSlotOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Slot</span>
          </button>
        </div>

        {/* Schedule Slots List */}
        {currentDaySlots.length === 0 ? (
          <div className="py-14 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30">
            <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No classes scheduled for {activeDay}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Click "+ Add Class Slot" to add periods according to your college routine.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {currentDaySlots.map((slot, idx) => {
              const sub = subjects.find(s => s.id === slot.subjectId) || {
                name: slot.subjectName,
                code: 'SUB',
                color: '#6366f1'
              };

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
                          {sub.code || 'SUB'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {sub.name}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 font-mono">
                          <Clock className="w-3.5 h-3.5 text-indigo-500" /> {slot.time}
                        </span>
                        {slot.room && (
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {slot.room}
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

      {/* Add Class Slot Modal */}
      {isAddSlotOpen && (
        <Modal
          isOpen={isAddSlotOpen}
          onClose={() => setIsAddSlotOpen(false)}
          title={`Add Period to ${activeDay}`}
          description="Choose subject, time slot, and room location"
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
                onChange={(e) => setSelectedSubjectId(e.target.value)}
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
