import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Sparkles, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle, RotateCcw } from 'lucide-react';
import { calculateSubjectBunkStats } from '../../utils/calculations';

export default function WhatIfSimulatorModal({ isOpen, onClose, subjects = [], defaultTarget = 75 }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState('ALL');
  const [classesToAttend, setClassesToAttend] = useState(0);
  const [classesToBunk, setClassesToBunk] = useState(0);

  // Compute baseline numbers
  let basePresent = 0;
  let baseTotal = 0;
  let target = defaultTarget;
  let subjectName = 'Overall All Subjects';

  if (selectedSubjectId === 'ALL') {
    subjects.forEach(s => {
      basePresent += s.present || 0;
      baseTotal += s.total || 0;
    });
  } else {
    const sub = subjects.find(s => s.id === selectedSubjectId);
    if (sub) {
      basePresent = sub.present || 0;
      baseTotal = sub.total || 0;
      target = sub.target || defaultTarget;
      subjectName = sub.name;
    }
  }

  const currentPct = baseTotal > 0 ? Math.round((basePresent / baseTotal) * 100) : 100;

  // Simulated numbers
  const simPresent = basePresent + classesToAttend;
  const simTotal = baseTotal + classesToAttend + classesToBunk;
  const simPct = simTotal > 0 ? Math.round((simPresent / simTotal) * 100) : 100;
  const diffPct = simPct - currentPct;

  const simStats = calculateSubjectBunkStats(simPresent, simTotal, target);

  const handleReset = () => {
    setClassesToAttend(0);
    setClassesToBunk(0);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🔮 'What-If' Attendance Predictor"
      description="Simulate upcoming leaves or classes to forecast your future percentage"
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        
        {/* Subject Picker */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Select Course to Simulate
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              handleReset();
            }}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Subjects (Overall Average)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.code} — {s.name} ({s.present}/{s.total} classes • {Math.round(s.total > 0 ? (s.present/s.total)*100 : 100)}%)
              </option>
            ))}
          </select>
        </div>

        {/* Prediction Comparison Card */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-white border border-slate-800 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Current Attendance
              </p>
              <p className="text-2xl font-black mt-0.5">{currentPct}%</p>
              <p className="text-[10px] text-slate-400 font-mono">{basePresent} / {baseTotal} classes</p>
            </div>

            <div className="text-center">
              <span className="text-lg">➡️</span>
            </div>

            <div className="text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Simulated Result
              </p>
              <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                <span className={`text-2xl font-black ${simPct >= target ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simPct}%
                </span>
                {diffPct !== 0 && (
                  <span className={`text-xs font-bold ${diffPct > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ({diffPct > 0 ? `+${diffPct}%` : `${diffPct}%`})
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">{simPresent} / {simTotal} classes</p>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="mt-3.5 pt-3 border-t border-slate-800 text-xs">
            {simPct >= target ? (
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Safe! You stay above the {target}% criteria ({simStats.safeBunks} safe bunks left).</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-300 font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Warning: Attendance drops below {target}%. Must attend {simStats.mustAttend} classes to recover.</span>
              </div>
            )}
          </div>
        </div>

        {/* Sliders Controls */}
        <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          
          {/* Attend Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">
                Classes to ATTEND: +{classesToAttend}
              </span>
              <button
                type="button"
                onClick={() => setClassesToAttend(c => c + 1)}
                className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px]"
              >
                +1 Class
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={classesToAttend}
              onChange={(e) => setClassesToAttend(parseInt(e.target.value) || 0)}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Bunk Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-rose-600 dark:text-rose-400">
                Classes to BUNK / MISS: +{classesToBunk}
              </span>
              <button
                type="button"
                onClick={() => setClassesToBunk(c => c + 1)}
                className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[11px]"
              >
                +1 Bunk
              </button>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={classesToBunk}
              onChange={(e) => setClassesToBunk(parseInt(e.target.value) || 0)}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Sliders
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Done
          </button>
        </div>

      </div>
    </Modal>
  );
}
