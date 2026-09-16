import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useToast } from '../../context/ToastContext';
import { addStudentSubject, updateStudentSubject } from '../../utils/storage';

const COLOR_OPTIONS = [
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Sky Blue', value: '#0ea5e9' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Teal', value: '#14b8a6' }
];

export default function PersonalSubjectModal({ isOpen, onClose, subject = null, onSaved }) {
  const toast = useToast();
  const isEdit = !!subject;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    teacher: '',
    target: 75,
    present: '',
    total: '',
    color: '#6366f1'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name || '',
        code: subject.code || '',
        teacher: subject.teacher || '',
        target: subject.target || 75,
        present: subject.present !== undefined && subject.present !== null ? String(subject.present) : '',
        total: subject.total !== undefined && subject.total !== null ? String(subject.total) : '',
        color: subject.color || '#6366f1'
      });
    } else {
      setFormData({
        name: '',
        code: '',
        teacher: '',
        target: 75,
        present: '',
        total: '',
        color: COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].value
      });
    }
    setErrors({});
  }, [subject, isOpen]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Subject name is required.';
    const pres = formData.present === '' ? 0 : parseInt(formData.present, 10) || 0;
    const tot = formData.total === '' ? 0 : parseInt(formData.total, 10) || 0;
    if (pres > tot) {
      errs.present = 'Attended classes cannot exceed total classes.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedData = {
      ...formData,
      present: formData.present === '' ? 0 : parseInt(formData.present, 10) || 0,
      total: formData.total === '' ? 0 : parseInt(formData.total, 10) || 0
    };

    if (isEdit) {
      updateStudentSubject(subject.id, parsedData);
      toast.success(`Updated ${formData.name}`);
    } else {
      const code = formData.code.trim() || formData.name.substring(0, 3).toUpperCase();
      addStudentSubject({ ...parsedData, code });
      toast.success(`Added ${formData.name} to your subjects`);
    }

    if (onSaved) onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Subject Details' : 'Add New Subject'}
      description="Enter course information and current attendance count"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Subject / Course Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Data Structures & Algorithms"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={`w-full px-3.5 py-2 rounded-xl border text-xs font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
              errors.name ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
            }`}
          />
          {errors.name && <p className="text-[11px] text-rose-500">{errors.name}</p>}
        </div>

        {/* Code & Teacher */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Subject Code (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. CS401"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono uppercase bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Teacher Name
            </label>
            <input
              type="text"
              placeholder="e.g. Prof. Jenkins"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Target Attendance % */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Attendance Threshold
            </label>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {formData.target}%
            </span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="1"
            value={formData.target}
            onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 75 })}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Current Attendance Numbers (If starting mid semester) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Starting Attendance Count
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Classes Attended (Present)
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.present}
                onChange={(e) => setFormData({ ...formData, present: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Total Classes Held
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
          {errors.present && <p className="text-[10px] text-rose-500">{errors.present}</p>}
        </div>

        {/* Color Picker */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Subject Card Color Tag
          </label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setFormData({ ...formData, color: c.value })}
                className={`w-7 h-7 rounded-full transition-transform ${
                  formData.color === c.value ? 'scale-120 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30"
          >
            {isEdit ? 'Save Changes' : 'Add Subject'}
          </button>
        </div>

      </form>
    </Modal>
  );
}
