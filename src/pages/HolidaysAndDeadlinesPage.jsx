import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Award,
  Layers
} from 'lucide-react';
import HolidayModal from '../components/holidays/HolidayModal';
import AssignmentModal from '../components/assignments/AssignmentModal';
import { useToast } from '../context/ToastContext';
import {
  getHolidays,
  deleteHoliday,
  getAssignments,
  toggleAssignment,
  deleteAssignment,
  getStudentSubjects
} from '../utils/storage';
import { formatDate, getTodayDateString } from '../utils/dateUtils';

export default function HolidaysAndDeadlinesPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('holidays'); // 'holidays' | 'assignments'
  const [holidays, setHolidays] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const loadData = () => {
    setHolidays(getHolidays());
    setAssignments(getAssignments());
    setSubjects(getStudentSubjects());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteHoliday = (id) => {
    deleteHoliday(id);
    loadData();
    toast.info('Holiday removed.');
  };

  const handleToggleAssignment = (id) => {
    toggleAssignment(id);
    loadData();
    toast.success('Assignment status updated!');
  };

  const handleDeleteAssignment = (id) => {
    deleteAssignment(id);
    loadData();
    toast.info('Assignment removed.');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Holidays & Academic Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track college festival breaks, exam schedules, and assignment submissions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setActiveTab('holidays')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'holidays'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>College Holidays ({holidays.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'assignments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Assignments ({assignments.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HOLIDAYS */}
      {activeTab === 'holidays' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upcoming College Holidays & Breaks
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily routine is automatically paused on marked holiday dates
              </p>
            </div>

            <button
              onClick={() => setIsHolidayModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Holiday / Break
            </button>
          </div>

          {holidays.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold">No holidays recorded</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {holidays.map((h) => (
                <div
                  key={h.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-3 h-10 rounded-full shrink-0 ${
                      h.type === 'holiday' ? 'bg-emerald-500' : h.type === 'exam' ? 'bg-amber-500' : 'bg-purple-500'
                    }`} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {h.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {formatDate(h.date)} • <span className="capitalize">{h.type}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteHoliday(h.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS & DEADLINES */}
      {activeTab === 'assignments' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Assignment & Exam Deadlines
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track pending submissions and upcoming test dates
              </p>
            </div>

            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Assignment / Test
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold">No pending assignments!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    asg.completed
                      ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/50 dark:border-slate-800 opacity-70'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleAssignment(asg.id)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        asg.completed
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                      }`}
                    >
                      {asg.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <h4 className={`text-sm font-bold ${asg.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {asg.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {asg.subjectName} • Due: <span className="font-mono font-semibold">{formatDate(asg.dueDate)}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAssignment(asg.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isHolidayModalOpen && (
        <HolidayModal
          isOpen={isHolidayModalOpen}
          onClose={() => setIsHolidayModalOpen(false)}
          onSaved={loadData}
        />
      )}

      {isAssignmentModalOpen && (
        <AssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          subjects={subjects}
          onSaved={loadData}
        />
      )}

    </div>
  );
}
