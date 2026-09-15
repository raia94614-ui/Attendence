import React, { useState, useEffect, useMemo } from 'react';
import { Search, BookOpen, Calendar, ArrowRight, X, LayoutDashboard, Settings } from 'lucide-react';
import { getStudentSubjects, getWeeklyRoutine } from '../../utils/storage';

export default function QuickSearchModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [routine, setRoutine] = useState({});

  useEffect(() => {
    if (isOpen) {
      setSubjects(getStudentSubjects());
      setRoutine(getWeeklyRoutine());
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const pages = [
      { type: 'page', title: 'Dashboard & Today Routine', page: 'dashboard', icon: LayoutDashboard, category: 'Pages' },
      { type: 'page', title: 'Timetable & Routine Setup', page: 'timetable', icon: Calendar, category: 'Pages' },
      { type: 'page', title: 'My Subjects Manager', page: 'subjects', icon: BookOpen, category: 'Pages' },
      { type: 'page', title: 'Attendance History Calendar', page: 'calendar', icon: Calendar, category: 'Pages' },
      { type: 'page', title: 'Settings & Data Backup', page: 'settings', icon: Settings, category: 'Pages' }
    ].filter(p => p.title.toLowerCase().includes(q));

    const matchedSubjects = subjects
      .filter(s => s.name.toLowerCase().includes(q) || (s.code && s.code.toLowerCase().includes(q)))
      .map(s => ({
        type: 'subject',
        title: `${s.code || 'SUB'} - ${s.name}`,
        subtitle: `${s.present}/${s.total} classes attended (${Math.round(s.total > 0 ? (s.present/s.total)*100 : 100)}%)`,
        page: 'subjects',
        data: s,
        icon: BookOpen,
        category: 'Subjects'
      }));

    return [...pages, ...matchedSubjects];
  }, [query, subjects, routine]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search subjects, routine, or pages... (e.g. 'Data Structures')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 ml-2">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to quickly find any course subject or jump to routine setup.
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              No results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onNavigate(item.page, item.data);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-indigo-50/80 dark:hover:bg-slate-800/80 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
